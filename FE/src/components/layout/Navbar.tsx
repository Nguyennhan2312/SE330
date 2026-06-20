"use client";

import Link from "next/link";
import { UsersRound } from "@/components/animate-ui/icons/users-round";
import { useAuth } from "@/features/auth/context/AuthContext";
import { useLanguage } from "@/features/i18n/context/LanguageContext";
import { BrandMark } from "./BrandMark";

export function Navbar() {
  const { currentUser, hasAdminAccess, isAuthenticated, isInitializing, logout } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="sticky inset-x-0 top-0 z-30 border-b border-[#EDEDF2] bg-white text-[#111827] shadow-[0_12px_30px_rgba(7,7,88,0.12)]">
      <nav className="mx-auto flex min-h-14 w-full max-w-7xl items-center justify-between gap-5 px-5 py-3 lg:px-8">
        <div className="flex items-center gap-6">
          <BrandMark tone="dark" />
          {isAuthenticated && (
            <Link
              href="/books"
              className="rounded-full px-3 py-2 text-sm font-semibold text-[#111827] transition-colors hover:bg-[#F1F2F4]"
            >
              Sách
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          {isInitializing ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-[#EDEDF2]" />
          ) : isAuthenticated ? (
            <UserMenu
              currentUser={currentUser}
              hasAdminAccess={hasAdminAccess}
              onLogout={() => logout()}
            />
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-sm font-semibold text-[#111827] transition-colors duration-75 hover:bg-[#F1F2F4] hover:text-black"
              >
                {t("nav.login")}
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-gradient-to-r from-[#E60028] to-[#c90022] px-5 py-2 text-sm font-bold text-white shadow-lg shadow-[#E60028]/25 transition-all duration-150 hover:-translate-y-0.5"
              >
                {t("nav.register")}
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

function LanguageToggle() {
  const { nextLocale, toggleLocale, t } = useLanguage();
  const nextLabel = nextLocale.toUpperCase();
  const title = nextLocale === "vi" ? t("language.switchToVietnamese") : t("language.switchToEnglish");

  return (
    <button
      type="button"
      aria-label={title}
      title={title}
      onClick={toggleLocale}
      className="inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-sm font-bold text-[#4B5563] transition hover:bg-[#F1F2F4] hover:text-black focus:outline-none"
    >
      <svg aria-hidden="true" className="h-[17px] w-[17px]" fill="none" stroke="currentColor"
        strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3c2.2 2.3 3.4 5.3 3.4 9s-1.2 6.7-3.4 9" />
        <path d="M12 3C9.8 5.3 8.6 8.3 8.6 12s1.2 6.7 3.4 9" />
      </svg>
      <span className="leading-none">{nextLabel}</span>
    </button>
  );
}

function UserMenu({
  currentUser, hasAdminAccess, onLogout,
}: {
  currentUser: { fullName?: string; role?: string } | null;
  hasAdminAccess: boolean;
  onLogout: () => void;
}) {
  const { t } = useLanguage();

  const roleLabel: Record<string, string> = {
    ADMIN: "Quản trị viên",
    LIBRARIAN: "Thủ thư",
    MEMBER: "Thành viên",
  };

  return (
    <div className="group relative">
      <button
        type="button"
        aria-label="Mở menu tài khoản"
        className="grid h-9 w-9 place-items-center rounded-full text-[#111827] transition-colors duration-150 hover:bg-[#F1F2F4] focus:outline-none focus:ring-4 focus:ring-black/10"
      >
        <UsersRound animateOnHover size={18} aria-hidden="true" />
      </button>

      <div className="invisible absolute right-0 top-[calc(100%+12px)] w-56 translate-y-2 rounded-2xl border border-[#EDEDF2] bg-white p-2 opacity-0 shadow-[0_24px_60px_rgba(7,7,88,0.16)] transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">

        {/* Account info */}
        <div className="px-3 py-2">
          <p className="text-xs font-bold uppercase tracking-wide text-black/50">{t("menu.account")}</p>
          <p className="mt-1 text-sm font-bold text-black">{currentUser?.fullName ?? "Người dùng"}</p>
          <p className="mt-0.5 text-xs font-bold uppercase tracking-wide text-black/40">
            {roleLabel[currentUser?.role ?? ""] ?? currentUser?.role ?? "Member"}
          </p>
        </div>

        <div className="my-1.5 h-px bg-[#EDEDF2]" />

        {/* My Profile — tất cả user đều có */}
        <Link
          href="/profile"
          className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-[#111827] transition hover:bg-black hover:text-white"
        >
          {t("menu.myProfile")}
          <span aria-hidden="true">&gt;</span>
        </Link>

        {/* Manage Users — chỉ ADMIN */}
        {hasAdminAccess && (
          <>
            <div className="my-1.5 h-px bg-[#EDEDF2]" />
            <Link
              href="/admin/users"
              className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold text-[#E60028] transition hover:bg-[#E60028] hover:text-white"
            >
              Quản lý người dùng
              <span aria-hidden="true">&gt;</span>
            </Link>
          </>
        )}

        <div className="my-1.5 h-px bg-[#EDEDF2]" />

        {/* Logout */}
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-bold text-[#E60028] transition hover:bg-[#E60028] hover:text-white"
        >
          {t("menu.logout")}
          <span aria-hidden="true">&gt;</span>
        </button>
      </div>
    </div>
  );
}
