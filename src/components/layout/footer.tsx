import Link from "next/link"
import { Sparkles } from "lucide-react"

export default function Footer() {
  return (
    <footer className="relative border-t bg-card/50 backdrop-blur overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent" />
      <div className="relative mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-3">
          <div className="animate-fade-in-left">
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-bold text-primary transition-all hover:scale-105">
              <Sparkles className="h-5 w-5" />
              Student-Money
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Le blog qui aide les étudiants à faire des économies au quotidien.
            </p>
          </div>
          <div className="animate-fade-in-up animate-stagger-1">
            <p className="text-sm font-semibold">Liens utiles</p>
            <nav className="mt-3 flex flex-col gap-2">
              {[
                { href: "/", label: "Accueil" },
                { href: "/articles", label: "Articles" },
                { href: "/#newsletter", label: "Newsletter" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-flex items-center gap-1"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="animate-fade-in-right">
            <p className="text-sm font-semibold">Informations</p>
            <nav className="mt-3 flex flex-col gap-2">
              {[
                { href: "/a-propos", label: "À propos" },
                { href: "/contact", label: "Contact" },
                { href: "/mentions-legales", label: "Mentions légales" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-all hover:translate-x-1 inline-flex items-center gap-1"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <div className="mt-10 border-t pt-6 text-center text-sm text-muted-foreground animate-fade-in">
          © 2026 Student-Money. Tous droits réservés.
        </div>
      </div>
    </footer>
  )
}
