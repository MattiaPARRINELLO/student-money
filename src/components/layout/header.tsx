"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, ChevronDown, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  { slug: "bourses", label: "Bourses & Aides" },
  { slug: "logement", label: "Logement" },
  { slug: "bouffe", label: "Alimentation" },
  { slug: "transport", label: "Transport" },
  { slug: "jobs", label: "Jobs étudiants" },
  { slug: "banque", label: "Banque & Épargne" },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b shadow-sm"
          : "bg-background/95 backdrop-blur border-b border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="group flex items-center gap-2 text-xl font-bold tracking-tight text-primary transition-all hover:scale-105"
        >
          <Sparkles className="h-5 w-5 transition-transform group-hover:rotate-12" />
          Student-Money
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="relative text-sm font-medium text-muted-foreground hover:text-primary transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
          >
            Accueil
          </Link>
          <Link
            href="/articles"
            className="relative text-sm font-medium text-muted-foreground hover:text-primary transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
          >
            Articles
          </Link>
          <div className="relative">
            <button
              onClick={() => setCatOpen(!catOpen)}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Catégories
              <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", catOpen && "rotate-180")} />
            </button>
            {catOpen && (
              <div className="absolute left-0 top-full mt-2 w-52 rounded-xl border bg-card/95 backdrop-blur-xl p-2 shadow-xl animate-slide-down">
                <div className="fixed inset-0 z-[-1]" onClick={() => setCatOpen(false)} />
                {CATEGORIES.map((cat, i) => (
                  <Link
                    key={cat.slug}
                    href={`/articles?categorie=${cat.slug}`}
                    onClick={() => setCatOpen(false)}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm hover:bg-accent transition-all hover:translate-x-1 animate-fade-in-up animate-stagger-" + (i + 1)
                    )}
                  >
                    {cat.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link
            href="/#newsletter"
            className="relative text-sm font-medium text-muted-foreground hover:text-primary transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all hover:after:w-full"
          >
            Newsletter
          </Link>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden transition-transform hover:scale-110"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <nav className="animate-slide-down border-t bg-background/95 backdrop-blur-xl px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium hover:text-primary transition-colors animate-fade-in-left"
            >
              Accueil
            </Link>
            <Link
              href="/articles"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium hover:text-primary transition-colors animate-fade-in-left animate-stagger-1"
            >
              Articles
            </Link>
            <p className="text-sm font-semibold text-muted-foreground animate-fade-in-left animate-stagger-2">
              Catégories
            </p>
            {CATEGORIES.map((cat, i) => (
              <Link
                key={cat.slug}
                href={`/articles?categorie=${cat.slug}`}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "pl-3 text-sm hover:text-primary transition-all hover:translate-x-1 animate-fade-in-left",
                  i === 0 && "animate-stagger-2",
                  i === 1 && "animate-stagger-3",
                  i === 2 && "animate-stagger-4",
                  i === 3 && "animate-stagger-5",
                  i === 4 && "animate-stagger-6",
                  i === 5 && "animate-stagger-7"
                )}
              >
                {cat.label}
              </Link>
            ))}
            <Link
              href="/#newsletter"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium hover:text-primary transition-colors animate-fade-in-left"
              style={{ animationDelay: "0.8s" }}
            >
              Newsletter
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
