# Zeltlager Manager 🏕️

Eine moderne Web-App zur digitalen Verwaltung von Getränken und Grillfleisch auf Zeltlagern. Die Anwendung ersetzt den klassischen Strichlisten-Bierdeckel aus Papier durch ein echtzeitfähiges Dashboard im "High-End Editorial"-Design.

## 🚀 Core Features

- **Digitale Deckel:** Getrennte Abrechnungskonten für Getränke und Grillfleisch.
- **Echtzeit-Synchronisation:** Buchungen werden über WebSockets sofort auf allen Geräten aktualisiert.
- **Gamification & Leaderboard:** "Bierkönig"-Rangliste und eine spielerische Promille-Anzeige ("Zeltlager-Elch") mit automatischem Reset um 7:00 Uhr morgens.
- **Sicherheits-Features:** 3-Minuten-Storno für versehentliche Klicks. Manuelle Account-Vergabe durch Admins (um E-Mail-Verifizierungen auf dem Zeltplatz zu vermeiden).
- **Editorial UI:** Hochwertiges Design (Olivgrün, Beige, Neon-Limette) mit Glassmorphism-Elementen und fotorealistischen Produktbildern.

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router)
- **Backend & Auth:** Supabase (PostgreSQL, Realtime, Authentication)
- **Styling:** Tailwind CSS
- **Sprache:** TypeScript

## 💻 Lokale Installation

Um das Projekt lokal auszuführen, müssen Node.js und npm installiert sein. Außerdem wird ein Supabase-Projekt benötigt.

**1. Repository klonen und Abhängigkeiten installieren:**
```bash
npm install
```

**2. Umgebungsvariablen einrichten:**
Erstelle eine `.env.local` Datei im Root-Verzeichnis und füge die Supabase-Schlüssel hinzu:
```env
NEXT_PUBLIC_SUPABASE_URL=deine-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-supabase-anon-key
```

**3. Entwicklungsserver starten:**
```bash
npm run dev
```
Die App ist nun unter `http://localhost:3000` erreichbar.
