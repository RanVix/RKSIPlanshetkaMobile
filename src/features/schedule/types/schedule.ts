export interface Teacher {
  id: string;
  name: string;
  room: string;
  group?: string;
}

export interface Lesson {
  id: string;
  number: number;
  startTime: string;
  endTime: string;
  subject: string;
  hasIndicator?: boolean;
  teachers: Teacher[];
}

export interface DaySchedule {
  id: string;
  dayOfWeek: string;
  date: string;
  isToday?: boolean;
}
