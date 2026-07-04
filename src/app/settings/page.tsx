"use client";
import { useState } from "react";
import { Settings, Database, Shield, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/components/layout/AppShell";

export default function SettingsPage() {
  const { user } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [seedStatus, setSeedStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSeed = async () => {
    setSeeding(true);
    setSeedStatus("idle");
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      setSeedStatus(res.ok ? "success" : "error");
    } catch {
      setSeedStatus("error");
    } finally {
      setSeeding(false);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700">Access Restricted</h2>
          <p className="text-gray-400 mt-2">Only administrators can access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">System configuration and administration</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="font-bold text-gray-900">Account Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Name</label>
              <p className="text-gray-900 font-medium mt-0.5">{user.name}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Email</label>
              <p className="text-gray-900 font-medium mt-0.5">{user.email}</p>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium uppercase tracking-wide">Role</label>
              <p className="text-gray-900 font-medium mt-0.5 capitalize">{user.role.replace("_", " ")}</p>
            </div>
          </div>
        </div>

        {/* RBAC Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-purple-50 rounded-xl">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="font-bold text-gray-900">Role-Based Access Control</h2>
          </div>
          <div className="space-y-3">
            {[
              { role: "Admin", perms: "Full access — manage users, delete all records, settings", color: "text-red-600 bg-red-50" },
              { role: "Manager", perms: "Create, edit, delete leads/deals/customers; manage team", color: "text-purple-600 bg-purple-50" },
              { role: "Sales Rep", perms: "Create and edit leads, deals, customers, log activities", color: "text-blue-600 bg-blue-50" },
              { role: "Viewer", perms: "Read-only access to all CRM data", color: "text-gray-600 bg-gray-50" },
            ].map((r) => (
              <div key={r.role} className={`flex items-start gap-3 p-3 rounded-xl ${r.color.split(" ")[1]}`}>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.color} whitespace-nowrap`}>{r.role}</span>
                <p className="text-xs text-gray-600">{r.perms}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Database */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-emerald-50 rounded-xl">
              <Database className="w-5 h-5 text-emerald-600" />
            </div>
            <h2 className="font-bold text-gray-900">Database Management</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Seed the database with demo data including users, leads, customers, deals, and activities.
            <strong className="text-red-500"> Warning: This will clear all existing data.</strong>
          </p>
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-xl text-sm font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${seeding ? "animate-spin" : ""}`} />
            {seeding ? "Seeding Database..." : "Seed Demo Data"}
          </button>
          {seedStatus === "success" && (
            <div className="flex items-center gap-2 mt-3 text-emerald-600 text-sm">
              <CheckCircle className="w-4 h-4" />
              Database seeded successfully!
            </div>
          )}
          {seedStatus === "error" && (
            <div className="flex items-center gap-2 mt-3 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              Failed to seed database. Check logs.
            </div>
          )}
        </div>

        {/* Tech Stack */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-amber-50 rounded-xl">
              <Settings className="w-5 h-5 text-amber-600" />
            </div>
            <h2 className="font-bold text-gray-900">Technology Stack</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Next.js 16", desc: "App Router", color: "bg-gray-900 text-white" },
              { name: "PostgreSQL", desc: "Database", color: "bg-blue-700 text-white" },
              { name: "Drizzle ORM", desc: "Type-safe ORM", color: "bg-emerald-600 text-white" },
              { name: "Tailwind CSS", desc: "Styling", color: "bg-cyan-500 text-white" },
              { name: "Recharts", desc: "Analytics Charts", color: "bg-purple-600 text-white" },
              { name: "JWT Auth", desc: "Authentication", color: "bg-amber-500 text-white" },
            ].map((t) => (
              <div key={t.name} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className={`w-2 h-2 rounded-full ${t.color.includes("gray-9") ? "bg-gray-900" : t.color.includes("blue-7") ? "bg-blue-700" : t.color.includes("emerald") ? "bg-emerald-600" : t.color.includes("cyan") ? "bg-cyan-500" : t.color.includes("purple") ? "bg-purple-600" : "bg-amber-500"}`} />
                <div>
                  <p className="text-xs font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
