# Smart Bookmark App

A real-time bookmark manager built with Next.js (App Router), Supabase (Google OAuth, Database, Realtime), Tailwind CSS, and deployed on Vercel.

## Features

- Google OAuth login (no email/password)
- Add and delete bookmarks
- Private bookmarks per user (Row Level Security enabled)
- Real-time updates across tabs
- Analytics page showing domain-wise bookmark count (bar chart)
- Dark and Light theme toggle
- Responsive design

## Tech Stack

- Next.js (App Router)
- Supabase (Auth, PostgreSQL, Realtime)
- Tailwind CSS
- Recharts
- Vercel

## Problems Faced & Solutions

**Google OAuth Redirect Issues**  
Configured correct Site URL and Redirect URLs in Supabase and Google Cloud Console.

**User Data Privacy**  
Enabled Row Level Security and restricted access using:
```sql
user_id = auth.uid()
```
## Realtime Not Updating
Implemented Supabase postgres_changes subscription and cleaned up listeners properly.
## Deployment Errors
Added required environment variables in Vercel:
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY

#Run Locally
```bash
npm install
npm run dev
```
##Add required environment variables in .env.local.
Live URL - https://boomark-webapplication.vercel.app/
