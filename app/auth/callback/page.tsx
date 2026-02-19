"use client"

import { Bookmark, LayoutDashboard, BarChart3, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AnalyticsPage() {
  return (
    <div className="flex min-h-screen bg-background transition-colors duration-300">
      
      {/* -------- SIDEBAR -------- */}
      <aside className="w-72 border-r border-border p-8 hidden md:flex flex-col bg-card/50">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Bookmark className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">SmartBook</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground transition-all">
            <LayoutDashboard size={20}/> 
            <span>Dashboard</span>
          </Link>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600/10 text-indigo-600 font-semibold transition-all">
            <BarChart3 size={20}/> 
            <span>Analytics</span>
          </div>
        </nav>
      </aside>

      {/* -------- MAIN CONTENT -------- */}
      <main className="flex-1 p-6 md:p-12 max-w-6xl mx-auto w-full">
        <header className="mb-10">
          <Link href="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-indigo-600 mb-4 transition-colors">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Insights into your saved content.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Total Bookmarks" value="--" description="Bookmarks in your vault" />
          <StatCard title="Top Domain" value="--" description="Most saved website" />
          <StatCard title="Usage" value="Active" description="Syncing in real-time" />
        </div>

        <div className="mt-10 p-12 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center">
          <div className="bg-accent p-4 rounded-full mb-4">
            <BarChart3 size={32} className="text-indigo-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Detailed Charts Coming Soon</h2>
          <p className="text-muted-foreground max-w-sm">
            We are working on bringing you advanced insights regarding your reading habits and category distributions.
          </p>
        </div>
      </main>
    </div>
  )
}

function StatCard({ title, value, description }: { title: string, value: string, description: string }) {
  return (
    <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
      <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
      <h3 className="text-2xl font-bold mb-2">{value}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}