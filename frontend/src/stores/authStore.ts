import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "../types";
import { clearAuthData, getStoredToken, getStoredUser } from "../utils";

interface AuthState {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      login: (userData: User) => {
        set({ user: userData });
        localStorage.setItem("token", userData.token);
        localStorage.setItem("user", JSON.stringify(userData));
      },

      logout: () => {
        set({ user: null });
        clearAuthData();
      },

      initialize: () => {
        const token = getStoredToken();
        const userData = getStoredUser();

        if (token && userData && userData.username) {
          set({ user: userData });
        } else {
          clearAuthData();
          set({ user: null });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
