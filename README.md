# PathWise AI 🧭

An **AI-powered 12-month learning path generator** built with Next.js 14, Gemini AI, Pinecone, and Prisma (SQLite).

Enter any learning goal and receive a personalised, step-by-step 12-month curriculum — stored locally and ready to sync to Google Calendar.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS + Framer Motion |
| AI | Google Gemini (`gemini-1.5-flash`) |
| Vector Store | Pinecone (RAG-ready skeleton) |
| Database | Prisma + SQLite |
| Icons | Lucide React |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your keys:

```env
GEMINI_API_KEY=your_gemini_api_key_here   # https://aistudio.google.com/app/apikey
PINECONE_API_KEY=your_pinecone_api_key_here  # optional — for RAG
DATABASE_URL="file:./dev.db"
```

### 3. Push the Prisma schema to SQLite

```bash
npx prisma db push
```

This creates `prisma/dev.db` with the `User`, `LearningPlan`, and `MonthlyBlock` tables.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
pathwise-ai/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts      # POST /api/generate — AI roadmap endpoint
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx              # Main UI — goal input + timeline
├── lib/
│   ├── gemini.ts             # Gemini AI client + prompt logic
│   ├── pinecone.ts           # Pinecone vector upsert/query helpers
│   └── prisma.ts             # Prisma client singleton
├── prisma/
│   └── schema.prisma         # Database schema (User, LearningPlan, MonthlyBlock)
├── .env.example              # Environment variable template
└── README.md
```

---

## API Reference

### `POST /api/generate`

Generate a 12-month learning roadmap.

**Request body:**
```json
{ "goal": "Become a machine learning engineer" }
```

**Response:**
```json
{
  "success": true,
  "plan": {
    "id": "...",
    "title": "Machine Learning Engineer in 12 Months",
    "goal": "...",
    "createdAt": "...",
    "monthlyBlocks": [
      {
        "monthNumber": 1,
        "topic": "Python & Math Foundations",
        "description": "...",
        "resources": ["..."]
      }
    ]
  }
}
```

---

## Useful Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npx prisma db push` | Sync schema → SQLite |
| `npx prisma studio` | Open Prisma GUI |

---

## Roadmap

- [x] Gemini-powered 12-month plan generation
- [x] SQLite persistence via Prisma
- [x] Animated timeline UI (Framer Motion)
- [x] Pinecone RAG skeleton
- [ ] Google Calendar sync
- [ ] User authentication (NextAuth.js)
- [ ] Plan sharing & export (PDF)
- [ ] Pinecone vector embeddings for semantic search

---

## License

MIT