// src/services/api.ts

import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "../lib/secureStore";

const api = axios.create({
 baseURL: "http://YOUR_BACKEND_URL/api",
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

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = await getRefreshToken();

      if (!refreshToken) {
        await clearTokens();
        return Promise.reject(err);
      }

      try {
        const res = await axios.post("http://YOUR_BACKEND_URL/api/auth/refresh", {
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