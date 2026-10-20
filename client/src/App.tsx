import { useEffect, useState } from "react";
import { BookOpen, BrainCircuit, Plus, X } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "./lib/api";
import type { Item } from "./lib/types";
import { IngestForm } from "./components/ingest-form";
import { ItemList } from "./components/item-list";
import { QuestionPanel } from "./components/question-panel";

export default function App() {
  const [entries, setEntries] = useState<Item[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    api
      .listEntries()
      .then(({ entries: savedEntries }) => setEntries(savedEntries))
      .catch(() => undefined)
      .finally(() => setLoadingEntries(false));
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/50 via-slate-50 to-slate-50">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-600 p-2.5 text-white shadow-lg">
            <BrainCircuit size={22} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLibraryOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950"
          >
            <BookOpen size={17} />
            <span className="hidden sm:inline">Knowledge library</span>
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
          >
            <Plus size={17} />
            Add content
          </button>
        </div>
      </header>
      <section className="mx-auto flex min-h-[calc(100vh-86px)] max-w-3xl items-center px-4 pb-24 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              What do you want to know?
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Ask about the notes and links in your inbox.
            </p>
          </div>
          <QuestionPanel />
        </motion.div>
      </section>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/25 transition-opacity ${libraryOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setLibraryOpen(false)}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-full max-w-md transform bg-slate-50 p-4 shadow-2xl transition-transform duration-300 sm:p-5 ${libraryOpen ? "translate-x-0" : "-translate-x-full"}`}
        aria-hidden={!libraryOpen}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Knowledge library</h2>
          <button
            onClick={() => setLibraryOpen(false)}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
            aria-label="Close knowledge library"
          >
            <X size={20} />
          </button>
        </div>
        <ItemList items={entries} loading={loadingEntries} />
      </aside>
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 transition-opacity ${addOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setAddOpen(false)}
      >
        <motion.div
          initial={false}
          animate={
            addOpen
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 12, scale: 0.98 }
          }
          className="w-full max-w-lg"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-2 flex justify-end">
            <button
              onClick={() => setAddOpen(false)}
              className="rounded-lg bg-white p-2 text-slate-500 shadow-sm transition hover:text-slate-900"
              aria-label="Close add content"
            >
              <X size={20} />
            </button>
          </div>
          <IngestForm
            onSaved={(entry) => {
              setEntries((current) => [entry, ...current]);
              setAddOpen(false);
            }}
          />
        </motion.div>
      </div>
    </main>
  );
}
