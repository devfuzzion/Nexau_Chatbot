import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
dotenv.config();
import {
  appendMessageInThread,
  createThread,
  listMesasgesInThread,
  createRun,
  delThread,
  generateThreadTitle,
  processFileContent,
  getMessageById,
  getThreadDataFromOpenAi,
  generateFeedbackSummary,
  // saveFeedback,
} from "./openai.utils.js";
import {
  logConversation,
  logFeedback,
  logUserData,
  storeFeedbackState,
  getFeedbackStates,
  logDocumentUpload,
  getDocumentUploads,
  getUserData,
  updateUserData
} from "./airtable.utils.js";
import {
  getAllThreads,
  createThreadInDb,
  deleteThreadInDb,
  getThreadById,
  updateThreadTitle,
  updateFeedback,
} from "./db/threads.queries.js";
import userRouter from "./routes/user.router.js";
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Sanitize filename and add timestamp
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, `${Date.now()}-${sanitizedFilename}`);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept all files
    cb(null, true);
  },
}).single("file");

app.use(cors());
app.use(express.json());
app.use("/users", userRouter);

app.get("/ping", (req, res) => {
  res.send("<h1>Pong</h1>");
});

app.get("/", (req, res) => {
  res.send("Love");
});

app.post("/threads", async (req, res) => {
  try {
    console.log("userId", req.body.userId);
    const threads = await getAllThreads(req.body.userId);
    res.json({ success: true, threads });
  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      err,
    });
  }
});

app.get("/threads/:threadId", async (req, res) => {
  try {
    const messages = await listMesasgesInThread(req.params.threadId);
    res.json({ success: true, messages });
  } catch (err) {
    console.log(err);
    res.json({
      success: false,
      err,
    });
  }
});

app.post("/run/:threadId", async (req, res) => {
  try {
    console.log("\n=== New Query Processing ===");
    // Handle file upload
    upload(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        console.error("Multer error:", err);
        return res.status(400).json({
          success: false,
          error: "File upload error: " + err.message,
        });
      } else if (err) {
        console.error("Unknown error:", err);
        return res.status(500).json({
          success: false,
          error: "Server error: " + err.message,
        });
      }

      try {
        console.log("Appending message to thread...");
        console.log(req.body.userMessage, 222);
        const message = await appendMessageInThread(
          req.params.threadId,
          req.body.userMessage,
          req.file,
        );
        console.log("Message appended successfully");

        // Log document upload if a file was included
        if (req.file) {
          await logDocumentUpload({
            userId: req.body.userId,
            threadId: req.params.threadId,
            messageId: message.id,
            documentId: `doc_${Date.now()}`,
            documentName: req.file.originalname,
          });
          console.log("Document upload logged successfully");
        }

        console.log("Creating run...");
        const run = await createRun(req.params.threadId);
        console.log("Run created successfully");

        console.log("Fetching updated messages...");
        const messages = await listMesasgesInThread(req.params.threadId);
        console.log("Messages fetched successfully");

        // Clean up the uploaded file
        if (req.file) {
          fs.unlinkSync(req.file.path);
          console.log("Temporary file cleaned up");
        }

        await logConversation({
          userId: req.body.userId,
          threadId: req.params.threadId,
          messageId: run.id,
          question: req.body.userMessage.split("User message:")[1]?.trim(),
          response: messages[0].content[0].text.value,
        });

              console.log("Conversation logged successfully");

        res.json({ success: true, botMessage: messages[0] });
      } catch (err) {
        // Clean up the uploaded file in case of error
        if (req.file) {
          try {
            fs.unlinkSync(req.file.path);
            console.log("Temporary file cleaned up after error");
          } catch (cleanupError) {
            console.error("Error cleaning up file:", cleanupError);
          }
        }

        res.status(500).json({ success: false, error: err.message });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/create-thread", async (req, res) => {
  try {
    const thread = await createThread();
    const dbThread = await createThreadInDb(thread.id, req.body.threadTitle, req.body.userId);
    console.log(dbThread);
    res.json({ success: true, thread });
  } catch (err) {
    res.json({
      success: true,
      err,
    });
  }
});

app.delete("/threads/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Fetch thread from DB
    const thread = await getThreadById(id);
    if (!thread) {
      return res.status(404).json({
        success: false,
        message: "No thread found with the given ID",
      });
    }
    // Delete thread from OpenAI
    const response = await delThread(thread.threadid);
    if (!response?.deleted) {
      return res.status(500).json({
        success: false,
        message: "Error deleting thread from OpenAI",
      });
    }
    if (response.deleted) {
      console.log(`Thread deleted in OpenAi: ${thread.threadid}`);
      const dbResponse = await deleteThreadInDb(id);
      if (dbResponse.success) {
        return res.json({
          success: true,
          message: dbResponse.message,
        });
      }
    }
  } catch (err) {
    console.error("Error deleting thread:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

app.post("/threads/:threadId/:messageId", async (req, res) => {
  try {
    const { threadId, messageId } = req.params;
    const { feedback, originalFeedback } = req.body;
    const userId = req.body.userId;

    console.log("Received text feedback:", { 
      threadId, 
      messageId, 
      userId,
      feedback: feedback ? feedback.substring(0, 50) + (feedback.length > 50 ? "..." : "") : "(none)",
      originalFeedback: originalFeedback ? "present" : "none"
    });

    // Use storeFeedbackState instead of logFeedback to avoid creating duplicate records
    if (feedback) {
      console.log("Storing text feedback for message:", messageId);
      
      const storeResult = await storeFeedbackState({
        userId: userId,
        messageId: messageId,
        threadId: threadId,
        isLiked: null, // neutral feedback
        feedbackText: feedback
      });
      
      console.log("Feedback storage result:", storeResult);
    }

    // Validate inputs
    if (!threadId || !messageId) {
      return res.status(400).json({
        success: false,
        error: "Thread ID and Message Id are required",
      });
    }
    if (!feedback) {
      return res.status(400).json({
        success: false,
        error: "Feedback is required",
      });
    }
    
    console.log("Retrieving message to generate feedback summary");
    const messageonWhichToGiveFeedback = await getMessageById(
      threadId,
      messageId,
    );

    const context = `Assistant Message:\n${
      messageonWhichToGiveFeedback.content[0].text.value
    }\n\nUser feedback on this message:\n${feedback}\n\nUser feedback before this feedback submission:\n${
      originalFeedback ? originalFeedback : "No feedback till now"
    }`;
    
    console.log("Generating feedback summary");
    const updatedFeedback = await generateFeedbackSummary(context);
    
    console.log("Updating thread feedback");
    const savedFeedback = await updateFeedback(threadId, updatedFeedback);
    
    if (savedFeedback.success) {
      console.log("Feedback successfully processed and saved");
      res.json({
        success: true,
        savedFeedback: { ...savedFeedback, updatedFeedback },
      });
    } else {
      throw new Error(savedFeedback.message);
    }
  } catch (error) {
    console.error("Error processing feedback:", error);

    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
});

// New endpoint to store like/dislike state
app.post("/feedback/state", async (req, res) => {
  try {
    console.log("Received feedback state request:", req.body);
    const { userId, messageId, threadId, isLiked, feedbackText } = req.body;

    if (!userId || !messageId || !threadId) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: userId, messageId, and threadId are required",
      });
    }

    // isLiked could be null for text-only feedback
    console.log("Processing feedback state with params:", { 
      userId, 
      messageId, 
      threadId, 
      isLiked: isLiked === null ? "null" : isLiked, 
      feedbackText: feedbackText || "(none)" 
    });

    const result = await storeFeedbackState({
      userId,
      messageId,
      threadId,
      isLiked,
      feedbackText
    });

    console.log("Feedback state result:", result);

    if (result.success) {
      res.json({ 
        success: true, 
        recordId: result.recordId, 
        isUpdate: result.isUpdate 
      });
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Error storing feedback state:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
});

// New endpoint to fetch feedback states for a thread
app.get("/feedback/states/:threadId/:userId", async (req, res) => {
  try {
    console.log("Fetching feedback states for thread:", req.params.threadId, "and user:", req.params.userId , "and body:", req.body) ;
    const { threadId, userId } = req.params;

    if (!threadId) {
      return res.status(400).json({
        success: false,
        error: "Thread ID is required",
      });
    }

    const result = await getFeedbackStates(threadId, userId);

    if (result.success) {
      res.json({ success: true, feedbackStates: result.feedbackStates });
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Error fetching feedback states:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
});

// New endpoint to fetch document uploads for a thread
app.get("/documents/:threadId/:userId", async (req, res) => {
  try {
    const { threadId, userId } = req.params;

    if (!threadId) {
      return res.status(400).json({
        success: false,
        error: "Thread ID is required",
      });
    }

    const result = await getDocumentUploads(threadId, userId);

    if (result.success) {
      res.json({ success: true, documentUploads: result.documentUploads });
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Error fetching document uploads:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details: error.message,
    });
  }
});

app.listen(3000, "0.0.0.0", () => {
  console.log(`Server is listening on 3000`);
});

app.put("/threads/:id", async (req, res) => {
  const { id } = req.params;
  const { title, aiTitle } = req.body;

  if (!title && !aiTitle) {
    return res
      .status(400)
      .json({ success: false, message: "Title is required." });
  }

  try {
    if (!aiTitle) {
      const result = await updateThreadTitle(id, title);
      res.status(result.success ? 200 : 404).json({ ...result, title });
    } else {
      const messages = await listMesasgesInThread(id);
      const title = await generateThreadTitle(messages);
      const result = await updateThreadTitle(id, title);

      res.status(result.success ? 200 : 404).json({ ...result, title });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

//Get the user data from airtable and return it
app.get("/users/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log("userId", userId);
  if (!userId) {  
    return res.status(400).json({ success: false, message: "User ID is required." });
  }

  const result = await getUserData(userId);

  if (result.success) {
    res.json({ success: true, userData: result.userData });
  } else {
    res.status(404).json({ success: false, message: "User data not found." });
  }
});

app.post("/users/:userId/user-questions-data", async (req, res) => {
  try {
    console.log("userId", req.params.userId);
    const { userId } = req.params;
    const { userQuestionsData } = req.body;

    if (!userId || !userQuestionsData) {
      return res.status(400).json({ success: false, message: "User ID and user questions data are required." });
    }

    const result = await updateUserData(userId, userQuestionsData);

    if (result.success) {
      res.json({ success: true, message: "User questions data updated successfully." });
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error("Error updating user questions data:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
});

