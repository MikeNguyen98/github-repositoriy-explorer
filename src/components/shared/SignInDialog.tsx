import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { useDeviceFlow } from "@/hooks/useDeviceFlow";
import { Check, Copy, ExternalLink, RotateCw } from "lucide-react";
import { useEffect, useState } from "react";

interface SignInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SignInDialog({ open, onOpenChange }: SignInDialogProps) {
  // Bumping the key remounts the flow, which requests a fresh code.
  const [attempt, setAttempt] = useState(0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sign in with GitHub</DialogTitle>
          <DialogDescription>
            Approve this app on GitHub to see your private repositories and get a
            5,000 requests/hour quota.
          </DialogDescription>
        </DialogHeader>
        {open && (
          <DeviceFlow
            key={attempt}
            onDone={() => onOpenChange(false)}
            onRetry={() => setAttempt((n) => n + 1)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function DeviceFlow({ onDone, onRetry }: { onDone: () => void; onRetry: () => void }) {
  const state = useDeviceFlow();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (state.status === "success") onDone();
  }, [state.status, onDone]);

  if (state.status === "error") {
    return (
      <div className="flex flex-col gap-4">
        <ErrorState title="Sign-in failed" message={state.message} />
        <Button onClick={onRetry} className="self-start">
          <RotateCw data-icon="inline-start" />
          Try again
        </Button>
      </div>
    );
  }

  if (state.status !== "waiting") {
    return (
      <div className="flex flex-col items-center gap-4 py-2" aria-busy>
        <Skeleton className="h-14 w-56 rounded-xl" />
        <Skeleton className="h-9 w-full" />
      </div>
    );
  }

  const { user_code, verification_uri } = state.code;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(user_code);
      setCopied(true);
    } catch {
      // clipboard blocked — the code is still visible to type by hand
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <ol className="flex flex-col gap-5 text-sm">
        <li className="flex flex-col gap-2">
          <span>
            <span className="font-semibold">1.</span> Copy this one-time code
          </span>
          <div className="flex items-center gap-2">
            <code
              aria-label="One-time code"
              className="flex-1 rounded-xl border bg-muted py-3 text-center font-mono text-2xl font-semibold tracking-[0.3em] select-all"
            >
              {user_code}
            </code>
            <Button variant="outline" size="icon-lg" onClick={copy} aria-label="Copy code">
              {copied ? <Check className="text-green-600" /> : <Copy />}
            </Button>
          </div>
        </li>
        <li className="flex flex-col gap-2">
          <span>
            <span className="font-semibold">2.</span> Paste it on GitHub and authorize the app
          </span>
          <a
            href={verification_uri}
            target="_blank"
            rel="noreferrer"
            onClick={copy}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand px-4 text-sm font-medium text-brand-foreground transition-colors hover:bg-brand/90"
          >
            Open {verification_uri.replace(/^https?:\/\//, "")}
            <ExternalLink className="size-4" />
          </a>
        </li>
      </ol>
      <p
        role="status"
        className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
      >
        <Spinner className="size-4" />
        Waiting for you to approve on GitHub…
      </p>
    </div>
  );
}
