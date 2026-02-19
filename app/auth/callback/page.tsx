"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Loader2 } from "lucide-react"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      // Supabase automatically picks up the code from the URL 
      // and exchanges it for a session here.
      const { error } = await supabase.auth.getSession()
      
      if (!error) {
        // Redirect to dashboard once session is confirmed
        router.push("/")
      } else {
        console.error("Auth callback error:", error.message)
        router.push("/") // Redirect home even on error to avoid hanging
      }
    }

    handleAuth()
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <div className="text-center">
          <h2 className="text-xl font-semibold">Securely signing you in...</h2>
          <p className="text-muted-foreground text-sm">Just a moment while we set up your vault.</p>
        </div>
      </div>
    </div>
  )
}