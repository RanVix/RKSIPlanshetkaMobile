import { apiClient } from "./client";

export const searchApi = {
  getGroups: () => apiClient<string[]>("/groups"),

  getTeachers: () => apiClient<string[]>("/teachers"),

  getAudiences: () => apiClient<string[]>("/audiences"),
};
