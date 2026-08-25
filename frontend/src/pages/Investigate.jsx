import { useState } from "react";
import api from "../services/api";
import AppLayout from "../components/AppLayout";
import RiskBadge from "../components/RiskBadge";

export default function Investigate() {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!text && !url) {
      setError("Provide a message, a URL, or both");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post("/investigate", {
        text: text || undefined,
        url: url || undefined,
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Investigation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <h1 className="text-2xl font-display font-semibold text-ink mb-2">🕵️ Investigation Engine</h1>
      <p className="text-sm text-gray-500 mb-6">
        Combine a message and a URL for a fused risk assessment — stronger
        than analyzing either one alone.
      </p>

      <form onSubmit={handleSubmit} className="bg-surface rounded-xl shadow-sm border border-border p-6 mb-6 space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Message text (optional)"
          className="w-full border rounded-lg px-3 py-2"
        />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Related URL (optional)"
          className="w-full border rounded-lg px-3 py-2"
        />
        {error && <p className="text-danger text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-deep text-white px-4 py-2 rounded-lg font-medium hover:bg-brand disabled:opacity-50"
        >
          {loading ? "Investigating..." : "Run Investigation"}
        </button>
      </form>

      {result && (
        <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center gap-3 mb-4">
            <RiskBadge level={result.riskLevel} score={result.finalRisk} />
            <span className="text-sm text-gray-500">{result.category}</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            {result.messageRisk !== null && result.messageRisk !== undefined && (
              <div className="bg-paper rounded-lg p-3">
                <p className="text-xs text-gray-400">Message Risk</p>
                <p className="font-mono font-semibold text-lg">{result.messageRisk}/100</p>
              </div>
            )}
            {result.urlRisk !== null && result.urlRisk !== undefined && (
              <div className="bg-paper rounded-lg p-3">
                <p className="text-xs text-gray-400">URL Risk</p>
                <p className="font-mono font-semibold text-lg">{result.urlRisk}/100</p>
              </div>
            )}
          </div>

          <h3 className="text-sm font-semibold mb-2">Combined Evidence</h3>
          <ul className="list-disc list-inside text-sm space-y-1">
            {result.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </AppLayout>
  );
}