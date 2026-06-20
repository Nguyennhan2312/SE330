"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/features/auth/context/AuthContext";
import { API_URL } from "@/features/auth/services/authService";

type Book = {
  id: number;
  title: string;
  author: string;
  category: string;
  description: string;
  coverUrl?: string;
  totalCopies: number;
  availableCopies: number;
};

const CATEGORY_COLORS: Record<string, string> = {
  "Lập trình":     "bg-blue-50 text-blue-700 border-blue-200",
  "Java":          "bg-orange-50 text-orange-700 border-orange-200",
  "Lập trình Web": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Cơ sở dữ liệu": "bg-purple-50 text-purple-700 border-purple-200",
  "AI":            "bg-green-50 text-green-700 border-green-200",
  "Văn học":       "bg-rose-50 text-rose-700 border-rose-200",
  "Kỹ năng sống":  "bg-teal-50 text-teal-700 border-teal-200",
  "Lịch sử":       "bg-amber-50 text-amber-700 border-amber-200",
};

export function BooksPage() {
  const router  = useRouter();
  const auth    = useAuth();
  const [books,     setBooks]     = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState("");
  const [search,    setSearch]    = useState("");
  const [borrowing, setBorrowing] = useState<number | null>(null);
  const [toast,     setToast]     = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    setIsLoading(true);
    try {
      const res  = await fetch(`${API_URL}/api/books`);
      const body = await res.json();
      if (!body.success) throw new Error(body.message);
      setBooks(body.data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không thể tải danh sách sách.");
    } finally {
      setIsLoading(false);
    }
  }

  function showToast(msg: string, type: "ok" | "err") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleBorrow(book: Book) {
    if (!auth.isAuthenticated) {
      router.push("/login");
      return;
    }
    setBorrowing(book.id);
    try {
      const res = await fetch(`${API_URL}/api/books/${book.id}/borrow`, {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.accessToken}` },
      });
      const body = await res.json();
      if (!body.success) throw new Error(body.message);
      showToast(`Đã mượn "${book.title}" thành công!`, "ok");
      // Cập nhật số bản sao
      setBooks((prev) =>
        prev.map((b) =>
          b.id === book.id ? { ...b, availableCopies: b.availableCopies - 1 } : b
        )
      );
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Không thể mượn sách.", "err");
    } finally {
      setBorrowing(null);
    }
  }

  const filtered = books.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      (b.category ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-dvh bg-[#f8f7f4]">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl px-5 py-10 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/40">Thư viện sách</p>
          <h1 className="mt-1 font-serif text-3xl font-bold text-black">Danh sách sách</h1>
          <p className="mt-1 text-sm text-black/55">Chọn sách và mượn ngay — tối đa 5 cuốn cùng lúc.</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Tìm theo tên sách, tác giả, thể loại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-[48px] w-full max-w-md rounded-xl border border-black/15 bg-white px-4 text-sm outline-none transition focus:border-black focus:shadow-[0_0_0_3px_rgba(0,0,0,0.08)]"
          />
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center gap-3 py-12 text-sm text-black/45">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
            Đang tải...
          </div>
        ) : error ? (
          <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-black/40">Không tìm thấy sách nào.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isBorrowing={borrowing === book.id}
                onBorrow={() => handleBorrow(book)}
                isLoggedIn={auth.isAuthenticated}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 rounded-2xl px-5 py-3 text-sm font-semibold text-white shadow-xl transition-all ${
          toast.type === "ok" ? "bg-emerald-600" : "bg-rose-600"
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

function BookCard({ book, isBorrowing, onBorrow, isLoggedIn }: {
  book: Book;
  isBorrowing: boolean;
  onBorrow: () => void;
  isLoggedIn: boolean;
}) {
  const catColor = CATEGORY_COLORS[book.category] ?? "bg-black/5 text-black/60 border-black/10";
  const available = book.availableCopies > 0;

  return (
    <div className="flex flex-col rounded-[20px] border border-black/10 bg-white p-5 shadow-[0_8px_24px_rgba(17,24,39,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(17,24,39,0.1)]">
      {/* Cover placeholder */}
      <div className="mb-4 flex h-36 items-center justify-center rounded-xl bg-[#f8f7f4]">
        <svg className="h-12 w-12 text-black/15" fill="none" stroke="currentColor"
          strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z" />
          <path d="M4 5.5v16" />
        </svg>
      </div>

      {/* Info */}
      <div className="flex-1">
        {book.category && (
          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${catColor}`}>
            {book.category}
          </span>
        )}
        <h3 className="mt-2 font-serif text-base font-bold text-black leading-snug line-clamp-2">
          {book.title}
        </h3>
        <p className="mt-1 text-xs text-black/50">{book.author}</p>
        {book.description && (
          <p className="mt-2 text-xs leading-5 text-black/55 line-clamp-2">{book.description}</p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <span className={`text-xs font-semibold ${available ? "text-emerald-600" : "text-rose-500"}`}>
          {available ? `Còn ${book.availableCopies} bản` : "Hết sách"}
        </span>
        <button
          onClick={onBorrow}
          disabled={!available || isBorrowing}
          className="inline-flex items-center gap-1.5 rounded-xl bg-black px-4 py-2 text-xs font-bold text-white transition hover:bg-[#E60028] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isBorrowing && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />}
          {isLoggedIn ? (isBorrowing ? "Đang xử lý..." : "Mượn sách") : "Đăng nhập để mượn"}
        </button>
      </div>
    </div>
  );
}
