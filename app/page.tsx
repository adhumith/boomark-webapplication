"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [search, setSearch] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // ---------------- AUTH ----------------
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }

    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  // ---------------- REALTIME ----------------
  useEffect(() => {
    if (!user) return

    fetchBookmarks()

    const channel = supabase
      .channel("bookmarks-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmarks" },
        () => fetchBookmarks()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false })

    setBookmarks(data || [])
  }

  // ---------------- ADD ----------------
  const handleAdd = async () => {
    if (!title || !url) return

    let formattedUrl = url.trim()
    if (
      !formattedUrl.startsWith("http://") &&
      !formattedUrl.startsWith("https://")
    ) {
      formattedUrl = "https://" + formattedUrl
    }

    await supabase.from("bookmarks").insert([
      {
        title,
        url: formattedUrl,
        user_id: user.id,
      },
    ])

    setTitle("")
    setUrl("")
    fetchBookmarks()
  }

  // ---------------- DELETE ----------------
  const handleDelete = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id)
    fetchBookmarks()
  }

  // ---------------- COPY ----------------
  const handleCopy = async (url: string, id: string) => {
    await navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  // ---------------- SEARCH FILTER ----------------
  const filteredBookmarks = bookmarks.filter((bookmark) => {
    const term = search.toLowerCase()
    return (
      bookmark.title?.toLowerCase().includes(term) ||
      bookmark.url?.toLowerCase().includes(term)
    )
  })

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <button
          onClick={() =>
            supabase.auth.signInWithOAuth({ provider: "google" })
          }
          className="px-6 py-3 bg-black text-white rounded-lg"
        >
          Sign in with Google
        </button>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* -------- SIDEBAR -------- */}
      <aside className="w-64 bg-white border-r p-6">
        <h2 className="text-xl font-bold mb-10">SmartBook</h2>
        <nav className="flex flex-col gap-4">
          <a href="/" className="font-medium text-black">
            Dashboard
          </a>
          <a href="/analytics" className="text-gray-600 hover:text-black">
            Analytics
          </a>
        </nav>
      </aside>

      {/* -------- MAIN CONTENT -------- */}
      <main className="flex-1 p-10">

        <h1 className="text-3xl font-semibold mb-2">Dashboard</h1>
        <p className="text-gray-500 mb-8">
          Logged in as {user.email}
        </p>

        {/* -------- ADD FORM -------- */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 p-3 border rounded-lg"
          />
          <input
            type="text"
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 p-3 border rounded-lg"
          />
          <button
            onClick={handleAdd}
            className="px-6 bg-black text-white rounded-lg"
          >
            Add
          </button>
        </div>

        {/* -------- SEARCH -------- */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search bookmarks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-3 border rounded-lg"
          />
        </div>

        {/* -------- TABLE -------- */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full text-left">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="p-4">Site</th>
                <th className="p-4">Title</th>
                <th className="p-4">Domain</th>
                <th className="p-4">Created</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookmarks.map((bookmark) => {
                const domain = new URL(bookmark.url).hostname
                const favicon = `https://www.google.com/s2/favicons?domain=${domain}`
                const createdDate = new Date(
                  bookmark.created_at
                ).toLocaleDateString()

                return (
                  <tr key={bookmark.id} className="border-b">
                    <td className="p-4">
                      <img src={favicon} alt="icon" />
                    </td>

                    <td className="p-4">
                      <a
                        href={bookmark.url}
                        target="_blank"
                        className="text-blue-600 hover:underline"
                      >
                        {bookmark.title}
                      </a>
                    </td>

                    <td className="p-4 text-gray-600">
                      {domain}
                    </td>

                    <td className="p-4 text-gray-600">
                      {createdDate}
                    </td>

                    <td className="p-4 space-x-4">
                      <button
                        onClick={() =>
                          handleCopy(bookmark.url, bookmark.id)
                        }
                        className="text-gray-600 hover:text-black"
                      >
                        {copiedId === bookmark.id
                          ? "Copied!"
                          : "Copy"}
                      </button>

                      <button
                        onClick={() =>
                          handleDelete(bookmark.id)
                        }
                        className="text-red-500 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <button
          onClick={handleLogout}
          className="mt-8 px-6 py-2 bg-red-600 text-white rounded-lg"
        >
          Logout
        </button>
      </main>
    </div>
  )
}
