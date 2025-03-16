import express from "express";
import dotenv from "dotenv";
dotenv.config();
import {
  appendMessageInThread,
  createThread,
  listMesasgesInThread,
  createRun,
  delThread,
} from "./openai.utils.js";
import { getAllThreads, createThreadInDb } from "./db/threads.queries.js";
const app = express();

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
    const dbThread = await createThreadInDb(thread.id);
    console.log(dbThread);
    res.json({ success: true, thread });
  } catch (err) {
    res.json({
      success: true,
      err,
    });
  }
});

app.listen(3000, () => {
  console.log(`Server is listening on 3000`);
});
