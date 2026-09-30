import { Button } from "@/components/ui/button";
import { isAuthConfigured } from "@/libs/auth";
import { LogIn } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { SignInDialog } from "./SignInDialog";

export function SignInButton({
  children = "Sign in",
  ...props
}: ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false);
  if (!isAuthConfigured) return null;

  return (
    <>
      <Button variant="outline" {...props} onClick={() => setOpen(true)}>
        <LogIn data-icon="inline-start" />
        {children}
      </Button>
      <SignInDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
