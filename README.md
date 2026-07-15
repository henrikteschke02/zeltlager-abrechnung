# zeltlager-abrechnung
Digitale Getränke/Fleisch/Brötchen-Strichliste für mobile Endgeräte

Zeltlager Manager (3-in-1 Abrechnungs-App)

Modulare Web-App zur Digitalisierung der Lager-Abrechnung (Getränke, Grillfleisch, Brötchen). Next.js + Supabase.

Problem

Klassische Zettel-Abrechnung bei Zeltlagern führt zu:

- Fehlerquoten durch aufgeweichte Papierlisten am Kühlwagen
- fehlender Übersicht ("was hab ich schon getrunken?")
- stundenlanger manueller Endabrechnung am letzten Tag

Lösung

Jeder Camper hat einen Account, trägt Konsum in Echtzeit ein, die Endabrechnung läuft automatisch.

Entstehungsgeschichte: erster MVP mit Lovable gebaut, diese Version ist der Rewrite mit robuster Architektur.

Module

Getränke-Deckel

- Mobile-First, große Touch-Ziele für Bedienung am Kühlwagen
- Animierter "Pegel-Elch" als Tagesanzeige mit 21 Betrunkenheits-Stufen (Reset 7:00 Uhr)
- "Hydration Hero" – Auszeichnung für meisten Wasserkonsum

Grillfleisch-Umlage

- Erfassung pro Tag/Person, faire Kostenteilung

Brötchen-Bestellsystem

- Digitale Vorbestellung, automatische Kontobelastung

Tech-Stack

- Frontend: Next.js (App Router), React, Tailwind CSS, shadcn/ui
- Backend/Auth: Supabase (PostgreSQL, Row Level Security)
- Animation: Framer Motion

Status

In aktiver Entwicklung. 

**🚀 Live-Status:** Die App wird erfolgreich über **Vercel** gehostet und ist für alle Camper rund um die Uhr online verfügbar. Alle Daten sind dank Supabase synchronisiert.

---

## Next.js Setup

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## Aktueller Entwicklungsstand (Changelog)

### Phase 1: Foundation & Auth
- **Setup:** Next.js 15+ (App Router), Tailwind CSS, shadcn/ui.
- **Theming:** Darkmode Support (`next-themes`, `lucide-react`).
- **Supabase Auth:** E-Mail/Passwort Authentifizierung mit serverseitigen Sessions.
- **Pages:** `/login`, `/register`, sowie ein durch Middleware geschütztes `/dashboard`.

### Phase 2: Getränkeabrechnung - Rollen & Admin-Panel
- **Datenbank & Rollen-System:** 
  - `profiles` Tabelle referenziert `auth.users`.
  - Postgres Trigger legt bei Registrierung automatisch ein Profil mit der Rolle `camper` an.
- **Sicherheits-Fix (RLS):**
  - Um einen _infinite recursion error_ bei den Row Level Security Policies zu vermeiden, wird die Admin-Überprüfung über eine dedizierte Helper-Funktion (`is_admin()` mit `SECURITY DEFINER`) durchgeführt.
- **Admin-Dashboard (`/dashboard/admin`):**
  - Serverseitig geschützt (Zugriff nur mit `role = 'admin'`).
  - Verwalten von Getränken (Tabelle `beverages`) inkl. Hinzufügen, Löschen und Preisänderung über shadcn/ui Dialoge.
  - Umbenennen von Getränken nachträglich möglich.
  - Read-Only Übersicht aller registrierten Profile (`profiles`).
- **Konsum-Tracking:** Die Tabelle `consumptions` steht bereit und sichert via RLS, dass Camper nur ihre eigenen Einträge lesen und schreiben können, während Admins alles einsehen dürfen.

### Phase 3 & 4: Camper-Frontend, Stornos & Profil-Vollständigkeit
- **Mobile-First Camper Dashboard (`/dashboard/getraenke`):**
  - Riesige Buttons für schnelle Buchungen am Kühlwagen (Optimistic UI Updates).
  - Anzeige des aktuellen Deckels (Gesamtschulden) und des Tagespegels.
  - Reset des Tagespegels automatisch um exakt 07:00 Uhr morgens (Lösen des "Mitternachts-Bugs").
- **3-Minuten-Storno:**
  - Neue UI-Sektion für kürzliche Buchungen mit Live-Countdown.
  - Camper können Fehlklicks innerhalb von 3 Minuten rückgängig machen.
  - RLS-Absicherung in Supabase erlaubt serverseitig keine `DELETE`s nach Ablauf dieser 3 Minuten.
- **Profil-Pflicht & Avatar-Upload:**
  - Zwingende Profil-Vervollständigung (Name) beim ersten Login.
  - Optional können Camper eine Telefonnummer angeben.
  - Profilbilder können hochgeladen werden und werden sicher im Supabase Storage Bucket (`avatars`) gespeichert.

### Phase 5 & 6: Gamification, Realtime & Admin-Features
- **Leaderboard & Statistiken (`/dashboard/leaderboard`):**
  - Live-Rangliste (Wer hat wie viel getrunken?) inkl. exklusivem **Bierkönig 👑**-Badge.
  - Globale Lager-Statistik (Wie viel wurde im gesamten Lager von welchem Getränk konsumiert?).
  - Persönliche Übersicht auf dem Deckel ("Meine Statistiken").
- **Echtzeit-Updates (Supabase Realtime):**
  - Das Leaderboard, der persönliche Deckel (inkl. Tages-Pegel) sowie das Schwarze Brett aktualisieren sich live und synchron auf allen Geräten, ohne die Seite neu laden zu müssen.
- **Quality-of-Life UI & Ergonomie:**
  - Kompaktes, *sticky* Deckel-Design. Ein Klick wechselt animiert zwischen "Gesamtdeckel" und "Tagesdeckel".
  - **Zeltlager-Elch Gamification:** Der Tagespegel berechnet Punkte pro Getränk (z.B. +1.0 Bier, -1.0 Wasser) und ändert den Elch in 21 Stufen (vom "Nüchternen Elch" bis zum "Legenden-Elch").
  - Sicheres Buchen: Klick auf ein Getränk öffnet ein Mengen-Auswahl-Popup statt direkt zu buchen (verhindert Fehlklicks).
  - Kisten-Schnellbuchung: Admins können "Bundle-Größen" (z.B. 24) hinterlegen, woraufhin ein Schnell-Button im Popup erscheint.
  - Maßgeschneiderte, flache Vektor-SVGs für jedes Getränk (Bierkrug, Becher mit Halm, etc.) ersetzen herkömmliche Emojis für einen aufgeräumten, professionellen Look.
- **Kassenwart CSV-Export:**
  - Admins können die Endabrechnung (Gesamtkosten und Menge pro Camper) als Excel-kompatible `.csv`-Datei exportieren.
- **Schwarzes Brett (News) & Löschanfragen:**
  - Alle angemeldeten Camper können auf dem Haupt-Dashboard Durchsagen in Echtzeit veröffentlichen.
  - Ersteller und Admins können Posts direkt löschen.
  - Fremde Nutzer können eine Löschfreigabe anfragen. Der Ersteller sieht dann ein Genehmigungs-Panel, über das er die Anfrage erlauben oder ablehnen kann.

### Phase 7: Live-Deployment & Hosting

* **Cloud-Hosting (Vercel):**
  * Die App ist erfolgreich auf Vercel deployed und rund um die Uhr für alle Camper erreichbar.
  * Automatische CI/CD-Pipeline: Jeder Push in den `main`-Branch auf GitHub (z.B. neue Features oder Bugfixes) löst automatisch einen neuen Build bei Vercel aus.
  * **Build-Striktheit & Git-Tracking:** Vercel erzwingt strikte TypeScript/ESLint-Regeln und baut nur Dateien, die explizit in Git getrackt werden (Vorsicht bei neu erstellten Dateien und `git commit -a`!).
* **Datenbank-Anbindung (Supabase):**
  * Die Next.js App kommuniziert nahtlos mit der Supabase-Datenbank in der Cloud.
  * Sichere Integration der Datenbank-Schlüssel über Vercel Environment Variables (`NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

### Phase 8: Sicherheit & Admin-Freigabesystem (Approval Workflow)

* **Warteraum & Freigaben:**
  * Neue Nutzer können sich registrieren, müssen jedoch ihr Profil (Name, Handynummer) ausfüllen.
  * Anschließend landen sie im "Warteraum" und können das Dashboard noch nicht sehen oder nutzen.
* **Admin-Kontrolle:**
  * Admins sehen im Admin-Dashboard eine Liste der offenen Freigaben (inklusive Name, Email und Telefonnummer).
  * Admins können Nutzer per Klick auf "Annehmen" freischalten oder mit "Ablehnen" das Profil löschen.
* **RESTRICTIVE Row Level Security:**
  * Auf Datenbankebene sind alle Lese- und Schreibzugriffe auf Konsum-Einträge, News etc. strikt blockiert, solange das eigene Profil nicht explizit auf `is_approved = true` gesetzt wurde.

### Phase 9: Security Audit & Secrets Management
- **Audit bestanden:** Die Codebase wurde auf Hardcoded Secrets (z.B. `SUPABASE_SERVICE_ROLE_KEY`, DB-Strings, JWTs) sowie auf `.env` Leaks in der Git-Historie geprüft. Alle Verbindungen laufen sicher über `NEXT_PUBLIC` Environment Variables.

### Nächste Schritte (Noch fehlend)
- **Modul: Grillfleisch-Umlage (`/dashboard/grillfleisch`):**
  - Erfassung des täglichen Fleischbedarfs pro Camper.
  - Berechnung der fairen Kostenteilung (Umlage am Ende des Lagers).
- **Modul: Brötchen-Bestellsystem (`/dashboard/broetchen`):**
  - Digitale Vorbestellung für den nächsten Morgen.
  - Automatische Belastung des Camper-Deckels basierend auf den Bäckerei-Preisen.
