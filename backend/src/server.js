import express from "express";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
import {
  appendMessageInThread,
  createThread,
  listMesasgesInThread,
  createRun,
  delThread,
} from "./openai.utils.js";
import {
  getAllThreads,
  createThreadInDb,
  deleteThreadInDb,
  getThreadById,
} from "./db/threads.queries.js";
const app = express();

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
    const message = await appendMessageInThread(
      req.params.threadId,
      req.body.userMessage,
    );
    const run = await createRun(req.params.threadId);
    const messages = await listMesasgesInThread(req.params.threadId);
    res.json({ success: true, botMessage: messages[0] });
  } catch (err) {
    res.json({ success: true, err });
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

app.listen(3000, () => {
  console.log(`Server is listening on 3000`);
});
