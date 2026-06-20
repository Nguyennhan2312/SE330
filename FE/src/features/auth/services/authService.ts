import { ApiError, ApiResponse } from "@/types/api.type";
import {
  AuthResponse,
  LoginRequest,
  MyProfile,
  RegisterRequest,
  UpdateMyProfileRequest,
} from "../types/auth.type";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
const AUTH_REQUEST_TIMEOUT_MS = 8000;

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), AUTH_REQUEST_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError("Yêu cầu quá thời gian chờ. Vui lòng thử lại.", 408, "REQUEST_TIMEOUT");
    }
    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

async function parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const body = (await response.json().catch(() => null)) as ApiResponse<T> | null;
  if (!body) {
    throw new ApiError("Server trả về phản hồi không hợp lệ.", response.status);
  }
  if (!response.ok || !body.success) {
    throw new ApiError(body.message || "Yêu cầu thất bại.", response.status, body.code);
  }
  return body;
}

/** POST /api/auth/register */
export async function registerAccount(payload: RegisterRequest) {
  const response = await fetchWithTimeout(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse<MyProfile>(response);
}

/** POST /api/auth/login */
export async function login(payload: LoginRequest) {
  const response = await fetchWithTimeout(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse<AuthResponse>(response);
}

/** GET /api/users/me */
export async function getMyProfile(accessToken: string) {
  const response = await fetchWithTimeout(`${API_URL}/api/users/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return parseResponse<MyProfile>(response);
}

/** PUT /api/users/me */
export async function updateMyProfile(payload: UpdateMyProfileRequest, accessToken: string) {
  const response = await fetchWithTimeout(`${API_URL}/api/users/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  return parseResponse<MyProfile>(response);
}

/** PATCH /api/users/me/password */
export async function changePassword(
  payload: { oldPassword: string; newPassword: string },
  accessToken: string
) {
  const response = await fetchWithTimeout(`${API_URL}/api/users/me/password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  return parseResponse<null>(response);
}

/** Logout chỉ xoá token phía client, BE không cần refresh token */
export async function logout() {
  // BE không có refresh token → chỉ clear phía client
  return Promise.resolve();
}
