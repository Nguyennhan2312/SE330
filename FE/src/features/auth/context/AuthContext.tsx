"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  AuthResponse,
  LoginRequest,
  MyProfile,
  UpdateMyProfileRequest,
} from "../types/auth.type";
import {
  login as loginRequest,
  logout as logoutRequest,
  getMyProfile,
  updateMyProfile,
} from "../services/authService";

const ACCESS_TOKEN_KEY = "libraryAccessToken";

type AuthContextValue = {
  accessToken: string | null;
  currentUser: MyProfile | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  hasAdminAccess: boolean;
  hasStaffAccess: boolean;
  login: (payload: LoginRequest) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  /** Không có refresh token trong BE đơn giản này — trả null */
  refresh: () => Promise<AuthResponse | null>;
  setAccessToken: (token: string | null) => void;
  updateProfile: (data: UpdateMyProfileRequest) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<MyProfile | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const setAccessToken = useCallback((token: string | null) => {
    setAccessTokenState(token);
    if (token) {
      window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  }, []);

  // Khởi tạo: đọc token từ sessionStorage → fetch profile
  useEffect(() => {
    let mounted = true;

    async function init() {
      const stored = window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
      if (stored) {
        setAccessTokenState(stored);
        try {
          const res = await getMyProfile(stored);
          if (mounted) setCurrentUser(res.data ?? null);
        } catch {
          // Token hết hạn → clear
          if (mounted) {
            window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
            setAccessTokenState(null);
            setCurrentUser(null);
          }
        }
      }
      if (mounted) setIsInitializing(false);
    }

    init();
    return () => { mounted = false; };
  }, []);

  const refresh = useCallback(async (): Promise<AuthResponse | null> => {
    // BE không có refresh token endpoint → trả null
    return null;
  }, []);

  const hasAdminAccess = useMemo(() => currentUser?.role === "ADMIN", [currentUser]);
  const hasStaffAccess = useMemo(
    () => currentUser?.role === "LIBRARIAN" || currentUser?.role === "ADMIN",
    [currentUser]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      currentUser,
      isAuthenticated: Boolean(accessToken),
      isInitializing,
      hasAdminAccess,
      hasStaffAccess,

      login: async (payload) => {
        const body = await loginRequest(payload);
        const token = body.data?.accessToken ?? null;
        setAccessToken(token);
        if (token) {
          try {
            const profileRes = await getMyProfile(token);
            setCurrentUser(profileRes.data ?? null);
          } catch {
            setCurrentUser(null);
          }
        }
        return body.data as AuthResponse;
      },

      logout: async () => {
        setAccessToken(null);
        setCurrentUser(null);
        await logoutRequest().catch(() => undefined);
        router.replace("/login");
      },

      refresh,
      setAccessToken,

      updateProfile: async (data: UpdateMyProfileRequest) => {
        if (!accessToken) throw new Error("Chưa đăng nhập");
        const res = await updateMyProfile(data, accessToken);
        setCurrentUser(res.data ?? null);
      },
    }),
    [accessToken, currentUser, isInitializing, hasAdminAccess, hasStaffAccess, refresh, router, setAccessToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider.");
  return ctx;
}
