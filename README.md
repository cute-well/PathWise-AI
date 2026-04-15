# PathWise AI

An AI-powered learning path generator that creates personalised 12-month
curricula based on your goals, powered by **Gemini AI**, **Pinecone vector
search**, and curated **YouTube** resources.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | PostgreSQL via Prisma ORM |
| AI / LLM | Google Gemini (`gemini-1.5-flash`) |
| Embeddings | Google Gemini Embeddings via LangChain |
| Vector Store | Pinecone |
| Resource Scraping | YouTube Data API v3 |
| Calendar Sync | Google Calendar API (OAuth 2.0) |

---

## Project Structure

```
/
├── app/
│   ├── api/
│   │   └── generate-path/   # Master API route (Phase 3)
│   ├── layout.tsx
│   └── page.tsx             # Landing page with form
├── components/
│   ├── PathwiseForm.tsx      # Goal input form + result display
│   └── Roadmap.tsx          # Interactive 12-month timeline (Phase 4)
├── lib/
│   ├── calendar.ts          # Google Calendar API sync (Phase 4)
│   ├── cleaner.ts           # Text cleaning utilities (Phase 2)
│   ├── config.ts            # Centralised env-var config (Phase 1)
│   ├── embeddings.ts        # Gemini embedding generation (Phase 2)
│   ├── prisma.ts            # Prisma client singleton (Phase 1)
│   ├── prompts.ts           # LLM system & user prompts (Phase 3)
│   ├── retriever.ts         # Pinecone similarity search (Phase 3)
│   ├── scraper.ts           # YouTube scraper utility (Phase 2)
│   └── vectorStore.ts       # Pinecone client & helpers (Phase 2)
└── prisma/
    └── schema.prisma        # Database schema (Phase 1)
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the template and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Required variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `GEMINI_API_KEY` | Google AI Studio API key |
| `PINECONE_API_KEY` | Pinecone API key |
| `PINECONE_INDEX_NAME` | Pinecone index name (default: `pathwise-ai`) |
| `YOUTUBE_API_KEY` | YouTube Data API v3 key |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 client secret |
| `GOOGLE_REFRESH_TOKEN` | Long-lived OAuth refresh token |

### 3. Set up the database

```bash
npx prisma migrate dev --name init
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API

### `POST /api/generate-path`

Generates a personalised 12-month learning plan.

**Request body:**

```json
{
  "goal": "Learn Japanese N5",
  "userId": "user_123",
  "queries": ["Japanese N5 grammar", "JLPT N5 vocabulary"]
}
```

**Response:** A structured `LearningPlanResponse` JSON object with `title`,
`description`, `goal`, and an array of 12 `MonthData` objects each containing
`goals`, `milestones`, and `resources`.
