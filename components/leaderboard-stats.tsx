"use client"

import { useMemo } from "react"
import { Crosshair, Trophy, Users, Skull } from "lucide-react"
import { TeamAvatar } from "@/components/team-avatar"
import { useTournamentData, type TournamentData } from "@/hooks/use-tournament-data"
import { buildStandings, mvpTeam } from "@/lib/scoring"

export function LeaderboardStats({ initial }: { initial: TournamentData }) {
  const { data } = useTournamentData(initial)

  const { standings, mvp, totalKills, leader } = useMemo(() => {
    const standings = buildStandings(data.teams, data.results, data.penalties)
    return {
      standings,
      mvp: mvpTeam(standings),
      totalKills: standings.reduce((s, r) => s + r.totalKills, 0),
      leader: standings[0] ?? null,
    }
  }, [data])

  if (standings.length === 0) return null

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-primary/30 bg-card p-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Trophy className="h-3.5 w-3.5 text-chart-3" /> Leader
        </div>
        {leader ? (
          <div className="mt-2 flex items-center gap-2">
            <TeamAvatar name={leader.team.name} logoUrl={leader.team.logo_url} size={28} />
            <span className="truncate text-sm font-bold text-foreground">{leader.team.name}</span>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">—</p>
        )}
      </div>

      <div className="rounded-xl border border-accent/30 bg-card p-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Crosshair className="h-3.5 w-3.5 text-accent" /> MVP Kills
        </div>
        {mvp && mvp.totalKills > 0 ? (
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <TeamAvatar name={mvp.team.name} logoUrl={mvp.team.logo_url} size={28} />
              <span className="truncate text-sm font-bold text-foreground">{mvp.team.name}</span>
            </div>
            <span className="font-mono text-sm font-bold tabular-nums text-accent">
              {mvp.totalKills}
            </span>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">—</p>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Skull className="h-3.5 w-3.5 text-foreground/70" /> Kills totaux
        </div>
        <p className="mt-2 font-mono text-2xl font-extrabold tabular-nums text-foreground">
          {totalKills}
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Users className="h-3.5 w-3.5 text-foreground/70" /> Équipes
        </div>
        <p className="mt-2 font-mono text-2xl font-extrabold tabular-nums text-foreground">
          {standings.length}
        </p>
      </div>
    </div>
  )
}
