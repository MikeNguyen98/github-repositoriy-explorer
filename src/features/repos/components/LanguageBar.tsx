import { languageColor } from "@/libs/languageColors";
import { LanguageDot } from "./LanguageDot";

export function LanguageBar({ languages }: { languages: Record<string, number> }) {
  const total = Object.values(languages).reduce((a, b) => a + b, 0);
  if (!total) return <p className="text-sm text-muted-foreground">No language data.</p>;

  const entries = Object.entries(languages)
    .map(([name, bytes]) => ({ name, pct: (bytes / total) * 100 }))
    .sort((a, b) => b.pct - a.pct);
  // Fold the long tail into "Other" so the legend stays readable.
  const top = entries.slice(0, 6);
  const other = entries.slice(6).reduce((sum, l) => sum + l.pct, 0);
  if (other > 0) top.push({ name: "Other", pct: other });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-2 overflow-hidden rounded-full bg-muted">
        {top.map((l) => (
          <span
            key={l.name}
            title={`${l.name} ${l.pct.toFixed(1)}%`}
            style={{ width: `${l.pct}%`, backgroundColor: languageColor(l.name) }}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
        {top.map((l) => (
          <li key={l.name} className="inline-flex items-center gap-1.5">
            <LanguageDot language={l.name} />
            <span className="font-medium">{l.name}</span>
            <span className="text-muted-foreground">{l.pct.toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
