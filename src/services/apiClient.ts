// src/services/api.ts

import Constants from "expo-constants";
import { Platform } from "react-native";
import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "../lib/secureStore";

function stripTrailingSlash(url: string) {
  return url.replace(/\/+$/, "");
}

function getExpoDevHost() {
  const hostUri =
    (Constants.expoConfig as { hostUri?: string } | null)?.hostUri ??
    (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost ??
    (Constants as any)?.manifest?.debuggerHost ??
    null;

  if (!hostUri || typeof hostUri !== "string") {
    return null;
  }

  return hostUri.split(":")[0] || null;
}

function getApiBaseUrl() {
  const envBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envBaseUrl) {
    return stripTrailingSlash(envBaseUrl);
  }

  const expoDevHost = getExpoDevHost();
  if (expoDevHost) {
    return `http://${expoDevHost}:3000/api`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000/api";
  }

  return "http://localhost:3000/api";
}

export const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use(async (config) => {
  const token = await getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;
    const requestUrl = originalRequest?.url ?? "";
    const isAuthRequest =
      typeof requestUrl === "string" &&
      (requestUrl.includes("/auth/login") || requestUrl.includes("/auth/refresh"));

    if (err.response?.status === 401 && !originalRequest?._retry && !isAuthRequest) {
      originalRequest._retry = true;

      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        await clearTokens();
        return Promise.reject(err);
      }

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken = res.data.accessToken;

        await setTokens(newAccessToken, refreshToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch (error) {
        await clearTokens();
        return Promise.reject(error);
      }
    }

    return Promise.reject(err);
  }
);

export default api;
