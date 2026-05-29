"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/server"
import { isAdmin, setAdminCookie, clearAdminCookie } from "@/lib/auth"
import { MAX_TEAMS } from "@/lib/scoring"

type ActionResult = { ok: boolean; error?: string }

async function requireAdmin(): Promise<ActionResult | null> {
  if (!(await isAdmin())) return { ok: false, error: "Non autorisé." }
  return null
}

function revalidateAll() {
  revalidatePath("/")
  revalidatePath("/classement")
  revalidatePath("/admin")
}

export async function loginAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const password = String(formData.get("password") ?? "")
  if (!process.env.ADMIN_PASSWORD) {
    return { ok: false, error: "ADMIN_PASSWORD non configuré." }
  }
  if (password !== process.env.ADMIN_PASSWORD) {
    return { ok: false, error: "Mot de passe incorrect." }
  }
  await setAdminCookie()
  revalidatePath("/admin")
  return { ok: true }
}

export async function logoutAction(): Promise<void> {
  await clearAdminCookie()
  revalidatePath("/admin")
}

export async function addTeamAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const guard = await requireAdmin()
  if (guard) return guard

  const name = String(formData.get("name") ?? "").trim()
  if (!name) return { ok: false, error: "Nom d'équipe requis." }

  const supabase = createAdminClient()

  const { count } = await supabase.from("teams").select("*", { count: "exact", head: true })
  if ((count ?? 0) >= MAX_TEAMS) {
    return { ok: false, error: `Maximum ${MAX_TEAMS} équipes atteint.` }
  }

  let logoUrl: string | null = null
  const logo = formData.get("logo") as File | null
  if (logo && logo.size > 0) {
    const ext = logo.name.split(".").pop() || "png"
    const path = `${crypto.randomUUID()}.${ext}`
    const { error: upErr } = await supabase.storage
      .from("team-logos")
      .upload(path, logo, { contentType: logo.type, upsert: true })
    if (upErr) return { ok: false, error: `Upload logo: ${upErr.message}` }
    const { data: pub } = supabase.storage.from("team-logos").getPublicUrl(path)
    logoUrl = pub.publicUrl
  }

  const { error } = await supabase.from("teams").insert({
    name,
    logo_url: logoUrl,
    player1: String(formData.get("player1") ?? "").trim() || null,
    player2: String(formData.get("player2") ?? "").trim() || null,
    player3: String(formData.get("player3") ?? "").trim() || null,
  })
  if (error) return { ok: false, error: error.message }

  revalidateAll()
  return { ok: true }
}

export async function deleteTeamAction(teamId: string): Promise<ActionResult> {
  const guard = await requireAdmin()
  if (guard) return guard
  const supabase = createAdminClient()
  const { error } = await supabase.from("teams").delete().eq("id", teamId)
  if (error) return { ok: false, error: error.message }
  revalidateAll()
  return { ok: true }
}

export async function saveResultAction(formData: FormData): Promise<ActionResult> {
  const guard = await requireAdmin()
  if (guard) return guard

  const teamId = String(formData.get("team_id") ?? "")
  const gameNumber = Number(formData.get("game_number"))
  const placementRaw = formData.get("placement")
  const placement = placementRaw === "" || placementRaw == null ? null : Number(placementRaw)
  const kills = Number(formData.get("kills") ?? 0)
  const dq = formData.get("dq") === "true"

  if (!teamId || !gameNumber) return { ok: false, error: "Données invalides." }

  const supabase = createAdminClient()
  const { error } = await supabase.from("game_results").upsert(
    {
      team_id: teamId,
      game_number: gameNumber,
      placement,
      kills: Number.isFinite(kills) ? Math.max(0, kills) : 0,
      dq,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "team_id,game_number" },
  )
  if (error) return { ok: false, error: error.message }

  revalidateAll()
  return { ok: true }
}

export async function clearResultAction(teamId: string, gameNumber: number): Promise<ActionResult> {
  const guard = await requireAdmin()
  if (guard) return guard
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("game_results")
    .delete()
    .eq("team_id", teamId)
    .eq("game_number", gameNumber)
  if (error) return { ok: false, error: error.message }
  revalidateAll()
  return { ok: true }
}

export async function addPenaltyValueAction(input: {
  teamId: string
  gameNumber: number | null
  reason: string
  value: number
}): Promise<ActionResult> {
  const guard = await requireAdmin()
  if (guard) return guard

  const { teamId, gameNumber, reason, value } = input
  if (!teamId || !reason.trim()) return { ok: false, error: "Équipe et motif requis." }
  if (!Number.isFinite(value) || value === 0) {
    return { ok: false, error: "Valeur de pénalité invalide." }
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from("penalties").insert({
    team_id: teamId,
    reason: reason.trim(),
    value, // negative to subtract points
    game_number: gameNumber,
  })
  if (error) return { ok: false, error: error.message }

  revalidateAll()
  return { ok: true }
}

export async function deletePenaltyAction(penaltyId: string): Promise<ActionResult> {
  const guard = await requireAdmin()
  if (guard) return guard
  const supabase = createAdminClient()
  const { error } = await supabase.from("penalties").delete().eq("id", penaltyId)
  if (error) return { ok: false, error: error.message }
  revalidateAll()
  return { ok: true }
}

export async function setStatusAction(status: "waiting" | "live" | "finished"): Promise<ActionResult> {
  const guard = await requireAdmin()
  if (guard) return guard
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("tournament_settings")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", 1)
  if (error) return { ok: false, error: error.message }
  revalidateAll()
  return { ok: true }
}

/**
 * Reset options:
 * - "scores": clears all game results and penalties, keeps teams
 * - "all": deletes everything (teams cascade-delete their results/penalties)
 */
export async function resetTournamentAction(mode: "scores" | "all"): Promise<ActionResult> {
  const guard = await requireAdmin()
  if (guard) return guard
  const supabase = createAdminClient()

  const { error: penErr } = await supabase
    .from("penalties")
    .delete()
    .not("id", "is", null)
  if (penErr) return { ok: false, error: penErr.message }

  const { error: resErr } = await supabase
    .from("game_results")
    .delete()
    .not("id", "is", null)
  if (resErr) return { ok: false, error: resErr.message }

  if (mode === "all") {
    const { error: teamErr } = await supabase.from("teams").delete().not("id", "is", null)
    if (teamErr) return { ok: false, error: teamErr.message }
  }

  const { error: statusErr } = await supabase
    .from("tournament_settings")
    .update({ status: "waiting", updated_at: new Date().toISOString() })
    .eq("id", 1)
  if (statusErr) return { ok: false, error: statusErr.message }

  revalidateAll()
  return { ok: true }
}
