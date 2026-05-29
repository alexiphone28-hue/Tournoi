"use client"

import { useMemo } from "react"
import { AlertTriangle, ShieldAlert } from "lucide-react"
import { useTournamentData, type TournamentData } from "@/hooks/use-tournament-data"

export function PenaltiesFeed({ initial }: { initial: TournamentData }) {
  const { data } = useTournamentData(initial)

  const items = useMemo(() => {
    const teamName = new Map(data.teams.map((t) => [t.id, t.name]))
    return data.penalties.map((p) => ({
      ...p,
      teamName: teamName.get(p.team_id) ?? "Équipe inconnue",
    }))
  }, [data])

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center">
        <ShieldAlert className="mx-auto h-7 w-7 text-muted-foreground/50" />
        <p className="mt-2 text-sm text-muted-foreground">
          Aucune pénalité enregistrée. Fair-play parfait pour l&apos;instant.
        </p>
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {items.map((p) => (
        <li
          key={p.id}
          className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/[0.07] px-4 py-3"
        >
          <div className="flex min-w-0 items-center gap-3">
            <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {p.teamName}
                {p.game_number ? (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    Game {p.game_number}
                  </span>
                ) : null}
              </p>
              <p className="truncate text-xs text-muted-foreground">{p.reason}</p>
            </div>
          </div>
          <span className="shrink-0 font-mono text-sm font-bold text-destructive">
            {p.value > 0 ? `+${p.value}` : p.value}
          </span>
        </li>
      ))}
    </ul>
  )
}
