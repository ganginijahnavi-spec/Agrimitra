# AgriMitra AI

A bilingual (English/Telugu) AI-powered farming advisory platform for Indian farmers, built with Next.js and Supabase.

- **Chat with an AI assistant** for crop/farming questions, with voice input (speech-to-text) and text-to-speech playback
- **Crop photo analysis** for possible pest/disease issues, via a vision model
- **Live weather forecasts** with simple farming guidance (e.g. when to avoid spraying)
- **Mandi (market) prices** from data.gov.in, with price-trend charts
- **Crop tracking** (sowing date, variety, area, irrigation, notes)

All AI guidance is advisory-only: the app never states pesticide/fertilizer dosages and always defers those to a local agriculture officer or Krishi Vigyan Kendra (KVK).

## Tech stack

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui (on Base UI)
- **i18n**: next-intl (English/Telugu, locale-prefixed routes)
- **Backend**: Supabase (Postgres + RLS, Auth, Storage, Edge Functions)
- **AI**: Groq — `openai/gpt-oss-120b` (chat), `qwen/qwen3.8-27b` (crop image analysis), `whisper-large-v3-turbo` (voice transcription)
- **Market data**: data.gov.in / Agmarknet
- **Weather**: Open-Meteo
- **Tests**: Vitest

## Local development

Requires Node 22 (see `.nvmrc`) and a Supabase project.

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project URL + anon key
npm run dev
```

Open http://localhost:3000.

### Environment variables

`.env.local` (frontend, safe to expose to the browser):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Server-side secrets are **never** set in `.env.local` — they're Supabase Edge Function secrets only (see below).

### Useful scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Run the Vitest unit test suite |

## Supabase setup

The `supabase/` directory holds the database schema and Edge Functions.

**Migrations** (`supabase/migrations/`): profiles, crops/chats/chat_messages/image_analyses/usage_limits/market_cache tables with RLS, the `crop-images` storage bucket, and the `increment_usage()` rate-limit RPC.

**Edge Functions** (`supabase/functions/`):
- `chat` — Groq chat completion with conversation history, rate-limited 50/day
- `analyze-crop` — Groq vision analysis of an uploaded crop photo, rate-limited 10/day
- `market-prices` — proxies + caches data.gov.in Agmarknet data
- `transcribe` — Groq Whisper speech-to-text for voice input, rate-limited 30/day

Deploy with the Supabase CLI, from a machine that can reach `api.supabase.com` / `*.supabase.co`:

```bash
npx supabase login --token <your-personal-access-token>
npx supabase link --project-ref <your-project-ref>
npx supabase db push
npx supabase functions deploy chat
npx supabase functions deploy analyze-crop
npx supabase functions deploy market-prices
npx supabase functions deploy transcribe
```

Edge Function secrets (set once per project, in the Supabase Dashboard under **Edge Functions → Secrets**, or via `npx supabase secrets set KEY=value`):

- `GROQ_API_KEY` — used by `chat`, `analyze-crop`, `transcribe`
- `DATAGOV_API_KEY` — used by `market-prices`

`SUPABASE_URL`, `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are populated automatically for every Edge Function and don't need to be set manually.

If the CLI isn't available (e.g. no dev machine on hand), each function can also be created and deployed directly from the Supabase Dashboard's Edge Function editor — paste in a self-contained version of the function (no relative imports across files) and deploy from the browser.

## CI

`.github/workflows/ci.yml` runs on every push and pull request: install, lint, typecheck, test, build. It uses placeholder Supabase env vars (the build never talks to a real project) so it needs no repository secrets.

## Deploying to Vercel

The recommended path is Vercel's native Git integration (no GitHub Actions deploy step needed — it handles production + PR preview deployments automatically):

1. Go to https://vercel.com/new and import this GitHub repository
2. Framework preset: **Next.js** (auto-detected)
3. Add the environment variables (Project Settings → Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

Every push to the production branch deploys to production; every pull request gets its own preview URL automatically.

## Project structure

```
src/
  app/[locale]/       # App Router pages, one tree per locale (en/te)
  components/         # UI components, grouped by feature
  hooks/               # Client-side hooks (voice input, text-to-speech)
  i18n/                # next-intl routing/config
  lib/                 # Server actions, Supabase clients, validation, pure logic
  messages/            # en.json / te.json translation strings
  types/                # Ambient type declarations
supabase/
  migrations/           # SQL migrations (schema + RLS)
  functions/            # Edge Functions (Deno), with shared helpers in _shared/
```
