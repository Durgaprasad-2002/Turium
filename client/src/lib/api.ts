import type { Item, ItemDetail, QueryResult } from "./types";

type IngestPayload =
  | { sourceType: "NOTE"; content: string; title?: string }
  | { sourceType: "URL"; url: string };

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(body.error ?? "Something went wrong. Please try again.");
  return body as T;
}

export const api = {
  listEntries: () => request<{ items: Item[] }>("/api/items"),
  getEntry: (id: string) =>
    request<{ item: ItemDetail }>(`/api/items/${id}`),
  ingest: (payload: IngestPayload) =>
    request<{ item: Item; chunkCount: number }>("/api/ingest", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  query: (question: string) =>
    request<QueryResult>("/api/query", {
      method: "POST",
      body: JSON.stringify({ question }),
    }),
};
