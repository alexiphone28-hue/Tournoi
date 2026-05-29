"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Team, GameResult, Penalty, TournamentStatus } from "@/lib/scoring"

export type TournamentData = {
  teams: Team[]
  results: GameResult[]
  penalties: Penalty[]
  status: TournamentStatus
}

export function useTournamentData(initial: TournamentData) {
  const [data, setData] = useState<TournamentData>(initial)

  const refetch = useCallback(async () => {
    const supabase = createClient()
    const [teamsRes, resultsRes, penaltiesRes, settingsRes] = await Promise.all([
      supabase.from("teams").select("*").order("created_at", { ascending: true }),
      supabase.from("game_results").select("*"),
      supabase.from("penalties").select("*").order("created_at", { ascending: false }),
      supabase.from("tournament_settings").select("status").eq("id", 1).single(),
    ])
    setData({
      teams: (teamsRes.data as Team[]) ?? [],
      results: (resultsRes.data as GameResult[]) ?? [],
      penalties: (penaltiesRes.data as Penalty[]) ?? [],
      status: (settingsRes.data?.status as TournamentStatus) ?? "waiting",
    })
  }, [])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`tournament-live-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "teams" }, refetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "game_results" }, refetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "penalties" }, refetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "tournament_settings" }, refetch)
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [refetch])

  return { data, refetch }
}
