"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../services/authService";

type UserProfile = {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  role: string;
  status: string;
  createdAt?: string;
};

type FilterTab = "ALL" | "MEMBER" | "ADMIN";

export function AdminUsersPanel() {
  const router  = useAuth();
  const auth    = useAuth();
  const [users,     setUsers]     = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState("");
  const [search,    setSearch]    = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [editUser,  setEditUser]  = useState<UserProfile | null>(null);
  const [deleteId,  setDeleteId]  = useState<number | null>(null);
  const [viewUser,  setViewUser]  = useState<UserProfile | null>(null);
  const nav = useRouter();

  useEffect(() => {
    if (!auth.isInitializing && !auth.isAuthenticated) nav.push("/login");
    if (!auth.isInitializing && auth.isAuthenticated && !auth.hasAdminAccess) nav.push("/profile");
  }, [auth.isInitializing, auth.isAuthenticated, auth.hasAdminAccess, nav]);

  useEffect(() => {
    if (!auth.accessToken || !auth.hasAdminAccess) return;
    fetchUsers();
  }, [auth.accessToken, auth.hasAdminAccess]);

  async function fetchUsers() {
    setIsLoading(true);
    setError("");
    try {
      const res  = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      });
      const body = await res.json();
      if (!body.success) throw new Error(body.message);
      setUsers(body.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải danh sách người dùng.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      const res  = await fetch(`${API_URL}/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      });
      const body = await res.json();
      if (!body.success) throw new Error(body.message);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setDeleteId(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Không thể xóa tài khoản.");
    }
  }

  if (auth.isInitializing) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#f8f7f4]">
        <span className="h-7 w-7 animate-spin rounded-full border-2 border-black border-t-transparent" />
      </main>
    );
  }

  // Filter theo tab + search
  const filtered = users
    .filter((u) => activeTab === "ALL" || u.role === activeTab)
    .filter((u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    );

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: "ALL",    label: "Tất cả",       count: users.length },
    { id: "MEMBER", label: "Thành viên",   count: users.filter((u) => u.role === "MEMBER").length },
    { id: "ADMIN",  label: "Quản trị viên", count: users.filter((u) => u.role === "ADMIN").length },
  ];

  return (
    <div className="min-h-dvh bg-[#f8f7f4]">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-5 py-10 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/40">Quản trị viên</p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-black">Quản lý tài khoản</h1>
          <p className="mt-1 text-sm text-black/55">Xem, chỉnh sửa và xóa tài khoản người dùng.</p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Tổng tài khoản"  value={users.length} />
          <StatCard label="Thành viên"       value={users.filter((u) => u.role === "MEMBER").length} />
          <StatCard label="Đang hoạt động"   value={users.filter((u) => u.status === "ACTIVE").length} />
          <StatCard label="Quản trị viên"    value={users.filter((u) => u.role === "ADMIN").length} />
        </div>

        {/* Panel */}
        <div className="rounded-[24px] border border-black/10 bg-white p-6 shadow-[0_16px_48px_rgba(17,24,39,0.07)]">

          {/* Toolbar: Search + Filter tabs + Refresh */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <input
              type="text"
              placeholder="Tìm theo tên hoặc email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-[42px] w-full rounded-xl border border-black/15 bg-[#f8f7f4] px-4 text-sm outline-none transition focus:border-black focus:bg-white sm:max-w-xs"
            />

            {/* Filter tabs + Refresh */}
            <div className="flex items-center gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? "bg-black text-white shadow-sm"
                      : "border border-black/15 text-black/60 hover:bg-black/5 hover:text-black"
                  }`}
                >
                  {tab.label}
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    activeTab === tab.id ? "bg-white/20 text-white" : "bg-black/8 text-black/50"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
              <button
                onClick={fetchUsers}
                className="inline-flex items-center gap-2 rounded-xl border border-black/15 px-3.5 py-2 text-sm font-semibold text-black/60 hover:bg-black/5 hover:text-black transition"
              >
                Làm mới
              </button>
            </div>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="flex items-center gap-3 py-12 text-sm text-black/45">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
              Đang tải...
            </div>
          ) : error ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <p className="text-sm font-semibold text-black/40">Không tìm thấy tài khoản nào.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-black/8">
              <table className="w-full min-w-[700px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-black text-white">
                    {["ID", "Họ và tên", "Email", "Vai trò", "Trạng thái", "Thao tác"].map((h) => (
                      <th key={h} className="px-4 py-3 text-xs font-bold uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr key={user.id} className="border-t border-black/8 hover:bg-black/[0.02] transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-black/45">{user.id}</td>
                      <td className="px-4 py-3 font-semibold text-black">{user.fullName}</td>
                      <td className="px-4 py-3 text-black/65">{user.email}</td>
                      <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                      <td className="px-4 py-3"><StatusBadge status={user.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setViewUser(user)}
                            className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-600 hover:text-white transition">
                            Chi tiết
                          </button>
                          <button onClick={() => setEditUser(user)}
                            className="rounded-lg border border-black/15 px-3 py-1.5 text-xs font-semibold hover:bg-black hover:text-white transition">
                            Sửa
                          </button>
                          <button onClick={() => setDeleteId(user.id)}
                            className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-600 hover:text-white transition">
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {editUser && (
        <EditModal
          user={editUser}
          accessToken={auth.accessToken}
          onClose={() => setEditUser(null)}
          onSaved={(updated) => {
            setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
            setEditUser(null);
          }}
        />
      )}

      {deleteId !== null && (
        <ConfirmModal
          message="Bạn có chắc muốn xóa tài khoản này? Hành động này không thể hoàn tác."
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {viewUser && (
        <ViewModal
          user={viewUser}
          accessToken={auth.accessToken}
          onClose={() => setViewUser(null)}
        />
      )}
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({ user, accessToken, onClose, onSaved }: {
  user: UserProfile;
  accessToken: string | null;
  onClose: () => void;
  onSaved: (u: UserProfile) => void;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [error,    setError]    = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      fullName:    String(fd.get("fullName")    ?? "").trim(),
      phone:       String(fd.get("phone")       ?? "").trim(),
      address:     String(fd.get("address")     ?? "").trim(),
      dateOfBirth: fd.get("dateOfBirth") ? String(fd.get("dateOfBirth")) : null,
      role:        String(fd.get("role")        ?? ""),
      status:      String(fd.get("status")      ?? ""),
    };

    setIsSaving(true);
    setError("");
    try {
      const res  = await fetch(`${API_URL}/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(payload),
      });
      const body = await res.json();
      if (!body.success) throw new Error(body.message);
      onSaved(body.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể cập nhật.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-[24px] bg-white p-7 shadow-2xl">
        <div className="mb-6 border-b border-black/8 pb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-black/40">Chỉnh sửa</p>
          <h2 className="mt-1 font-serif text-xl font-bold text-black">Thông tin tài khoản</h2>
          <p className="mt-0.5 text-sm text-black/50">{user.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-black">Họ và tên *</label>
            <input name="fullName" defaultValue={user.fullName}
              className="mt-1.5 h-[44px] w-full rounded-xl border border-black/15 px-4 text-sm outline-none focus:border-black" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-black">Số điện thoại</label>
            <input name="phone" defaultValue={user.phone ?? ""}
              className="mt-1.5 h-[44px] w-full rounded-xl border border-black/15 px-4 text-sm outline-none focus:border-black" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-black">Ngày sinh</label>
            <input name="dateOfBirth" type="date" defaultValue={user.dateOfBirth ?? ""}
              className="mt-1.5 h-[44px] w-full rounded-xl border border-black/15 px-4 text-sm outline-none focus:border-black" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-black">Địa chỉ</label>
            <input name="address" defaultValue={user.address ?? ""}
              className="mt-1.5 h-[44px] w-full rounded-xl border border-black/15 px-4 text-sm outline-none focus:border-black" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-black">Vai trò</label>
            <select name="role" defaultValue={user.role}
              className="mt-1.5 h-[44px] w-full rounded-xl border border-black/15 px-4 text-sm outline-none focus:border-black bg-white">
              <option value="MEMBER">Thành viên</option>
              <option value="LIBRARIAN">Thủ thư</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-black">Trạng thái</label>
            <select name="status" defaultValue={user.status}
              className="mt-1.5 h-[44px] w-full rounded-xl border border-black/15 px-4 text-sm outline-none focus:border-black bg-white">
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Không hoạt động</option>
            </select>
          </div>

          {error && (
            <p className="sm:col-span-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700">{error}</p>
          )}

          <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="rounded-xl border border-black/15 px-5 py-2.5 text-sm font-semibold hover:bg-black/5 transition">
              Hủy
            </button>
            <button type="submit" disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-bold text-white hover:bg-[#E60028] transition disabled:opacity-50">
              {isSaving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Confirm Delete Modal ─────────────────────────────────────────────────────

function ConfirmModal({ message, onConfirm, onCancel }: {
  message: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-[20px] bg-white p-6 shadow-2xl">
        <h3 className="font-serif text-lg font-bold text-black">Xác nhận xóa</h3>
        <p className="mt-2 text-sm text-black/60">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel}
            className="rounded-xl border border-black/15 px-4 py-2 text-sm font-semibold hover:bg-black/5 transition">
            Hủy
          </button>
          <button onClick={onConfirm}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700 transition">
            Xóa tài khoản
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
      <p className="text-2xl font-bold text-black">{value}</p>
      <p className="mt-0.5 text-xs font-semibold text-black/45">{label}</p>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    ADMIN:     "bg-black text-white",
    LIBRARIAN: "bg-blue-50 text-blue-700 border border-blue-200",
    MEMBER:    "bg-black/5 text-black/60",
  };
  const label: Record<string, string> = {
    ADMIN: "Admin", LIBRARIAN: "Thủ thư", MEMBER: "Thành viên",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold ${map[role] ?? "bg-black/5 text-black/60"}`}>
      {label[role] ?? role}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
      status === "ACTIVE"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : "bg-black/5 text-black/50 border-black/10"
    }`}>
      {status === "ACTIVE" ? "Hoạt động" : "Không hoạt động"}
    </span>
  );
}

// ─── View Modal (Chi tiết user) ───────────────────────────────────────────────

type BorrowRecord = {
  id: number;
  bookTitle?: string;
  bookAuthor?: string;
  borrowedAt?: string;
  dueDate?: string;
  returnedAt?: string;
  status?: string;
  fineAmount?: number;
};

function ViewModal({ user, accessToken, onClose }: {
  user: UserProfile;
  accessToken: string | null;
  onClose: () => void;
}) {
  const [activeTab,  setActiveTab]  = useState<"info" | "loans" | "history">("info");
  const [loans,      setLoans]      = useState<BorrowRecord[]>([]);
  const [history,    setHistory]    = useState<BorrowRecord[]>([]);
  const [loadingTab, setLoadingTab] = useState(false);

  async function loadLoans() {
    setLoadingTab(true);
    try {
      const res  = await fetch(`${API_URL}/api/admin/users/${user.id}/loans`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const body = await res.json();
      setLoans(body.data ?? []);
    } catch { setLoans([]); }
    finally { setLoadingTab(false); }
  }

  async function loadHistory() {
    setLoadingTab(true);
    try {
      const res  = await fetch(`${API_URL}/api/admin/users/${user.id}/loans/history`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const body = await res.json();
      setHistory(body.data ?? []);
    } catch { setHistory([]); }
    finally { setLoadingTab(false); }
  }

  function handleTab(tab: "info" | "loans" | "history") {
    setActiveTab(tab);
    if (tab === "loans")   loadLoans();
    if (tab === "history") loadHistory();
  }

  function fmtDate(iso?: string | null) {
    if (!iso) return "—";
    try { return new Date(iso).toLocaleDateString("vi-VN"); } catch { return iso; }
  }

  const statusLabel: Record<string, string> = {
    ACTIVE: "Đang mượn", RETURNED: "Đã trả", OVERDUE: "Quá hạn", LOST: "Mất sách",
  };
  const statusColor: Record<string, string> = {
    ACTIVE:   "bg-emerald-50 text-emerald-700 border-emerald-200",
    RETURNED: "bg-blue-50 text-blue-700 border-blue-200",
    OVERDUE:  "bg-rose-50 text-rose-700 border-rose-200",
    LOST:     "bg-orange-50 text-orange-700 border-orange-200",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-[24px] bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/8 px-7 py-5">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-black font-serif text-lg font-bold text-white">
              {user.fullName.trim().split(/\s+/).map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()}
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-black">{user.fullName}</h2>
              <p className="text-sm text-black/50">{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 hover:bg-black/5 transition">
            <svg className="h-5 w-5 text-black/50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-black/8 px-7 pt-3">
          {([
            { id: "info",    label: "Thông tin" },
            { id: "loans",   label: "Đang mượn" },
            { id: "history", label: "Lịch sử mượn" },
          ] as const).map((tab) => (
            <button key={tab.id} onClick={() => handleTab(tab.id)}
              className={`rounded-t-xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "border-b-2 border-black text-black"
                  : "text-black/45 hover:text-black"
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-h-[420px] overflow-y-auto p-7">
          {activeTab === "info" && (
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { label: "Họ và tên",    value: user.fullName },
                { label: "Email",        value: user.email },
                { label: "Số điện thoại", value: user.phone ?? "—" },
                { label: "Địa chỉ",      value: user.address ?? "—" },
                { label: "Ngày sinh",    value: user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString("vi-VN") : "—" },
                { label: "Vai trò",      value: user.role === "ADMIN" ? "Quản trị viên" : user.role === "LIBRARIAN" ? "Thủ thư" : "Thành viên" },
                { label: "Trạng thái",   value: user.status === "ACTIVE" ? "Hoạt động" : "Không hoạt động" },
                { label: "Ngày tạo",     value: user.createdAt ? new Date(user.createdAt).toLocaleDateString("vi-VN") : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-black/8 bg-[#f8f7f4] px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-black/40">{label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-black">{value}</p>
                </div>
              ))}
            </div>
          )}

          {(activeTab === "loans" || activeTab === "history") && (
            loadingTab ? (
              <div className="flex items-center gap-3 py-8 text-sm text-black/45">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                Đang tải...
              </div>
            ) : (
              (() => {
                const rows = activeTab === "loans" ? loans : history;
                if (!rows.length) return (
                  <div className="py-10 text-center text-sm text-black/40">
                    {activeTab === "loans" ? "Không có sách đang mượn." : "Chưa có lịch sử mượn sách."}
                  </div>
                );
                return (
                  <div className="overflow-x-auto rounded-xl border border-black/8">
                    <table className="w-full min-w-[500px] border-collapse text-left text-sm">
                      <thead>
                        <tr className="bg-black text-white">
                          <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider">Tên sách</th>
                          <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider">Ngày mượn</th>
                          <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider">
                            {activeTab === "loans" ? "Hạn trả" : "Ngày trả"}
                          </th>
                          <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r, i) => (
                          <tr key={i} className="border-t border-black/8 hover:bg-black/[0.02]">
                            <td className="px-4 py-3 font-semibold text-black">
                              <span className="line-clamp-1">{r.bookTitle ?? "—"}</span>
                              {r.bookAuthor && <span className="block text-xs text-black/40">{r.bookAuthor}</span>}
                            </td>
                            <td className="px-4 py-3 text-black/60 whitespace-nowrap">{fmtDate(r.borrowedAt)}</td>
                            <td className="px-4 py-3 text-black/60 whitespace-nowrap">
                              {activeTab === "loans" ? fmtDate(r.dueDate) : fmtDate(r.returnedAt)}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-bold ${statusColor[r.status ?? ""] ?? "bg-black/5 text-black/50 border-black/10"}`}>
                                {statusLabel[r.status ?? ""] ?? r.status ?? "—"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })()
            )
          )}
        </div>
      </div>
    </div>
  );
}
