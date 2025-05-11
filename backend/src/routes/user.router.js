import express from "express";
import {
  saveUserDatainDb,
  getUserDataFromDb,
  updateUserQuestionData,
} from "../controllers/user.controller.js";
const router = express.Router();

router
  .post("/:userId/user-questions-data", saveUserDatainDb)
  .get("/:userId", getUserDataFromDb)
  .post("/:userId/user-questions-data", updateUserQuestionData);

export default router;
