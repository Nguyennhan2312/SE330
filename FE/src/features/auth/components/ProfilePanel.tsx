"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { changePassword as changePasswordApi } from "@/features/auth/services/authService";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { useAuth } from "../context/AuthContext";
import { BorrowRecord } from "@/features/circulation/types/circulation.type";
import { getMyBorrows, getMyBorrowHistory, returnBook } from "@/features/circulation/services/circulationService";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "info" | "password" | "loans" | "history";
type TabIconName = "user" | "lock" | "book" | "history" | "mail" | "shield" | "check" | "eye" | "eyeOff";

// ─── Tab definitions ──────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: TabIconName }[] = [
  { id: "info",     label: "Thông tin cá nhân", icon: "user"    },
  { id: "password", label: "Đổi mật khẩu",      icon: "lock"    },
  { id: "loans",    label: "Đang mượn",          icon: "book"    },
  { id: "history",  label: "Lịch sử mượn",       icon: "history" },
];

// ─── Root component ───────────────────────────────────────────────────────────

export function ProfilePanel() {
  const router  = useRouter();
  const auth    = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("info");

  useEffect(() => {
    if (!auth.isInitializing && !auth.isAuthenticated) {
      router.push("/login");
    }
  }, [auth.isAuthenticated, auth.isInitializing, router]);

  if (auth.isInitializing || !auth.isAuthenticated) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[#f8f7f4]">
        <div className="flex flex-col items-center gap-4">
          <span className="inline-block h-7 w-7 animate-spin rounded-full border-2 border-black border-t-transparent" />
          <p className="text-sm font-semibold text-black/50">Đang xác thực...</p>
        </div>
      </main>
    );
  }

  const user     = auth.currentUser;
  const initials = initialsOf(user?.fullName ?? "A");

  return (
    <div className="min-h-dvh bg-[#f8f7f4]">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl px-5 py-10 lg:px-8">

        {/* ── Profile header ── */}
        <div className="mb-8 flex items-center gap-5">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-black font-serif text-2xl font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
            {initials}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/45">Tài khoản thành viên</p>
            <h1 className="mt-0.5 font-serif text-2xl font-bold text-black leading-tight">
              {user?.fullName ?? "Độc giả"}
            </h1>
            <p className="mt-0.5 text-sm text-black/55">{user?.email}</p>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="mb-8 flex gap-1 overflow-x-auto rounded-2xl border border-black/10 bg-white p-1.5 shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 min-w-max items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-black text-white shadow-[0_4px_12px_rgba(0,0,0,0.18)]"
                  : "text-black/55 hover:bg-black/5 hover:text-black"
              }`}
            >
              <TabIcon
                name={tab.icon}
                className={`h-4 w-4 ${activeTab === tab.id ? "text-white" : "text-black/40"}`}
              />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div key={activeTab} style={{ animation: "fadeUp 0.2s ease both" }}>
          {activeTab === "info"     && <InfoTab     auth={auth} />}
          {activeTab === "password" && <PasswordTab  auth={auth} />}
          {activeTab === "loans"    && <LoansTab    auth={auth} />}
          {activeTab === "history"  && <HistoryTab  auth={auth} />}
        </div>
      </main>
      <Footer />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>
    </div>
  );
}

// ─── Tab: Thông tin cá nhân ───────────────────────────────────────────────────

function InfoTab({ auth }: { auth: ReturnType<typeof useAuth> }) {
  const user = auth.currentUser;
  const [message,  setMessage]  = useState("");
  const [error,    setError]    = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const statusMap: Record<string, string> = {
    ACTIVE:               "Hoạt động",
    PENDING_VERIFICATION: "Chờ xác minh",
    INACTIVE:             "Không hoạt động",
  };
  const roleMap: Record<string, string> = {
    MEMBER:    "Thành viên",
    LIBRARIAN: "Thủ thư",
    ADMIN:     "Quản trị viên",
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd       = new FormData(e.currentTarget);
    const fullName = String(fd.get("fullName") ?? "").trim();
    const phone    = String(fd.get("phone")    ?? "").trim();

    if (!fullName) { setError("Họ và tên không được để trống."); return; }

    setIsSaving(true);
    setError("");
    setMessage("");
    try {
      await auth.updateProfile({ fullName, phone });
      setMessage("Thông tin đã được cập nhật thành công.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể cập nhật thông tin.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PanelCard
      eyebrow="Thông tin cá nhân"
      title="Chỉnh sửa hồ sơ"
      description="Cập nhật họ tên, số điện thoại, địa chỉ và ngày sinh của bạn."
    >
      {/* Read-only overview chips */}
      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <OverviewChip icon="mail"   label="Email"      value={user?.email ?? "—"} />
        <OverviewChip icon="shield" label="Vai trò"    value={roleMap[user?.role ?? ""] ?? user?.role ?? "—"} />
        <OverviewChip icon="check"  label="Trạng thái" value={statusMap[user?.status ?? ""] ?? user?.status ?? "—"} />
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
        <FormField label="Họ và tên *"   name="fullName" defaultValue={user?.fullName ?? ""} placeholder="Nguyễn Văn An"              autoComplete="name"           />
        <FormField label="Số điện thoại" name="phone"    defaultValue={user?.phone    ?? ""} placeholder="0901 234 567"              autoComplete="tel"  type="tel" />
        <FormField label="Ngày sinh"     name="dob"      defaultValue=""                      placeholder=""                          type="date"                    />
        <FormField label="Địa chỉ"       name="address"  defaultValue=""                      placeholder="123 Nguyễn Huệ, Q.1, HCM" autoComplete="street-address"  />

        {/* Locked email */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-semibold text-black">
            Email <span className="font-normal text-black/45">(không thể thay đổi)</span>
          </label>
          <div className="mt-2 flex items-center gap-3 rounded-xl border border-black/10 bg-black/[0.03] px-4 py-3 text-black/50">
            <TabIcon name="lock" className="h-4 w-4 shrink-0" />
            <span className="text-sm">{user?.email ?? "—"}</span>
          </div>
        </div>

        {message && (
          <p className="sm:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {message}
          </p>
        )}
        {error && (
          <p className="sm:col-span-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {error}
          </p>
        )}

        <div className="sm:col-span-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all hover:-translate-y-0.5 hover:bg-[#E60028] hover:shadow-[0_12px_28px_rgba(230,0,40,0.25)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isSaving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </PanelCard>
  );
}

// ─── Tab: Đổi mật khẩu ───────────────────────────────────────────────────────

function PasswordTab({ auth }: { auth: ReturnType<typeof useAuth> }) {
  const [message,  setMessage]  = useState("");
  const [error,    setError]    = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showOld,  setShowOld]  = useState(false);
  const [showNew,  setShowNew]  = useState(false);
  const [strength, setStrength] = useState<{ label: string; pct: number; color: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function calcStrength(pw: string) {
    if (!pw) { setStrength(null); return; }
    let s = 0;
    if (pw.length >= 8)                                s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw))         s++;
    if (/\d/.test(pw))                                 s++;
    if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12)   s++;
    const map = [
      { label: "Yếu",       pct: 25,  color: "bg-[#E60028]" },
      { label: "Trung bình", pct: 50, color: "bg-[#D8A31A]" },
      { label: "Khá",       pct: 75,  color: "bg-[#2E7D62]" },
      { label: "Mạnh",      pct: 100, color: "bg-[#1B5E3B]" },
    ];
    setStrength(map[Math.max(0, s - 1)]);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd          = new FormData(e.currentTarget);
    const oldPassword = String(fd.get("oldPassword") ?? "").trim();
    const newPassword = String(fd.get("newPassword") ?? "").trim();
    const confirm     = String(fd.get("confirm")     ?? "").trim();

    if (!oldPassword)           { setError("Vui lòng nhập mật khẩu hiện tại."); return; }
    if (newPassword.length < 8) { setError("Mật khẩu mới phải có ít nhất 8 ký tự."); return; }
    if (newPassword !== confirm) { setError("Mật khẩu xác nhận không khớp."); return; }

    setIsSaving(true);
    setError("");
    setMessage("");
    try {
      if (!auth.accessToken) throw new Error("Chưa đăng nhập");
      await changePasswordApi({ oldPassword, newPassword }, auth.accessToken);
      setMessage("Mật khẩu đã được thay đổi thành công.");
      formRef.current?.reset();
      setStrength(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đổi mật khẩu. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PanelCard
      eyebrow="Bảo mật tài khoản"
      title="Đổi mật khẩu"
      description="Sử dụng mật khẩu mạnh, ít nhất 8 ký tự bao gồm chữ hoa, chữ thường và số."
    >
      <form ref={formRef} onSubmit={handleSubmit} className="grid gap-5 max-w-md">
        {/* Current password */}
        <div>
          <label htmlFor="oldPassword" className="block text-sm font-semibold text-black">Mật khẩu hiện tại</label>
          <div className="relative mt-2">
            <input
              id="oldPassword" name="oldPassword"
              type={showOld ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Nhập mật khẩu hiện tại"
              className="h-[48px] w-full rounded-xl border border-black/15 bg-white px-4 pr-11 text-sm text-black outline-none transition focus:border-black focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)]"
            />
            <button type="button" onClick={() => setShowOld((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black/35 hover:text-black">
              <TabIcon name={showOld ? "eyeOff" : "eye"} className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* New password */}
        <div>
          <label htmlFor="newPassword" className="block text-sm font-semibold text-black">Mật khẩu mới</label>
          <div className="relative mt-2">
            <input
              id="newPassword" name="newPassword"
              type={showNew ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Tạo mật khẩu mới"
              onChange={(e) => calcStrength(e.target.value)}
              className="h-[48px] w-full rounded-xl border border-black/15 bg-white px-4 pr-11 text-sm text-black outline-none transition focus:border-black focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)]"
            />
            <button type="button" onClick={() => setShowNew((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-black/35 hover:text-black">
              <TabIcon name={showNew ? "eyeOff" : "eye"} className="h-5 w-5" />
            </button>
          </div>
          {strength && (
            <div className="mt-3">
              <div className="h-1.5 overflow-hidden rounded-full bg-black/10">
                <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                  style={{ width: `${strength.pct}%` }} />
              </div>
              <p className="mt-1.5 text-xs font-semibold text-black/55">
                Độ mạnh: <span className="text-black">{strength.label}</span>
              </p>
            </div>
          )}
        </div>

        {/* Confirm */}
        <div>
          <label htmlFor="confirm" className="block text-sm font-semibold text-black">Xác nhận mật khẩu mới</label>
          <div className="relative mt-2">
            <input
              id="confirm" name="confirm"
              type={showNew ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Nhập lại mật khẩu mới"
              className="h-[48px] w-full rounded-xl border border-black/15 bg-white px-4 text-sm text-black outline-none transition focus:border-black focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)]"
            />
          </div>
        </div>

        {message && (
          <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{message}</p>
        )}
        {error && (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>
        )}

        <div>
          <button
            type="submit" disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(0,0,0,0.15)] transition-all hover:-translate-y-0.5 hover:bg-[#E60028] hover:shadow-[0_12px_28px_rgba(230,0,40,0.25)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {isSaving && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
            {isSaving ? "Đang lưu..." : "Cập nhật mật khẩu"}
          </button>
        </div>
      </form>
    </PanelCard>
  );
}

// ─── Tab: Sách đang mượn ──────────────────────────────────────────────────────

function LoansTab({ auth }: { auth: ReturnType<typeof useAuth> }) {
  const [loans, setLoans]         = useState<BorrowRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState("");
  const [returnId, setReturnId]   = useState<number | null>(null);
  const [returning, setReturning] = useState(false);
  const [toast, setToast]         = useState<string>("");
  const refreshToken = useCallback(async () => (await auth.refresh())?.accessToken ?? null, [auth]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  async function loadLoans() {
    setIsLoading(true);
    try {
      const items = await getMyBorrows({}, auth.accessToken, refreshToken);
      setLoans(items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadLoans(); }, [auth.accessToken]);

  async function handleReturn() {
    if (!returnId) return;
    setReturning(true);
    try {
      await returnBook(returnId, auth.accessToken);
      showToast("Trả sách thành công!");
      setReturnId(null);
      await loadLoans();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Không thể trả sách.");
      setReturnId(null);
    } finally {
      setReturning(false);
    }
  }

  const returningBook = loans.find((l) => l.id === returnId);

  return (
    <PanelCard
      eyebrow="Sách đang mượn"
      title="Các sách bạn đang mượn"
      description="Theo dõi sách đang mượn, hạn trả và số lần gia hạn còn lại."
    >
      <BorrowTable
        rows={loans}
        isLoading={isLoading}
        error={error}
        emptyMessage="Bạn chưa có sách nào đang mượn."
        columns={["Tên sách", "Ngày mượn", "Hạn trả", "Trạng thái", "Thao tác"]}
        renderRow={(loan, i) => (
          <tr key={i} className="border-t border-black/8 hover:bg-black/[0.02] transition-colors">
            <td className="px-4 py-3 font-semibold text-black max-w-[200px]">
              <span className="line-clamp-2">{loan.bookTitle ?? loan.title ?? "—"}</span>
              <span className="block text-xs text-black/40 mt-0.5">{loan.bookAuthor ?? ""}</span>
            </td>
            <td className="px-4 py-3 text-black/65 whitespace-nowrap">{fmtDate(loan.borrowedAt ?? loan.checkoutAt)}</td>
            <td className="px-4 py-3 whitespace-nowrap">
              <span className={loan.overdue ? "font-bold text-[#E60028]" : "text-black/65"}>
                {fmtDate(loan.dueAt ?? loan.dueDate)}
              </span>
              {loan.overdue && (
                <span className="ml-2 rounded-full bg-[#E60028]/10 px-2 py-0.5 text-[10px] font-bold text-[#E60028]">Quá hạn</span>
              )}
            </td>
            <td className="px-4 py-3"><StatusBadge status={loan.status} /></td>
            <td className="px-4 py-3">
              <button
                onClick={() => setReturnId(loan.id as number)}
                className="rounded-lg border border-black/15 px-3 py-1.5 text-xs font-semibold hover:bg-black hover:text-white transition"
              >
                Trả sách
              </button>
            </td>
          </tr>
        )}
      />

      {/* Toast */}
      {toast && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {toast}
        </div>
      )}

      {/* Confirm return modal */}
      {returnId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-[20px] bg-white p-6 shadow-2xl">
            <h3 className="font-serif text-lg font-bold text-black">Xác nhận trả sách</h3>
            <p className="mt-2 text-sm text-black/60">
              Bạn có chắc muốn trả cuốn <span className="font-semibold text-black">"{returningBook?.bookTitle ?? returningBook?.title}"</span>?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setReturnId(null)}
                disabled={returning}
                className="rounded-xl border border-black/15 px-4 py-2 text-sm font-semibold hover:bg-black/5 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleReturn}
                disabled={returning}
                className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-sm font-bold text-white hover:bg-[#E60028] transition disabled:opacity-50"
              >
                {returning && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                {returning ? "Đang xử lý..." : "Xác nhận trả"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PanelCard>
  );
}

// ─── Tab: Lịch sử mượn ───────────────────────────────────────────────────────

function HistoryTab({ auth }: { auth: ReturnType<typeof useAuth> }) {
  const [history, setHistory]     = useState<BorrowRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState("");
  const refreshToken = useCallback(async () => (await auth.refresh())?.accessToken ?? null, [auth]);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    getMyBorrowHistory({}, auth.accessToken, refreshToken)
      .then((items) => { if (mounted) setHistory(items ?? []); })
      .catch((err)  => { if (mounted) setError(err instanceof Error ? err.message : "Không thể tải dữ liệu."); })
      .finally(()   => { if (mounted) setIsLoading(false); });
    return () => { mounted = false; };
  }, [auth.accessToken, refreshToken]);

  return (
    <PanelCard
      eyebrow="Lịch sử mượn sách"
      title="Các lượt mượn trước đây"
      description="Danh sách tất cả sách đã mượn và trả trong quá khứ."
    >
      <BorrowTable
        rows={history}
        isLoading={isLoading}
        error={error}
        emptyMessage="Chưa có lịch sử mượn sách."
        columns={["Tên sách", "Mã bản sao", "Ngày mượn", "Ngày trả", "Trạng thái", "Tiền phạt"]}
        renderRow={(loan, i) => (
          <tr key={i} className="border-t border-black/8 hover:bg-black/[0.02] transition-colors">
            <td className="px-4 py-3 font-semibold text-black max-w-[200px]">
              <span className="line-clamp-2">{loan.bookTitle ?? loan.title ?? "—"}</span>
            </td>
            <td className="px-4 py-3 font-mono text-xs text-black/55">{loan.barcode ?? loan.itemBarcode ?? "—"}</td>
            <td className="px-4 py-3 text-black/65 whitespace-nowrap">{fmtDate(loan.borrowedAt ?? loan.checkoutAt)}</td>
            <td className="px-4 py-3 text-black/65 whitespace-nowrap">{fmtDate(loan.returnedAt ?? undefined)}</td>
            <td className="px-4 py-3"><StatusBadge status={loan.status} /></td>
            <td className="px-4 py-3 whitespace-nowrap text-sm">
              {typeof (loan.fineAmount ?? loan.fine) === "number"
                ? <span className="font-semibold text-[#E60028]">{(loan.fineAmount ?? loan.fine ?? 0).toLocaleString("vi-VN")} ₫</span>
                : <span className="text-black/35">—</span>}
            </td>
          </tr>
        )}
      />
    </PanelCard>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function PanelCard({
  eyebrow, title, description, children,
}: {
  eyebrow: string; title: string; description: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-black/10 bg-white p-7 shadow-[0_16px_48px_rgba(17,24,39,0.07)] sm:p-8">
      <div className="mb-7 border-b border-black/8 pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/40">{eyebrow}</p>
        <h2 className="mt-2 font-serif text-2xl font-bold text-black">{title}</h2>
        <p className="mt-1.5 text-sm leading-6 text-black/55">{description}</p>
      </div>
      {children}
    </div>
  );
}

function FormField({
  label, name, defaultValue, placeholder, type = "text", autoComplete,
}: {
  label: string; name: string; defaultValue: string;
  placeholder: string; type?: string; autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-black">{label}</label>
      <input
        id={name} name={name} type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="mt-2 h-[48px] w-full rounded-xl border border-black/15 bg-white px-4 text-sm text-black outline-none transition focus:border-black focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)]"
      />
    </div>
  );
}

function OverviewChip({ icon, label, value }: { icon: TabIconName; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-black/8 bg-[#f8f7f4] px-4 py-3">
      <TabIcon name={icon} className="h-5 w-5 shrink-0 text-black/40" />
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-black/40">{label}</p>
        <p className="truncate text-sm font-semibold text-black">{value}</p>
      </div>
    </div>
  );
}

function BorrowTable({
  rows, isLoading, error, emptyMessage, columns, renderRow,
}: {
  rows: BorrowRecord[];
  isLoading: boolean;
  error: string;
  emptyMessage: string;
  columns: string[];
  renderRow: (row: BorrowRecord, index: number) => React.ReactNode;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-3 py-8 text-sm text-black/45">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
        Đang tải...
      </div>
    );
  }
  if (error) {
    return (
      <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>
    );
  }
  if (!rows.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <TabIcon name="book" className="h-10 w-10 text-black/15" />
        <p className="text-sm font-semibold text-black/40">{emptyMessage}</p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-black/8">
      <table className="w-full min-w-[720px] border-collapse bg-white text-left text-sm">
        <thead>
          <tr className="bg-black text-white">
            {columns.map((col) => (
              <th key={col} className="px-4 py-3 text-xs font-bold uppercase tracking-wider">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>{rows.map((row, i) => renderRow(row, i))}</tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status?: string }) {
  const map: Record<string, { label: string; classes: string }> = {
    ACTIVE:   { label: "Đang mượn", classes: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    RETURNED: { label: "Đã trả",    classes: "bg-blue-50 text-blue-700 border-blue-200"          },
    OVERDUE:  { label: "Quá hạn",   classes: "bg-rose-50 text-rose-700 border-rose-200"           },
    LOST:     { label: "Mất sách",  classes: "bg-orange-50 text-orange-700 border-orange-200"    },
  };
  const info = map[status ?? ""] ?? { label: status ?? "—", classes: "bg-black/5 text-black/60 border-black/10" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${info.classes}`}>
      {info.label}
    </span>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function TabIcon({ name, className = "" }: { name: TabIconName; className?: string }) {
  const paths: Record<TabIconName, React.ReactNode> = {
    user:    <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
    lock:    <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    book:    <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" /><path d="M4 5.5v16" /></>,
    history: <><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" /></>,
    mail:    <><rect x="4" y="6" width="16" height="12" rx="2" /><path d="m4 8 8 6 8-6" /></>,
    shield:  <path d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6z" />,
    check:   <path d="M20 6 9 17l-5-5" />,
    eye:     <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
    eyeOff:  <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}
      fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
      {paths[name]}
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "A";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return iso;
  }
}
