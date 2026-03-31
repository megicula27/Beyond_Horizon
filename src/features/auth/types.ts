export type UserRole = "ADMIN" | "HOD" | "OFFICER";

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  imoNumber: string;
}

export interface LoginRequest {
  imoNumber: string;
  crewId: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}