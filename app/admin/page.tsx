import { isAdmin } from "@/lib/auth"
import { getTournamentData } from "@/lib/data"
import { LoginForm } from "@/components/admin/login-form"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Admin — Tournoi LILI Warzone",
  robots: { index: false, follow: false },
}

export default async function AdminPage() {
  const authed = await isAdmin()

  if (!authed) {
    return <LoginForm />
  }

  const data = await getTournamentData()
  return <AdminDashboard initial={data} />
}
