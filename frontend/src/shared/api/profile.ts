import api from "./apiClient";
import type { UserProfile } from "@/shared/types";

const BASE = "/api/users";

export const profileAPI = {
  getProfile: () => api.get<UserProfile>(`${BASE}/me`),

  updateProfile: (data: { nickname?: string; bio?: string }) =>
    api.put<UserProfile>(`${BASE}/me`, data),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post<{ message: string }>(`${BASE}/me/avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /** 获取头像 Blob URL（用于 img src），无头像时返回 null */
  getAvatarUrl: async (): Promise<string | null> => {
    const res = await api.get<Blob>(`${BASE}/me/avatar`, {
      responseType: "blob",
      validateStatus: (status) => status === 200 || status === 204,
    });
    if (res.status === 204) return null;
    const blob = res.data as Blob | undefined;
    if (blob == null || blob.size === 0) return null;
    return URL.createObjectURL(blob);
  },
};
