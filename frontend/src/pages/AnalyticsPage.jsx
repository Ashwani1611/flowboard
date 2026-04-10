import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getAnalytics } from "../api/tasks";
import toast from "react-hot-toast";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";

const DAY_OPTIONS = [7, 14, 30];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card px-3 py-2 text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="text-white font-semibold">{payload[0].value} tasks completed</p>
    </div>
  );
};

export default function AnalyticsPage() {
  const [data, setData]       = useState([]);
  const [days, setDays]       = useState(7);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
  setLoading(true);
  getAnalytics(days)
    .then(({ data: res }) => {
      setData(res.chart_data || []);
      setSummary({
        window_days:     res.window_days,
        total_completed: res.total_completed,
        best_day:        res.best_day?.date || "-",
        best_day_count:  res.best_day?.completed ?? 0,
      });
    })
    .catch(() => toast.error("Failed to load analytics"))
    .finally(() => setLoading(false));
}, [days]);

  const maxVal = Math.max(...data.map((d) => d.completed ?? d.count ?? 0), 1);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold">Analytics</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Sliding window task completion
            </p>
          </div>
          {/* Day selector */}
          <div className="flex items-center gap-1 bg-surface-card border border-surface-border rounded-lg p-1">
            {DAY_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`text-xs px-3 py-1.5 rounded-md transition-colors font-medium ${
                  days === d
                    ? "bg-brand-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Summary cards */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {Object.entries(summary).map(([key, val]) => (
              <div key={key} className="card p-4">
                <p className="text-xs text-gray-500 capitalize mb-1">
                  {key.replace(/_/g, " ")}
                </p>
                <p className="text-2xl font-bold font-mono text-white">{val}</p>
              </div>
            ))}
          </div>
        )}

        {/* Chart */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-300 mb-6">
            Tasks Completed — Last {days} Days
          </h2>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600 text-sm">No data for this period</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#252a3a"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) =>
                    new Date(val).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short",
                    })
                  }
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#252a3a" }} />
                <Bar
                  dataKey="completed"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={48}
                >
                  {data.map((entry, index) => {
                    const val = entry.completed ?? entry.count ?? 0;
                    const intensity = maxVal > 0 ? val / maxVal : 0;
                    const opacity = 0.3 + intensity * 0.7;
                    return (
                      < Cell
                        key={index}
                        fill={`rgba(79, 110, 247, ${opacity})`}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </main>
    </div>
  );
}