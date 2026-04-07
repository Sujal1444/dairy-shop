import { useState, useEffect, useMemo } from "react";
import { getEntries } from "../services/api";
import SummaryCard from "../components/SummaryCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "#06b6d4",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
];

const todayStr = () => new Date().toISOString().split("T")[0];

function Dashboard() {
  const [date, setDate] = useState(todayStr());
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, [date]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await getEntries(date);
      setEntries(res.data.data || []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const totalRevenue = entries.reduce(
      (s, e) => s + (e.productId?.price || 0) * e.quantity,
      0,
    );
    const totalQty = entries.reduce((s, e) => s + e.quantity, 0);
    const productMap = {};
    entries.forEach((e) => {
      const id = e.productId?._id;
      if (!productMap[id])
        productMap[id] = {
          name: e.productId?.name || "Unknown",
          unit: e.productId?.unit || "",
          quantity: 0,
          revenue: 0,
        };
      productMap[id].quantity += e.quantity;
      productMap[id].revenue += (e.productId?.price || 0) * e.quantity;
    });
    return {
      totalRevenue,
      totalQty,
      totalEntries: entries.length,
      breakdown: Object.values(productMap),
    };
  }, [entries]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Daily overview of your dairy shop</p>
        </div>
        <div className="date-filter">
          <label htmlFor="dash-date">📅 Date</label>
          <input
            id="dash-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loader">
          <div className="spinner" />
        </div>
      ) : (
        <>
          <div className="cards-grid">
            <SummaryCard
              title="Total Revenue"
              value={`₹${stats.totalRevenue.toFixed(2)}`}
              icon="💰"
              color="#06b6d4"
              subtitle="earned today"
            />
            <SummaryCard
              title="Transactions"
              value={stats.totalEntries}
              icon="📋"
              color="#10b981"
              subtitle="entries"
            />
            <SummaryCard
              title="Total Sold"
              value={stats.totalQty.toFixed(2)}
              icon="📦"
              color="#8b5cf6"
              subtitle="units sold"
            />
          </div>

          {stats.breakdown.length > 0 ? (
            <>
              <h2 className="section-title">Product-wise Summary</h2>
              <div className="card dash-chart-card">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={stats.breakdown}
                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                    />
                    <YAxis
                      tick={{ fill: "#94a3b8", fontSize: 12 }}
                      tickFormatter={(v) => `₹${v}`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#1e293b",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8,
                        color: "#f1f5f9",
                      }}
                      formatter={(v) => [`₹${Number(v).toFixed(2)}`, "Revenue"]}
                    />
                    <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
                    <Bar
                      dataKey="revenue"
                      name="Revenue (₹)"
                      radius={[6, 6, 0, 0]}
                    >
                      {stats.breakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="product-col-grid">
                {stats.breakdown.map((p, i) => (
                  <div className="product-col-card" key={i} style={{ "--accent": COLORS[i % COLORS.length] }}>
                    <div className="pcol-accent-bar" />
                    <div className="pcol-header">
                      <div className="pcol-icon" style={{ background: COLORS[i % COLORS.length] + "22" }}>
                        🛒
                      </div>
                    </div>
                    <div className="pcol-name">{p.name}</div>
                    <div className="pcol-divider" />
                    <div className="pcol-stats">
                      <div className="pcol-stat">
                        <span className="pcol-stat-label">Qty Sold</span>
                        <span className="pcol-stat-val">
                          {p.quantity.toFixed(2)} <span className="pcol-unit">{p.unit}</span>
                        </span>
                      </div>
                      <div className="pcol-stat">
                        <span className="pcol-stat-label">Revenue</span>
                        <span className="pcol-revenue-pill">₹{p.revenue.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="product-col-card pcol-total" style={{ "--accent": "#10b981" }}>
                  <div className="pcol-accent-bar" />
                  <div className="pcol-header">
                    <div className="pcol-icon" style={{ background: "rgba(16,185,129,0.15)" }}>📊</div>
                  </div>
                  <div className="pcol-name">Grand Total</div>
                  <div className="pcol-divider" />
                  <div className="pcol-stats">
                    <div className="pcol-stat">
                      <span className="pcol-stat-label">All Revenue</span>
                      <span className="pcol-revenue-pill">₹{stats.totalRevenue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <h2 className="section-title">Recent Entries</h2>
              <div className="entry-col-list">
                {entries.slice(0, 10).map((e, i) => (
                  <div className="entry-col-card" key={e._id}>
                    <div className="ecol-left">
                      <div className="ecol-index">{i + 1}</div>
                      <div>
                        <div className="ecol-product">{e.productId?.name}</div>
                        <div className="ecol-customer">{e.billName || e.customerName || "—"}</div>
                      </div>
                    </div>
                    <div className="ecol-right">
                      <div className="ecol-time">🕐 {e.time}</div>
                      <div className="ecol-qty">
                        {e.quantity} <span className="qty-unit">{e.productId?.unit}</span>
                      </div>
                      <div className="ecol-revenue">₹{((e.productId?.price || 0) * e.quantity).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <p>
                No entries for <strong>{date}</strong>. Add some entries to see
                your dashboard.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
export default Dashboard;
