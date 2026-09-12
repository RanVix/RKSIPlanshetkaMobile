import { BellScheduleType } from "../types/bells";

export const BELL_SCHEDULES: BellScheduleType[] = [
  {
    id: "class_hour",
    title: "С классным часом",
    items: [
      { id: "1", number: "1", time: "8:00 - 9:30" },
      { id: "2", number: "2", time: "9:40 - 11:10" },
      { id: "3", number: "3", time: "11:30 - 13:00" },
      { id: "kh", number: "К", time: "13:05 - 14:05" },
      { id: "4", number: "4", time: "14:10 - 15:40" },
      { id: "5", number: "5", time: "16:00 - 17:30" },
      { id: "6", number: "6", time: "17:40 - 19:10" },
    ],
  },
  {
    id: "regular",
    title: "Обычное расписание",
    items: [
      { id: "1", number: "1", time: "8:00 - 9:30" },
      { id: "2", number: "2", time: "9:40 - 11:10" },
      { id: "3", number: "3", time: "11:30 - 13:00" },
      { id: "4", number: "4", time: "13:10 - 14:40" },
      { id: "5", number: "5", time: "15:00 - 16:30" },
      { id: "6", number: "6", time: "16:40 - 18:10" },
      { id: "7", number: "7", time: "18:20 - 19:50" },
    ],
  },
  {
    id: "shortened",
    title: "Сокращённое расписание",
    items: [
      { id: "1", number: "1", time: "8:00 - 8:50" },
      { id: "2", number: "2", time: "9:00 - 9:50" },
      { id: "3", number: "3", time: "10:00 - 10:50" },
      { id: "4", number: "4", time: "11:00 - 11:50" },
      { id: "5", number: "5", time: "12:00 - 12:50" },
      { id: "6", number: "6", time: "13:00 - 13:50" },
      { id: "7", number: "7", time: "14:00 - 14:50" },
    ],
  },
];
