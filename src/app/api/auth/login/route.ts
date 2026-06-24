import { createSession, setSessionCookie } from "@/lib/auth"

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@studentmoney.fr"
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "studentmoney2026"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json({ error: "Email et mot de passe requis." }, { status: 400 })
    }

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return Response.json({ error: "Identifiants incorrects." }, { status: 401 })
    }

    const token = await createSession()
    await setSessionCookie(token)

    return Response.json({ success: true })
  } catch {
    return Response.json({ error: "Erreur serveur." }, { status: 500 })
  }
}
