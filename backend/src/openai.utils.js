import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();
const openai = new OpenAI();
const ASSISTANT_ID = process.env.ASSISTANT_ID;
export const appendMessageInThread = async (threadId, userMessage) => {
  const message = await openai.beta.threads.messages.create(threadId, {
    role: "user",
    content: userMessage,
  });
  return message;
};

export const createThread = async () => {
  const thread = await openai.beta.threads.create();
  console.log(thread);
  return thread;
};

export const createRun = async (threadId) => {
  const run = await openai.beta.threads.runs.createAndPoll(threadId, {
    assistant_id: ASSISTANT_ID,
  });
  return run;
};

export const listMesasgesInThread = async (threadId) => {
  const messages = await openai.beta.threads.messages.list(threadId);
  return messages.data;
};

export const delThread = async (threadId) => {
  const response = await openai.beta.threads.del(threadId);
  return response;
};
