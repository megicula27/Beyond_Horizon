// src/hooks/useInitializeAuth.ts

import { useEffect, useState } from "react";
import { getAccessToken } from "../lib/secureStore";
import { getCurrentUser } from "../services/authService";
import { useAuthStore } from "../features/auth/store";

export function useInitializeAuth() {
  const { setSession, clearSession } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = await getAccessToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const user = await getCurrentUser();
        setSession(user);
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  return { loading };
}