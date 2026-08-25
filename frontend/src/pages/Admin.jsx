import { useEffect, useState } from "react";
import api from "../services/api";
import AppLayout from "../components/AppLayout";
import RiskBadge from "../components/RiskBadge";

export default function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [scans, setScans] = useState([]);
  const [tab, setTab] = useState("stats");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [statsRes, usersRes, scansRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/scans"),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setScans(scansRes.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load admin data — admin access required"
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  const removeUser = async (id) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((u) => u.filter((x) => x._id !== id));
    } catch {
      // non-critical
    }
  };

  if (error) {
    return (
      <AppLayout>
        <p className="text-danger text-sm">{error}</p>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <h1 className="text-2xl font-display font-semibold text-ink mb-6">👨‍💼 Admin Panel</h1>

      <div className="flex gap-2 mb-6">
        {["stats", "users", "scans"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize ${
              tab === t ? "bg-brand-deep text-white" : "bg-surface border border-border text-gray-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "stats" && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total Users" value={stats.totalUsers} />
          <StatCard label="Total Scans" value={stats.totalScans} />
          <StatCard label="Scams Detected" value={stats.scamsDetected} tone="text-danger" />
          <StatCard label="Most Common Category" value={stats.mostCommonCategory} small />
          <StatCard label="Feedback: Correct" value={stats.feedback.correct} tone="text-safe" />
          <StatCard label="Feedback: Incorrect" value={stats.feedback.incorrect} tone="text-danger" />
        </div>
      )}

      {tab === "users" && (
        <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Role</th>
                <th className="px-4 py-2 font-medium">Joined</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => removeUser(u._id)}
                      className="text-danger text-xs hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "scans" && (
        <div className="bg-surface rounded-xl shadow-sm border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">User</th>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Category</th>
                <th className="px-4 py-2 font-medium">Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {scans.map((s) => (
                <tr key={s._id}>
                  <td className="px-4 py-3 text-gray-500">
                    {s.user?.name || "Unknown"}
                  </td>
                  <td className="px-4 py-3 capitalize">{s.type}</td>
                  <td className="px-4 py-3 text-gray-500">{s.category}</td>
                  <td className="px-4 py-3">
                    <RiskBadge level={s.riskLevel} score={s.riskScore} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
}

function StatCard({ label, value, tone = "text-gray-800", small }) {
  return (
    <div className="bg-surface rounded-xl shadow-sm border border-border p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`${small ? "text-base font-semibold" : "text-2xl font-mono font-semibold"} ${tone}`}>
        {value ?? 0}
      </p>
    </div>
  );
}