import { useState } from "react";
import api from "../services/api";
import AppLayout from "../components/AppLayout";
import RiskBadge from "../components/RiskBadge";

export default function UrlScanner() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post("/scans/url", { url });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "URL scan failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <h1 className="text-2xl font-display font-semibold text-ink mb-6">🔗 URL Scanner</h1>

      <form onSubmit={handleSubmit} className="bg-surface rounded-xl shadow-sm border border-border p-6 mb-6">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://suspicious-example.com/login"
          className="w-full border rounded-lg px-3 py-2 mb-3"
          required
        />
        {error && <p className="text-danger text-sm mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-deep text-white px-4 py-2 rounded-lg font-medium hover:bg-brand disabled:opacity-50"
        >
          {loading ? "Checking..." : "Scan URL"}
        </button>
      </form>

      {result && (
        <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <RiskBadge level={result.riskLevel} score={result.riskScore} />
            <span className="text-sm text-gray-500">{result.category}</span>
          </div>
          <h3 className="text-sm font-semibold mb-2">Indicators</h3>
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