# Zeltlager Manager

Live-Version: [zeltlager-abrechnung.vercel.app](https://zeltlager-abrechnung.vercel.app)

Eine moderne Web-App zur digitalen Verwaltung von Getränken und Grillfleisch auf Zeltlagern. Die Anwendung ersetzt den klassischen Strichlisten-Bierdeckel durch ein echtzeitfähiges Dashboard im "High-End Editorial"-Design.

## Core Features
- Die App bietet getrennte, in Echtzeit synchronisierte Abrechnungskonten für Getränke und Grillfleisch, die sich jeweils über den administrativen Bereich vollständig verwalten lassen. Für Brötchen-Bestellungen steht zudem ein ganz ähnliches Modul zur Verfügung, das zusätzlich über einen praktischen Mengen-Stepper verfügt.
- Um den Spaß auf dem Zeltplatz zu fördern, kürt eine Rangliste fortlaufend den aktuellen Bierkönig. Ergänzt wird das durch eine spielerische Promille-Anzeige, den sogenannten Zeltlager-Elch, die sich jeden Morgen um 7:00 Uhr automatisch zurücksetzt.
- Falls man sich am Tresen einmal vertippt hat, schützt eine Fehlertoleranz vor falschen Abrechnungen. Versehentliche Buchungen können so innerhalb von drei Minuten unkompliziert wieder storniert werden.
- Da der Internetempfang auf Zeltplätzen oft mäßig ist, erfolgt die Vergabe von Accounts manuell durch die Lagerleitung. Das umgeht fehleranfällige E-Mail-Verifizierungen bei der Ersteinrichtung.
- Das optische Grundgerüst baut auf einem hochwertigen Glassmorphism-Design in Olivgrün und Neon-Limette auf. Abgerundet wird die Benutzeroberfläche durch kleine Details wie einen animierten Tag-Nacht-Camping-Loader.
- Für Ankündigungen und allgemeine Infos gibt es ein zentrales schwarzes Brett. Hier lassen sich Beiträge eindeutig dem jeweiligen Autor zuordnen und über ein Anfragen-System auch wieder löschen.
- Die Auswertung am Ende des Lagers wird über eine zentrale Statistik-Seite gelöst. Während Admins den Gesamtüberblick über alle Teilnehmer haben und die Daten als CSV exportieren können, sieht jeder Camper stets nur seinen eigenen detaillierten Kassenbon.
- Teilnehmer können ihr Profil selbstständig im Dashboard pflegen. Dort lassen sich Name, Telefonnummer und bei Bedarf auch weitere Mitglieder eintragen, was besonders praktisch ist, wenn sich beispielsweise eine Familie oder Gruppe einen gemeinsamen Account teilt.
- Das Theming der App lässt sich flexibel anpassen und bietet exakt abgestimmte Kontrastwerte für optimale Lesbarkeit, egal welchen Modus man bevorzugt.

## Tech Stack
- Frontend: Next.js (App Router), Tailwind CSS, shadcn/ui
- Backend: Supabase (PostgreSQL, Realtime, Auth)
- Hosting: Vercel

## Lokale Installation

1. Repository klonen & Abhängigkeiten installieren:
```bash
npm install
```

2. Umgebungsvariablen einrichten:
Erstelle eine `.env.local` Datei im Root-Verzeichnis:
```env
NEXT_PUBLIC_SUPABASE_URL=deine-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-supabase-anon-key
```

3. Entwicklungsserver starten:
```bash
npm run dev
```
