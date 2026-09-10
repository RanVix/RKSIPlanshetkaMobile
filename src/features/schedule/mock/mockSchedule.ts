import { Feather } from "@expo/vector-icons";
import { DaySchedule, Lesson } from "../types/schedule";

export interface FilterItem {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  text: string;
}

export const MOCK_DAYS: DaySchedule[] = [
  { id: "1", dayOfWeek: "ЧТ", date: "11.06", isToday: true },
  { id: "2", dayOfWeek: "ПТ", date: "12.06" },
  { id: "3", dayOfWeek: "СБ", date: "13.06" },
];

export const MOCK_FILTERS: FilterItem[] = [
  { id: "1", icon: "map-pin", text: "1 корпус" },
  { id: "2", icon: "clock", text: "Сокращёнка" },
  { id: "3", icon: "check-square", text: "Планшетка" },
];

export const MOCK_LESSONS: Lesson[] = [
  {
    id: "l1",
    number: 5,
    startTime: "12:00",
    endTime: "12:50",
    subject: "Название предмета",
    hasIndicator: true,
    teachers: [{ id: "t1", name: "Преподаватель А.Б.", room: "123" }],
  },
  {
    id: "l2",
    number: 6,
    startTime: "13:00",
    endTime: "13:50",
    subject: "Название предмета",
    teachers: [
      { id: "t2", name: "Преподаватель А.Б.", room: "123", group: "ИС-11" },
    ],
  },
  {
    id: "l3",
    number: 7,
    startTime: "14:00",
    endTime: "14:50",
    subject: "Название предмета",
    teachers: [
      { id: "t3", name: "Преподаватель А.Б.", room: "123" },
      { id: "t4", name: "Преподаватель2 А.Б.", room: "123" },
    ],
  },
];
