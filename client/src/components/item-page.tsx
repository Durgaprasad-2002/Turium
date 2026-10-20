import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  Link as LinkIcon,
  LoaderCircle,
} from "lucide-react";
import { api } from "../lib/api";
import type { ItemDetail } from "../lib/types";
import { Card } from "./ui";

export function ItemPage({ id }: { id: string }) {
  const [item, setItem] = useState<ItemDetail | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getEntry(id)
      .then(({ entry }) => setItem(entry))
      .catch((caught) =>
        setError(
          caught instanceof Error
            ? caught.message
            : "Unable to load this entry.",
        ),
      );
  }, [id]);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <a
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft size={16} />
          Back to inbox
        </a>
        {error ? (
          <Card>
            <p className="text-sm text-red-700">{error}</p>
          </Card>
        ) : !item ? (
          <Card className="flex justify-center py-12">
            <LoaderCircle className="animate-spin text-indigo-600" />
          </Card>
        ) : (
          <Card className="p-6 sm:p-8">
            <div className="mb-6 flex items-start gap-3">
              <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                {item.sourceType === "URL" ? (
                  <LinkIcon size={19} />
                ) : (
                  <FileText size={19} />
                )}
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                  {item.title ??
                    (item.sourceType === "URL"
                      ? "Untitled web page"
                      : "Untitled note")}
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  {new Intl.DateTimeFormat(undefined, {
                    dateStyle: "long",
                  }).format(new Date(item.createdAt))}
                </p>
              </div>
            </div>
            {item.sourceUrl && (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:underline"
              >
                Open original URL <ExternalLink size={15} />
              </a>
            )}
            <article className="whitespace-pre-wrap break-words border-t pt-6 leading-7 text-slate-700">
              {item.rawContent}
            </article>
          </Card>
        )}
      </div>
    </main>
  );
}
