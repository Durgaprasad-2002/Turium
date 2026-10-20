import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, BookOpenCheck, LoaderCircle } from "lucide-react";
import { api } from "../lib/api";
import type { QueryResult } from "../lib/types";
import { Button, Card, Label, fieldClass } from "./ui";

export function QuestionPanel() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setAsking(true);
    setError("");

    try {
      setResult(await api.query(question));
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to answer the question.",
      );
    } finally {
      setAsking(false);
    }
  }

  return (
    <Card className="w-full border-slate-200/80 p-4 shadow-lg shadow-slate-200/40 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-violet-50 p-2 text-violet-600">
          <BookOpenCheck size={19} />
        </div>
        <h2 className="font-semibold">Ask your knowledge</h2>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
        <div className="flex-1">
          <Label className="sr-only" htmlFor="question">
            Question
          </Label>
          <input
            id="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
            maxLength={2000}
            className={fieldClass}
            placeholder="Ask a question about your saved content"
          />
        </div>
        <Button type="submit" disabled={asking} className="gap-2">
          {asking ? (
            <LoaderCircle size={16} className="animate-spin" />
          ) : (
            <ArrowUp size={16} />
          )}
          {asking ? "Searching…" : "Ask"}
        </Button>
      </form>
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-5 border-t pt-5"
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Answer
            </h3>
            <p className="mt-2 whitespace-pre-wrap leading-7 text-slate-800">
              {result.answer}
            </p>
            <div className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Sources
              </h3>
              {result.sources.length === 0 ? (
                <p className="mt-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                  No specific source available.
                </p>
              ) : (
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {result.sources.map((source, index) => (
                    <a
                      key={source.chunkId}
                      href={`/#/entries/${source.entryId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg bg-slate-50 p-3 transition hover:bg-indigo-50 hover:ring-1 hover:ring-indigo-200"
                    >
                      <p className="text-sm font-medium text-slate-800">
                        [{index + 1}] {source.title}
                      </p>
                      <p className="mt-1 text-sm leading-5 text-slate-600">
                        {source.snippet}
                      </p>
                      {source.sourceUrl && (
                        <span className="mt-2 inline-block text-xs font-medium text-indigo-600">
                          View original URL
                        </span>
                      )}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
