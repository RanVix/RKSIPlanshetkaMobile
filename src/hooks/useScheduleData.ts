import { fetchSchedule } from "@/api/scheduleApi";
import { ScheduleResponse } from "@/features/schedule/types/schedule";
import { useQuery } from "@tanstack/react-query";

export const useScheduleData = (name: string, day?: string | null) => {
  return useQuery<ScheduleResponse, Error>({
    queryKey: ["schedule", name, day],
    queryFn: () => fetchSchedule({ name, day }),
    enabled: Boolean(name),
    staleTime: 1000 * 60 * 5,
  });
};
