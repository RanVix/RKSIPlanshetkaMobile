import { apiClient } from "./client";

export interface LastReleaseResponse {
  version: string;
  description: string;
}

export const getLastRelease = async (): Promise<LastReleaseResponse> => {
  return apiClient<LastReleaseResponse>("/latest-release");
};
