import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import api from "../../services/api"; // Use your correct path

const DebateRoom = () => {
    const location = useLocation();
    const debateId = location.state?.debateId;
  const topic = location.state?.topic || "Artificial Intelligence";
const stance = location.state?.stance || "Against";

const bottomRef = useRef(null);

  const [messages, setMessages] = useState([
    {
        sender: "AI",
        text: `Welcome! Today's debate topic is "${topic}". I will argue ${
            stance === "For" ? "Against" : "For"
        }. Please present your opening argument.`,
    },
]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
        behavior: "smooth",
    });
}, [messages]);


  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;

    setMessages((prev) => [
      ...prev,
      {
        sender: "You",
        text: userMessage,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await api.post("/ai/chat", {
    debate_id: debateId,
    topic,
    stance,
    user_message: userMessage,
});

      setMessages((prev) => [
        ...prev,
        {
          sender: "AI",
          text: response.data.reply,
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          sender: "AI",
          text: "Sorry, I'm unable to respond right now.",
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
    <h1 className="text-3xl font-bold">
        AI Debate Room
    </h1>

    <p className="text-gray-600 mt-2">
        <strong>Topic:</strong> {topic}
    </p>

    <p className="text-gray-600">
        <strong>Your Stance:</strong> {stance}
    </p>
</div>

      <div className="border rounded-lg h-[500px] overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sender === "You" ? "text-right" : "text-left"}
          >
            <div className="font-bold">
              {msg.sender}
            </div>

            <div
              className={`inline-block rounded-lg p-3 mt-1 max-w-[80%] ${
                msg.sender === "You"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-left">
            <div className="font-bold">AI</div>
            <div className="inline-block bg-gray-100 rounded-lg p-3 mt-1">
              🤖 AI is thinking...
            </div>
          </div>
        )}
                <div ref={bottomRef}></div>

      </div>

      <div className="flex mt-4 gap-3">
        <input
          className="border rounded-lg flex-1 p-3"
          placeholder="Type your argument..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 rounded-lg"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default DebateRoom;