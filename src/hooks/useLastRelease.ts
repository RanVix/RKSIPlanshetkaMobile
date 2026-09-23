import { getLastRelease, LastReleaseResponse } from "@/api/lastReleaseApi";
import { useQuery } from "@tanstack/react-query";
import Constants from "expo-constants";

export const CURRENT_APP_VERSION = Constants.expoConfig?.version ?? "";

const isNewVersionAvailable = (current: string, latest: string): boolean => {
  if (!current || !latest) return false;

  const cleanCurrent = current.replace(/^v/, "").trim();
  const cleanLatest = latest.replace(/^v/, "").trim();

  return cleanCurrent !== cleanLatest;
};

export const useLastRelease = () => {
  const query = useQuery<LastReleaseResponse>({
    queryKey: ["latest-release"],
    queryFn: getLastRelease,
    staleTime: 1000 * 60 * 30,
    gcTime: Infinity,
    networkMode: "offlineFirst",
  });

  const hasUpdate = query.data
    ? isNewVersionAvailable(CURRENT_APP_VERSION, query.data.version)
    : false;

  return {
    ...query,
    hasUpdate,
    latestRelease: query.data,
  };
};
