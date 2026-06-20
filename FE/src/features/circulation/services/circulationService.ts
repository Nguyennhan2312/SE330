"use client";

import { ApiError, ApiResponse } from "@/types/api.type";
import { API_URL } from "@/features/auth/services/authService";
import { BorrowRecord } from "../types/circulation.type";

const REQUEST_TIMEOUT_MS = 10000;
type AccessTokenRefresher = () => Promise<string | null>;

async function apiFetch<T>(
  path: string,
  init?: RequestInit,
  accessToken?: string | null
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const headers = new Headers(init?.headers);
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
      signal: controller.signal,
    });

    const body = (await response.json().catch(() => null)) as ApiResponse<T> | null;

    if (!body) throw new ApiError("Phản hồi không hợp lệ từ server.", response.status);
    if (!response.ok || !body.success) {
      throw new ApiError(body.message || "Yêu cầu thất bại.", response.status);
    }

    return body.data as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Yêu cầu quá thời gian chờ.", 408);
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

/** GET /api/users/me/loans — sách đang mượn */
export function getMyBorrows(
  _params: object,
  accessToken: string | null,
  _refreshAccessToken?: AccessTokenRefresher
): Promise<BorrowRecord[]> {
  return apiFetch<BorrowRecord[]>("/api/users/me/loans", { method: "GET" }, accessToken);
}

/** GET /api/users/me/loans/history — lịch sử mượn */
export function getMyBorrowHistory(
  _params: object,
  accessToken: string | null,
  _refreshAccessToken?: AccessTokenRefresher
): Promise<BorrowRecord[]> {
  return apiFetch<BorrowRecord[]>("/api/users/me/loans/history", { method: "GET" }, accessToken);
}

/** POST /api/books/borrows/{id}/return — trả sách */
export function returnBook(
  borrowId: number,
  accessToken: string | null
): Promise<import("../types/circulation.type").BorrowRecord> {
  return apiFetch<import("../types/circulation.type").BorrowRecord>(
    `/api/books/borrows/${borrowId}/return`,
    { method: "POST" },
    accessToken
  );
}
