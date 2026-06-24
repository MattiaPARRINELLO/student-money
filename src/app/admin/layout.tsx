import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"
import { LogoutButton } from "./logout-button"

export const metadata: Metadata = {
  title: "Admin — Student-Money",
  robots: { index: false, follow: false },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const heads = await headers()
  const pathname = heads.get("x-pathname") || ""

  const isLoginPage = pathname === "/admin/login"

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {!isLoginPage && (
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <Link
              href="/admin"
              className="text-2xl font-bold tracking-tight hover:text-primary transition-colors"
            >
              Administration
            </Link>
            <LogoutButton />
          </div>
          <nav className="flex flex-wrap gap-1 text-sm">
            <Link href="/admin" className="rounded-md px-3 py-1.5 transition-colors hover:bg-muted">
              Dashboard
            </Link>
            <Link href="/admin/nouveau" className="rounded-md px-3 py-1.5 transition-colors hover:bg-muted">
              Nouvel article
            </Link>
            <Link href="/admin/drafts" className="rounded-md px-3 py-1.5 transition-colors hover:bg-muted">
              Brouillons
            </Link>
            <Link href="/admin/discord" className="rounded-md px-3 py-1.5 transition-colors hover:bg-muted">
              Discord
            </Link>
          </nav>
        </div>
      )}
      {children}
    </div>
  )
}
