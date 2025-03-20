export const fetchThreads = async () => {
  try {
    const response = await fetch("http://localhost:3000/threads");
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch threads");
    }

    return data.threads;
  } catch (error) {
    console.error("Error in fetchThreads:", error);
    throw error;
  }
};

export const fetchMessages = async (threadId) => {
  try {
    const response = await fetch(`http://localhost:3000/threads/${threadId}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch messages");
    }

    return data.messages.reverse().map((msg) => ({
      text: msg.content[0].text.value,
      isBot: msg.role === "assistant",
    }));
  } catch (error) {
    console.error("Error in fetchMessages:", error);
    throw error;
  }
};

export const sendMessage = async (threadId, userMessage) => {
  try {
    const response = await fetch(`http://localhost:3000/run/${threadId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userMessage }),
    });

    const data = await response.json();

    if (!data.success || !data.botMessage) {
      throw new Error(data.message || "Error processing request");
    }

    return data.botMessage.content[0].text.value;
  } catch (error) {
    console.error("Error in sendMessage:", error);
    throw error;
  }
};
