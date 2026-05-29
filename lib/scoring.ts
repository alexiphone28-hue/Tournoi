export const TOTAL_GAMES = 7
export const MAX_TEAMS = 16

export type Team = {
  id: string
  name: string
  logo_url: string | null
  player1: string | null
  player2: string | null
  player3: string | null
  created_at: string
}

export type GameResult = {
  id: string
  team_id: string
  game_number: number
  placement: number | null
  kills: number
  dq: boolean
  updated_at: string
}

export type Penalty = {
  id: string
  team_id: string
  game_number: number | null
  reason: string
  value: number
  created_at: string
}

export type TournamentStatus = "waiting" | "live" | "finished"

/**
 * Official placement points table for the Tournoi LILI (16-team Warzone lobby).
 * Points are awarded by range of final placement.
 */
export const PLACEMENT_TABLE: { label: string; range: [number, number]; points: number }[] = [
  { label: "1er", range: [1, 1], points: 100 },
  { label: "2e – 4e", range: [2, 4], points: 70 },
  { label: "5e – 6e", range: [5, 6], points: 50 },
  { label: "7e – 8e", range: [7, 8], points: 30 },
  { label: "9e – 10e", range: [9, 10], points: 20 },
  { label: "11e – 13e", range: [11, 13], points: 10 },
  { label: "14e – 16e", range: [14, 16], points: 0 },
]

export const POINTS_PER_KILL = 4
export const MAX_KILLS_COUNTED = 30
export const MAX_KILL_POINTS = MAX_KILLS_COUNTED * POINTS_PER_KILL // 120

export function placementPoints(placement: number | null): number {
  if (!placement) return 0
  const entry = PLACEMENT_TABLE.find(
    (e) => placement >= e.range[0] && placement <= e.range[1],
  )
  return entry ? entry.points : 0
}

/** Kills are capped at MAX_KILLS_COUNTED per team per game. */
export function killPoints(kills: number): number {
  const counted = Math.min(Math.max(0, kills), MAX_KILLS_COUNTED)
  return counted * POINTS_PER_KILL
}

/** Predefined sanctions applied by admins (public rules). */
export const PENALTY_PRESETS: { reason: string; value: number }[] = [
  { reason: "Abus d'hélicoptère", value: -30 },
  { reason: "Suspicion de streamhack", value: -40 },
  { reason: "Insultes", value: -30 },
  { reason: "T-bag / manque de respect", value: -50 },
]

export type GameBreakdown = {
  game_number: number
  placement: number | null
  kills: number
  dq: boolean
  placementPts: number
  killPts: number
  total: number
}

export type StandingRow = {
  team: Team
  totalPoints: number
  totalKills: number
  totalPenalty: number
  gamesPlayed: number
  bestPlacement: number | null
  wins: number // number of #1 placements
  games: GameBreakdown[]
  penalties: Penalty[]
}

/**
 * Build full standings from raw rows. Sorted high-to-low with tiebreakers:
 * total points -> total kills -> best placement -> number of wins.
 */
export function buildStandings(
  teams: Team[],
  results: GameResult[],
  penalties: Penalty[],
): StandingRow[] {
  const rows: StandingRow[] = teams.map((team) => {
    const teamResults = results
      .filter((r) => r.team_id === team.id)
      .sort((a, b) => a.game_number - b.game_number)
    const teamPenalties = penalties.filter((p) => p.team_id === team.id)
    const penaltyTotal = teamPenalties.reduce((s, p) => s + p.value, 0)

    const games: GameBreakdown[] = teamResults.map((r) => {
      const placementPts = r.dq ? 0 : placementPoints(r.placement)
      const killPts = r.dq ? 0 : killPoints(r.kills)
      return {
        game_number: r.game_number,
        placement: r.placement,
        kills: r.kills,
        dq: r.dq,
        placementPts,
        killPts,
        total: placementPts + killPts,
      }
    })

    const totalPoints =
      games.reduce((s, g) => s + g.total, 0) + penaltyTotal
    const totalKills = games.reduce((s, g) => s + (g.dq ? 0 : g.kills), 0)
    const gamesPlayed = games.length
    const validPlacements = games
      .filter((g) => !g.dq && g.placement)
      .map((g) => g.placement as number)
    const bestPlacement =
      validPlacements.length > 0 ? Math.min(...validPlacements) : null
    const wins = games.filter((g) => !g.dq && g.placement === 1).length

    return {
      team,
      totalPoints,
      totalKills,
      totalPenalty: penaltyTotal,
      gamesPlayed,
      bestPlacement,
      wins,
      games,
      penalties: teamPenalties,
    }
  })

  rows.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints
    if (b.totalKills !== a.totalKills) return b.totalKills - a.totalKills
    const aBest = a.bestPlacement ?? 99
    const bBest = b.bestPlacement ?? 99
    if (aBest !== bBest) return aBest - bBest
    if (b.wins !== a.wins) return b.wins - a.wins
    return a.team.name.localeCompare(b.team.name)
  })

  return rows
}

/** The team with the most total kills (MVP team), or null. */
export function mvpTeam(standings: StandingRow[]): StandingRow | null {
  if (standings.length === 0) return null
  return [...standings].sort((a, b) => b.totalKills - a.totalKills)[0] ?? null
}

/** Build a CSV export of the full standings. */
export function standingsToCsv(standings: StandingRow[]): string {
  const header = [
    "Rang",
    "Équipe",
    "Joueurs",
    ...Array.from({ length: TOTAL_GAMES }, (_, i) => `Game ${i + 1}`),
    "Kills",
    "Pénalités",
    "Total",
  ]
  const lines = standings.map((row, i) => {
    const byGame = new Map(row.games.map((g) => [g.game_number, g]))
    const gameCols = Array.from({ length: TOTAL_GAMES }, (_, gi) => {
      const g = byGame.get(gi + 1)
      if (!g) return ""
      return g.dq ? "DQ" : String(g.total)
    })
    const players = [row.team.player1, row.team.player2, row.team.player3]
      .filter(Boolean)
      .join(" / ")
    return [
      String(i + 1),
      row.team.name,
      players,
      ...gameCols,
      String(row.totalKills),
      String(row.totalPenalty),
      String(row.totalPoints),
    ]
  })
  return [header, ...lines]
    .map((cols) => cols.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
    .join("\n")
}
