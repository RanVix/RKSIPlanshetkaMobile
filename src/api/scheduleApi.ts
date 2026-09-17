import {
  FetchScheduleParams,
  ScheduleResponse,
} from "@/features/schedule/types/schedule";
import { apiClient } from "./client";

export async function fetchSchedule({
  name,
  day,
}: FetchScheduleParams): Promise<ScheduleResponse> {
  const encodedName = encodeURIComponent(name);
  const queryParam = day ? `?day=${encodeURIComponent(day)}` : "";

  return apiClient<ScheduleResponse>(`/schedule/${encodedName}${queryParam}`);
}
