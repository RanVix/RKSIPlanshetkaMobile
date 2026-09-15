export type SearchCategory = "groups" | "teachers" | "audiences";

export interface SearchItem {
  id: string;
  name: string;
  category: SearchCategory;
}

export type SearchApiRawResponse = string[];

export const MOCK_SEARCH_DATA: SearchItem[] = [
  { id: "g_ИС-21", name: "ИС-21", category: "groups" },
  { id: "g_ИС-22", name: "ИС-22", category: "groups" },
  { id: "t_Преподаватель1", name: "Преподаватель1 А.Б.", category: "teachers" },
  { id: "a_123", name: "123", category: "audiences" },
];
