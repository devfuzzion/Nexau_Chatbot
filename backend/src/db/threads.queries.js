import sql from "./db.js";

export const getAllThreads = async () => {
  try {
    const { rows } = await sql.query(
      "SELECT * FROM threads ORDER BY createdAt DESC",
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

export const createThreadInDb = async (threadId, threadTitle) => {
  try {
    const { rows } = await sql.query(
      'INSERT INTO threads ("threadid","threadTitle") VALUES ($1,$2) RETURNING *',
      [threadId, threadTitle],
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
      'UPDATE threads SET "threadTitle" = $1 WHERE "id" = $2',
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
