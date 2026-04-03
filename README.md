# Trimly — TRIM. share. TRACK.

A production-deployed, full-stack URL shortener. Shorten any link in seconds, 
track every click, and share anywhere — with custom aliases and link expiry built in.

🔗 **Live:** [trimly-bice.vercel.app](https://trimly-bice.vercel.app)

---

## Features

- **Instant URL shortening** — paste any long URL and get a clean short link immediately
- **Custom aliases** — choose your own slug instead of a random one
- **Click analytics** — track how many times each link has been clicked
- **Link expiry** — set an expiration date after which the link stops redirecting
- **User authentication** — sign up and manage all your links from a personal dashboard
- **Fast redirects** — server-side redirects via Next.js for near-instant forwarding

---

## Tech Stack

| Layer | Tech |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Database & Auth** | Supabase (PostgreSQL + Auth) |
| **Styling** | Tailwind CSS |
| **Deployment** | Vercel |

---

## Getting Started
```bash
# Clone the repo
git clone https://github.com/hemanth379/Trimly.git
cd Trimly

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your Supabase URL and anon key

# Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it locally.

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_BASE_URL=https://trimly-bice.vercel.app
```

---

## Architecture

- **Next.js App Router** handles both the frontend UI and API routes
- **Supabase** provides PostgreSQL for link storage and built-in auth for user management
- **Server-side redirects** — when a short URL is visited, Next.js resolves the slug server-side and redirects instantly
- **Row Level Security (RLS)** on Supabase ensures users can only manage their own links
