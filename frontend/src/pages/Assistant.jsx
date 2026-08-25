import { useState, useRef, useEffect } from "react";
import api from "../services/api";
import AppLayout from "../components/AppLayout";

export default function Assistant() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI Security Assistant. Ask me about suspicious messages, phishing, OTP requests, or anything scam-related.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setError("");

    const userMessage = { role: "user", content: input };
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((m) => [...m, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post("/assistant/chat", {
        message: userMessage.content,
        history,
      });
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(
        err.response?.data?.message || "The assistant is unavailable right now"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <h1 className="text-2xl font-display font-semibold text-ink mb-6">🤖 AI Security Assistant</h1>

      <div className="bg-surface rounded-xl shadow-sm border border-border flex flex-col h-[65vh]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  m.role === "user"
                    ? "bg-brand-deep text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-2 text-sm text-gray-400">
                Thinking...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {error && <p className="text-danger text-sm px-4">{error}</p>}

        <form onSubmit={handleSend} className="border-t p-3 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. I received a message asking for my OTP, what should I do?"
            className="flex-1 border rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-deep text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </AppLayout>
  );
}