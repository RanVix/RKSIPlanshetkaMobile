export type SearchCategory = "groups" | "teachers" | "audiences";

export interface SearchItem {
  id: string;
  name: string;
  category: SearchCategory;
}

export type SearchApiRawResponse = string[];
