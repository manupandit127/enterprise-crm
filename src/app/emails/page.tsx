"use client";
import { useEffect, useState } from "react";
import { Plus, Mail, Send, Eye, Inbox, CheckCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { useAuth } from "@/components/layout/AppShell";

interface EmailLog {
  id: number;
  subject: string;
  body: string;
  fromEmail: string;
  toEmail: string;
  status: string;
  sentAt: string;
  leadId: number;
  customerId: number;
  dealId: number;
  sentBy: number;
  senderName: string;
}

const statusVariant = (status: string) => {
  if (status === "opened") return "success";
  if (status === "delivered") return "info";
  if (status === "sent") return "warning";
  if (status === "bounced") return "danger";
  return "gray";
};

export default function EmailsPage() {
  const { user } = useAuth();
  const [emails, setEmails] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<EmailLog | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [form, setForm] = useState({ subject: "", body: "", toEmail: "" });
  const [sending, setSending] = useState(false);

  const fetchEmails = async () => {
    setLoading(true);
    const res = await fetch("/api/emails");
    if (res.ok) setEmails(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchEmails(); }, []);

  const handleSend = async () => {
    setSending(true);
    await fetch("/api/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSending(false);
    setShowCompose(false);
    setForm({ subject: "", body: "", toEmail: "" });
    fetchEmails();
  };

  const canCompose = user && user.role !== "viewer";

  const stats = {
    total: emails.length,
    opened: emails.filter((e) => e.status === "opened").length,
    delivered: emails.filter((e) => e.status === "delivered").length,
    sent: emails.filter((e) => e.status === "sent").length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Logs</h1>
          <p className="text-gray-500 text-sm mt-1">{emails.length} emails logged</p>
        </div>
        {canCompose && (
          <button onClick={() => setShowCompose(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium">
            <Plus className="w-4 h-4" />
            Compose Email
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-xl"><Inbox className="w-5 h-5 text-blue-600" /></div>
          <div><p className="text-2xl font-bold text-gray-900">{stats.total}</p><p className="text-xs text-gray-500">Total</p></div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 rounded-xl"><Eye className="w-5 h-5 text-emerald-600" /></div>
          <div><p className="text-2xl font-bold text-gray-900">{stats.opened}</p><p className="text-xs text-gray-500">Opened</p></div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="p-2.5 bg-cyan-50 rounded-xl"><CheckCircle className="w-5 h-5 text-cyan-600" /></div>
          <div><p className="text-2xl font-bold text-gray-900">{stats.delivered}</p><p className="text-xs text-gray-500">Delivered</p></div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 rounded-xl"><Send className="w-5 h-5 text-amber-600" /></div>
          <div><p className="text-2xl font-bold text-gray-900">{stats.sent}</p><p className="text-xs text-gray-500">Pending</p></div>
        </div>
      </div>

      {/* Email Layout */}
      <div className="flex gap-6 h-[600px]">
        {/* List */}
        <div className="w-80 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : emails.length === 0 ? (
            <div className="text-center py-16">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No emails logged yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {emails.map((email) => (
                <button
                  key={email.id}
                  onClick={() => setSelected(email)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${selected?.id === email.id ? "bg-blue-50 border-l-2 border-blue-500" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-900 truncate pr-2">{email.subject}</span>
                    <Badge variant={statusVariant(email.status)} className="flex-shrink-0 text-[10px]">{email.status}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{email.toEmail}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(email.sentAt)}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-y-auto">
          {selected ? (
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">{selected.subject}</h2>
                  <Badge variant={statusVariant(selected.status)}>{selected.status}</Badge>
                </div>
                <span className="text-xs text-gray-400">{formatDate(selected.sentAt)}</span>
              </div>
              <div className="space-y-3 text-sm mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 w-12 text-right text-xs">From:</span>
                  <div className="flex items-center gap-2">
                    {selected.senderName && <Avatar name={selected.senderName} size="sm" />}
                    <div>
                      {selected.senderName && <p className="text-xs font-medium text-gray-700">{selected.senderName}</p>}
                      <p className="text-gray-500 text-xs">{selected.fromEmail}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 w-12 text-right text-xs">To:</span>
                  <span className="text-gray-700">{selected.toEmail}</span>
                </div>
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-xl p-4">
                {selected.body}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <Mail className="w-16 h-16 mb-3 text-gray-200" />
              <p className="text-sm">Select an email to preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      <Modal isOpen={showCompose} onClose={() => setShowCompose(false)} title="Compose Email" size="lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To *</label>
            <input type="email" value={form.toEmail} onChange={(e) => setForm({ ...form, toEmail: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="recipient@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Email subject" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
            <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={6} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Write your email..." />
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setShowCompose(false)} className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50">Discard</button>
            <button onClick={handleSend} disabled={sending || !form.toEmail || !form.subject || !form.body} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-medium">
              <Send className="w-4 h-4" />
              {sending ? "Sending..." : "Send Email"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
