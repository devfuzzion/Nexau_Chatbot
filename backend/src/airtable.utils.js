import Airtable from "airtable";
import dotenv from "dotenv";

dotenv.config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  process.env.AIRTABLE_BASE_ID,
);

const CONVERSATIONS_TABLE_NAME = process.env.AIRTABLE_CONVERSATIONS_TABLE_NAME;
const FEEDBACKS_TABLE_NAME = process.env.AIRTABLE_FEEDBACKS_TABLE_NAME;
const USER_DATA_TABLE_NAME = process.env.AIRTABLE_USER_DATA_TABLE_NAME;
const DOCUMENTS_UPLOADS_TABLE_NAME =
  process.env.AIRTABLE_DOCUMENTS_UPLOADS_TABLE_NAME;

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
  feedbackText,
}) => {
  try {
    console.log("Checking for existing feedback record:", {
      messageId,
      threadId,
      userId,
    });

    // More specific filter to find existing records for this exact message
    const existingRecords = await base(FEEDBACKS_TABLE_NAME)
      .select({
        filterByFormula: `AND({message_id} = '${messageId}', {thread_id} = '${threadId}', {user_id} = '${userId}')`,
      })
      .firstPage();

    console.log(
      `Found ${existingRecords.length} existing records for message: ${messageId}`,
    );

    if (existingRecords.length > 0) {
      console.log("Updating existing record:", existingRecords[0].id);

      // Create update fields object
      const updateFields = {
        user_id: userId, // Update user_id in case it changed
      };

      // Only update isLiked field if it's not null/undefined
      if (isLiked !== null && isLiked !== undefined) {
        updateFields.isLiked = isLiked ? "true" : "false";
      } else if (existingRecords[0].fields.isLiked) {
        // Preserve existing isLiked value if present
        updateFields.isLiked = existingRecords[0].fields.isLiked;
      }

      // Only update feedback field if new feedback is provided
      if (feedbackText) {
        updateFields.feedback = feedbackText;
      } else if (existingRecords[0].fields.feedback) {
        // Preserve existing feedback if present
        updateFields.feedback = existingRecords[0].fields.feedback;
      }

      console.log("Update fields:", updateFields);

      // Update existing record
      const record = await base(FEEDBACKS_TABLE_NAME).update(
        existingRecords[0].id,
        updateFields,
      );

      return { success: true, recordId: record.id, isUpdate: true };
    } else {
      console.log("Creating new feedback record for message:", messageId);

      // Create new record
      const newRecord = {
        user_id: userId,
        message_id: messageId,
        thread_id: threadId,
        feedback_id: `feedback_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      };

      // Only add feedback field if provided
      if (feedbackText) {
        newRecord.feedback = feedbackText;
      }

      // Only add isLiked field if it's not null/undefined
      if (isLiked !== null && isLiked !== undefined) {
        newRecord.isLiked = isLiked ? "true" : "false";
      }

      console.log("New record fields:", newRecord);

      const record = await base(FEEDBACKS_TABLE_NAME).create(newRecord);
      return { success: true, recordId: record.id, isUpdate: false };
    }
  } catch (error) {
    console.error("Error saving feedback state to Airtable:", error);
    return { success: false, error: error.message };
  }
};

// New function to fetch feedback states for a thread
export const getFeedbackStates = async (threadId, userId) => {
  try {
    const records = await base(FEEDBACKS_TABLE_NAME)
      .select({
        filterByFormula: `AND({thread_id} = '${threadId}', {user_id} = '${userId}')`,
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
  store_name,
  website,
  products,
  story,
  ecommerce_platform,
}) => {
  try {
    console.log(
      "logUserData",
      userId,
      store_name,
      website,
      products,
      story,
      ecommerce_platform,
    );
    const records = await base(USER_DATA_TABLE_NAME)
      .select({
        filterByFormula: `{user_id} = '${userId}'`,
        maxRecords: 1,
      })
      .firstPage();
    if (records.length > 0) {
      // ✅ Update existing record
      const recordId = records[0].id;

      const updated = await base(USER_DATA_TABLE_NAME).update(recordId, {
        store_name: store_name || "",
        website: website || "",
        products: products || "",

        story: story || "",
        ecommerce_platform: ecommerce_platform || "",
      });

      return { success: true, recordId: updated.id, updated: true };
    } else {
      // 🆕 Create new record
      const created = await base(USER_DATA_TABLE_NAME).create({
        user_id: userId,
        store_name: store_name || "",
        website: website || "",
        products: products || "",
        story: story || "",
        ecommerce_platform: ecommerce_platform || "",
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error saving user data to Airtable:", error);
    return { success: false, error: error.message };
  }
};

export const logDocumentUpload = async ({
  userId,
  threadId,
  messageId,
  documentId,
  documentName,
}) => {
  try {
    console.log(
      "Logging document upload to Airtable",
      DOCUMENTS_UPLOADS_TABLE_NAME,
    );
    const record = await base(DOCUMENTS_UPLOADS_TABLE_NAME).create({
      user_id: userId,
      thread_id: threadId || "",
      message_id: messageId || "",
      document_id: documentId,
      document_name: documentName,
    });

    return { success: true, recordId: record.id };
  } catch (error) {
    console.error("Error saving document upload to Airtable:", error);
    return { success: false, error: error.message };
  }
};

export const getDocumentUploads = async (threadId, userId) => {
  try {
    console.log(DOCUMENTS_UPLOADS_TABLE_NAME, 11111);
    const records = await base(DOCUMENTS_UPLOADS_TABLE_NAME)
      .select({
        filterByFormula: `AND({thread_id} = '${threadId}', {user_id} = '${userId}')`,
      })
      .all();

    const documentUploads = records.map((record) => ({
      messageId: record.fields.message_id,
      documentId: record.fields.document_id,
      documentName: record.fields.document_name,
    }));

    return { success: true, documentUploads };
  } catch (error) {
    console.error("Error fetching document uploads from Airtable:", error);
    return { success: false, error: error.message };
  }
};

export const getUserData = async (userId) => {
  try {
    const records = await base(USER_DATA_TABLE_NAME)
      .select({
        filterByFormula: `{user_id} = '${userId}'`,
      })
      .firstPage();

    if (records.length > 0) {
      console.log("records", records[0].fields);
      return records[0].fields;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching user data from Airtable:", error);
    return { success: false, error: error.message };
  }
};

export const updateUserData = async (userId, userQuestionsData) => {
  try {
    console.log("Requesting user data for userId:", userId);
    const records = await base(USER_DATA_TABLE_NAME)
      .select({
        filterByFormula: `{user_id} = '${userId}'`,
      })
      .firstPage();

    if (records.length > 0) {
      const recordId = records[0].id;

      const updated = await base(USER_DATA_TABLE_NAME).update(recordId, {
        user_questions_data: userQuestionsData,
      });

      return { success: true, recordId: updated.id };
    } else {
      // 🆕 Create new record
      const created = await base(USER_DATA_TABLE_NAME).create({
        user_id: userId,
        user_questions_data: userQuestionsData,
      });

      return { success: true, recordId: created.id };
    }
  } catch (error) {
    console.error("Error updating user questions data:", error);
    return { success: false, error: error.message };
  }
};
