export interface ScheduleCombinedItem {
  audience: string;
  group: string;
  teacher: string;
}

export interface ScheduleLessonItem {
  name: string;
  time: string;
  audience: string;
  group: string;
  teacher: string;
  subject: string;
  subject_warning?: boolean;
  combined?: ScheduleCombinedItem[];
  distance_info?: string | null;
  is_now?: boolean;
}

export interface ScheduleDayData {
  corpus: number;
  source: string;
  items: ScheduleLessonItem[];
  time_type: string;
}

export type ScheduleResponse = Record<string, ScheduleDayData>;

export interface FetchScheduleParams {
  name: string;
  day?: string | null;
}
