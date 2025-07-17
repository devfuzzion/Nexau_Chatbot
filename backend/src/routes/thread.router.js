import express from "express";
import {
  getThreadsByUserId,
  getThreadMessages,
  deleteThread,
  storeFeedback,
  updateThreadtitle,
} from "../controllers/thread.controller.js";
const router = express.Router();

router
  .post("/", getThreadsByUserId)
  .get("/:threadId", getThreadMessages)
  .delete("/:id", deleteThread)
  .post("/:threadId/:messageId", storeFeedback)
  .put("/:id", updateThreadtitle);
//   .get("/:userId", getUserDataFromDb);

export default router;
