// CRUD-Panel für Grillfleisch-Verwaltung
// Hier kommen später:
// - Neue Fleischsorten anlegen (Name, Preis, Bild-Upload)
// - Bestehende Sorten bearbeiten / löschen
// - Übersicht aller gebuchten Grill-Posten
// - Manuelles Stornieren durch Admins

export default function AdminGrillfleischPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <span className="text-6xl">🔥</span>
      <h1 className="text-2xl font-serif font-bold">Grillfleisch-Verwaltung</h1>
      <p className="text-muted-foreground text-sm max-w-sm">
        Das Admin-Panel für Grillfleisch wird hier gebaut. Platzhalter aktiv.
      </p>
    </div>
  )
}
