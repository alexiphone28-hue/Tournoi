import Link from "next/link"
import Image from "next/image"
import { Trophy, Users, Gamepad2, ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { StatusBadge } from "@/components/status-badge"
import { LiveLeaderboard } from "@/components/live-leaderboard"
import { PenaltiesFeed } from "@/components/penalties-feed"
import { ScoringRules } from "@/components/scoring-rules"
import { getTournamentData } from "@/lib/data"
import { TOTAL_GAMES, MAX_TEAMS } from "@/lib/scoring"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const data = await getTournamentData()

  const stats = [
    { icon: Users, label: "Équipes", value: `${data.teams.length}/${MAX_TEAMS}` },
    { icon: Gamepad2, label: "Games", value: String(TOTAL_GAMES) },
    { icon: Trophy, label: "Format", value: "Trio" },
  ]

  return (
    <div className="min-h-screen">
      <SiteHeader status={data.status} />

      <main className="mx-auto max-w-6xl px-4 pb-20">
        {/* Hero */}
        <section className="relative mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid-bg absolute inset-0 opacity-60" />
          <div
            aria-hidden
            className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
          />
          <div className="relative flex flex-col items-center gap-6 px-6 py-12 text-center sm:py-16">
            <Image
              src="/tournoi-lili-logo.png"
              alt="Tournoi LILI Warzone"
              width={180}
              height={180}
              priority
              className="h-36 w-36 object-contain drop-shadow-[0_0_30px_oklch(0.66_0.27_350_/_0.5)] sm:h-44 sm:w-44"
            />
            <StatusBadge status={data.status} />
            <div>
              <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl">
                TOURNOI <span className="text-primary text-glow">LILI</span>
              </h1>
              <p className="mt-1 text-sm font-bold uppercase tracking-[0.4em] text-muted-foreground">
                Warzone
              </p>
            </div>
            <p className="max-w-xl text-pretty text-muted-foreground">
              {MAX_TEAMS} équipes en trio s&apos;affrontent sur {TOTAL_GAMES} games. Classement,
              kills et pénalités mis à jour en temps réel.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/classement"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 glow-pink"
              >
                Voir le classement
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#reglement"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/70"
              >
                Règlement
              </a>
            </div>

            <div className="mt-2 grid w-full max-w-md grid-cols-3 gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-border bg-background/60 px-3 py-4 backdrop-blur"
                >
                  <s.icon className="mx-auto h-5 w-5 text-primary" />
                  <p className="mt-2 font-mono text-xl font-bold text-foreground">{s.value}</p>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Leaderboard preview */}
        <section className="mt-12">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">Top du classement</h2>
              <p className="text-sm text-muted-foreground">Les 5 meilleures équipes en direct.</p>
            </div>
            <Link
              href="/classement"
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Tout voir <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <LiveLeaderboard initial={data} compact />
        </section>

        {/* Rules */}
        <section id="reglement" className="mt-12 scroll-mt-20">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">Règlement & Scoring</h2>
            <p className="text-sm text-muted-foreground">
              Système de points officiel du Tournoi LILI. Toutes les pénalités appliquées par les
              admins suivent les règles publiques ci-dessous.
            </p>
          </div>
          <ScoringRules />
        </section>

        {/* Penalties */}
        <section className="mt-12">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">Journal des pénalités</h2>
            <p className="text-sm text-muted-foreground">
              Sanctions et disqualifications appliquées pendant le tournoi.
            </p>
          </div>
          <PenaltiesFeed initial={data} />
        </section>
      </main>

      <footer className="border-t border-border/60 py-8 text-center">
        <p className="text-xs text-muted-foreground">
          Tournoi LILI Warzone — Classement en temps réel
        </p>
      </footer>
    </div>
  )
}
