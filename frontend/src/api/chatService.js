// const backendUrl = "https://ejitukppt8.execute-api.eu-west-3.amazonaws.com/dev";
// const backendUrl = "http://localhost:3000";
const backendUrl = "http://13.38.107.93:3000";

export async function createThread(userId = "guest") {
  try {
    const response = await fetch(`${backendUrl}/create-thread`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        threadTitle: "Nuevo Chat",
        userId,
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating thread:", error);
    throw error;
  }
}

export const fetchThreads = async (userId) => {
  try {
    console.log("userId", userId);
    const response = await fetch(`${backendUrl}/threads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });
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
    const response = await fetch(`${backendUrl}/threads/${threadId}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Failed to fetch messages");
    }

    return data.messages.reverse().map((msg) => ({
      text: msg.content[0].text.value,
      isBot: msg.role === "assistant",
      id: msg.id,
    }));
  } catch (error) {
    console.error("Error in fetchMessages:", error);
    throw error;
  }
};

export const sendMessage = async (
  threadId,
  userMessage,
  userId,
  file = null,
) => {
  try {
    const formData = new FormData();
    formData.append("userMessage", userMessage);
    formData.append("userId", userId || "guest");
    console.log("file", file);

    if (file) {
      console.log("Adding file to FormData:", file.name);
      formData.append("file", file);

      // Log the actual file object
      console.log("File object:", file);
      console.log("File type:", file.type);
      console.log("File size:", file.size);
    }

    // Log the complete FormData contents
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    const response = await fetch(`${backendUrl}/run/${threadId}`, {
      method: "POST",
      body: formData,
      // Remove Content-Type header to let browser set it with boundary
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to send message");
    }

    const data = await response.json();

    if (!data.success || !data.botMessage) {
      throw new Error(data.message || "Error processing request");
    }

    return {
      botMessage: data.botMessage.content[0].text.value,
      messageId: data.botMessage.id,
    };
  } catch (error) {
    console.error("Error in sendMessage:", error);
    throw error;
  }
};

export const deleteThread = async (id) => {
  try {
    const response = await fetch(`${backendUrl}/threads/${id}`, {
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
    const response = await fetch(`${backendUrl}/threads/${id}`, {
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

export const appendFeedbackMessage = async (
  threadId,
  messageId,
  userId,
  feedback,
  originalFeedback,
) => {
  try {
    // Ensure required parameters are provided
    if (!threadId || !messageId || !feedback || !userId) {
      throw new Error("Thread ID, Message ID, and Feedback are required.");
    }

    const response = await fetch(
      `${backendUrl}/threads/${threadId}/${messageId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedback, originalFeedback, userId }),
      },
    );

    // Check if response is successful
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to append feedback message");
    }

    const data = await response.json();

    if (!data.success || !data.savedFeedback) {
      throw new Error(data.message || "Error processing feedback");
    }

    return data.savedFeedback; // Return the saved feedback from the backend
  } catch (error) {
    console.error("Error in appendFeedbackMessage:", error);
    throw error;
  }
};

export const updateUserData = async (userId, userData) => {
  try {
    console.log("userId in updateUserData", userId);

    if (!userId) {
      throw new Error("User ID is required.");
    }

    const response = await fetch(
      `${backendUrl}/users/${userId}/user-questions-data`,
      {
        method: "POST", // or "POST" if you're not strictly RESTful
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update user data.");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "User update failed.");
    }

    return data;
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
};

export const getUserData = async (userId) => {
  try {
    console.log("userId in getUserData", userId);
    if (!userId) {
      throw new Error("User ID is required.");
    }
    const response = await fetch(`${backendUrl}/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch user data.");
    }
    const data = await response.json();
    console.log("user ka data", data);
    if (!data.success || !data.data) {
      throw new Error(data.message || "User data not found.");
    }

    console.log("data", data);
    return data.data; // returning only the actual user data
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error; // optional: or return null if you prefer silent failure
  }
};

export async function fetchFeedbackStates(threadId, userId) {
  try {
    const response = await fetch(
      `${backendUrl}/feedback/states/${threadId}/${userId}`,
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching feedback states:", error);
    throw error;
  }
}

export async function fetchDocumentUploads(threadId, userId) {
  try {
    const response = await fetch(
      `${backendUrl}/documents/${threadId}/${userId}`,
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching document uploads:", error);
    throw error;
  }
}

export async function storeFeedbackState({
  userId,
  messageId,
  threadId,
  isLiked,
}) {
  try {
    const response = await fetch(`${backendUrl}/feedback/state`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, messageId, threadId, isLiked }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to store feedback state");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error storing feedback state:", error);
    throw error;
  }
}
