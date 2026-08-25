import { useState } from "react";
import api from "../services/api";
import AppLayout from "../components/AppLayout";
import RiskBadge from "../components/RiskBadge";

export default function EmailAnalyzer() {
  const [form, setForm] = useState({ sender: "", subject: "", body: "", links: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const links = form.links
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      const { data } = await api.post("/scans/email", {
        sender: form.sender,
        subject: form.subject,
        body: form.body,
        links,
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Email analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <h1 className="text-2xl font-display font-semibold text-ink mb-6">✉️ Email Analyzer</h1>

      <form onSubmit={handleSubmit} className="bg-surface rounded-xl shadow-sm border border-border p-6 mb-6 space-y-3">
        <input
          type="text"
          value={form.sender}
          onChange={update("sender")}
          placeholder="Sender (e.g. security@bank-alerts.com)"
          className="w-full border rounded-lg px-3 py-2"
        />
        <input
          type="text"
          value={form.subject}
          onChange={update("subject")}
          placeholder="Subject line"
          className="w-full border rounded-lg px-3 py-2"
        />
        <textarea
          value={form.body}
          onChange={update("body")}
          rows={6}
          placeholder="Paste the email body here..."
          className="w-full border rounded-lg px-3 py-2"
          required
        />
        <textarea
          value={form.links}
          onChange={update("links")}
          rows={2}
          placeholder="Links found in the email, one per line (optional)"
          className="w-full border rounded-lg px-3 py-2"
        />
        {error && <p className="text-danger text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-deep text-white px-4 py-2 rounded-lg font-medium hover:bg-brand disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Analyze Email"}
        </button>
      </form>

      {result && (
        <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <RiskBadge level={result.riskLevel} score={result.riskScore} />
            <span className="text-sm text-gray-500">{result.category}</span>
          </div>
          <h3 className="text-sm font-semibold mb-2">Why</h3>
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