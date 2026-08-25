import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import AppLayout from "../components/AppLayout";
import RiskBadge from "../components/RiskBadge";
import TacticBadges from "../components/TacticBadges";

export default function Dashboard() {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [scans, setScans] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadScans = async () => {
    const { data } = await api.get("/scans");
    setScans(data.slice(0, 5));

    const counts = { total: data.length, SAFE: 0, SUSPICIOUS: 0, HIGH_RISK: 0 };
    data.forEach((s) => {
      counts[s.riskLevel] = (counts[s.riskLevel] || 0) + 1;
    });
    setStats(counts);
  };

  useEffect(() => {
    loadScans().catch(() => {});
  }, []);

  const handleScan = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/scans/message", { text });
      setResult(data);
      setText("");
      loadScans();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Scan failed — is the AI service running on port 8000?"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <h1 className="text-2xl font-display font-semibold text-ink mb-6">
        Welcome, {user?.name?.split(" ")[0]} 👋
      </h1>

      {stats && (
        <div className="grid grid-cols-4 gap-3 mb-6">
          <StatCard label="Total Scans" value={stats.total} />
          <StatCard label="Safe" value={stats.SAFE} tone="text-safe" />
          <StatCard
            label="Suspicious"
            value={stats.SUSPICIOUS}
            tone="text-suspicious"
          />
          <StatCard label="High Risk" value={stats.HIGH_RISK} tone="text-danger" />
        </div>
      )}

      <form onSubmit={handleScan} className="bg-surface rounded-xl shadow-sm border border-border p-6 mb-6">
        <h2 className="font-semibold mb-3">Scan a message</h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Paste a suspicious message here..."
          className="w-full border rounded-lg px-3 py-2 mb-3"
          required
        />
        {error && <p className="text-danger text-sm mb-3">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-brand-deep text-white px-4 py-2 rounded-lg font-medium hover:bg-brand disabled:opacity-50"
        >
          {loading ? "Scanning..." : "Scan Message"}
        </button>
      </form>

      {result && (
        <div className="bg-surface rounded-xl shadow-sm border border-border p-6 mb-6 space-y-3">
          <div className="flex items-center gap-3">
            <RiskBadge level={result.riskLevel} score={result.riskScore} />
            <span className="text-sm text-gray-500">{result.category}</span>
          </div>
          {result.tactics?.length > 0 && <TacticBadges tactics={result.tactics} />}
          <ul className="list-disc list-inside text-sm space-y-1">
            {result.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
        <h2 className="font-semibold mb-3">Recent Scans</h2>
        {scans.length === 0 ? (
          <p className="text-sm text-gray-400">No scans yet.</p>
        ) : (
          <ul className="divide-y">
            {scans.map((s) => (
              <li key={s._id} className="py-2 flex justify-between items-center text-sm">
                <span className="truncate max-w-xs">
                  {typeof s.input === "string" ? s.input : s.type}
                </span>
                <RiskBadge level={s.riskLevel} score={s.riskScore} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppLayout>
  );
}

function StatCard({ label, value, tone = "text-gray-800" }) {
  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-mono font-semibold ${tone}`}>{value ?? 0}</p>
    </div>
  );
}