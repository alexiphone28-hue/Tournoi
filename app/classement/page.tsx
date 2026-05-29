import { SiteHeader } from "@/components/site-header"
import { StatusBadge } from "@/components/status-badge"
import { LiveLeaderboard } from "@/components/live-leaderboard"
import { getTournamentData } from "@/lib/data"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Classement — Tournoi LILI Warzone",
}

export default async function ClassementPage() {
  const data = await getTournamentData()

  return (
    <div className="min-h-screen">
      <SiteHeader status={data.status} />
      <main className="mx-auto max-w-6xl px-4 pb-20 pt-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
              Classement <span className="text-primary text-glow">général</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Touchez une équipe pour voir le détail des {data.results.length > 0 ? "games" : "7 games"}.
            </p>
          </div>
          <StatusBadge status={data.status} />
        </div>

        <LiveLeaderboard initial={data} />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Mise à jour automatique en temps réel — aucun rafraîchissement nécessaire.
        </p>
      </main>
    </div>
  )
}
