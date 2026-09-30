import { languageColor } from "@/libs/languageColors";

export function LanguageDot({ language }: { language: string }) {
  return (
    <span
      className="size-2.5 shrink-0 rounded-full ring-1 ring-foreground/10"
      style={{ backgroundColor: languageColor(language) }}
      aria-hidden
    />
  );
}
