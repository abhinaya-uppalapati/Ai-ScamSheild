import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import api from "../services/api";
import AppLayout from "../components/AppLayout";

const RISK_COLORS = { SAFE: "#16a34a", SUSPICIOUS: "#D97706", HIGH_RISK: "#dc2626" };
const BAR_COLOR = "#14B8A6";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/analytics/overview")
      .then((res) => setData(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load analytics")
      );
  }, []);

  if (error) {
    return (
      <AppLayout>
        <p className="text-danger text-sm">{error}</p>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout>
        <p className="text-sm text-gray-400">Loading analytics...</p>
      </AppLayout>
    );
  }

  const pieData = Object.entries(data.byRiskLevel).map(([level, count]) => ({
    name: level.replace("_", " "),
    value: count,
    level,
  }));

  return (
    <AppLayout>
      <h1 className="text-2xl font-display font-semibold text-ink mb-6">📊 Your Security Overview</h1>

      <div className="bg-surface rounded-xl shadow-sm border border-border p-4 mb-6">
        <p className="text-xs text-gray-400 mb-1">Total Scans</p>
        <p className="text-3xl font-mono font-semibold text-ink">{data.totalScans}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-sm font-semibold mb-4">Risk Distribution</h2>
          {data.totalScans === 0 ? (
            <p className="text-sm text-gray-400">No scans yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.level} fill={RISK_COLORS[entry.level]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-sm font-semibold mb-4">Scam Categories</h2>
          {data.byCategory.length === 0 ? (
            <p className="text-sm text-gray-400">No scans yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.byCategory} layout="vertical">
                <XAxis type="number" allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={120}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip />
                <Bar dataKey="count" fill={BAR_COLOR} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
        <h2 className="text-sm font-semibold mb-4">Scans Over Time</h2>
        {data.scansOverTime.length === 0 ? (
          <p className="text-sm text-gray-400">No scans yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.scansOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke={BAR_COLOR}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </AppLayout>
  );
}