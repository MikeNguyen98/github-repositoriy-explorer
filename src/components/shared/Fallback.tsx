import { Spinner } from "@/components/ui/spinner";

export function Fallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status">
      <Spinner className="size-6 text-muted-foreground" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}
