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

export const updateFeedback = async () => {
  try {
    console.log("Received feedback state request:", req.body);
    const { userId, messageId, threadId, isLiked, feedbackText } = req.body;

    if (!userId || !messageId || !threadId) {
      return res.status(400).json({
        success: false,
        error:
          "Missing required fields: userId, messageId, and threadId are required",
      });
    }

    // isLiked could be null for text-only feedback
    console.log("Processing feedback state with params:", {
      userId,
      messageId,
      threadId,
      isLiked: isLiked === null ? "null" : isLiked,
      feedbackText: feedbackText || "(none)",
    });

    const result = await storeFeedbackState({
      userId,
      messageId,
      threadId,
      isLiked,
      feedbackText,
    });

    console.log("Feedback state result:", result);

    if (result.success) {
      res.json({
        success: true,
        recordId: result.recordId,
        isUpdate: result.isUpdate,
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
};

export const getUserFeedback = async (req, res) => {
  try {
    console.log(
      "Fetching feedback states for thread:",
      req.params.threadId,
      "and user:",
      req.params.userId,
      "and body:",
      req.body,
    );
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
};
