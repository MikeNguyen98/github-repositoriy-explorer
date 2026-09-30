import { useViewer } from "@/features/repos/queries";
import { authStore } from "@/libs/auth";
import { useSyncExternalStore } from "react";

export function useAuth() {
  const token = useSyncExternalStore(authStore.subscribe, authStore.getToken);
  const { data: viewer, isLoading } = useViewer(!!token);
  return {
    isSignedIn: !!token,
    viewer,
    isLoading: !!token && isLoading,
  };
}
