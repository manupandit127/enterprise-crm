"use client";
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  TrendingUp,
  Phone,
  Mail,
  Building,
  Trash2,
  Edit,
  ChevronDown,
} from "lucide-react";
import { Badge, getLeadStatusVariant, getPriorityVariant } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/components/layout/AppShell";

interface Lead {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  source: string;
  status: string;
  priority: string;
  estimatedValue: string;
  assigneeName: string;
  createdAt: string;
}

const statusOptions = ["", "new", "contacted", "qualified", "unqualified", "converted"];
const priorityOptions = ["low", "medium", "high"];
const sourceOptions = ["Website", "Referral", "LinkedIn", "Cold Call", "Trade Show", "Email Campaign", "Other"];

export default function LeadsPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    source: "Website",
    status: "new",
    priority: "medium",
    estimatedValue: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchLeads = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    const res = await fetch(`/api/leads?${params}`);
    if (res.ok) setLeads(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchLeads();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const openCreate = () => {
    setEditLead(null);
    setForm({
      firstName: "", lastName: "", email: "", phone: "", company: "",
      jobTitle: "", source: "Website", status: "new", priority: "medium",
      estimatedValue: "", notes: "",
    });
    setShowModal(true);
  };

  const openEdit = (lead: Lead) => {
    setEditLead(lead);
    setForm({
      firstName: lead.firstName,
      lastName: lead.lastName,
      email: lead.email ?? "",
      phone: lead.phone ?? "",
      company: lead.company ?? "",
      jobTitle: lead.jobTitle ?? "",
      source: lead.source ?? "Website",
      status: lead.status,
      priority: lead.priority,
      estimatedValue: lead.estimatedValue ?? "",
      notes: "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const url = editLead ? `/api/leads/${editLead.id}` : "/api/leads";
    const method = editLead ? "PATCH" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setShowModal(false);
    fetchLeads();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this lead?")) return;
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
    fetchLeads();
  };

  const canEdit = user && user.role !== "viewer";
  const canDelete = user && ["admin", "manager"].includes(user.role);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-500 text-sm mt-1">{leads.length} leads total</p>
        </div>
        {canEdit && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
          >
            <option value="">All Statuses</option>
            {statusOptions.filter(Boolean).map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-16">
            <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No leads found</p>
            <p className="text-gray-400 text-sm mt-1">Add your first lead to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3.5 font-semibold text-gray-600">Name</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Company</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Contact</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Status</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Priority</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Value</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Assigned</th>
                  <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Created</th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={`${lead.firstName} ${lead.lastName}`} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {lead.firstName} {lead.lastName}
                          </p>
                          {lead.jobTitle && (
                            <p className="text-xs text-gray-400">{lead.jobTitle}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Building className="w-3.5 h-3.5 text-gray-400" />
                        {lead.company ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        {lead.email && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Mail className="w-3 h-3" />
                            <span className="truncate max-w-[130px]">{lead.email}</span>
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={getLeadStatusVariant(lead.status)}>
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={getPriorityVariant(lead.priority)}>
                        {lead.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-900">
                      {lead.estimatedValue ? formatCurrency(lead.estimatedValue) : "—"}
                    </td>
                    <td className="px-4 py-4">
                      {lead.assigneeName ? (
                        <div className="flex items-center gap-2">
                          <Avatar name={lead.assigneeName} size="sm" />
                          <span className="text-xs text-gray-600">{lead.assigneeName.split(" ")[0]}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-gray-400 text-xs">{formatDate(lead.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        {canEdit && (
                          <button
                            onClick={() => openEdit(lead)}
                            className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4 text-blue-500" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(lead.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editLead ? "Edit Lead" : "Add New Lead"}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="James"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Anderson"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="james@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+1-555-0000"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VP Sales"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {sourceOptions.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {statusOptions.filter(Boolean).map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {priorityOptions.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Value ($)</label>
            <input
              type="number"
              value={form.estimatedValue}
              onChange={(e) => setForm({ ...form, estimatedValue: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="50000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Additional notes..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowModal(false)}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.firstName || !form.lastName}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-medium transition-colors"
            >
              {saving ? "Saving..." : editLead ? "Update Lead" : "Create Lead"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
