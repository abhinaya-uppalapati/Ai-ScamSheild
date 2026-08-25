import { useState } from "react";
import api from "../services/api";
import AppLayout from "../components/AppLayout";
import RiskBadge from "../components/RiskBadge";
import TacticBadges from "../components/TacticBadges";

const EXAMPLE = `Scammer: Hello, I am from SBI Bank.
User: Yes?
Scammer: Your account has a KYC issue that needs urgent verification.
Scammer: Please send your OTP immediately to avoid account suspension.
User: Why do you need my OTP?
Scammer: Otherwise your account will be permanently blocked today.`;

export default function ConversationAnalyzer() {
  const [conversation, setConversation] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post("/scans/conversation", { conversation });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Conversation analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <h1 className="text-2xl font-display font-semibold text-ink mb-2">🧠 Conversation Analyzer</h1>
      <p className="text-sm text-gray-500 mb-6">
        Paste a full back-and-forth conversation. Unlike the message scanner,
        this looks at how the conversation escalates across turns — trust
        building, then pressure, then a credential or payment ask — not just
        keywords in a single line.
      </p>

      <form onSubmit={handleSubmit} className="bg-surface rounded-xl shadow-sm border border-border p-6 mb-6">
        <textarea
          value={conversation}
          onChange={(e) => setConversation(e.target.value)}
          rows={10}
          placeholder="Paste the full conversation here, one message per line..."
          className="w-full border rounded-lg px-3 py-2 mb-2 font-mono text-sm"
          required
        />
        <button
          type="button"
          onClick={() => setConversation(EXAMPLE)}
          className="text-xs text-brand-deep hover:underline mb-3"
        >
          Fill with example conversation
        </button>
        {error && <p className="text-danger text-sm mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-deep text-white px-4 py-2 rounded-lg font-medium hover:bg-brand disabled:opacity-50 block"
        >
          {loading ? "Analyzing conversation..." : "Analyze Conversation"}
        </button>
      </form>

      {result && (
        <div className="bg-surface rounded-xl shadow-sm border border-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <RiskBadge level={result.riskLevel} score={result.riskScore} />
            <span className="text-sm text-gray-500">{result.category}</span>
          </div>

          {result.tactics?.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">Tactics Detected</h3>
              <TacticBadges tactics={result.tactics} />
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold mb-2">Why</h3>
            <ul className="list-disc list-inside text-sm space-y-1">
              {result.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </AppLayout>
  );
}