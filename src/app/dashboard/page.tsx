"use client";
import { useEffect, useState } from "react";
import {
  Users,
  TrendingUp,
  Briefcase,
  DollarSign,
  Mail,
  Phone,
  Calendar,
  CheckSquare,
  FileText,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { StatCard } from "@/components/ui/StatCard";
import { Avatar } from "@/components/ui/Avatar";
import { Badge, getDealStageVariant } from "@/components/ui/Badge";
import { formatCurrency, formatDate } from "@/lib/utils";

interface DashboardData {
  totals: { leads: number; customers: number; deals: number; revenue: number };
  dealsByStage: { stage: string; count: number; value: string }[];
  leadsByStatus: { status: string; count: number }[];
  topPerformers: { name: string; email: string; closedDeals: number; revenue: string }[];
  recentActivities: {
    id: number;
    type: string;
    subject: string;
    isDone: boolean;
    createdAt: string;
    userName: string;
  }[];
  pipeline: { stage: string; value: string; count: number }[];
  monthlyData: { month: string; revenue: number; deals: number }[];
}

const STAGE_COLORS: Record<string, string> = {
  prospecting: "#94a3b8",
  qualification: "#06b6d4",
  proposal: "#f59e0b",
  negotiation: "#a855f7",
  closed_won: "#10b981",
  closed_lost: "#ef4444",
};

const STATUS_COLORS: Record<string, string> = {
  new: "#06b6d4",
  contacted: "#f59e0b",
  qualified: "#10b981",
  unqualified: "#ef4444",
  converted: "#a855f7",
};

const activityIcons: Record<string, React.ElementType> = {
  email: Mail,
  call: Phone,
  meeting: Calendar,
  task: CheckSquare,
  note: FileText,
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    const res = await fetch("/api/dashboard");
    if (res.ok) setData(await res.json());
    setLoading(false);
  };

  const handleSeed = async () => {
    setSeeding(true);
    await fetch("/api/seed", { method: "POST" });
    await fetchDashboard();
    setSeeding(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Sales performance overview</p>
        </div>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${seeding ? "animate-spin" : ""}`} />
          {seeding ? "Seeding..." : "Seed Demo Data"}
        </button>
      </div>

      {!data ? (
        <div className="text-center py-12 text-gray-500">
          No data available. Click &quot;Seed Demo Data&quot; to get started.
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Leads"
              value={data.totals.leads}
              change="+12%"
              changeType="positive"
              icon={TrendingUp}
              iconColor="text-blue-600"
              iconBg="bg-blue-50"
            />
            <StatCard
              title="Customers"
              value={data.totals.customers}
              change="+5%"
              changeType="positive"
              icon={Users}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-50"
            />
            <StatCard
              title="Active Deals"
              value={data.totals.deals}
              change="+8%"
              changeType="positive"
              icon={Briefcase}
              iconColor="text-purple-600"
              iconBg="bg-purple-50"
            />
            <StatCard
              title="Closed Revenue"
              value={formatCurrency(data.totals.revenue)}
              change="+23%"
              changeType="positive"
              icon={DollarSign}
              iconColor="text-amber-600"
              iconBg="bg-amber-50"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Monthly Revenue */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-1">Monthly Revenue</h2>
              <p className="text-sm text-gray-500 mb-4">Last 6 months performance</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.monthlyData} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                    contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                  />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Leads by Status */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-1">Lead Status</h2>
              <p className="text-sm text-gray-500 mb-4">Distribution by status</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={data.leadsByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    innerRadius={40}
                    paddingAngle={3}
                  >
                    {data.leadsByStatus.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#94a3b8"} />
                    ))}
                  </Pie>
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs capitalize">{value}</span>
                    )}
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pipeline & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Deal Pipeline */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-4">Deal Pipeline</h2>
              <div className="space-y-3">
                {data.dealsByStage.map((item) => (
                  <div key={item.stage} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: STAGE_COLORS[item.stage] ?? "#94a3b8" }}
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {item.stage.replace("_", " ")}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(item.value)}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">({item.count})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-4">Top Performers</h2>
              <div className="space-y-3">
                {data.topPerformers.slice(0, 5).map((p, i) => (
                  <div key={p.email} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 w-4">#{i + 1}</span>
                    <Avatar name={p.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.closedDeals} deals</p>
                    </div>
                    <span className="text-sm font-semibold text-emerald-600">
                      {formatCurrency(p.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-base font-bold text-gray-900 mb-4">Recent Activities</h2>
              <div className="space-y-3">
                {data.recentActivities.slice(0, 6).map((act) => {
                  const Icon = activityIcons[act.type] ?? FileText;
                  return (
                    <div key={act.id} className="flex items-start gap-3">
                      <div className="p-1.5 bg-blue-50 rounded-lg mt-0.5 flex-shrink-0">
                        <Icon className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{act.subject}</p>
                        <p className="text-xs text-gray-400">
                          {act.userName} · {formatDate(act.createdAt)}
                        </p>
                      </div>
                      {act.isDone && (
                        <span className="text-xs text-emerald-600 font-medium flex-shrink-0">Done</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
