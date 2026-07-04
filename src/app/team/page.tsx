"use client";
import { useEffect, useState } from "react";
import { Plus, Users, Shield, UserCheck, Eye } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/components/layout/AppShell";

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

const roleIcons: Record<string, React.ElementType> = {
  admin: Shield,
  manager: UserCheck,
  sales_rep: Users,
  viewer: Eye,
};

const roleVariant = (role: string) => {
  if (role === "admin") return "danger";
  if (role === "manager") return "purple";
  if (role === "sales_rep") return "info";
  return "gray";
};

const roleLabel = (role: string) => role.replace("_", " ");

export default function TeamPage() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "sales_rep" });
  const [saving, setSaving] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    const res = await fetch("/api/users");
    if (res.ok) setMembers(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, []);

  const openCreate = () => {
    setEditMember(null);
    setForm({ name: "", email: "", password: "", role: "sales_rep" });
    setShowModal(true);
  };

  const openEdit = (m: TeamMember) => {
    setEditMember(m);
    setForm({ name: m.name, email: m.email, password: "", role: m.role });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    if (editMember) {
      await fetch(`/api/users/${editMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: form.role }),
      });
    } else {
      await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setSaving(false);
    setShowModal(false);
    fetchMembers();
  };

  const handleToggleActive = async (m: TeamMember) => {
    await fetch(`/api/users/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !m.isActive, role: m.role }),
    });
    fetchMembers();
  };

  const isAdmin = user?.role === "admin";

  const roleGroups = ["admin", "manager", "sales_rep", "viewer"];
  const grouped = roleGroups.reduce((acc, role) => {
    acc[role] = members.filter((m) => m.role === role);
    return acc;
  }, {} as Record<string, TeamMember[]>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team</h1>
          <p className="text-gray-500 text-sm mt-1">{members.length} members</p>
        </div>
        {isAdmin && (
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">
            <Plus className="w-4 h-4" />
            Add Member
          </button>
        )}
      </div>

      {/* Role Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {roleGroups.map((role) => {
          const Icon = roleIcons[role];
          return (
            <div key={role} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="p-2.5 bg-gray-50 rounded-xl">
                <Icon className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{grouped[role]?.length ?? 0}</p>
                <p className="text-xs text-gray-500 capitalize">{roleLabel(role)}s</p>
              </div>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-6 py-3.5 font-semibold text-gray-600">Member</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Role</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Status</th>
                <th className="text-left px-4 py-3.5 font-semibold text-gray-600">Joined</th>
                {isAdmin && <th className="px-4 py-3.5 font-semibold text-gray-600">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members.map((m) => {
                const Icon = roleIcons[m.role] ?? Users;
                return (
                  <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={m.name} size="md" />
                        <div>
                          <p className="font-semibold text-gray-900">{m.name}</p>
                          <p className="text-xs text-gray-400">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-400" />
                        <Badge variant={roleVariant(m.role)}>{roleLabel(m.role)}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={m.isActive ? "success" : "gray"}>
                        {m.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-400">{formatDate(m.createdAt)}</td>
                    {isAdmin && (
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(m)}
                            className="text-xs px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors font-medium"
                          >
                            Edit Role
                          </button>
                          {m.id !== user?.id && (
                            <button
                              onClick={() => handleToggleActive(m)}
                              className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${m.isActive ? "bg-red-50 hover:bg-red-100 text-red-500" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"}`}
                            >
                              {m.isActive ? "Deactivate" : "Activate"}
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editMember ? "Edit Role" : "Add Team Member"} size="sm">
        <div className="space-y-4">
          {!editMember && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Jane Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="jane@crm.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••••" />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="sales_rep">Sales Rep</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} disabled={saving || (!editMember && (!form.name || !form.email || !form.password))} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-medium">
              {saving ? "Saving..." : editMember ? "Update Role" : "Add Member"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
