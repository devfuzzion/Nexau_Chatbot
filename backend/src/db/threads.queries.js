import sql from "./db.js";

export const getAllThreads = async () => {
  try {
    const { rows } = await sql.query("SELECT * FROM threads");
    return rows;
  } catch (err) {
    console.error("Error fetching threads:", err);
    throw err;
  }
};

export const createThreadInDb = async (threadId) => {
  try {
    const { rows } = await sql.query(
      'INSERT INTO threads ("threadid") VALUES ($1) RETURNING *',
      [threadId],
    );
    return rows[0];
  } catch (err) {
    console.error("Error inserting thread:", err);
    throw err;
  }
};
