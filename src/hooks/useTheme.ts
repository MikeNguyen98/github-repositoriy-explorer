import { themeStore } from "@/libs/theme";
import { useSyncExternalStore } from "react";

export const useTheme = () =>
  [useSyncExternalStore(themeStore.subscribe, themeStore.get), themeStore.set] as const;
