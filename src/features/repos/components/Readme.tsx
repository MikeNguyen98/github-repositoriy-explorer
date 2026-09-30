import DOMPurify from "dompurify";
import { useMemo } from "react";

// Open external README links in a new tab without leaking the opener.
DOMPurify.addHook("afterSanitizeAttributes", (node) => {
  if (node.tagName === "A" && /^https?:/i.test(node.getAttribute("href") ?? "")) {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener noreferrer");
  }
});

/** Renders the HTML GitHub produced for a README, sanitized again on our side. */
export function Readme({ html }: { html: string }) {
  const clean = useMemo(
    () => DOMPurify.sanitize(html, { ADD_ATTR: ["target"] }),
    [html],
  );

  return (
    <article
      className="readme prose prose-sm max-w-none min-w-0 dark:prose-invert sm:prose-base prose-headings:scroll-mt-20 prose-a:text-brand prose-pre:bg-muted prose-pre:text-foreground prose-img:rounded-md"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
