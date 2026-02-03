import api from "./apiClient";
import type { ReviewPlan } from "@/shared/types";

export const reviewPlanAPI = {
  getPlans: () => api.get<ReviewPlan[]>("/api/review-plans"),
  getPlansByDateRange: (startDate: string, endDate: string) =>
    api.get<ReviewPlan[]>("/api/review-plans/date-range", {
      params: { startDate, endDate },
    }),
  getPlansByDate: (date: string) =>
    api.get<ReviewPlan[]>(`/api/review-plans/date/${date}`),
  getPlan: (id: number) =>
    api.get<ReviewPlan>(`/api/review-plans/${String(id)}`),
  createPlan: (planData: Partial<ReviewPlan>) =>
    api.post<ReviewPlan>("/api/review-plans", planData),
  updatePlan: (id: number, planData: Partial<ReviewPlan>) =>
    api.put<ReviewPlan>(`/api/review-plans/${String(id)}`, planData),
  deletePlan: (id: number) => api.delete(`/api/review-plans/${String(id)}`),
};
