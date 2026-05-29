import { Crosshair, ShieldAlert, Trophy } from "lucide-react"
import {
  PLACEMENT_TABLE,
  PENALTY_PRESETS,
  POINTS_PER_KILL,
  MAX_KILLS_COUNTED,
  MAX_KILL_POINTS,
} from "@/lib/scoring"

export function ScoringRules() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Placement points */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border bg-secondary/50 px-5 py-4">
          <Trophy className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
            Points de placement
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-2.5 font-semibold">Classement</th>
              <th className="px-5 py-2.5 text-right font-semibold">Points</th>
            </tr>
          </thead>
          <tbody>
            {PLACEMENT_TABLE.map((row) => (
              <tr
                key={row.label}
                className="border-b border-border/40 transition-colors last:border-0 hover:bg-primary/[0.04]"
              >
                <td className="px-5 py-2.5 font-medium text-foreground">{row.label}</td>
                <td className="px-5 py-2.5 text-right font-mono font-bold tabular-nums text-primary">
                  {row.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-border/60 bg-accent/[0.06] px-5 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Crosshair className="h-3.5 w-3.5 text-accent" />
            <span>
              <span className="font-semibold text-foreground">1 élimination = {POINTS_PER_KILL} points</span>
              {" · "}max {MAX_KILLS_COUNTED} kills comptés par game{" · "}
              max {MAX_KILL_POINTS} points de kills par game
            </span>
          </div>
        </div>
      </div>

      {/* Sanctions */}
      <div className="overflow-hidden rounded-xl border border-destructive/40 bg-card">
        <div className="flex items-center gap-2 border-b border-destructive/40 bg-destructive/10 px-5 py-4">
          <ShieldAlert className="h-4 w-4 text-destructive" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-destructive">
            Sanctions & pénalités
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-2.5 font-semibold">Infraction</th>
              <th className="px-5 py-2.5 text-right font-semibold">Pénalité</th>
            </tr>
          </thead>
          <tbody>
            {PENALTY_PRESETS.map((row) => (
              <tr
                key={row.reason}
                className="border-b border-border/40 transition-colors last:border-0 hover:bg-destructive/[0.06]"
              >
                <td className="px-5 py-2.5 font-medium text-foreground">{row.reason}</td>
                <td className="px-5 py-2.5 text-right font-mono font-bold tabular-nums text-destructive">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-border/60 bg-secondary/40 px-5 py-3">
          <p className="text-xs text-muted-foreground">
            Une <span className="font-semibold text-foreground">disqualification (DQ)</span> sur une
            game donne <span className="font-semibold text-foreground">0 point</span> pour cette
            game. Toutes les pénalités appliquées par les admins suivent les règles publiques
            ci-dessus.
          </p>
        </div>
      </div>
    </div>
  )
}
