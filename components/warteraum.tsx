import { Tent } from "lucide-react"

export function Warteraum() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in duration-500">
      <div className="bg-primary/10 p-6 rounded-full mb-6">
        <Tent className="h-16 w-16 text-primary" />
      </div>
      <h1 className="text-3xl font-bold mb-4 tracking-tight">Warteraum ⛺</h1>
      <p className="text-muted-foreground max-w-md text-lg">
        Dein Profil ist vollständig, muss aber noch von der Lagerleitung (Admin) freigeschaltet werden.
        Bitte habe etwas Geduld oder sprich das Team direkt an!
      </p>
    </div>
  )
}
