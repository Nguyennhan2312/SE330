"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useLanguage } from "@/features/i18n/context/LanguageContext";
import { BrandMark } from "./BrandMark";

const footerCopy = {
  en: {
    ctaKicker: "Heard enough?",
    ctaTitle: "Contact us",
    tagline: "A modern space for knowledge discovery.",
    copyright: "© 2026 The Athenaeum. Built with Next.js and Spring Boot.",
    locationTitle: "Library desk",
    contactEmail: "support@athenaeum.local",
    contactPhone: "+84 396 807 074",
    address: "SE313 Library Hall, University Quarter",
    map: "See location",
    smartTitle: "Want a smarter library day?",
    newsletter: "Sign up for library notices",
    follow: "Follow us",
    groups: [
      { title: "Explore", links: ["Books", "Categories", "Authors", "Borrowing Guide"] },
      { title: "Account", links: ["Login", "Register", "My Borrows", "Reservations"] },
      { title: "System", links: ["About", "Notices", "Contact", "Help Desk"] },
    ],
  },
  vi: {
    ctaKicker: "Đủ thông tin chưa?",
    ctaTitle: "Liên hệ",
    tagline: "Không gian hiện đại cho hành trình khám phá tri thức.",
    copyright: "© 2026 The Athenaeum. Xây dựng với Next.js và Spring Boot.",
    locationTitle: "Quầy thư viện",
    contactEmail: "support@athenaeum.local",
    contactPhone: "+84 396 807 074",
    address: "Sảnh thư viện SE313, khu đại học",
    map: "Xem vị trí",
    smartTitle: "Muốn một ngày thư viện thông minh hơn?",
    newsletter: "Đăng ký nhận thông báo thư viện",
    follow: "Theo dõi",
    groups: [
      { title: "Khám phá", links: ["Sách", "Danh mục", "Tác giả", "Hướng dẫn mượn"] },
      { title: "Tài khoản", links: ["Đăng nhập", "Đăng ký", "Sách đang mượn", "Đặt giữ"] },
      { title: "Hệ thống", links: ["Giới thiệu", "Thông báo", "Liên hệ", "Quầy hỗ trợ"] },
    ],
  },
};

export function Footer() {
  const { locale } = useLanguage();
  const copy = footerCopy[locale];

  return (
    <footer className="w-full bg-[#050505] text-white">
      <div className="w-full overflow-hidden">
        <div className="bg-[radial-gradient(circle_at_20%_0%,#232323_0%,#111111_42%,#050505_100%)]">
          <div className="grid min-h-[430px] w-full gap-12 px-8 py-18 md:grid-cols-[0.95fr_0.85fr_1.45fr_0.9fr] lg:px-16 xl:px-24">
            <div className="space-y-5">
              <BrandMark />
              <h2 className="max-w-72 text-4xl font-semibold leading-[0.95] tracking-[-0.05em] text-white">
                The agency for curious readers
              </h2>
              <p className="max-w-sm text-sm leading-6 text-white/65">{copy.tagline}</p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wide text-white/90">{copy.locationTitle}</h3>
              <div className="space-y-1 text-sm font-semibold leading-6 text-white/75">
                <p className="underline decoration-white/50 underline-offset-4">{copy.contactEmail}</p>
                <p>{copy.contactPhone}</p>
                <p>{copy.address}</p>
              </div>
              <Link href="/about" className="inline-flex text-xs font-black uppercase tracking-wide text-white underline decoration-white/50 underline-offset-4 transition hover:text-[#DFFF00]">
                {copy.map} <span aria-hidden="true">&nbsp;-&gt;</span>
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-3 md:grid-cols-3">
              {copy.groups.map((group) => (
                <div key={group.title}>
                  <h3 className="text-xs font-black uppercase tracking-wide text-white/90">{group.title}</h3>
                  <div className="mt-3 grid gap-2">
                    {group.links.map((link) => (
                      <Link key={link} href="#" className="text-sm font-semibold text-white/65 transition hover:text-white">
                        {link}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-7">
              <div>
                <h3 className="max-w-64 text-sm font-black uppercase leading-5 tracking-wide text-white">
                  {copy.smartTitle}
                </h3>
                <Link href="/notices" className="mt-5 inline-flex text-xs font-black uppercase tracking-wide text-white underline decoration-white/50 underline-offset-4 transition hover:text-[#DFFF00]">
                  {copy.newsletter} <span aria-hidden="true">&nbsp;-&gt;</span>
                </Link>
              </div>
              <div>
                <h3 className="text-xs font-black uppercase tracking-wide text-white/80">{copy.follow}</h3>
                <div className="mt-5 flex items-center gap-5">
                  <SocialLink label="Facebook">
                    <span className="text-lg font-black">f</span>
                  </SocialLink>
                  <SocialLink label="X">
                    <span className="text-sm font-black">X</span>
                  </SocialLink>
                  <SocialLink label="Google">
                    <span className="text-sm font-black">G</span>
                  </SocialLink>
                </div>
              </div>
              <p className="text-xs text-white/45">{copy.copyright}</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Link
      href="#"
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-white/20 text-white transition hover:border-[#DFFF00] hover:bg-[#DFFF00] hover:text-black"
    >
      {children}
    </Link>
  );
}
