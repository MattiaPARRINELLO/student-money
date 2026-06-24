"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [focused, setFocused] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email || !email.includes("@")) {
      setStatus("error")
      setMessage("Veuillez entrer une adresse email valide.")
      return
    }
    setStatus("loading")
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus("success")
        setMessage("Merci ! Vous êtes bien inscrit à la newsletter.")
        setEmail("")
      } else {
        setStatus("error")
        setMessage(data.error || "Une erreur est survenue.")
      }
    } catch {
      setStatus("error")
      setMessage("Erreur réseau. Veuillez réessayer.")
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex flex-col gap-3 sm:flex-row",
          status === "success" && "animate-scale-in"
        )}
      >
        <div className="relative flex-1">
          <Input
            type="email"
            placeholder="ton.email@exemple.fr"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (status !== "idle") setStatus("idle")
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className={cn(
              "h-12 rounded-xl border-2 bg-background/80 backdrop-blur pl-10 pr-4 transition-all duration-300",
              focused && "border-primary/60 shadow-lg shadow-primary/10",
              !focused && "border-border",
              status === "error" && "border-destructive/60"
            )}
            disabled={status === "loading"}
          />
          <Send className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-all duration-300",
            focused ? "text-primary" : "text-muted-foreground/50"
          )} />
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={status === "loading"}
          className={cn(
            "h-12 rounded-xl px-6 transition-all duration-300",
            "shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-105",
            status === "success" && "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
          )}
        >
          {status === "loading" ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Inscription...
            </span>
          ) : status === "success" ? (
            <span className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Inscrit !
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Je m&apos;inscris
              <Send className="h-4 w-4" />
            </span>
          )}
        </Button>
      </form>
      {status !== "idle" && message && (
        <p
          className={cn(
            "mt-3 flex items-center justify-center gap-1.5 text-sm font-medium animate-fade-in-up",
            status === "success" ? "text-emerald-600" : "text-destructive"
          )}
        >
          {status === "success" ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {message}
        </p>
      )}
    </div>
  )
}
