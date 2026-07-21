# Zeltlager Manager 🏕️

🌍 **Live-Version:** [zeltlager-abrechnung.vercel.app](https://zeltlager-abrechnung.vercel.app)

Eine moderne Web-App zur digitalen Verwaltung von Getränken und Grillfleisch auf Zeltlagern. Die Anwendung ersetzt den klassischen Strichlisten-Bierdeckel durch ein echtzeitfähiges Dashboard im "High-End Editorial"-Design.

## 🚀 Core Features
- **Digitale Deckel:** Getrennte, echtzeit-synchronisierte Abrechnungskonten für Getränke und Grillfleisch, jeweils mit vollumfänglicher Admin-Verwaltung.
- **Gamification:** "Bierkönig"-Rangliste und spielerische Promille-Anzeige ("Zeltlager-Elch") mit täglichem Auto-Reset um 7:00 Uhr.
- **Fehlertoleranz:** 3-Minuten-Stornofunktion für versehentliche Buchungen.
- **Admin-Auth:** Manuelle Account-Vergabe zur Umgehung von E-Mail-Verifizierungen auf dem Zeltplatz.
- **Premium UI:** Hochwertiges Glassmorphism-Design (Olivgrün/Neon-Limette) mit animiertem Tag/Nacht-Camping-Loader.
- **Brötchen-Deckel:** Eigenes Modul analog zu Getränken/Grillfleisch, mit Mengen-Stepper (Plus/Minus) und Admin-CRUD.
- **Schwarzes Brett:** Zentrale Ankündigungs- und Infoseite für alle Camper, mit echter Autor-Zuordnung und Lösch-Anfragen-System.
- **Gesamtabrechnung & Statistik:** Zentrale Statistik-Seite mit rollenbasierter Ansicht (Admins sehen alle Camper inkl. CSV-Export, Camper sehen ihren eigenen "Kassenbon" mit Einzelposten).
- **Profil-Verwaltung:** Selbstständige Pflege von Name, Telefonnummer und Mitgliedern (für Familien- oder Gruppen-Accounts) direkt im Dashboard.
- **Light & Dark Mode:** Beide Modi mit exakt abgestimmten Kontrastwerten für optimale Lesbarkeit.

## 🛠️ Tech Stack
- **Frontend:** Next.js (App Router), Tailwind CSS, shadcn/ui
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
