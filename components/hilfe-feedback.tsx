"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Loader2, CheckCircle2, LifeBuoy } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export function HilfeFeedback({ userId }: { userId: string }) {
  const [feedback, setFeedback] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedback.trim()) return

    setLoading(true)
    const { error } = await supabase
      .from("feedback")
      .insert([{ user_id: userId, message: feedback }])

    setLoading(false)

    if (error) {
      alert("Fehler beim Senden deines Feedbacks. Bitte versuche es später noch einmal.")
      console.error(error)
    } else {
      setSuccess(true)
      setFeedback("")
      setTimeout(() => setSuccess(false), 5000)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hilfe & Feedback</h1>
        <p className="text-muted-foreground mt-2">
          Hier findest du Antworten auf häufige Fragen oder kannst dich direkt an das Orga-Team wenden.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Häufig gestellte Fragen (FAQ)</CardTitle>
          <CardDescription>Die wichtigsten Antworten im Überblick</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Wie funktioniert die Abrechnung?</AccordionTrigger>
              <AccordionContent>
                Alle deine Buchungen über die App (Getränke, Grillfleisch, Brötchen) werden auf deinem persönlichen Profil gespeichert. Am Ende des Zeltlagers (oder am Stichtag) wird aus allen deinen Buchungen eine Gesamtsumme gebildet, die du in bar bei der Kassenwartin oder dem Kassenwart bezahlen kannst. Du findest deine aktuelle Zwischensumme jederzeit unter dem Menüpunkt "Statistik".
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Was mache ich, wenn ich mich verbucht habe?</AccordionTrigger>
              <AccordionContent>
                Keine Panik! Du kannst jede Buchung innerhalb von 3 Minuten nach dem Eintragen direkt auf der jeweiligen Seite wieder stornieren. Ein Button "Rückgängig" erscheint dazu ganz oben. Solltest du den Fehler erst später bemerken, schreib uns einfach über das Feedback-Formular unten auf dieser Seite – das Orga-Team kann falsche Buchungen im Admin-Bereich stornieren.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Wo finde ich meine bisherigen Buchungen?</AccordionTrigger>
              <AccordionContent>
                Scrolle auf der jeweiligen Seite (z. B. "Getränke" oder "Grillfleisch") ganz nach unten. Dort findest du den Bereich "Meine Statistiken", der alle Artikel auflistet, die du bisher gebucht hast, zusammen mit den aufsummierten Kosten. Die Gesamtsumme all deiner Deckel findest du im Bereich "Statistik".
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <LifeBuoy className="w-5 h-5 text-primary" />
            Nachricht an das Orga-Team
          </CardTitle>
          <CardDescription>
            Hast du ein Problem mit der App, einen falschen Eintrag, der storniert werden muss, oder einfach einen Verbesserungsvorschlag? Lass es uns wissen!
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="flex flex-col items-center justify-center p-6 bg-green-500/10 border border-green-500/20 rounded-xl text-green-700 dark:text-green-400">
              <CheckCircle2 className="w-10 h-10 mb-2" />
              <p className="font-semibold text-center">Vielen Dank für dein Feedback!</p>
              <p className="text-sm text-center opacity-80 mt-1">Wir haben deine Nachricht erhalten und kümmern uns darum.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Deine Nachricht an uns..."
                className="min-h-[120px] resize-y"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required
              />
              <Button type="submit" disabled={loading || !feedback.trim()} className="w-full sm:w-auto">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Nachricht absenden
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
