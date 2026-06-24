import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 })
  }

  const phpUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/scripts/newsletter/subscribe.php`
    : "http://localhost/student-money/scripts/newsletter/subscribe.php"

  try {
    const response = await fetch(phpUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Erreur lors de l'inscription" }, { status: 500 })
  }
}
