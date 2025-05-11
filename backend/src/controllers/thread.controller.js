import {
  getAllThreads,
  createThreadInDb,
  deleteThreadInDb,
  getThreadById,
  updateThreadTitle,
  updateFeedback,
} from "../db/threads.queries.js";

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
} from "../openai.utils.js";

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
} from "../airtable.utils.js";

export const getThreadsByUserId = async (req, res) => {
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
};

export const getThreadMessages = async (req, res) => {
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
};

export const deleteThread = async (req, res) => {
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
};

export const storeFeedback = async (req, res) => {
  try {
    const { threadId, messageId } = req.params;
    const { feedback, originalFeedback } = req.body;
    const userId = req.body.userId;

    console.log("Received text feedback:", {
      threadId,
      messageId,
      userId,
      feedback: feedback
        ? feedback.substring(0, 50) + (feedback.length > 50 ? "..." : "")
        : "(none)",
      originalFeedback: originalFeedback ? "present" : "none",
    });

    // Use storeFeedbackState instead of logFeedback to avoid creating duplicate records
    if (feedback) {
      console.log("Storing text feedback for message:", messageId);

      const storeResult = await storeFeedbackState({
        userId: userId,
        messageId: messageId,
        threadId: threadId,
        isLiked: null, // neutral feedback
        feedbackText: feedback,
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
};

export const updateThreadtitle = async (req, res) => {
  console.log("api striked /threads/:id", req.body);
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
      console.log("Generating thread title from openai");
      const messages = await listMesasgesInThread(id);
      const title = await generateThreadTitle(messages);
      const result = await updateThreadTitle(id, title);

      res.status(result.success ? 200 : 404).json({ ...result, title });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};
