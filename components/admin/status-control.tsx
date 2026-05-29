"use client"

import { useState, useTransition } from "react"
import { cn } from "@/lib/utils"
import { setStatusAction } from "@/app/actions"
import type { TournamentStatus } from "@/lib/scoring"

const OPTIONS: { value: TournamentStatus; label: string }[] = [
  { value: "waiting", label: "À venir" },
  { value: "live", label: "En direct" },
  { value: "finished", label: "Terminé" },
]

export function StatusControl({ status }: { status: TournamentStatus }) {
  const [current, setCurrent] = useState(status)
  const [isPending, startTransition] = useTransition()

  function update(value: TournamentStatus) {
    setCurrent(value)
    startTransition(async () => {
      await setStatusAction(value)
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
        Statut du tournoi
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Affiché en direct sur la page publique.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => update(o.value)}
            disabled={isPending}
            className={cn(
              "rounded-lg border px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60",
              current === o.value
                ? o.value === "live"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-accent bg-accent text-accent-foreground"
                : "border-border bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
