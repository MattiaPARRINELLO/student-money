import { NextResponse } from "next/server"

export async function GET() {
  const status = {
    bot_token: Boolean(process.env.DISCORD_BOT_TOKEN),
    app_id: Boolean(process.env.DISCORD_APP_ID),
    public_key: Boolean(process.env.DISCORD_PUBLIC_KEY),
    channel_id: Boolean(process.env.DISCORD_CHANNEL_ID),
    interactions_ok: Boolean(
      process.env.DISCORD_BOT_TOKEN &&
      process.env.DISCORD_APP_ID &&
      process.env.DISCORD_PUBLIC_KEY &&
      process.env.DISCORD_CHANNEL_ID,
    ),
  }
  return NextResponse.json(status)
}
