"use client";
import { useEffect, useState } from "react";
import { Plus, Briefcase, DollarSign, Calendar, Edit, Trash2, Search } from "lucide-react";
import { Badge, getDealStageVariant } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/components/layout/AppShell";

interface Deal {
  id: number;
  title: string;
  stage: string;
  value: string;
  probability: number;
  expectedCloseDate: string;
  description: string;
  assignedTo: number;
  assigneeName: string;
  customerName: string;
  customerCompany: string;
  createdAt: string;
}

const STAGES = [
  { key: "prospecting", label: "Prospecting", color: "bg-gray-400" },
  { key: "qualification", label: "Qualification", color: "bg-cyan-500" },
  { key: "proposal", label: "Proposal", color: "bg-amber-500" },
  { key: "negotiation", label: "Negotiation", color: "bg-purple-500" },
  { key: "closed_won", label: "Closed Won", color: "bg-emerald-500" },
  { key: "closed_lost", label: "Closed Lost", color: "bg-red-500" },
];

export default function DealsPage() {
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [showModal, setShowModal] = useState(false);
  const [editDeal, setEditDeal] = useState<Deal | null>(null);
  const [form, setForm] = useState({
    title: "", stage: "prospecting", value: "", probability: "0",
    expectedCloseDate: "", description: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchDeals = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/deals?${params}`);
    if (res.ok) setDeals(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchDeals(); }, [search]); // eslint-disable-line

  const openCreate = () => {
    setEditDeal(null);
    setForm({ title: "", stage: "prospecting", value: "", probability: "0", expectedCloseDate: "", description: "" });
    setShowModal(true);
  };

  const openEdit = (deal: Deal) => {
    setEditDeal(deal);
    setForm({
      title: deal.title, stage: deal.stage, value: deal.value,
      probability: String(deal.probability ?? 0),
      expectedCloseDate: deal.expectedCloseDate ? new Date(deal.expectedCloseDate).toISOString().split("T")[0] : "",
      description: deal.description ?? "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const url = editDeal ? `/api/deals/${editDeal.id}` : "/api/deals";
    const method = editDeal ? "PATCH" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, probability: Number(form.probability) }),
    });
    setSaving(false);
    setShowModal(false);
    fetchDeals();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this deal?")) return;
    await fetch(`/api/deals/${id}`, { method: "DELETE" });
    fetchDeals();
  };

  const handleStageChange = async (dealId: number, newStage: string) => {
    await fetch(`/api/deals/${dealId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: newStage }),
    });
    fetchDeals();
  };

  const canEdit = user && user.role !== "viewer";
  const canDelete = user && ["admin", "manager"].includes(user.role);

  const dealsByStage = (stage: string) => deals.filter((d) => d.stage === stage);
  const stageTotal = (stage: string) =>
    deals.filter((d) => d.stage === stage).reduce((sum, d) => sum + Number(d.value), 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-500 text-sm mt-1">{deals.length} deals · {formatCurrency(deals.reduce((s, d) => s + Number(d.value), 0))} pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === "kanban" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
            >
              List
            </button>
          </div>
          {canEdit && (
            <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">
              <Plus className="w-4 h-4" />
              Add Deal
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search deals..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : viewMode === "kanban" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => {
            const stageDeals = dealsByStage(stage.key);
            return (
              <div key={stage.key} className="flex-shrink-0 w-64">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                    <span className="text-sm font-semibold text-gray-700">{stage.label}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">{stageDeals.length}</span>
                  </div>
                  <span className="text-xs font-medium text-gray-500">{formatCurrency(stageTotal(stage.key))}</span>
                </div>
                <div className="space-y-3">
                  {stageDeals.map((deal) => (
                    <div key={deal.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-default">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-semibold text-gray-900 leading-snug flex-1 pr-2">{deal.title}</h3>
                        <div className="flex gap-0.5">
                          {canEdit && (
                            <button onClick={() => openEdit(deal)} className="p-1 hover:bg-blue-50 rounded-lg transition-colors">
                              <Edit className="w-3.5 h-3.5 text-blue-400" />
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => handleDelete(deal.id)} className="p-1 hover:bg-red-50 rounded-lg transition-colors">
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          )}
                        </div>
                      </div>
                      {deal.customerName && (
                        <p className="text-xs text-gray-400 mb-2 truncate">{deal.customerCompany ?? deal.customerName}</p>
                      )}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-base font-bold text-gray-900">{formatCurrency(deal.value)}</span>
                        <span className="text-xs text-gray-400">{deal.probability}%</span>
                      </div>
                      {deal.expectedCloseDate && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                          <Calendar className="w-3 h-3" />
                          {formatDate(deal.expectedCloseDate)}
                        </div>
                      )}
                      {canEdit && (
                        <select
                          value={deal.stage}
                          onChange={(e) => handleStageChange(deal.id, e.target.value)}
                          className="w-full text-xs border border-gray-100 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                        </select>
                      )}
                    </div>
                  ))}
                  {stageDeals.length === 0 && (
                    <div className="border-2 border-dashed border-gray-100 rounded-xl p-6 text-center">
                      <p className="text-xs text-gray-300">No deals</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3.5 font-semibold text-gray-600">Deal</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Stage</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Value</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Probability</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Close Date</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Assigned</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{deal.title}</p>
                    {deal.customerName && <p className="text-xs text-gray-400">{deal.customerCompany ?? deal.customerName}</p>}
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={getDealStageVariant(deal.stage)}>
                      {deal.stage.replace("_", " ")}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 font-semibold text-gray-900">{formatCurrency(deal.value)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-100 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${deal.probability}%` }} />
                      </div>
                      <span className="text-xs text-gray-500">{deal.probability}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-500 text-xs">{formatDate(deal.expectedCloseDate)}</td>
                  <td className="px-4 py-4">
                    {deal.assigneeName ? (
                      <div className="flex items-center gap-2">
                        <Avatar name={deal.assigneeName} size="sm" />
                        <span className="text-xs text-gray-600">{deal.assigneeName.split(" ")[0]}</span>
                      </div>
                    ) : <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1">
                      {canEdit && <button onClick={() => openEdit(deal)} className="p-1.5 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4 text-blue-500" /></button>}
                      {canDelete && <button onClick={() => handleDelete(deal.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {deals.length === 0 && (
            <div className="text-center py-16">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No deals found</p>
            </div>
          )}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editDeal ? "Edit Deal" : "New Deal"} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deal Title *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enterprise License Q4" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
              <select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value ($)</label>
              <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="50000" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Probability (%)</label>
              <input type="number" min="0" max="100" value={form.probability} onChange={(e) => setForm({ ...form, probability: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close</label>
              <input type="date" value={form.expectedCloseDate} onChange={(e) => setForm({ ...form, expectedCloseDate: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Deal details..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.title} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-medium">
              {saving ? "Saving..." : editDeal ? "Update Deal" : "Create Deal"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
