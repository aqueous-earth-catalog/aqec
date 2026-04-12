"use client";

import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { unescapeAirtableRichTextMarkdown } from "@/lib/airtable/unescape-rich-text-markdown";

export function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  const source = unescapeAirtableRichTextMarkdown(children);

  return (
    <div
      className={cn("prose prose-sm max-w-none dark:prose-invert prose-p:leading-snug", className)}
    >
      <ReactMarkdown>{source}</ReactMarkdown>
    </div>
  );
}
