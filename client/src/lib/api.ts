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
  listEntries: () => request<{ entries: Item[] }>("/api/knowledge"),
  getEntry: (id: string) =>
    request<{ entry: ItemDetail }>(`/api/knowledge/${id}`),
  ingest: (payload: IngestPayload) =>
    request<{ entry: Item; segmentCount: number }>("/api/knowledge", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  query: (question: string) =>
    request<QueryResult>("/api/query", {
      method: "POST",
      body: JSON.stringify({ question }),
    }),
};
