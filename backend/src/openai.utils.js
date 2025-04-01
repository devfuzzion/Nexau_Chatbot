import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();
const openai = new OpenAI();
const ASSISTANT_ID = process.env.ASSISTANT_ID;

export const processFileContent = async (file) => {
  // Convert file buffer to text
  console.log("file", file)
  const text = file.buffer.toString('utf-8');
  return text;
};

export const uploadFileToOpenAI = async (file) => {
  try {
    console.log('Uploading file to OpenAI:', file.originalname);
    const uploadedFile = await openai.files.create({
      file: fs.createReadStream(file.path),
      purpose: "assistants",
    });
    console.log('File uploaded successfully:', uploadedFile.id);
    return uploadedFile;
  } catch (error) {
    console.error('Error uploading file to OpenAI:', error);
    throw error;
  }
};

export const appendMessageInThread = async (threadId, userMessage, file = null) => {
  try {
    let messageOptions = {
      role: "user",
      content: userMessage,
    };

    if (file) {
      // Upload file to OpenAI first
      const uploadedFile = await uploadFileToOpenAI(file);
      
      // Add file attachment to message
      messageOptions['attachments'] = [
        {
          file_id: uploadedFile.id,
          tools:[{type: "file_search"}]
        }
      ];
    }

    const message = await openai.beta.threads.messages.create(threadId, messageOptions);
    return message;
  } catch (error) {
    console.error('Error appending message to thread:', error);
    throw error;
  }
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

export const generateThreadTitle = async (messages) => {
  const context = messages
    .map(
      (msg) => `${msg.role}: ${msg.content.map((c) => c.text.value).join(" ")}`,
    )
    .join("\n");
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are an AI assistant that generates concise and relevant thread titles based on the given conversation context.",
      },
      {
        role: "user",
        content: `Here is the conversation context: ${context}\n\nGenerate a short, clear, and engaging title that summarizes the discussion (Title should be not more than 3 words).`,
      },
    ],
    model: "gpt-4o-mini",
    store: false,
  });

  console.log(completion.choices[0]);
  return completion.choices[0].message.content;
};
