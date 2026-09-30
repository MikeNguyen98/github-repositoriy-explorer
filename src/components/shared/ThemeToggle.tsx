import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import type { Theme } from "@/libs/theme";
import { Monitor, Moon, Sun } from "lucide-react";

const NEXT: Record<Theme, Theme> = { light: "dark", dark: "system", system: "light" };
const ICON = { light: Sun, dark: Moon, system: Monitor };

export function ThemeToggle() {
  const [theme, setTheme] = useTheme();
  const Icon = ICON[theme];
  const label = `Theme: ${theme} (switch to ${NEXT[theme]})`;

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={label}
      title={label}
      onClick={() => setTheme(NEXT[theme])}
    >
      <Icon />
    </Button>
  );
}
