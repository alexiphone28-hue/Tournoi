"use client"

import { useMemo, useState, useTransition } from "react"
import { Save, Ban, Check, Gamepad2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { TeamAvatar } from "@/components/team-avatar"
import { saveResultAction } from "@/app/actions"
import {
  TOTAL_GAMES,
  MAX_KILLS_COUNTED,
  placementPoints,
  killPoints,
  type Team,
  type GameResult,
} from "@/lib/scoring"

export function ScoresManager({
  teams,
  results,
}: {
  teams: Team[]
  results: GameResult[]
}) {
  const [game, setGame] = useState(1)

  const byTeam = useMemo(() => {
    const map = new Map<string, GameResult>()
    for (const r of results) {
      if (r.game_number === game) map.set(r.team_id, r)
    }
    return map
  }, [results, game])

  if (teams.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-sm text-muted-foreground">
        Ajoutez des équipes pour saisir les scores.
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
        <Gamepad2 className="h-4 w-4" /> Saisie des scores
      </h3>

      <div className="mt-4 flex flex-wrap gap-2">
        {Array.from({ length: TOTAL_GAMES }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => setGame(n)}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm font-semibold transition-colors",
              game === n
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            Game {n}
          </button>
        ))}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Placement = 1er 100 · 2-4 70 · 5-6 50 · 7-8 30 · 9-10 20 · 11-13 10 · 14-16 0. Kills = 4
        pts (max {MAX_KILLS_COUNTED} comptés / game). Entrée pour enregistrer.
      </p>

      <div className="mt-4 space-y-2">
        {teams.map((t) => (
          <ScoreRow key={t.id} team={t} game={game} existing={byTeam.get(t.id)} />
        ))}
      </div>
    </div>
  )
}

function ScoreRow({
  team,
  game,
  existing,
}: {
  team: Team
  game: number
  existing?: GameResult
}) {
  const [placement, setPlacement] = useState(existing?.placement?.toString() ?? "")
  const [kills, setKills] = useState(existing?.kills?.toString() ?? "")
  const [dq, setDq] = useState(existing?.dq ?? false)
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset local state when switching game
  const key = `${team.id}-${game}`
  const [renderKey, setRenderKey] = useState(key)
  if (renderKey !== key) {
    setRenderKey(key)
    setPlacement(existing?.placement?.toString() ?? "")
    setKills(existing?.kills?.toString() ?? "")
    setDq(existing?.dq ?? false)
    setSaved(false)
    setError(null)
  }

  function save() {
    const fd = new FormData()
    fd.set("team_id", team.id)
    fd.set("game_number", String(game))
    fd.set("placement", placement)
    fd.set("kills", kills || "0")
    fd.set("dq", String(dq))
    startTransition(async () => {
      const res = await saveResultAction(fd)
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 1500)
      } else {
        setError(res.error ?? "Erreur")
      }
    })
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-lg border border-border/60 bg-secondary/30 p-3",
        dq && "border-destructive/40 bg-destructive/10",
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <TeamAvatar name={team.name} logoUrl={team.logo_url} size={36} />
        <p className="truncate text-sm font-semibold text-foreground">{team.name}</p>
      </div>

      <div className="flex items-center gap-2">
        <label className="flex flex-col text-[10px] font-medium uppercase text-muted-foreground">
          Place
          <input
            type="number"
            min={1}
            max={16}
            value={placement}
            disabled={dq}
            onChange={(e) => setPlacement(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder="#"
            className="mt-0.5 w-16 rounded-md border border-input bg-background px-2 py-1.5 text-center text-sm text-foreground outline-none ring-primary/40 focus:ring-2 disabled:opacity-40"
          />
        </label>
        <label className="flex flex-col text-[10px] font-medium uppercase text-muted-foreground">
          Élim.
          <input
            type="number"
            min={0}
            max={MAX_KILLS_COUNTED}
            value={kills}
            disabled={dq}
            onChange={(e) => setKills(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder="0"
            className="mt-0.5 w-16 rounded-md border border-input bg-background px-2 py-1.5 text-center text-sm text-foreground outline-none ring-primary/40 focus:ring-2 disabled:opacity-40"
          />
        </label>

        <div className="mt-3.5 flex w-14 flex-col items-center">
          <span className="text-[10px] font-medium uppercase text-muted-foreground">Pts</span>
          <span className="font-mono text-sm font-bold tabular-nums text-primary">
            {dq
              ? 0
              : placementPoints(placement ? Number(placement) : null) +
                killPoints(kills ? Number(kills) : 0)}
          </span>
        </div>

        <button
          onClick={() => setDq(!dq)}
          className={cn(
            "mt-3.5 flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors",
            dq
              ? "border-destructive bg-destructive text-destructive-foreground"
              : "border-border bg-background text-muted-foreground hover:text-destructive",
          )}
        >
          <Ban className="h-3.5 w-3.5" /> DQ
        </button>

        <button
          onClick={save}
          disabled={isPending}
          className={cn(
            "mt-3.5 flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50",
            saved
              ? "bg-chart-5 text-background"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          {saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
          {saved ? "OK" : "Enreg."}
        </button>
      </div>
      {error ? <p className="w-full text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
