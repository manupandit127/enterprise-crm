"use client";
import { useEffect, useState } from "react";
import { Plus, Mail, Phone, Calendar, CheckSquare, FileText, Activity, Clock, CheckCheck } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/components/layout/AppShell";

interface ActivityItem {
  id: number;
  type: string;
  subject: string;
  body: string;
  isDone: boolean;
  scheduledAt: string;
  completedAt: string;
  leadId: number;
  dealId: number;
  customerId: number;
  userId: number;
  userName: string;
  createdAt: string;
}

const activityIcons: Record<string, React.ElementType> = {
  email: Mail,
  call: Phone,
  meeting: Calendar,
  task: CheckSquare,
  note: FileText,
};

const activityColors: Record<string, string> = {
  email: "bg-blue-50 text-blue-600",
  call: "bg-emerald-50 text-emerald-600",
  meeting: "bg-purple-50 text-purple-600",
  task: "bg-amber-50 text-amber-600",
  note: "bg-gray-50 text-gray-600",
};

export default function ActivitiesPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "done">("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    type: "call",
    subject: "",
    body: "",
    scheduledAt: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchActivities = async () => {
    setLoading(true);
    const res = await fetch("/api/activities");
    if (res.ok) setActivities(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchActivities(); }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        scheduledAt: form.scheduledAt || undefined,
      }),
    });
    setSaving(false);
    setShowModal(false);
    setForm({ type: "call", subject: "", body: "", scheduledAt: "" });
    fetchActivities();
  };

  const canEdit = user && user.role !== "viewer";

  const filtered = activities.filter((a) => {
    if (filter === "pending") return !a.isDone;
    if (filter === "done") return a.isDone;
    return true;
  });

  const pending = activities.filter((a) => !a.isDone).length;
  const done = activities.filter((a) => a.isDone).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
          <p className="text-gray-500 text-sm mt-1">{pending} pending · {done} completed</p>
        </div>
        {canEdit && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">
            <Plus className="w-4 h-4" />
            Log Activity
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(activityIcons).map(([type, Icon]) => {
          const count = activities.filter((a) => a.type === type).length;
          return (
            <div key={type} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${activityColors[type]}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500 capitalize">{type}s</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(["all", "pending", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${filter === f ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Activity Feed */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No activities found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((activity) => {
            const Icon = activityIcons[activity.type] ?? FileText;
            const colorClass = activityColors[activity.type] ?? "bg-gray-50 text-gray-600";
            return (
              <div key={activity.id} className={`bg-white rounded-2xl p-5 shadow-sm border transition-all ${activity.isDone ? "border-gray-100 opacity-75" : "border-gray-100 hover:shadow-md"}`}>
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className={`font-semibold text-gray-900 ${activity.isDone ? "line-through text-gray-400" : ""}`}>
                          {activity.subject}
                        </h3>
                        {activity.body && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{activity.body}</p>
                        )}
                      </div>
                      <Badge variant={activity.isDone ? "success" : "warning"} className="flex-shrink-0">
                        {activity.isDone ? "Done" : "Pending"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 flex-wrap">
                      <div className="flex items-center gap-1">
                        <Avatar name={activity.userName ?? "?"} size="sm" />
                        <span>{activity.userName}</span>
                      </div>
                      {activity.scheduledAt && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Scheduled: {formatDate(activity.scheduledAt)}
                        </div>
                      )}
                      {activity.completedAt && (
                        <div className="flex items-center gap-1 text-emerald-500">
                          <CheckCheck className="w-3 h-3" />
                          Completed: {formatDate(activity.completedAt)}
                        </div>
                      )}
                      <span className="capitalize bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">{activity.type}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Log Activity" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(activityIcons).map(([type, Icon]) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, type })}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all ${form.type === type ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-100 text-gray-400 hover:border-gray-200"}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs capitalize">{type}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Follow-up call with Alice" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Details about this activity..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled At</label>
            <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.subject} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-medium">
              {saving ? "Saving..." : "Log Activity"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
