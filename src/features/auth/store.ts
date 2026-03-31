import { create } from "zustand";
import { AuthUser } from "./types";
import { persist } from "zustand/middleware";



type AuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setSession: (user: AuthUser) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setSession: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),

      clearSession: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage",
    }
  )
);