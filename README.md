# AI Knowledge Inbox

This is a RAG-based knowledge inbox. You can save a note or a URL, then ask questions based on what you have saved. The answer includes the source entry so it is easy to check where it came from.

## Prerequisites

You will need Node.js 20+, Docker, and an OpenAI API key.

## Setup

First install the packages and create your local environment file:

```bash
npm install
cp .env.example .env
```

Add your OpenAI key to `OPENAI_API_KEY` in `.env`, then start PostgreSQL and Qdrant:

```bash
docker compose up -d
```

Generate Prisma Client, apply the database migrations, and start the app:

```bash
npm run db:generate
npm run db:migrate -- --name init
npm run dev
```

The frontend is available at `http://localhost:5173`. The API port is configured through `PORT` in `.env`.

## Design decisions

PostgreSQL is the main database. It stores the original note or URL content, title, date, and the text segments used for retrieval. Qdrant only stores vectors and a little metadata needed to find the right content again.

When a question is asked, the backend creates an embedding for it, searches Qdrant for relevant segments, and sends that context to OpenAI. If more than one segment comes from the same note, the app still shows it as one source. That felt less confusing than showing the same note multiple times.

I kept the API small and placed the routes together because there are only a few endpoints. The separate service files are mainly for the parts that talk to external systems, such as OpenAI, Qdrant, and URL extraction.

The backend writes structured JSON logs with request IDs, request duration, status codes, and safe error details. It does not log request bodies or API keys.

## Tradeoffs and limitations

URL extraction will not work well for every site, especially pages that need JavaScript to render or block automated requests. Embeddings are also created during the request, which is okay for this small app but should move to a background job for larger content volumes.

Qdrant runs locally through Docker for this project. In production, I would use persistent storage, backups, monitoring, and access control. I also left out authentication because this is intended as a single-user assignment.
