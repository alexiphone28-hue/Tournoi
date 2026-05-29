"use client"

import { useState, useTransition } from "react"
import { AlertTriangle, Trash2, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { addPenaltyValueAction, deletePenaltyAction } from "@/app/actions"
import { TOTAL_GAMES, PENALTY_PRESETS, type Team, type Penalty } from "@/lib/scoring"

export function PenaltiesManager({
  teams,
  penalties,
}: {
  teams: Team[]
  penalties: Penalty[]
}) {
  const [teamId, setTeamId] = useState("")
  const [gameNumber, setGameNumber] = useState("")
  const [customReason, setCustomReason] = useState("")
  const [customValue, setCustomValue] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)

  const teamName = new Map(teams.map((t) => [t.id, t.name]))

  function apply(reason: string, value: number) {
    setError(null)
    if (!teamId) {
      setError("Sélectionnez d'abord une équipe.")
      return
    }
    startTransition(async () => {
      const res = await addPenaltyValueAction({
        teamId,
        gameNumber: gameNumber ? Number(gameNumber) : null,
        reason,
        value,
      })
      if (!res.ok) {
        setError(res.error ?? "Erreur")
      } else {
        setFlash(`${reason} appliqué (${value})`)
        setTimeout(() => setFlash(null), 1800)
        setCustomReason("")
        setCustomValue("")
      }
    })
  }

  function remove(id: string) {
    startTransition(async () => {
      const res = await deletePenaltyAction(id)
      if (!res.ok) setError(res.error ?? "Erreur")
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="rounded-xl border border-destructive/40 bg-card p-5">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-destructive">
          <AlertTriangle className="h-4 w-4" /> Appliquer une pénalité
        </h3>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <select
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
          >
            <option value="">Sélectionner une équipe</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            value={gameNumber}
            onChange={(e) => setGameNumber(e.target.value)}
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
          >
            <option value="">Général</option>
            {Array.from({ length: TOTAL_GAMES }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                Game {n}
              </option>
            ))}
          </select>
        </div>

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Sanctions rapides
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {PENALTY_PRESETS.map((p) => (
            <button
              key={p.reason}
              onClick={() => apply(p.reason, p.value)}
              disabled={isPending}
              className="flex items-center justify-between gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-left text-sm font-semibold text-foreground transition-colors hover:bg-destructive/20 disabled:opacity-50"
            >
              <span className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-destructive" />
                {p.reason}
              </span>
              <span className="font-mono font-bold text-destructive">{p.value}</span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Pénalité personnalisée
        </p>
        <div className="mt-2 flex flex-col gap-2">
          <input
            value={customReason}
            onChange={(e) => setCustomReason(e.target.value)}
            placeholder="Motif"
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
          />
          <div className="flex gap-2">
            <input
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              type="number"
              placeholder="Points (ex: -10)"
              className="w-32 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
            />
            <button
              onClick={() => {
                const v = Number(customValue)
                if (!customReason.trim() || !Number.isFinite(v) || v === 0) {
                  setError("Motif et valeur (≠ 0) requis.")
                  return
                }
                apply(customReason.trim(), v)
              }}
              disabled={isPending}
              className="flex-1 rounded-lg bg-destructive py-2 text-sm font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
            >
              Appliquer
            </button>
          </div>
        </div>

        {flash ? <p className="mt-3 text-sm font-medium text-chart-5">{flash}</p> : null}
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
          Pénalités appliquées
        </h3>
        {penalties.length === 0 ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Aucune pénalité enregistrée.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {penalties.map((p) => (
              <li
                key={p.id}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-secondary/40 px-3 py-2",
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {teamName.get(p.team_id) ?? "?"}
                    {p.game_number ? (
                      <span className="ml-2 text-xs font-normal text-muted-foreground">
                        Game {p.game_number}
                      </span>
                    ) : null}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{p.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-destructive">
                    {p.value > 0 ? `+${p.value}` : p.value}
                  </span>
                  <button
                    onClick={() => remove(p.id)}
                    disabled={isPending}
                    className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive disabled:opacity-50"
                    aria-label="Supprimer la pénalité"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
