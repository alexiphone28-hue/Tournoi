import Link from "next/link"
import Image from "next/image"
import { StatusBadge } from "@/components/status-badge"
import type { TournamentStatus } from "@/lib/scoring"

export function SiteHeader({ status }: { status?: TournamentStatus }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/tournoi-lili-logo.png"
            alt="Tournoi LILI Warzone"
            width={48}
            height={48}
            className="h-11 w-11 object-contain"
            priority
          />
          <div className="leading-tight">
            <p className="text-sm font-bold tracking-wide text-foreground sm:text-base">
              TOURNOI <span className="text-primary text-glow">LILI</span>
            </p>
            <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
              Warzone
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {status ? <StatusBadge status={status} className="mr-1 hidden sm:inline-flex" /> : null}
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Accueil
          </Link>
          <Link
            href="/classement"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Classement
          </Link>
          <Link
            href="/admin"
            className="rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  )
}
