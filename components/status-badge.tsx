import { cn } from "@/lib/utils"
import type { TournamentStatus } from "@/lib/scoring"

const CONFIG: Record<TournamentStatus, { label: string; dot: string; box: string }> = {
  waiting: {
    label: "À venir",
    dot: "bg-muted-foreground",
    box: "border-border bg-secondary text-muted-foreground",
  },
  live: {
    label: "EN DIRECT",
    dot: "bg-primary animate-pulse-live",
    box: "border-primary/40 bg-primary/15 text-primary",
  },
  finished: {
    label: "Terminé",
    dot: "bg-accent",
    box: "border-accent/40 bg-accent/15 text-accent",
  },
}

export function StatusBadge({
  status,
  className,
}: {
  status: TournamentStatus
  className?: string
}) {
  const c = CONFIG[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider",
        c.box,
        className,
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", c.dot)} />
      {c.label}
    </span>
  )
}
