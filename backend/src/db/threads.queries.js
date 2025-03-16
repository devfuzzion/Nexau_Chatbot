import sql from "./db.js";
import { listMesasgesInThread } from "./../openai.utils.js";

export const getAllThreads = async () => {
  const threads = await sql`SELECT * FROM threads`;
  return threads;
};

export const createThreadInDb = async (threadId) => {
  try {
    const [thread] =
      await sql`INSERT INTO threads ("threadId") VALUES (${threadId})`;
    return thread;
  } catch (err) {
    console.log(err);
  }
};
