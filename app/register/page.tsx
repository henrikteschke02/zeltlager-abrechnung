"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Tent, Loader2, MailCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/utils/supabase/client"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwörter stimmen nicht überein.")
      setLoading(false)
      return
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // If email confirmation is required, show success state instead of redirecting
    if (data.session === null) {
      setSuccess(true)
      setLoading(false)
      return
    }

    // Auto-confirmed (e.g. dev mode) – redirect straight to dashboard
    router.push("/dashboard")
    router.refresh()
  }

  if (success) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md shadow-lg border-primary/10 animate-in fade-in zoom-in duration-500">
          <CardHeader className="space-y-3 items-center text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-2">
              <MailCheck className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Fast geschafft!</CardTitle>
            <CardDescription className="text-base">
              Wir haben dir eine Bestätigungs-E-Mail geschickt an <strong>{email}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-center">
            <p className="text-sm text-muted-foreground">
              Bitte klicke auf den Link in der E-Mail, um deinen Account zu aktivieren. Danach kannst du dich einloggen.
            </p>
            <p className="text-sm font-semibold text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
              ✉️ Prüfe auch deinen Spam-Ordner, falls die Mail nicht ankommt!
            </p>
          </CardContent>
          <CardFooter className="flex justify-center text-sm text-muted-foreground border-t pt-4">
            <Link href="/login" className="text-primary hover:underline font-medium">
              Zurück zum Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="space-y-3 items-center text-center">
          <div className="bg-primary/10 p-3 rounded-full mb-2">
            <Tent className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Account erstellen</CardTitle>
          <CardDescription>
            Registriere dich für den Zeltlager Manager.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="camper@beispiel.de" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Passwort wiederholen</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {/* Email confirmation notice */}
            <p className="text-xs text-muted-foreground bg-muted rounded-lg p-3 border">
              ✉️ Nach der Registrierung erhältst du eine Bestätigungs-E-Mail. Bitte auch den{" "}
              <strong>Spam-Ordner</strong> prüfen!
            </p>
            {error && <p className="text-sm text-destructive font-medium">{error}</p>}
            <Button type="submit" className="w-full transition-all duration-200 hover:scale-105 active:scale-95" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Bitte warten...
                </>
              ) : (
                "Registrieren"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground border-t pt-4">
          Bereits einen Account?{" "}
          <Link href="/login" className="ml-1 text-primary hover:underline font-medium">
            Zum Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
