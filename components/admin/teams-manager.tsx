"use client"

import { useActionState, useMemo, useRef, useState, useTransition } from "react"
import { Plus, Search, Trash2, Users } from "lucide-react"
import { TeamAvatar } from "@/components/team-avatar"
import { addTeamAction, deleteTeamAction } from "@/app/actions"
import { MAX_TEAMS, type Team } from "@/lib/scoring"

export function TeamsManager({ teams }: { teams: Team[] }) {
  const [state, formAction, pending] = useActionState(addTeamAction, { ok: false })
  const formRef = useRef<HTMLFormElement>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  if (state.ok && formRef.current) {
    formRef.current.reset()
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return teams
    return teams.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        [t.player1, t.player2, t.player3].some((p) => p?.toLowerCase().includes(q)),
    )
  }, [teams, query])

  function handleDelete(id: string, name: string) {
    if (!confirm(`Supprimer l'équipe "${name}" et tous ses scores ?`)) return
    startTransition(async () => {
      const res = await deleteTeamAction(id)
      if (!res.ok) setError(res.error ?? "Erreur")
    })
  }

  const full = teams.length >= MAX_TEAMS

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
          <Plus className="h-4 w-4" /> Ajouter une équipe
        </h3>
        <form ref={formRef} action={formAction} className="mt-4 flex flex-col gap-3">
          <input
            name="name"
            required
            placeholder="Nom de l'équipe"
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <input name="player1" placeholder="Joueur 1" className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2" />
            <input name="player2" placeholder="Joueur 2" className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2" />
            <input name="player3" placeholder="Joueur 3" className="rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2" />
          </div>
          <label className="text-xs font-medium text-muted-foreground">
            Logo (optionnel)
            <input
              type="file"
              name="logo"
              accept="image/*"
              className="mt-1 block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-foreground hover:file:bg-secondary/70"
            />
          </label>
          {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
          <button
            type="submit"
            disabled={pending || full}
            className="rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {full ? `Maximum ${MAX_TEAMS} équipes` : pending ? "Ajout..." : "Ajouter l'équipe"}
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-foreground">
            <Users className="h-4 w-4" /> Équipes
          </h3>
          <span className="font-mono text-sm text-muted-foreground">
            {teams.length}/{MAX_TEAMS}
          </span>
        </div>
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
        {teams.length > 0 ? (
          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une équipe ou un joueur..."
              className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
            />
          </div>
        ) : null}
        {teams.length === 0 ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Aucune équipe inscrite pour l&apos;instant.
          </p>
        ) : filtered.length === 0 ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Aucune équipe ne correspond à &laquo; {query} &raquo;.
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {filtered.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-secondary/40 px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <TeamAvatar name={t.name} logoUrl={t.logo_url} size={36} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {[t.player1, t.player2, t.player3].filter(Boolean).join(" · ") || "Trio"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(t.id, t.name)}
                  disabled={isPending}
                  className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/15 hover:text-destructive disabled:opacity-50"
                  aria-label={`Supprimer ${t.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
