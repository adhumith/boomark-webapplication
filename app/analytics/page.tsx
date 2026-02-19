"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { 
  Bookmark, 
  LayoutDashboard, 
  BarChart3, 
  ArrowLeft, 
  Loader2, 
  TrendingUp, 
  Globe 
} from "lucide-react"
import Link from "next/link"

export default function AnalyticsPage() {
  const [stats, setStats] = useState({ total: 0, topDomain: "N/A" })
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        setUser(data.user)
        if (data.user) fetchAnalytics()
      } finally {
        setIsAuthLoading(false)
      }
    }
    checkUser()
  }, [])

  const fetchAnalytics = async () => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("url")

    if (error) return

    if (data && data.length > 0) {
      // Calculate Top Domain
      const domains = data.map(b => {
        try {
          return new URL(b.url).hostname
        } catch {
          return null
        }
      }).filter(Boolean)

      const counts: Record<string, number> = {}
      let maxCount = 0
      let topDom = "N/A"

      domains.forEach(dom => {
        const d = dom as string
        counts[d] = (counts[d] || 0) + 1
        if (counts[d] > maxCount) {
          maxCount = counts[d]
          topDom = d
        }
      })

      setStats({
        total: data.length,
        topDomain: topDom
      })
    }
  }

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <h1 className="text-xl font-bold mb-4">Please sign in to view analytics</h1>
        <Link href="/" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
          Go to Login
        </Link>
      </div>
    )
  }

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
          <StatCard 
            title="Total Bookmarks" 
            value={stats.total.toString()} 
            description="Bookmarks in your vault"
            icon={<Bookmark className="w-4 h-4 text-indigo-600" />}
          />
          <StatCard 
            title="Top Domain" 
            value={stats.topDomain} 
            description="Most saved website"
            icon={<Globe className="w-4 h-4 text-indigo-600" />}
          />
          <StatCard 
            title="Usage" 
            value="Active" 
            description="Syncing in real-time"
            icon={<TrendingUp className="w-4 h-4 text-indigo-600" />}
          />
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

function StatCard({ title, value, description, icon }: { title: string, value: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="p-2 bg-indigo-600/10 rounded-lg">
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-1 truncate" title={value}>{value}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}