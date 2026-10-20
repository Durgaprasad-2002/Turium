import { ExternalLink, FileText, Link as LinkIcon } from "lucide-react";
import type { Item } from "../lib/types";
import { Card } from "./ui";

export function ItemList({
  items,
  loading,
}: {
  items: Item[];
  loading: boolean;
}) {
  return (
    <Card className="h-full">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-semibold">Knowledge library</h2>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
          {items.length}
        </span>
      </div>
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((key) => (
            <div
              key={key}
              className="h-20 animate-pulse rounded-lg bg-slate-100"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed p-8 text-center text-sm text-slate-500">
          Your notes and links will appear here.
        </div>
      ) : (
        <div
          className="h-full space-y-3 overflow-y-auto"
          style={{
            scrollbarColor: "#cbd5e1 transparent",
            scrollMarginBlockStart: "10px",
            scrollbarWidth: "thin",
          }}
        >
          {items.map((item) => (
            <a
              key={item.id}
              href={`/#/entries/${item.id}`}
              target="_blank"
              rel="noreferrer"
              className="block rounded-xl border p-3.5 transition hover:border-indigo-200 hover:bg-indigo-50/50"
            >
              <div className="mb-1 flex items-start gap-2">
                <span className="mt-0.5 text-indigo-600">
                  {item.sourceType === "URL" ? (
                    <LinkIcon size={16} />
                  ) : (
                    <FileText size={16} />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-sm font-semibold">
                    {item.title ??
                      (item.sourceType === "URL"
                        ? "Untitled web page"
                        : "Untitled note")}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                    {item.preview}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between pl-6 text-xs text-slate-400">
                <time>
                  {new Intl.DateTimeFormat(undefined, {
                    dateStyle: "medium",
                  }).format(new Date(item.createdAt))}
                </time>
                <span className="inline-flex items-center gap-1 text-indigo-600">
                  <ExternalLink size={12} />
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </Card>
  );
}
