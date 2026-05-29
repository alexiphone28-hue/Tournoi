"use client"

import { useActionState } from "react"
import Image from "next/image"
import { Lock } from "lucide-react"
import { loginAction } from "@/app/actions"

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, { ok: false })

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 glow-pink">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image
            src="/tournoi-lili-logo.png"
            alt="Tournoi LILI"
            width={72}
            height={72}
            className="h-16 w-16 object-contain"
          />
          <h1 className="text-xl font-bold text-foreground">Espace Admin</h1>
          <p className="text-sm text-muted-foreground">
            Entrez le mot de passe pour gérer le tournoi.
          </p>
        </div>

        <form action={formAction} className="mt-6 flex flex-col gap-3">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              name="password"
              required
              autoFocus
              placeholder="Mot de passe"
              className="w-full rounded-lg border border-input bg-background py-2.5 pl-10 pr-3 text-sm text-foreground outline-none ring-primary/40 placeholder:text-muted-foreground focus:ring-2"
            />
          </div>
          {state.error ? (
            <p className="text-sm font-medium text-destructive">{state.error}</p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {pending ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  )
}
