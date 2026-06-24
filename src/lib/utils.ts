import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric", month: "long", day: "numeric"
  })
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
}

const CATEGORY_LABELS: Record<string, string> = {
  bourses: "Bourses & Aides",
  logement: "Logement",
  bouffe: "Alimentation",
  transport: "Transport",
  jobs: "Jobs étudiants",
  banque: "Banque & Épargne",
}

const CATEGORY_PALETTES = [
  "bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20",
  "bg-sky-50 text-sky-700 border-sky-200 ring-sky-600/20",
  "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20",
  "bg-violet-50 text-violet-700 border-violet-200 ring-violet-600/20",
  "bg-orange-50 text-orange-700 border-orange-200 ring-orange-600/20",
  "bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20",
  "bg-cyan-50 text-cyan-700 border-cyan-200 ring-cyan-600/20",
  "bg-lime-50 text-lime-700 border-lime-200 ring-lime-600/20",
  "bg-pink-50 text-pink-700 border-pink-200 ring-pink-600/20",
  "bg-indigo-50 text-indigo-700 border-indigo-200 ring-indigo-600/20",
  "bg-teal-50 text-teal-700 border-teal-200 ring-teal-600/20",
  "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200 ring-fuchsia-600/20",
  "bg-yellow-50 text-yellow-700 border-yellow-200 ring-yellow-600/20",
  "bg-purple-50 text-purple-700 border-purple-200 ring-purple-600/20",
]

function hashString(s: string): number {
  let hash = 0
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash) + s.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const colorCache = new Map<string, string>()

export function getCategoryBadgeColor(cat: string): string {
  if (colorCache.has(cat)) return colorCache.get(cat)!
  const idx = hashString(cat) % CATEGORY_PALETTES.length
  const color = CATEGORY_PALETTES[idx]
  colorCache.set(cat, color)
  return color
}

export function formatCategory(cat?: string | null): string {
  if (!cat) return "Non classé"
  return CATEGORY_LABELS[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)
}
