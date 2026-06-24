import { execSync } from "child_process"
import { sendNotification } from "./helpers"

const PROJECT_DIR = process.env.PROJECT_DIR || process.cwd()

async function main() {
  const prompt = `Cherche des sujets tendance sur les économies étudiantes.
  Propose 3 sujets différents.
  Pour chaque sujet, donne : le titre, la catégorie, pourquoi c'est tendance.
  Choisis ensuite le meilleur sujet et écris l'article complet en suivant les instructions du template pipeline/prompts/article.md.
  Sauvegarde le fichier dans content/drafts/[slug].mdx
  En sortie finale, réponds UNIQUEMENT le slug de l'article généré.`

  console.log("[pipeline] Lancement de Hermes...")
  try {
    const slug = execSync(
      `hermes -z "${prompt}"`,
      {
        cwd: PROJECT_DIR,
        encoding: "utf-8",
        timeout: 600_000,
      }
    ).trim()

    console.log(`[pipeline] Slug généré : ${slug}`)

    await sendNotification(slug)

    console.log("[pipeline] Terminé.")
  } catch (error) {
    console.error("[pipeline] Erreur :", error)
    process.exit(1)
  }
}

main()
