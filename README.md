# 🔖 SmartBook - Personal Knowledge Vault

SmartBook is a professional, high-performance bookmark management application built with **Next.js 16**, **Tailwind CSS**, and **Supabase**. It provides users with a clean, real-time dashboard to save, search, and analyze their favorite web content.



## ✨ Key Features

* **Google OAuth Integration**: Secure and seamless authentication via Supabase Auth.
* **Real-time Synchronization**: Instant UI updates across devices when bookmarks are added or deleted, powered by Supabase Realtime.
* **Optimistic UI Updates**: Bookmarks appear instantly upon addition for a lag-free experience.
* **Custom Frontend Modals**: Sleek, built-in deletion confirmation dialogs that replace generic browser popups.
* **Metadata Tracking**: Automatically captures site favicons, domain names, and the exact date/time of every save.
* **Live Search**: A dedicated search engine to filter your collection by title or URL instantly.
* **Analytics Dashboard**: Visualized insights into your total bookmarks and most-visited domains.
* **Responsive Dark Mode**: Smooth theme switching using `next-themes` and Tailwind CSS v4.

## 🚀 Tech Stack

| Tool | Purpose |
| :--- | :--- |
| **Next.js 16** | Frontend Framework with App Router & Turbopack |
| **Supabase** | Backend-as-a-Service (Auth, Database, Realtime) |
| **Tailwind CSS v4** | Modern Utility-first Styling |
| **Lucide React** | High-quality iconography |
| **next-themes** | Dark mode management |

---

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/smartbook-app.git](https://github.com/yourusername/smartbook-app.git)
```
## Install Dependencies
npm install

Configure Environment Variables
Create a .env.local file in the root directory and add your Supabase credentials:

Plaintext
NEXT_PUBLIC_SUPABASE_URL=[https://your-project-id.supabase.co](https://your-project-id.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
4. Database Schema
Run the following SQL in your Supabase SQL Editor to set up the database table:

SQL
create table bookmarks (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  url text not null,
  user_id uuid references auth.users(id) on delete cascade
);

-- Enable Realtime for the table
alter publication supabase_realtime add table bookmarks;
5. Run the Application
Bash
npm run dev
Visit http://localhost:3000 to get started.
