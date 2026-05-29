import { cookies } from "next/headers"

const COOKIE_NAME = "lili_admin"

/**
 * The cookie stores the admin password value itself (httpOnly, server-only check).
 * Simple gate for a single-admin tournament tool.
 */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  return Boolean(token) && token === process.env.ADMIN_PASSWORD
}

export async function setAdminCookie() {
  const store = await cookies()
  store.set(COOKIE_NAME, process.env.ADMIN_PASSWORD ?? "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12, // 12h
  })
}

export async function clearAdminCookie() {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}
