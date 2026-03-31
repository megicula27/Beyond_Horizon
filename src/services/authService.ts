// src/services/authService.ts

import api from "./apiClient";
import { setTokens, clearTokens, getAccessToken } from "../lib/secureStore";

export async function login(imoNumber: string, crewId: string, password: string) {
  const res = await api.post("/auth/login", { imoNumber, crewId, password });

  const { accessToken, refreshToken, user } = res.data;

  await setTokens(accessToken, refreshToken);

  return user;
}

export async function logout() {
  try {
    // Call backend to invalidate refresh token
    await api.post("/auth/logout");
  } finally {
    // Always clear local tokens even if the API call fails
    await clearTokens();
  }
}

export async function getCurrentUser() {
  const res = await api.get("/auth/me");
  return res.data;
}