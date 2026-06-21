"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BrandMark } from "@/components/layout/BrandMark";
import { API_URL } from "../services/authService";

type Step = "email" | "reset";

export function ForgotPasswordPanel() {
  const router  = useRouter();
  const [step,        setStep]        = useState<Step>("email");
  const [email,       setEmail]       = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showNew,     setShowNew]     = useState(false);
  const [isLoading,   setIsLoading]   = useState(false);
  const [error,       setError]       = useState("");
  const [strength,    setStrength]    = useState<{ label: string; pct: number; color: string } | null>(null);

  function calcStrength(pw: string) {
    if (!pw) { setStrength(null); return; }
    let s = 0;
    if (pw.length >= 8)                              s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw))       s++;
    if (/\d/.test(pw))                               s++;
    if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) s++;
    const map = [
      { label: "Yếu",       pct: 25,  color: "bg-[#E60028]" },
      { label: "Trung bình", pct: 50, color: "bg-[#D8A31A]" },
      { label: "Khá",       pct: 75,  color: "bg-[#2E7D62]" },
      { label: "Mạnh",      pct: 100, color: "bg-[#1B5E3B]" },
    ];
    setStrength(map[Math.max(0, s - 1)]);
  }

  // Bước 1: kiểm tra email có tồn tại không
  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) { setError("Vui lòng nhập email."); return; }

    setIsLoading(true);
    setError("");
    try {
      const res  = await fetch(`${API_URL}/api/auth/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const body = await res.json();
      if (!body.success) throw new Error(body.message);
      setStep("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tìm thấy tài khoản với email này.");
    } finally {
      setIsLoading(false);
    }
  }

  // Bước 2: đặt lại mật khẩu
  async function handleResetSubmit(e: FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) { setError("Mật khẩu phải có ít nhất 8 ký tự."); return; }
    if (newPassword !== confirm)  { setError("Mật khẩu xác nhận không khớp."); return; }

    setIsLoading(true);
    setError("");
    try {
      const res  = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), newPassword }),
      });
      const body = await res.json();
      if (!body.success) throw new Error(body.message);
      router.push("/login?reset=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đặt lại mật khẩu.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#f8f7f4] px-4 py-12">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-[url('/new-books-library-bg.png')] bg-cover bg-center opacity-20" />

      <div className="relative w-full max-w-md">
        <div className="rounded-[28px] border border-black/10 bg-white px-8 py-10 shadow-[0_32px_80px_rgba(17,24,39,0.14)]">

          {/* Logo */}
          <div className="mb-7 flex items-center justify-between">
            <BrandMark tone="dark" />
            <span className="rounded-full border border-black/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-black/50">
              Khôi phục
            </span>
          </div>

          {step === "email" ? (
            <>
              <h1 className="font-serif text-3xl font-bold text-black">Quên mật khẩu?</h1>
              <p className="mt-2 text-sm leading-6 text-black/55">
                Nhập email đã đăng ký, chúng tôi sẽ cho phép bạn đặt lại mật khẩu ngay.
              </p>

              <form onSubmit={handleEmailSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-black">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="mt-2 h-[52px] w-full rounded-2xl border border-black/15 bg-white px-4 text-sm text-black outline-none transition focus:border-black focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)]"
                  />
                </div>

                {error && (
                  <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#E60028] text-sm font-bold text-white shadow-lg shadow-[#E60028]/25 transition hover:-translate-y-0.5 hover:bg-[#c90022] disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                  {isLoading ? "Đang kiểm tra..." : "Tiếp tục"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="font-serif text-3xl font-bold text-black">Đặt lại mật khẩu</h1>
              <p className="mt-2 text-sm leading-6 text-black/55">
                Tài khoản: <span className="font-semibold text-black">{email}</span>
              </p>

              <form onSubmit={handleResetSubmit} className="mt-8 space-y-5">
                {/* New password */}
                <div>
                  <label className="block text-sm font-semibold text-black">Mật khẩu mới</label>
                  <div className="relative mt-2">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); calcStrength(e.target.value); setError(""); }}
                      placeholder="Tạo mật khẩu mới"
                      autoComplete="new-password"
                      className="h-[52px] w-full rounded-2xl border border-black/15 bg-white px-4 pr-12 text-sm text-black outline-none transition focus:border-black focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)]"
                    />
                    <button type="button" onClick={() => setShowNew((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-black/35 hover:text-black">
                      <EyeIcon open={showNew} />
                    </button>
                  </div>
                  {strength && (
                    <div className="mt-2">
                      <div className="h-1.5 overflow-hidden rounded-full bg-black/10">
                        <div className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                          style={{ width: `${strength.pct}%` }} />
                      </div>
                      <p className="mt-1 text-xs font-semibold text-black/55">
                        Độ mạnh: <span className="text-black">{strength.label}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-sm font-semibold text-black">Xác nhận mật khẩu mới</label>
                  <div className="relative mt-2">
                    <input
                      type={showNew ? "text" : "password"}
                      value={confirm}
                      onChange={(e) => { setConfirm(e.target.value); setError(""); }}
                      placeholder="Nhập lại mật khẩu mới"
                      autoComplete="new-password"
                      className="h-[52px] w-full rounded-2xl border border-black/15 bg-white px-4 text-sm text-black outline-none transition focus:border-black focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)]"
                    />
                  </div>
                </div>

                {error && (
                  <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#E60028] text-sm font-bold text-white shadow-lg shadow-[#E60028]/25 transition hover:-translate-y-0.5 hover:bg-[#c90022] disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {isLoading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                  {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                </button>

                <button type="button" onClick={() => { setStep("email"); setError(""); }}
                  className="w-full text-center text-sm font-semibold text-black/50 hover:text-black transition">
                  ← Thay đổi email
                </button>
              </form>
            </>
          )}

          <div className="mt-6 text-center text-sm text-black/50">
            Nhớ mật khẩu rồi?{" "}
            <Link href="/login" className="font-bold text-black hover:text-[#E60028] transition">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round"
      strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round"
      strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
