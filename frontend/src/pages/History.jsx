import { useEffect, useState } from "react";
import api from "../services/api";
import AppLayout from "../components/AppLayout";
import RiskBadge from "../components/RiskBadge";
import TacticBadges from "../components/TacticBadges";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function inputPreview(scan) {
  if (typeof scan.input === "string") return scan.input;
  if (scan.input?.text || scan.input?.url) {
    return [scan.input.text, scan.input.url].filter(Boolean).join(" — ");
  }
  if (scan.input?.subject) return scan.input.subject;
  return scan.type;
}

export default function History() {
  const [scans, setScans] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/scans");
      setScans(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load scan history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const giveFeedback = async (id, feedback) => {
    try {
      const { data } = await api.patch(`/scans/${id}/feedback`, { feedback });
      setScans((prev) => prev.map((s) => (s._id === id ? data : s)));
      if (selected?._id === id) setSelected(data);
    } catch {
      // silently ignore — non-critical UI action
    }
  };

  const filtered =
    filter === "ALL" ? scans : scans.filter((s) => s.riskLevel === filter);

  return (
    <AppLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-semibold text-ink">📜 Scan History</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-lg px-3 py-1.5 text-sm"
        >
          <option value="ALL">All</option>
          <option value="SAFE">Safe</option>
          <option value="SUSPICIOUS">Suspicious</option>
          <option value="HIGH_RISK">High Risk</option>
        </select>
      </div>

      {error && <p className="text-danger text-sm mb-4">{error}</p>}

      <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-gray-400">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">No scans found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Preview</th>
                <th className="px-4 py-2 font-medium">Category</th>
                <th className="px-4 py-2 font-medium">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((s) => (
                <tr
                  key={s._id}
                  onClick={() => setSelected(s)}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                    {formatDate(s.createdAt)}
                  </td>
                  <td className="px-4 py-3 capitalize">{s.type}</td>
                  <td className="px-4 py-3 truncate max-w-xs">
                    {inputPreview(s)}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{s.category}</td>
                  <td className="px-4 py-3">
                    <RiskBadge level={s.riskLevel} score={s.riskScore} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-surface rounded-xl shadow-xl border border-border max-w-lg w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <RiskBadge level={selected.riskLevel} score={selected.riskScore} />
                <p className="text-sm text-gray-500 mt-1">
                  {selected.category} · {formatDate(selected.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <p className="text-sm bg-paper rounded-lg p-3 mb-4 whitespace-pre-wrap">
              {inputPreview(selected)}
            </p>

            {selected.tactics?.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold mb-2">Tactics Detected</h3>
                <TacticBadges tactics={selected.tactics} />
              </div>
            )}

            <h3 className="text-sm font-semibold mb-2">Why</h3>
            <ul className="list-disc list-inside text-sm space-y-1 mb-5">
              {selected.reasons?.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>

            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 mb-2">
                Was this prediction correct?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => giveFeedback(selected._id, "correct")}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${
                    selected.feedback === "correct"
                      ? "bg-green-100 border-green-300 text-safe"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  👍 Correct
                </button>
                <button
                  onClick={() => giveFeedback(selected._id, "incorrect")}
                  className={`px-3 py-1.5 rounded-lg text-sm border ${
                    selected.feedback === "incorrect"
                      ? "bg-red-100 border-red-300 text-danger"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  👎 Incorrect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}