import api from "./apiClient";
import type { User } from "@/shared/types";

export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post<{ user: User; token: string }>("/api/auth/login", credentials),
  register: (userData: { username: string; password: string; role?: string }) =>
    api.post<{ user: User; token: string }>("/api/auth/register", userData),
};
