import { useState } from "react";
import { Link, LoaderCircle, NotebookPen } from "lucide-react";
import { api } from "../lib/api";
import type { Item } from "../lib/types";
import { Button, Card, Label, fieldClass } from "./ui";

type Props = { onSaved: (item: Item) => void };

export function IngestForm({ onSaved }: Props) {
  const [tab, setTab] = useState<"NOTE" | "URL">("NOTE");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const result =
        tab === "NOTE"
          ? await api.ingest({
              sourceType: "NOTE",
              content,
              ...(title.trim() ? { title } : {}),
            })
          : await api.ingest({ sourceType: "URL", url });

      onSaved(result.entry);
      setTitle("");
      setContent("");
      setUrl("");
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Unable to save content.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="h-full">
      <div className="mb-5 flex items-center gap-2">
        <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
          <NotebookPen size={19} />
        </div>
        <h2 className="font-semibold">Add content</h2>
      </div>
      <div className="mb-4 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
        {(["NOTE", "URL"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setTab(type);
              setError("");
            }}
            className={`rounded-md px-3 py-2 text-sm font-medium transition ${tab === type ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"}`}
          >
            {type === "NOTE" ? "Note" : "URL"}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="space-y-3">
        {tab === "NOTE" ? (
          <>
            <div>
              <Label htmlFor="note-title">
                Title{" "}
                <span className="font-normal text-slate-400">(optional)</span>
              </Label>
              <input
                id="note-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                className={fieldClass}
                placeholder="e.g. RAG notes"
              />
            </div>
            <div>
              <Label htmlFor="note-content">Note</Label>
              <textarea
                id="note-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                maxLength={100000}
                rows={7}
                className={fieldClass}
                placeholder="Paste a thought, meeting note, or useful research…"
              />
            </div>
          </>
        ) : (
          <div>
            <Label htmlFor="url">URL</Label>
            <div className="relative">
              <Link
                className="absolute left-3 top-3 text-slate-400"
                size={16}
              />
              <input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className={`${fieldClass} pl-9`}
                placeholder="https://example.com"
              />
            </div>
          </div>
        )}
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        <Button type="submit" disabled={saving} className="w-full gap-2">
          {saving && <LoaderCircle size={16} className="animate-spin" />}
          {saving ? "Saving…" : "Save"}
        </Button>
      </form>
    </Card>
  );
}
