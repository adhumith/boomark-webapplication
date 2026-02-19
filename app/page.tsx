"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { 
  Plus, Trash2, Copy, LogOut, Search, ExternalLink, 
  Moon, Sun, Bookmark as BookmarkIcon, LayoutDashboard, BarChart3,
  Loader2, Calendar, Clock, AlertTriangle, X 
} from "lucide-react"
import { useTheme } from "next-themes"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [search, setSearch] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)
  
  // UI States
  const [isAdding, setIsAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 1. Auth Logic - Handles sessions and cleans up OAuth URLs
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error("Auth error:", error)
      } finally {
        setIsAuthLoading(false)
      }
    }

    checkUser()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setIsAuthLoading(false)
      
      // Clean up the URL fragment (#access_token=...) after successful login
      if (event === "SIGNED_IN") {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  // 2. Data Fetching & Realtime Logic
  useEffect(() => {
    if (!user) return
    fetchBookmarks()

    const channel = supabase
      .channel("bookmarks-realtime")
      .on("postgres_changes", { 
        event: "*", 
        schema: "public", 
        table: "bookmarks" 
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setBookmarks((prev) => {
            // Prevent duplication if the item was already added optimistically
            const exists = prev.some(b => b.id === payload.new.id)
            if (exists) return prev
            return [payload.new, ...prev]
          })
        } else if (payload.eventType === 'DELETE') {
          setBookmarks((prev) => prev.filter(b => b.id !== payload.old.id))
        } else {
          fetchBookmarks() 
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user])

  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false })
    setBookmarks(data || [])
  }

  // 3. Actions
  const handleAdd = async () => {
    if (!title || !url) return
    setIsAdding(true)
    
    try {
      let formattedUrl = url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`
      
      const { data, error } = await supabase
        .from("bookmarks")
        .insert([{ 
          title, 
          url: formattedUrl, 
          user_id: user.id 
        }])
        .select()

      if (error) throw error
      
      // Local optimistic update
      if (data) {
        setBookmarks((prev) => {
          const exists = prev.some(b => b.id === data[0].id)
          if (exists) return prev
          return [data[0], ...prev]
        })
      }
      
      setTitle(""); setUrl("");
    } catch (error) {
      console.error("Error adding bookmark:", error)
    } finally {
      setIsAdding(false)
    }
  }

  const executeDelete = async () => {
    if (!confirmDeleteId) return
    const id = confirmDeleteId
    setConfirmDeleteId(null) 
    setDeletingId(id)
    try {
      const { error } = await supabase.from("bookmarks").delete().eq("id", id)
      if (error) throw error
      setBookmarks((prev) => prev.filter(b => b.id !== id))
    } catch (error) {
      console.error("Error deleting:", error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleCopy = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (!mounted) return null

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="p-8 bg-card shadow-xl rounded-2xl border border-border text-center max-w-sm w-full">
          <BookmarkIcon className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
          <h1 className="text-2xl font-bold mb-2">Welcome to SmartBook</h1>
          <p className="text-muted-foreground mb-6">Your personal knowledge vault.</p>
          <button
            onClick={() => supabase.auth.signInWithOAuth({ 
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            })}
            className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-medium shadow-lg shadow-indigo-600/20"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    )
  }

  const filteredBookmarks = bookmarks.filter(b => 
    b.title?.toLowerCase().includes(search.toLowerCase()) || 
    b.url?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-background transition-colors duration-300 relative">
      
      {/* -------- CUSTOM FRONTEND MODAL -------- */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md rounded-2xl border border-border p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-red-500/10 p-2 rounded-lg text-red-500">
                <AlertTriangle size={24} />
              </div>
              <button onClick={() => setConfirmDeleteId(null)} className="text-muted-foreground hover:text-foreground">
                <X size={20} />
              </button>
            </div>
            <h2 className="text-xl font-bold mb-2 text-foreground">Delete Bookmark?</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Are you sure? This bookmark will be permanently removed from your vault. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-accent transition-colors">
                Cancel
              </button>
              <button onClick={executeDelete} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-red-600/20">
                Delete Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------- SIDEBAR -------- */}
      <aside className="w-72 border-r border-border p-8 hidden md:flex flex-col bg-card/50">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <BookmarkIcon size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">SmartBook</span>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link href="/">
            <SidebarLink icon={<LayoutDashboard size={20}/>} label="Dashboard" active />
          </Link>
          <Link href="/analytics">
            <SidebarLink icon={<BarChart3 size={20}/>} label="Analytics" />
          </Link>
        </nav>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 text-muted-foreground hover:text-red-500 transition-colors pt-4 border-t border-border"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </aside>

      {/* -------- MAIN CONTENT -------- */}
      <main className="flex-1 p-6 md:p-12 max-w-6xl mx-auto w-full">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground truncate max-w-[300px]">Logged in as {user.email}</p>
          </div>
          <button 
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-3 rounded-xl bg-card border border-border shadow-sm hover:bg-accent transition-colors"
          >
            {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        {/* --- ADD FORM --- */}
        <div className="bg-card p-2 rounded-2xl shadow-sm border border-border flex flex-col md:flex-row gap-2 mb-10">
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isAdding}
            className="flex-1 bg-transparent px-4 py-3 outline-none disabled:opacity-50"
          />
          <input
            placeholder="URL (e.g. google.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isAdding}
            className="flex-1 bg-transparent px-4 py-3 border-l border-border outline-none disabled:opacity-50"
          />
          <button
            onClick={handleAdd}
            disabled={isAdding}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-medium min-w-[120px] disabled:opacity-70"
          >
            {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus size={18} />}
            {isAdding ? "Adding..." : "Add"}
          </button>
        </div>

        {/* --- SEARCH BOX --- */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search your bookmarks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 bg-card border border-border rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all shadow-sm"
          />
        </div>

        {/* --- LIST --- */}
        <div className="grid gap-4">
          {filteredBookmarks.map((bookmark) => (
            <BookmarkCard 
              key={bookmark.id} 
              bookmark={bookmark} 
              onDelete={() => setConfirmDeleteId(bookmark.id)} 
              onCopy={handleCopy}
              copied={copiedId === bookmark.id}
              isDeleting={deletingId === bookmark.id}
            />
          ))}
          {filteredBookmarks.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl bg-card/30">
              <Search className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-muted-foreground font-medium">No bookmarks match your search.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function SidebarLink({ icon, label, active = false }: any) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
      active 
        ? "bg-indigo-600/10 text-indigo-600 font-semibold" 
        : "text-muted-foreground hover:bg-accent hover:text-foreground"
    }`}>
      {icon} {label}
    </div>
  )
}

function BookmarkCard({ bookmark, onDelete, onCopy, copied, isDeleting }: any) {
  let domain = ""
  try {
    domain = new URL(bookmark.url).hostname
  } catch (e) {
    domain = "link"
  }
  
  const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`

  const dateObj = new Date(bookmark.created_at);
  const formattedDate = dateObj.toLocaleDateString(undefined, { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
  const formattedTime = dateObj.toLocaleTimeString(undefined, { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <div className={`group bg-card p-4 rounded-2xl border border-border flex items-center justify-between hover:border-indigo-500/50 hover:shadow-md transition-all ${isDeleting ? "opacity-50 grayscale" : ""}`}>
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-12 h-12 rounded-xl bg-accent flex-shrink-0 flex items-center justify-center p-2 overflow-hidden border border-border/50 text-indigo-600">
          <img src={favicon} alt="" className="w-full h-full object-contain" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold truncate text-foreground mb-0.5">{bookmark.title}</h3>
          
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="truncate max-w-[150px] font-medium text-indigo-600 dark:text-indigo-400">{domain}</span>
            <span className="flex items-center gap-1 shrink-0">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3" />
              {formattedTime}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
        <button 
          onClick={() => onCopy(bookmark.url, bookmark.id)} 
          className="p-2 hover:bg-accent rounded-lg text-muted-foreground transition-colors"
          title="Copy Link"
          disabled={isDeleting}
        >
          {copied ? <span className="text-[10px] font-bold text-green-500 uppercase font-sans">Copied!</span> : <Copy size={18} />}
        </button>
        <a 
          href={bookmark.url} 
          target="_blank" 
          rel="noreferrer"
          className="p-2 hover:bg-accent rounded-lg text-muted-foreground transition-colors"
          title="Open Link"
        >
          <ExternalLink size={18} />
        </a>
        <button 
          onClick={onDelete} 
          className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors"
          title="Delete"
          disabled={isDeleting}
        >
          {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 size={18} />}
        </button>
      </div>
    </div>
  )
}