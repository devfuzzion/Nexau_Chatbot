import express from "express";
import {
  updateFeedback,
  getUserFeedback,
} from "../controllers/feedback.controller.js";
const router = express.Router();

router
  .post("/state", updateFeedback)
  .get("/states/:threadId/:userId", getUserFeedback);

//   .get("/:userId", getUserDataFromDb);

export default router;
