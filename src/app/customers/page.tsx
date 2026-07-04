"use client";
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Users,
  Mail,
  Phone,
  Globe,
  Building,
  Trash2,
  Edit,
  MapPin,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/components/layout/AppShell";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: string;
  industry: string;
  website: string;
  country: string;
  totalRevenue: string;
  tags: string;
  isActive: boolean;
  assigneeName: string;
  createdAt: string;
}

const industryOptions = [
  "Technology", "Finance", "Healthcare", "Retail", "Education",
  "Logistics", "Manufacturing", "Real Estate", "Media", "Other",
];

export default function CustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState({
    name: "", email: "", phone: "", company: "", industry: "Technology",
    website: "", country: "", tags: "", notes: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/customers?${params}`);
    if (res.ok) setCustomers(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const openCreate = () => {
    setEditCustomer(null);
    setForm({ name: "", email: "", phone: "", company: "", industry: "Technology", website: "", country: "", tags: "", notes: "" });
    setShowModal(true);
  };

  const openEdit = (c: Customer) => {
    setEditCustomer(c);
    setForm({ name: c.name, email: c.email ?? "", phone: c.phone ?? "", company: c.company ?? "", industry: c.industry ?? "Technology", website: c.website ?? "", country: c.country ?? "", tags: c.tags ?? "", notes: "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const url = editCustomer ? `/api/customers/${editCustomer.id}` : "/api/customers";
    const method = editCustomer ? "PATCH" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setShowModal(false);
    fetchCustomers();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this customer?")) return;
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    fetchCustomers();
  };

  const canEdit = user && user.role !== "viewer";
  const canDelete = user && ["admin", "manager"].includes(user.role);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm mt-1">{customers.length} customers total</p>
        </div>
        {canEdit && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Customer
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {customers.length === 0 ? (
            <div className="col-span-3 text-center py-16">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No customers found</p>
            </div>
          ) : (
            customers.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar name={c.name} size="md" />
                    <div>
                      <h3 className="font-semibold text-gray-900">{c.name}</h3>
                      {c.company && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                          <Building className="w-3 h-3" />
                          {c.company}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {canEdit && (
                      <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-blue-500" />
                      </button>
                    )}
                    {canDelete && (
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {c.email && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.phone && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {c.phone}
                    </div>
                  )}
                  {c.country && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {c.country}
                    </div>
                  )}
                  {c.website && (
                    <div className="flex items-center gap-2 text-gray-500">
                      <Globe className="w-3.5 h-3.5 text-gray-400" />
                      <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline truncate">
                        {c.website.replace("https://", "")}
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Revenue</p>
                    <p className="text-base font-bold text-emerald-600">{formatCurrency(c.totalRevenue)}</p>
                  </div>
                  <div className="text-right">
                    {c.industry && (
                      <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">{c.industry}</span>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatDate(c.createdAt)}</p>
                  </div>
                </div>

                {c.assigneeName && (
                  <div className="mt-3 flex items-center gap-2">
                    <Avatar name={c.assigneeName} size="sm" />
                    <span className="text-xs text-gray-500">Managed by {c.assigneeName}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editCustomer ? "Edit Customer" : "Add Customer"} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Alice Thompson" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="alice@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+1-555-0000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="TechCorp Inc." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                {industryOptions.map((i) => <option key={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="USA" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="enterprise, saas, tech" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Additional notes..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.name} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-medium transition-colors">
              {saving ? "Saving..." : editCustomer ? "Update" : "Add Customer"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
