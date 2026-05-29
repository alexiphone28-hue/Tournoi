"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { LogOut, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { StatusControl } from "@/components/admin/status-control"
import { TeamsManager } from "@/components/admin/teams-manager"
import { ScoresManager } from "@/components/admin/scores-manager"
import { PenaltiesManager } from "@/components/admin/penalties-manager"
import { logoutAction } from "@/app/actions"
import { useTournamentData, type TournamentData } from "@/hooks/use-tournament-data"

const TABS = [
  { id: "teams", label: "Équipes" },
  { id: "scores", label: "Scores" },
  { id: "penalties", label: "Pénalités" },
] as const

type TabId = (typeof TABS)[number]["id"]

export function AdminDashboard({ initial }: { initial: TournamentData }) {
  const { data } = useTournamentData(initial)
  const [tab, setTab] = useState<TabId>("teams")

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Image
              src="/tournoi-lili-logo.png"
              alt="Tournoi LILI"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
            />
            <div className="leading-tight">
              <p className="text-sm font-bold text-foreground">Panneau Admin</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                Tournoi LILI
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/classement"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/70"
            >
              <ExternalLink className="h-4 w-4" /> <span className="hidden sm:inline">Classement</span>
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-destructive"
              >
                <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20 pt-6">
        <div className="mb-6">
          <StatusControl status={data.status} />
        </div>

        <div className="mb-5 flex gap-2 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "-mb-px border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors",
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "teams" && <TeamsManager teams={data.teams} />}
        {tab === "scores" && <ScoresManager teams={data.teams} results={data.results} />}
        {tab === "penalties" && (
          <PenaltiesManager teams={data.teams} penalties={data.penalties} />
        )}
      </main>
    </div>
  )
}
