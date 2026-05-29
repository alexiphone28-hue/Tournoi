import { createClient } from "@/lib/supabase/server"
import type { Team, GameResult, Penalty, TournamentStatus } from "@/lib/scoring"

export type TournamentData = {
  teams: Team[]
  results: GameResult[]
  penalties: Penalty[]
  status: TournamentStatus
}

export async function getTournamentData(): Promise<TournamentData> {
  const supabase = await createClient()

  const [teamsRes, resultsRes, penaltiesRes, settingsRes] = await Promise.all([
    supabase.from("teams").select("*").order("created_at", { ascending: true }),
    supabase.from("game_results").select("*"),
    supabase.from("penalties").select("*").order("created_at", { ascending: false }),
    supabase.from("tournament_settings").select("status").eq("id", 1).single(),
  ])

  return {
    teams: (teamsRes.data as Team[]) ?? [],
    results: (resultsRes.data as GameResult[]) ?? [],
    penalties: (penaltiesRes.data as Penalty[]) ?? [],
    status: (settingsRes.data?.status as TournamentStatus) ?? "waiting",
  }
}
