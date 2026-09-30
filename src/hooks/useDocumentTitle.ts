import { useEffect } from "react";

export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · Repo Explorer` : "Repo Explorer";
  }, [title]);
}
