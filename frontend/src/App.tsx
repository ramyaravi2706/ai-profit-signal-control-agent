import { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, AlertTriangle, CheckCircle, Info, XCircle, RefreshCw,
} from "lucide-react";

const API = "http://localhost:8000/api";
const COLORS = ["#00ff88", "#3b82f6", "#f59e0b", "#ef4444", "#a855f7", "#06b6d4"];
interface KPIs {
  total_sales: number;
  total_profit: number;
  total_orders: number;
  avg_order_value: number;
  avg_profit_margin: number;
  cancelled_sales: number;
  cancellation_rate: number;
}

interface Insight {
  type: "success" | "warning" | "info" | "danger";
  icon: string;
  title: string;
  detail: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const fmtK = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${(n / 1_000).toFixed(1)}K`;

function KpiCard({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
  return (
    <div className="bg-surface-800 border border-surface-600 rounded-2xl p-5 flex flex-col gap-2 hover:border-accent/40 transition-colors">
      <span className="text-xs font-mono text-green-400/60 uppercase tracking-widest">{label}</span>
      <span className="text-2xl font-display font-semibold text-white">{value}</span>
      {sub && (
        <span className={`text-xs font-mono ${positive ? "text-green-400" : "text-red-400"}`}>{sub}</span>
      )}
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  const config = {
    success: { bg: "bg-green-900/20 border-green-500/30", icon: <CheckCircle size={18} className="text-green-400" /> },
    warning: { bg: "bg-yellow-900/20 border-yellow-500/30", icon: <AlertTriangle size={18} className="text-yellow-400" /> },
    info: { bg: "bg-blue-900/20 border-blue-500/30", icon: <Info size={18} className="text-blue-400" /> },
    danger: { bg: "bg-red-900/20 border-red-500/30", icon: <XCircle size={18} className="text-red-400" /> },
  };
  const c = config[insight.type];
  return (
    <div className={`border rounded-xl p-4 flex gap-3 ${c.bg}`}>
      <div className="mt-0.5 shrink-0">{c.icon}</div>
      <div>
        <p className="text-sm font-semibold text-white">{insight.title}</p>
        <p className="text-xs text-white/50 mt-1">{insight.detail}</p>
      </div>
    </div>
  );
}

export default function App() {
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [monthlyTrend, setMonthlyTrend] = useState<any[]>([]);
  const [salesByProduct, setSalesByProduct] = useState<any[]>([]);
  const [salesByCountry, setSalesByCountry] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [dealSize, setDealSize] = useState<any[]>([]);
  const [orderStatus, setOrderStatus] = useState<any[]>([]);
  const [quarterly, setQuarterly] = useState<any[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  const yearParam = selectedYear ? `?year=${selectedYear}` : "";

  useEffect(() => {
    axios.get(`${API}/years`).then((r) => setYears(r.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      axios.get(`${API}/kpis${yearParam}`),
      axios.get(`${API}/monthly-trend${yearParam}`),
      axios.get(`${API}/sales-by-product${yearParam}`),
      axios.get(`${API}/sales-by-country${yearParam}`),
      axios.get(`${API}/top-customers?limit=8${selectedYear ? `&year=${selectedYear}` : ""}`),
      axios.get(`${API}/deal-size${yearParam}`),
      axios.get(`${API}/order-status${yearParam}`),
      axios.get(`${API}/quarterly${yearParam}`),
      axios.get(`${API}/ai-insights${yearParam}`),
    ]).then(([k, mt, sp, sc, tc, ds, os, q, ai]) => {
      setKpis(k.data);
      setMonthlyTrend(mt.data);
      setSalesByProduct(sp.data);
      setSalesByCountry(sc.data);
      setTopCustomers(tc.data);
      setDealSize(ds.data);
      setOrderStatus(os.data);
      setQuarterly(q.data);
      setInsights(ai.data);
      setLoading(false);
    });
  }, [selectedYear]);

  return (
    <div className="min-h-screen bg-surface-900 text-white font-display">
      <header className="border-b border-surface-600 bg-surface-800/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/20 border border-accent/40 flex items-center justify-center">
              <TrendingUp size={16} className="text-accent" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-white leading-tight">AI Profit Control Agent</h1>
              <p className="text-xs text-white/40 font-mono">Smart Signal Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              className="bg-surface-700 border border-surface-600 text-white text-sm rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-accent/60"
              value={selectedYear ?? ""}
              onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">All Years</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            {loading && <RefreshCw size={16} className="text-accent animate-spin" />}
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-8 space-y-8">
        {kpis && (
          <section>
            <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-4">Key Performance Indicators</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <KpiCard label="Total Sales" value={fmtK(kpis.total_sales)} />
              <KpiCard label="Total Profit" value={fmtK(kpis.total_profit)} positive={kpis.total_profit > 0} sub={`${kpis.avg_profit_margin.toFixed(1)}% avg margin`} />
              <KpiCard label="Total Orders" value={kpis.total_orders.toLocaleString()} />
              <KpiCard label="Avg Order Value" value={fmt(kpis.avg_order_value)} />
              <KpiCard label="Cancelled Sales" value={fmtK(kpis.cancelled_sales)} positive={false} sub={`${kpis.cancellation_rate.toFixed(1)}% rate`} />
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-surface-800 border border-surface-600 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white/80 mb-4">Monthly Revenue & Profit Trend</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2420" />
                <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 10 }} interval={2} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: "#111812", border: "1px solid #243028", borderRadius: 8 }} formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#00ff88" strokeWidth={2} dot={false} name="Sales" />
                <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} dot={false} name="Profit" strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-surface-800 border border-surface-600 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white/80 mb-4">Quarterly Performance</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={quarterly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2420" />
                <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 10 }} />
                <YAxis tick={{ fill: "#6b7280", fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ background: "#111812", border: "1px solid #243028", borderRadius: 8 }} formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
                <Bar dataKey="sales" fill="#00ff88" name="Sales" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#16a34a" name="Profit" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface-800 border border-surface-600 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white/80 mb-4">Sales by Product Line</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={salesByProduct} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2420" />
                <XAxis type="number" tick={{ fill: "#6b7280", fontSize: 10 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                <YAxis type="category" dataKey="PRODUCTLINE" tick={{ fill: "#9ca3af", fontSize: 11 }} width={100} />
                <Tooltip contentStyle={{ background: "#111812", border: "1px solid #243028", borderRadius: 8 }} formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
                <Bar dataKey="total_sales" fill="#00ff88" name="Sales" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-surface-800 border border-surface-600 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white/80 mb-4">Deal Size & Order Status</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/40 font-mono mb-2">Deal Size</p>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={dealSize} dataKey="total_sales" nameKey="DEALSIZE" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                      {dealSize.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#111812", border: "1px solid #243028", borderRadius: 8 }} formatter={(v: number) => [`$${v.toLocaleString()}`, ""]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div>
                <p className="text-xs text-white/40 font-mono mb-2">Order Status</p>
                <div className="space-y-2 mt-2">
                  {orderStatus.map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-xs text-white/60">{s.STATUS}</span>
                      <span className="text-xs font-mono text-accent">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-surface-800 border border-surface-600 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white/80 mb-4">Top Countries by Revenue</h2>
            <div className="space-y-3">
              {salesByCountry.slice(0, 8).map((c, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-white/30 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-white/70">{c.COUNTRY}</span>
                      <span className="text-xs font-mono text-accent">{fmtK(c.total_sales)}</span>
                    </div>
                    <div className="h-1 bg-surface-600 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-accent to-green-600 rounded-full" style={{ width: `${(c.total_sales / salesByCountry[0].total_sales) * 100}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-surface-800 border border-surface-600 rounded-2xl p-6">
            <h2 className="text-sm font-semibold text-white/80 mb-4">Top Customers</h2>
            <div className="space-y-2">
              {topCustomers.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-surface-600 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-xs font-mono text-accent">{i + 1}</span>
                    <div>
                      <p className="text-xs font-semibold text-white/80">{c.CUSTOMERNAME}</p>
                      <p className="text-xs text-white/30">{c.country}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-accent">{fmtK(c.total_sales)}</p>
                    <p className="text-xs text-white/30">{c.orders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-xs font-mono text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            AI Profit Signals & Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((ins, i) => <InsightCard key={i} insight={ins} />)}
          </div>
        </section>
      </main>

      <footer className="border-t border-surface-600 mt-12 py-6 text-center">
        <p className="text-xs font-mono text-white/20">AI Profit Control Agent · Powered by FastAPI + React</p>
      </footer>
    </div>
  );
}