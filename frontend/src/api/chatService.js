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

export const sendMessage = async (threadId, userMessage, file = null) => {
  try {
    const formData = new FormData();
    formData.append('userMessage', userMessage);
    console.log("file", file)
    
    if (file) {
      console.log('Adding file to FormData:', file.name);
      formData.append('file', file);
      
      // Log the actual file object
      console.log('File object:', file);
      console.log('File type:', file.type);
      console.log('File size:', file.size);
    }

    // Log the complete FormData contents
    for (let pair of formData.entries()) {
      console.log(pair[0] + ': ' + pair[1]);
    }

    const response = await fetch(`http://localhost:3000/run/${threadId}`, {
      method: "POST",
      body: formData,
      // Remove Content-Type header to let browser set it with boundary
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send message');
    }

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

export const deleteThread = async (id) => {
  try {
    const response = await fetch(`http://localhost:3000/threads/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!data.success || !data.message) {
      throw new Error(data.message || "Error processing request");
    }

    return data;
  } catch (error) {
    console.error("Error in deleting thread:", error);
    throw error;
  }
};

export const updateThreadTitle = async (id, newTitle, aiTitle) => {
  try {
    const response = await fetch(`http://localhost:3000/threads/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title: newTitle, aiTitle }),
    });

    const data = await response.json();

    if (!data.success || !data.message) {
      throw new Error(data.message || "Error processing request");
    }

    return data;
  } catch (error) {
    console.error("Error in updating thread title:", error);
    throw error;
  }
};
