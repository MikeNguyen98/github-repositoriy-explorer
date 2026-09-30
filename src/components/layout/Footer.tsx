import { rateLimitStore } from "@/libs/api";
import { useSyncExternalStore } from "react";

export function Footer() {
  const rateLimit = useSyncExternalStore(rateLimitStore.subscribe, rateLimitStore.get);
  const low = rateLimit && rateLimit.remaining / rateLimit.limit < 0.1;

  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <p>
          Built with React, TanStack Query &amp; Tailwind CSS · Data from the{" "}
          <a
            href="https://docs.github.com/en/rest"
            target="_blank"
            rel="noreferrer"
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            GitHub REST API
          </a>
        </p>
        {rateLimit && (
          <p
            className={low ? "font-medium text-destructive" : undefined}
            title={`Resets at ${rateLimit.reset.toLocaleTimeString()}`}
          >
            API quota {rateLimit.remaining.toLocaleString("en-US")} /{" "}
            {rateLimit.limit.toLocaleString("en-US")}
          </p>
        )}
      </div>
    </footer>
  );
}
