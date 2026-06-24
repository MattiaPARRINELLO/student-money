import "dotenv/config"

const TOKEN = process.env.DISCORD_BOT_TOKEN
const APP_ID = process.env.DISCORD_APP_ID

if (!TOKEN || !APP_ID) {
  console.error("❌ Mets DISCORD_BOT_TOKEN et DISCORD_APP_ID dans .env.local")
  process.exit(1)
}

const COMMANDS = [
  {
    name: "publier",
    description: "Générer et publier un article sur Student-Money",
    options: [
      {
        type: 3,
        name: "sujet",
        description: "Le sujet de l'article",
        required: true,
      },
    ],
  },
  {
    name: "sujets",
    description: "Proposer 4 sujets d'articles originaux",
  },
]

async function main() {
  const res = await fetch(
    `https://discord.com/api/v10/applications/${APP_ID}/commands`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bot ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(COMMANDS),
    },
  )

  if (res.ok) {
    const data = await res.json()
    console.log(`✅ ${data.length} commandes slash enregistrées !`)
  } else {
    console.error(`❌ Erreur ${res.status}: ${await res.text()}`)
  }
}

main()
