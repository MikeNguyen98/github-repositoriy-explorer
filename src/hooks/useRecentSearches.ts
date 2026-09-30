import { recentSearches } from "@/libs/recentSearches";
import { useSyncExternalStore } from "react";

export const useRecentSearches = () =>
  useSyncExternalStore(recentSearches.subscribe, recentSearches.get);
