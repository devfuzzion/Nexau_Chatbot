import Airtable from "airtable";
import dotenv from "dotenv";

dotenv.config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID,
);

const CONVERSATIONS_TABLE_NAME = process.env.AIRTABLE_CONVERSATIONS_TABLE_NAME;
const FEEDBACKS_TABLE_NAME = process.env.AIRTABLE_FEEDBACKS_TABLE_NAME;
const USER_DATA_TABLE_NAME = process.env.AIRTABLE_USER_DATA_TABLE_NAME;

export const logConversation = async ({
  userId,
  question,
  response,
  threadId,
  messageId,
}) => {
  try {
    const record = await base(CONVERSATIONS_TABLE_NAME).create({
      user_id: userId,
      thread_id: threadId || "",
      message_id: messageId || "",
      user_request: question,
      bot_response: response,
    });

    return { success: true, recordId: record.id };
  } catch (error) {
    console.error("Error saving to Airtable:", error);
    return { success: false, error: error.message };
  }
};

export const logFeedback = async ({
  userId,
  feedback,
  threadId,
  messageId,
}) => {
  try {
    const record = await base(FEEDBACKS_TABLE_NAME).create({
      user_id: userId,
      message_id: messageId || "",
      thread_id: threadId || "",
      feedback_id: `feedback_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      feedback: feedback,
    });

    return { success: true, recordId: record.id };
  } catch (error) {
    console.error("Error saving to Airtable:", error);
    return { success: false, error: error.message };
  }
};

// New function to store like/dislike state
export const storeFeedbackState = async ({
  userId,
  messageId,
  threadId,
  isLiked,
}) => {
  try {
    // First check if feedback already exists for this message
    const existingRecords = await base(FEEDBACKS_TABLE_NAME)
      .select({
        filterByFormula: `AND({message_id} = '${messageId}', {thread_id} = '${threadId}')`,
      })
      .firstPage();

    if (existingRecords.length > 0) {
      // Update existing record
      const record = await base(FEEDBACKS_TABLE_NAME).update(
        existingRecords[0].id,
        {
          isLiked: isLiked ? "true" : "false",
          user_id: userId, // Update user_id in case it changed
        },
      );
      return { success: true, recordId: record.id, isUpdate: true };
    } else {
      // Create new record
      const record = await base(FEEDBACKS_TABLE_NAME).create({
        user_id: userId,
        message_id: messageId,
        thread_id: threadId,
        feedback_id: `feedback_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
        feedback: "",
        isLiked: isLiked ? "true" : "false",
      });
      return { success: true, recordId: record.id, isUpdate: false };
    }
  } catch (error) {
    console.error("Error saving feedback state to Airtable:", error);
    return { success: false, error: error.message };
  }
};

// New function to fetch feedback states for a thread
export const getFeedbackStates = async (threadId) => {
  try {
    const records = await base(FEEDBACKS_TABLE_NAME)
      .select({
        filterByFormula: `{thread_id} = '${threadId}'`,
      })
      .all();

    const feedbackStates = records.map((record) => ({
      messageId: record.fields.message_id,
      isLiked: record.fields.isLiked === "true",
    }));

    return { success: true, feedbackStates };
  } catch (error) {
    console.error("Error fetching feedback states from Airtable:", error);
    return { success: false, error: error.message };
  }
};

export const logUserData = async ({
  userId,
  storeName,
  website,
  products,
  story,
}) => {
  try {
    const record = await base(USER_DATA_TABLE_NAME).create({
      user_id: parseInt(userId),
      store_name: storeName || "",
      website: website || "",
      products: products || "",
      story: story || "",
    });

    return { success: true, recordId: record.id };
  } catch (error) {
    console.error("Error saving user data to Airtable:", error);
    return { success: false, error: error.message };
  }
};
