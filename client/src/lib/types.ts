export type Item = {
  id: string;
  sourceType: "NOTE" | "URL";
  title: string | null;
  sourceUrl: string | null;
  preview: string;
  createdAt: string;
};

export type ItemDetail = Omit<Item, "preview"> & { rawContent: string };

export type Source = {
  entryId: string;
  chunkId: string;
  title: string;
  sourceUrl: string | null;
  snippet: string;
  score: number;
};

export type QueryResult = { answer: string; sources: Source[] };
