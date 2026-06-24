import nacl from "tweetnacl"

const BASE = "https://discord.com/api/v10"

function botToken(): string {
  const t = process.env.DISCORD_BOT_TOKEN
  if (!t) throw new Error("DISCORD_BOT_TOKEN manquant")
  return t
}

function appId(): string {
  const id = process.env.DISCORD_APP_ID
  if (!id) throw new Error("DISCORD_APP_ID manquant")
  return id
}

async function discordFetch(method: string, path: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bot ${botToken()}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Discord API ${res.status}: ${text}`)
  }
  return res.json()
}

async function interactionFetch(method: string, path: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Discord interaction API ${res.status}: ${text}`)
  }
  const text = await res.text()
  if (!text) return null
  return JSON.parse(text)
}

export async function sendChannelMessage(
  channelId: string,
  content: string,
  components?: unknown[],
) {
  return discordFetch("POST", `/channels/${channelId}/messages`, {
    content,
    components,
    allowed_mentions: { parse: [] },
  })
}

export async function editMessage(
  channelId: string,
  messageId: string,
  content: string,
  components?: unknown[],
) {
  return discordFetch("PATCH", `/channels/${channelId}/messages/${messageId}`, {
    content,
    components,
  })
}

export async function createInteractionResponse(
  interactionId: string,
  interactionToken: string,
  type: number,
  data?: Record<string, unknown>,
) {
  return interactionFetch("POST", `/interactions/${interactionId}/${interactionToken}/callback`, {
    type,
    data,
  })
}

export async function editInteractionResponse(
  interactionToken: string,
  content: string,
  components?: unknown[],
) {
  return interactionFetch("PATCH", `/webhooks/${appId()}/${interactionToken}/messages/@original`, {
    content,
    components,
  })
}

export function verifyDiscordRequest(
  publicKey: string,
  signature: string,
  timestamp: string,
  rawBody: string,
): boolean {
  return nacl.sign.detached.verify(
    new TextEncoder().encode(timestamp + rawBody),
    hexToUint8Array(signature),
    hexToUint8Array(publicKey),
  )
}

function hexToUint8Array(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = Number.parseInt(hex.substring(i, i + 2), 16)
  }
  return bytes
}

export interface TopicButton {
  titre: string
  categorie: string
  description: string
}

export function buildTopicButtons(topics: TopicButton[]): unknown[] {
  return [
    {
      type: 1,
      components: topics.slice(0, 5).map((t, i) => ({
        type: 2,
        style: 1,
        label: `${i + 1}. ${t.titre.slice(0, 60)}`,
        custom_id: `t${i}`,
      })),
    },
  ]
}

export function buildConfirmButtons(slug: string): unknown[] {
  return [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 3,
          label: "✅ Publier",
          custom_id: `publish_${slug}`,
        },
        {
          type: 2,
          style: 4,
          label: "❌ Annuler",
          custom_id: `cancel_${slug}`,
        },
      ],
    },
  ]
}

export function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

const CATEGORY_EMOJIS: Record<string, string> = {
  bourses: "🎓",
  logement: "🏠",
  bouffe: "🍕",
  transport: "🚇",
  jobs: "💼",
  banque: "💰",
}

export function categoryEmoji(cat: string): string {
  return CATEGORY_EMOJIS[cat] || "📌"
}
