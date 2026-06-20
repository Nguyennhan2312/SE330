export type AuthResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
};

export type UserRole = "MEMBER" | "LIBRARIAN" | "ADMIN" | string;

export type UserStatus = "ACTIVE" | "INACTIVE" | string;

export type MyProfile = {
  id: number;
  fullName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  dateOfBirth?: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt?: string;
};

export type UpdateMyProfileRequest = {
  fullName: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string | null;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
};
