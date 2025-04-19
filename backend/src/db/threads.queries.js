import sql from "./db.js";

export const getAllThreads = async (userId) => {
  try {
    const { rows } = await sql.query(
      "SELECT * FROM threads WHERE 'userId' = $1 ORDER BY createdAt DESC",
      [userId],
    );
    return rows;
  } catch (err) {
    console.error("Error fetching threads:", err);
    throw err;
  }
};
export const getThreadById = async (id) => {
  try {
    const { rows } = await sql.query('SELECT * FROM threads WHERE "id"=$1', [
      id,
    ]);
    if (rows.length === 0) {
      console.log(`No thread found with ID: ${id}`);
      return null; // or return { success: false, message: "Thread not found" };
    }
    return rows[0];
  } catch (err) {
    console.error("Error fetching thread:", err);
    throw err;
  }
};

export const createThreadInDb = async (threadId, threadTitle, userId) => {
  try {
    const { rows } = await sql.query(
      'INSERT INTO threads ("threadid","threadTitle", "userId") VALUES ($1,$2, $3) RETURNING *',
      [threadId, threadTitle, userId],
    );
    return rows[0];
  } catch (err) {
    console.error("Error inserting thread:", err);
    throw err;
  }
};

export const deleteThreadInDb = async (id) => {
  try {
    const { rowCount } = await sql.query(
      'DELETE FROM threads WHERE "id" = $1',
      [id],
    );

    if (rowCount > 0) {
      console.log(`Thread with ID ${id} deleted successfully.`);
      return { success: true, message: "Thread deleted successfully." };
    } else {
      console.log(`No thread found with ID ${id}.`);
      return { success: false, message: "Thread not found." };
    }
  } catch (err) {
    console.error("Error deleting thread:", err);
    throw err;
  }
};

export const updateThreadTitle = async (id, newTitle) => {
  try {
    const { rowCount } = await sql.query(
      'UPDATE threads SET "threadTitle" = $1 WHERE "threadid" = $2',
      [newTitle, id],
    );

    if (rowCount > 0) {
      console.log(`Thread title updated successfully for ID ${id}.`);
      return { success: true, message: "Thread title updated successfully." };
    } else {
      console.log(`No thread found with ID ${id}.`);
      return { success: false, message: "Thread not found." };
    }
  } catch (err) {
    console.error(`Error updating thread title`);
    throw err;
  }
};

export const updateFeedback = async (id, feedback) => {
  try {
    const { rowCount } = await sql.query(
      'UPDATE threads SET "feedback" = $1 WHERE "threadid" = $2',
      [feedback, id],
    );

    if (rowCount > 0) {
      console.log(`Feedback updated successfully for ID ${id}.`);
      return { success: true, message: "Feedback updated successfully." };
    } else {
      console.log(`No thread found with ID ${id}.`);
      return { success: false, message: "Thread not found." };
    }
  } catch (err) {
    console.error(`Error updating feedback`);
    throw err;
  }
};

export const createUser = async ({ storeName, website, products, story }) => {
  try {
    const { rowCount } = await sql.query(
      'INSERT INTO users ("storeName", "website", "products", "story") VALUES ($1, $2, $3, $4)',
      [storeName, website, products, story]
    );

    if (rowCount > 0) {
      console.log(`User created successfully: ${storeName}`);
      return { success: true, message: "User created successfully." };
    } else {
      return { success: false, message: "Failed to create user." };
    }
  } catch (err) {
    console.error("Error creating user:", err);
    throw err;
  }
};

