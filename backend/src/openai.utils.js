import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";
dotenv.config();
const openai = new OpenAI();
const ASSISTANT_ID = process.env.ASSISTANT_ID;

export const processFileContent = async (file) => {
  // Convert file buffer to text
  console.log("file", file);
  const text = file.buffer.toString("utf-8");
  return text;
};

export const uploadFileToOpenAI = async (file) => {
  try {
    console.log("Uploading file to OpenAI:", file.originalname);
    const uploadedFile = await openai.files.create({
      file: fs.createReadStream(file.path),
      purpose: "assistants",
    });
    console.log("File uploaded successfully:", uploadedFile.id);
    return uploadedFile;
  } catch (error) {
    console.error("Error uploading file to OpenAI:", error);
    throw error;
  }
};

export const appendMessageInThread = async (
  threadId,
  userMessage,
  file = null,
) => {
  try {
    let messageOptions = {
      role: "user",
      content: userMessage,
    };

    if (file) {
      // Upload file to OpenAI first
      const uploadedFile = await uploadFileToOpenAI(file);

      // Add file attachment to message
      messageOptions["attachments"] = [
        {
          file_id: uploadedFile.id,
          tools: [{ type: "file_search" }],
        },
      ];
    }

    const message = await openai.beta.threads.messages.create(
      threadId,
      messageOptions,
    );
    return message;
  } catch (error) {
    console.error("Error appending message to thread:", error);
    throw error;
  }
};

export const createThread = async () => {
  const thread = await openai.beta.threads.create();
  console.log(thread);
  return thread;
};

export const getThreadDataFromOpenAi = async (threadId) => {
  const thread = await openai.beta.threads.retrieve(threadId);
  return thread;
};

// export const saveFeedback = async (threadId, feedback) => {
//   const updatedThread = await openai.beta.threads.update(threadId, {
//     metadata: { feedback },
//   });
//   return updatedThread;
// };

export const createRun = async (threadId) => {
  const run = await openai.beta.threads.runs.createAndPoll(threadId, {
    assistant_id: ASSISTANT_ID,
    instructions: `Eres un asistente AI servicial. IMPORTANTE: Siempre responde en español, independientemente del idioma en que te escriba el usuario.

Siempre formatea tus respuestas en formato markdown. Utiliza la sintaxis markdown apropiada para:
- Encabezados (usando #)
- Listas (tanto ordenadas como no ordenadas)
- Bloques de código (usando \`\`\`)
- Texto en negrita e itálica
- Tablas cuando presentes datos estructurados
- Citas en bloque para notas o citas importantes
- Enlaces cuando hagas referencia a recursos externos

Asegúrate de que tus respuestas sean:
1. Siempre en español
2. Claras y bien estructuradas
3. Visualmente atractivas usando formato markdown
4. Profesionales y amigables
5. Incluyan ejemplos cuando sea apropiado

Recuerda: No importa en qué idioma te escriba el usuario, siempre responde en español.`,
  });
  return run;
};

export const listMesasgesInThread = async (threadId) => {
  const messages = await openai.beta.threads.messages.list(threadId, {
    limit: 100,
  });
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

  return completion.choices[0].message.content;
};

export const getMessageById = async (threadId, messageId) => {
  const message = await openai.beta.threads.messages.retrieve(
    threadId,
    messageId,
  );
  return message;
};

export const generateFeedbackSummary = async (context) => {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are an AI assistant that refines user feedback by incorporating new feedback into the original feedback. The updated feedback should focus on the qualities of the message—what was good, what could be improved, or any advice. Avoid stating personal preferences like 'I liked this message because...'. Keep the feedback concise and limited to three lines.",
      },
      {
        role: "user",
        content: `Here is the feedback context:\n\n${context}\n\nUpdate the original feedback by merging the new feedback into it. Ensure the feedback highlights the qualities of the message (e.g., clarity, depth, relevance, or areas for improvement). The feedback can be positive, negative, or suggest improvements. Keep it short and meaningful (max 3 lines).`,
      },
    ],
    model: "gpt-4o-mini",
    store: false,
  });

  return completion.choices[0].message.content;
};
