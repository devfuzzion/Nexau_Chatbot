import express from "express";
import {
  saveUserDatainDb,
  getUserDataFromDb,
} from "../controllers/user.controller.js";
const router = express.Router();

router
  .post("/:userId/user-questions-data", saveUserDatainDb)
  .get("/:userId", getUserDataFromDb);

export default router;
