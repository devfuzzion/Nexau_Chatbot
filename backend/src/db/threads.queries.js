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
