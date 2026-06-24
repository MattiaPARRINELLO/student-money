import nodemailer from "nodemailer"
import fs from "fs"
import path from "path"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.votre-hebergeur.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "noreply@studentmoney.fr",
    pass: process.env.SMTP_PASS || "",
  },
})

export async function sendNotification(slug: string) {
  const draftPath = path.join(process.cwd(), "content", "drafts", `${slug}.mdx`)
  if (!fs.existsSync(draftPath)) {
    console.log(`[helpers] Draft introuvable : ${draftPath}`)
    return
  }

  const content = fs.readFileSync(draftPath, "utf-8")
  const titleMatch = content.match(/title:\s*"(.+)"/)
  const title = titleMatch ? titleMatch[1] : slug

  await transporter.sendMail({
    from: '"Student-Money" <noreply@studentmoney.fr>',
    to: process.env.NOTIF_EMAIL || "ton-email@example.com",
    subject: `✏️ Nouvel article à valider : "${title}"`,
    html: `
      <h1>Nouvel article généré</h1>
      <p><strong>${title}</strong></p>
      <p>Slug : <code>${slug}</code></p>
      <p>
        <a href="https://studentmoney.fr/admin/drafts/${slug}">
          👉 Valider l'article
        </a>
      </p>
    `,
  })

  console.log(`[helpers] Email envoyé pour ${slug}`)
}
