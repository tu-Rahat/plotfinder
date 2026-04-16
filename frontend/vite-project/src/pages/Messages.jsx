import { useEffect, useState } from "react";
import "./Messages.css";

function Messages() {
  const token = localStorage.getItem("token");

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      setErrorMessage("");

      const response = await fetch("http://localhost:5000/api/chat/conversations/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch conversations");
      }

      setConversations(data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      setLoadingMessages(true);
      setErrorMessage("");

      const response = await fetch(
        `http://localhost:5000/api/chat/messages/${conversationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch messages");
      }

      setMessages(data);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation._id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim() || !selectedConversation) return;

    try {
      setErrorMessage("");

      const response = await fetch(
        `http://localhost:5000/api/chat/messages/${selectedConversation._id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            text: messageText,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send message");
      }

      setMessages((prev) => [...prev, data]);
      setMessageText("");
      fetchConversations();
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="messages-page">
      <div className="messages-layout">
        <aside className="conversation-sidebar">
          <div className="conversation-sidebar-header">
            <h2>My Chats</h2>
            <p>Buyer-seller conversations for land listings</p>
          </div>

          {loadingConversations && (
            <p className="messages-info">Loading conversations...</p>
          )}

          {!loadingConversations && conversations.length === 0 && (
            <p className="messages-info">No conversations found yet.</p>
          )}

          <div className="conversation-list">
            {conversations.map((conversation) => (
              <button
                key={conversation._id}
                type="button"
                className={`conversation-item ${
                  selectedConversation?._id === conversation._id ? "active" : ""
                }`}
                onClick={() => handleSelectConversation(conversation)}
              >
                <h3>{conversation.landId?.title || "Land Chat"}</h3>
                <p>
                  {conversation.lastMessage
                    ? conversation.lastMessage
                    : "No messages yet"}
                </p>
              </button>
            ))}
          </div>
        </aside>

        <section className="chat-panel">
          {!selectedConversation ? (
            <div className="empty-chat-state">
              <h2>Select a conversation</h2>
              <p>Choose a land-based chat from the left to start messaging.</p>
            </div>
          ) : (
            <>
              <div className="chat-panel-header">
                <h2>{selectedConversation.landId?.title || "Conversation"}</h2>
                <p>
                  Land Type: {selectedConversation.landId?.landType || "N/A"} | Price: ৳{" "}
                  {Number(selectedConversation.landId?.price || 0).toLocaleString()}
                </p>
              </div>

              <div className="chat-messages">
                {loadingMessages ? (
                  <p className="messages-info">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <p className="messages-info">No messages yet. Start the conversation.</p>
                ) : (
                  messages.map((message) => (
                    <div key={message._id} className="message-bubble">
                      <p className="message-sender">
                        {message.senderId?.firstName} {message.senderId?.lastName}
                      </p>
                      <p>{message.text}</p>
                      <span className="message-time">
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <form className="chat-input-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <button type="submit">Send</button>
              </form>
            </>
          )}

          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </section>
      </div>
    </div>
  );
}

export default Messages;