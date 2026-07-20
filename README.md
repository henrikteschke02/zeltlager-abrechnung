# Zeltlager Manager 🏕️

🌍 **Live-Version:** [zeltlager-abrechnung.vercel.app](https://zeltlager-abrechnung.vercel.app)

Eine moderne Web-App zur digitalen Verwaltung von Getränken und Grillfleisch auf Zeltlagern. Die Anwendung ersetzt den klassischen Strichlisten-Bierdeckel durch ein echtzeitfähiges Dashboard im "High-End Editorial"-Design.

## 🚀 Core Features
- **Digitale Deckel:** Getrennte, echtzeit-synchronisierte Abrechnungskonten für Getränke und Grillfleisch.
- **Gamification:** "Bierkönig"-Rangliste und spielerische Promille-Anzeige ("Zeltlager-Elch") mit täglichem Auto-Reset um 7:00 Uhr.
- **Fehlertoleranz:** 3-Minuten-Stornofunktion für versehentliche Buchungen.
- **Admin-Auth:** Manuelle Account-Vergabe zur Umgehung von E-Mail-Verifizierungen auf dem Zeltplatz.
- **Premium UI:** Hochwertiges Glassmorphism-Design (Olivgrün/Neon-Limette) mit animiertem Tag/Nacht-Camping-Loader.

## 🛠️ Tech Stack
- **Frontend:** Next.js (App Router), Tailwind CSS
- **Backend:** Supabase (PostgreSQL, Realtime, Auth)
- **Hosting:** Vercel

## 💻 Lokale Installation

**1. Repository klonen & Abhängigkeiten installieren:**
```bash
npm install
```

**2. Umgebungsvariablen einrichten:**
Erstelle eine `.env.local` Datei im Root-Verzeichnis:
```env
NEXT_PUBLIC_SUPABASE_URL=deine-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-supabase-anon-key
```

**3. Entwicklungsserver starten:**
```bash
npm run dev
```
