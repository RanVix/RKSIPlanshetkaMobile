import { searchApi } from "@/api/searchApi";
import { QueryClient, useQuery } from "@tanstack/react-query";
import { SearchItem } from "../features/search/types/search";

export const SEARCH_QUERY_KEYS = {
  groups: ["search", "groups"],
  teachers: ["search", "teachers"],
  audiences: ["search", "audiences"],
} as const;

export const prefetchSearchData = async (queryClient: QueryClient) => {
  await Promise.allSettled([
    queryClient.prefetchQuery({
      queryKey: SEARCH_QUERY_KEYS.groups,
      queryFn: searchApi.getGroups,
      staleTime: 1000 * 60 * 60,
    }),
    queryClient.prefetchQuery({
      queryKey: SEARCH_QUERY_KEYS.teachers,
      queryFn: searchApi.getTeachers,
      staleTime: 1000 * 60 * 60,
    }),
    queryClient.prefetchQuery({
      queryKey: SEARCH_QUERY_KEYS.audiences,
      queryFn: searchApi.getAudiences,
      staleTime: 1000 * 60 * 60,
    }),
  ]);
};

export interface SearchDataResult {
  groups: SearchItem[];
  teachers: SearchItem[];
  audiences: SearchItem[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useSearchData(): SearchDataResult {
  // 1. Запрос групп
  const groupsQuery = useQuery({
    queryKey: SEARCH_QUERY_KEYS.groups,
    queryFn: searchApi.getGroups,
    staleTime: 1000 * 60 * 60,
  });

  // 2. Запрос преподавателей
  const teachersQuery = useQuery({
    queryKey: SEARCH_QUERY_KEYS.teachers,
    queryFn: searchApi.getTeachers,
    staleTime: 1000 * 60 * 60,
  });

  // 3. Запрос аудиторий
  const audiencesQuery = useQuery({
    queryKey: SEARCH_QUERY_KEYS.audiences,
    queryFn: searchApi.getAudiences,
    staleTime: 1000 * 60 * 60,
  });

  const groups: SearchItem[] = (groupsQuery.data || []).map((name) => ({
    id: `group_${name}`,
    name,
    category: "groups",
  }));

  const teachers: SearchItem[] = (teachersQuery.data || []).map((name) => ({
    id: `teacher_${name}`,
    name,
    category: "teachers",
  }));

  const audiences: SearchItem[] = (audiencesQuery.data || []).map((name) => ({
    id: `audience_${name}`,
    name,
    category: "audiences",
  }));

  const isLoading =
    groupsQuery.isLoading ||
    teachersQuery.isLoading ||
    audiencesQuery.isLoading;
  const isError =
    groupsQuery.isError || teachersQuery.isError || audiencesQuery.isError;
  const error =
    (groupsQuery.error as Error) ||
    (teachersQuery.error as Error) ||
    (audiencesQuery.error as Error) ||
    null;

  return {
    groups,
    teachers,
    audiences,
    isLoading,
    isError,
    error,
    refetch: () => {
      groupsQuery.refetch();
      teachersQuery.refetch();
      audiencesQuery.refetch();
    },
  };
}
