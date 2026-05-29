"use client"

import { useMemo, useState } from "react"
import { ChevronDown, Crosshair, Trophy, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { TeamAvatar } from "@/components/team-avatar"
import { useTournamentData, type TournamentData } from "@/hooks/use-tournament-data"
import { buildStandings, TOTAL_GAMES, type StandingRow } from "@/lib/scoring"

function rankStyle(rank: number) {
  if (rank === 1) return "text-chart-3"
  if (rank === 2) return "text-foreground/80"
  if (rank === 3) return "text-accent"
  return "text-muted-foreground"
}

function RankBadge({ rank }: { rank: number }) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-md border border-border bg-secondary font-mono text-sm font-bold tabular-nums",
        rankStyle(rank),
        rank <= 3 && "border-current/40",
      )}
    >
      {rank}
    </div>
  )
}

function GameDetail({ row }: { row: StandingRow }) {
  const byGame = new Map(row.games.map((g) => [g.game_number, g]))
  return (
    <div className="border-t border-border/60 bg-background/40 px-3 py-3 sm:px-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {Array.from({ length: TOTAL_GAMES }, (_, i) => i + 1).map((n) => {
          const g = byGame.get(n)
          return (
            <div
              key={n}
              className={cn(
                "rounded-md border border-border/60 bg-card px-2 py-2 text-center",
                g?.dq && "border-destructive/50 bg-destructive/10",
              )}
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Game {n}
              </p>
              {g ? (
                g.dq ? (
                  <p className="mt-1 text-xs font-bold text-destructive">DQ</p>
                ) : (
                  <>
                    <p className="mt-1 text-sm font-bold text-foreground">
                      {g.total} <span className="text-[10px] font-normal text-muted-foreground">pts</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {g.placement ? `#${g.placement}` : "—"} · {g.kills} elim
                    </p>
                    <p className="mt-0.5 text-[10px] tabular-nums text-muted-foreground/80">
                      <span className="text-primary">{g.placementPts}</span>
                      {" + "}
                      <span className="text-accent">{g.killPts}</span>
                    </p>
                  </>
                )
              ) : (
                <p className="mt-1 text-sm text-muted-foreground/50">—</p>
              )}
            </div>
          )
        })}
      </div>
      {row.penalties.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {row.penalties.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1 text-[11px] font-medium text-destructive"
            >
              <AlertTriangle className="h-3 w-3" />
              {p.reason} ({p.value > 0 ? `+${p.value}` : p.value})
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export function LiveLeaderboard({
  initial,
  compact = false,
}: {
  initial: TournamentData
  compact?: boolean
}) {
  const { data } = useTournamentData(initial)
  const [open, setOpen] = useState<string | null>(null)

  const standings = useMemo(
    () => buildStandings(data.teams, data.results, data.penalties),
    [data],
  )

  if (standings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-10 text-center">
        <Trophy className="mx-auto h-8 w-8 text-muted-foreground/50" />
        <p className="mt-3 font-semibold text-foreground">Aucune équipe inscrite</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Les équipes apparaîtront ici dès qu&apos;elles seront ajoutées par l&apos;administrateur.
        </p>
      </div>
    )
  }

  const rows = compact ? standings.slice(0, 5) : standings

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="hidden grid-cols-[3rem_1fr_5rem_5rem_5.5rem_2rem] items-center gap-2 border-b border-border bg-secondary/50 px-3 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground sm:grid sm:px-4">
        <span>Rang</span>
        <span>Équipe</span>
        <span className="text-center">Games</span>
        <span className="text-center">Élim.</span>
        <span className="text-right">Points</span>
        <span />
      </div>

      <ul className="divide-y divide-border/60">
        {rows.map((row, i) => {
          const rank = i + 1
          const isOpen = open === row.team.id
          return (
            <li key={row.team.id}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : row.team.id)}
                className={cn(
                  "grid w-full grid-cols-[3rem_1fr_auto] items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-secondary/40 sm:grid-cols-[3rem_1fr_5rem_5rem_5.5rem_2rem] sm:gap-2 sm:px-4",
                  rank <= 3 && "bg-primary/[0.04]",
                )}
              >
                <RankBadge rank={rank} />

                <div className="flex min-w-0 items-center gap-3">
                  <TeamAvatar name={row.team.name} logoUrl={row.team.logo_url} size={40} />
                  <div className="min-w-0">
                    <p className="truncate font-bold text-foreground">{row.team.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[row.team.player1, row.team.player2, row.team.player3]
                        .filter(Boolean)
                        .join(" · ") || "Trio"}
                    </p>
                  </div>
                </div>

                <span className="hidden text-center font-mono text-sm tabular-nums text-muted-foreground sm:block">
                  {row.gamesPlayed}/{TOTAL_GAMES}
                </span>

                <span className="hidden items-center justify-center gap-1 text-center font-mono text-sm tabular-nums text-foreground sm:flex">
                  <Crosshair className="h-3.5 w-3.5 text-muted-foreground" />
                  {row.totalKills}
                </span>

                <div className="flex items-center gap-2 justify-self-end sm:block sm:justify-self-auto sm:text-right">
                  <span className="font-mono text-lg font-extrabold tabular-nums text-primary text-glow">
                    {row.totalPoints}
                  </span>
                  <span className="ml-1 hidden text-[10px] uppercase text-muted-foreground sm:inline">pts</span>
                </div>

                <ChevronDown
                  className={cn(
                    "hidden h-4 w-4 text-muted-foreground transition-transform sm:block",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              {isOpen && <GameDetail row={row} />}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
