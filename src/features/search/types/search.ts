export type SearchCategory = "groups" | "teachers" | "cabinets";

export interface SearchItem {
  id: string;
  name: string;
  category: SearchCategory;
}

export const MOCK_SEARCH_DATA: SearchItem[] = [
  { id: "g1", name: "ИС-21", category: "groups" },
  { id: "g2", name: "ИС-22", category: "groups" },
  { id: "g3", name: "ИС-23", category: "groups" },
  { id: "g4", name: "ИС-24", category: "groups" },

  { id: "t1", name: "Преподаватель1 А.Б.", category: "teachers" },
  { id: "t2", name: "Преподаватель2 А.Б.", category: "teachers" },
  { id: "t3", name: "Преподаватель3 А.Б.", category: "teachers" },
  { id: "t4", name: "Преподаватель4 А.Б.", category: "teachers" },

  { id: "c1", name: "123", category: "cabinets" },
  { id: "c2", name: "124", category: "cabinets" },
  { id: "c3", name: "125", category: "cabinets" },
  { id: "c4", name: "126", category: "cabinets" },
];
