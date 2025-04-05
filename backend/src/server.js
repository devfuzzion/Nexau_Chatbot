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
import { logConversation, logFeedback, storeFeedbackState, getFeedbackStates } from "./airtable.utils.js";
import {
  getAllThreads,
  createThreadInDb,
  deleteThreadInDb,
  getThreadById,
  updateThreadTitle,
  updateFeedback,
} from "./db/threads.queries.js";
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

app.get("/ping", (req, res) => {
  res.send("<h1>Pong</h1>");
});

app.get("/", (req, res) => {
  res.send("Love");
});

app.get("/threads", async (req, res) => {
  try {
    const threads = await getAllThreads();
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
          error: "File uplcoad error: " + err.message,
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
          userId: "123",
          threadId: req.params.threadId,
          messageId: run.id,
          question: req.body.userMessage.split("User message:")[1]?.trim(),
          response: messages[0].content[0].text.value,
        });

        const feedbackMatch = req.body.userMessage.match(/User feedback:\s*(.*?)\s*User message:/s);
        const feedback = feedbackMatch && feedbackMatch[1].trim() ? feedbackMatch[1].trim() : null;

        if (feedback) {
          await logFeedback({
            userId: "123",
            threadId: req.params.threadId,
            messageId: run.id,
            feedback: feedback,
          });
          console.log("Feedback logged successfully");
        }
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
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/create-thread", async (req, res) => {
  try {
    const thread = await createThread();
    const dbThread = await createThreadInDb(thread.id, req.body.threadTitle);
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
    const messageonWhichToGiveFeedback = await getMessageById(
      threadId,
      messageId,
    );

    const context = `Assistant Message:\n${
      messageonWhichToGiveFeedback.content[0].text.value
    }\n\nUser feedback on this message:\n${feedback}\n\nUser feedback before this feedback submission:\n${
      originalFeedback ? originalFeedback : "No feedback till now"
    }`;
    const updatedFeedback = await generateFeedbackSummary(context);
    const savedFeedback = await updateFeedback(threadId, updatedFeedback);
    if (savedFeedback.success) {
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
    const { userId, messageId, threadId, isLiked } = req.body;

    if (!userId || !messageId || !threadId || isLiked === undefined) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const result = await storeFeedbackState({
      userId,
      messageId,
      threadId,
      isLiked
    });

    if (result.success) {
      res.json({ success: true, recordId: result.recordId });
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
app.get("/feedback/states/:threadId", async (req, res) => {
  try {
    const { threadId } = req.params;

    if (!threadId) {
      return res.status(400).json({
        success: false,
        error: "Thread ID is required",
      });
    }

    const result = await getFeedbackStates(threadId);

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
