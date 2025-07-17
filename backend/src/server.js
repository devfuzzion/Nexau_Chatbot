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
  updateUserData,
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
import threadRouter from "./routes/thread.router.js";
import feedbackRouter from "./routes/feedback.router.js";
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
app.use("/threads", threadRouter);
app.use("/feedback", feedbackRouter);
app.get("/ping", (req, res) => {
  res.send("<h1>Pong</h1>");
});

app.get("/", (req, res) => {
  res.send("Love 1");
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

        // Fetch user data from Airtable before creating run
        console.log("Fetching user data for personalized response...");
        let userData = null;
        try {
          userData = await getUserData(req.body.userId);
          console.log("User data fetched successfully");
        } catch (userDataError) {
          console.error("Error fetching user data:", userDataError);
          // Continue even if user data fetch fails
        }

        console.log("Creating run with personalized context...");
        const run = await createRun(req.params.threadId, userData);
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
    const dbThread = await createThreadInDb(
      thread.id,
      req.body.threadTitle,
      req.body.userId,
    );
    console.log(dbThread);
    res.json({ success: true, thread });
  } catch (err) {
    res.json({
      success: true,
      err,
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

//Get the user data from airtable and return it
app.get("/users/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log("userId", userId);
  if (!userId) {
    return res
      .status(400)
      .json({ success: false, message: "User ID is required." });
  }

  const result = await getUserData(userId);

  if (result.success) {
    res.json({ success: true, userData: result.userData });
  } else {
    res.status(404).json({ success: false, message: "User data not found." });
  }
});
