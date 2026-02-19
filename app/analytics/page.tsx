"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

export default function Analytics() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data } = await supabase
      .from("bookmarks")
      .select("created_at")

    if (!data) return

    const grouped: Record<string, number> = {}

    data.forEach((item) => {
      const date = new Date(
        item.created_at
      ).toLocaleDateString()

      grouped[date] = (grouped[date] || 0) + 1
    })

    const chartData = Object.entries(grouped).map(
      ([date, count]) => ({
        date,
        count,
      })
    )

    setData(chartData)
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-10">
        Analytics
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#111827" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
