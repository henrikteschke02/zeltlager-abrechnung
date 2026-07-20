# Entwickler-Tagebuch

Kein Schaufenster — das hier erklärt, wie und warum Dinge gebaut wurden. Für das Was gibt es die readme.md.

---

## 2026-07-16 — CampingLoader & Grillfleisch

### Loader

Der alte Liquid-Loader hatte keinen Bezug zum Zeltlager-Thema. Ersetzt durch eine animierte Zeltlager-Szene von Uiverse (Zelt, Lagerfeuer, Bäume, Tag-Nacht-Zyklus).

Das Problem beim Einbauen: Der Uiverse-Code nutzt Klassennamen wie `.time`, `.door`, `.fire`, `.smoke` — alles potenzielle globale Kollisionen. Lösung war CSS Modules. `CampingLoader.module.css` kapselt alles, der Compiler generiert zur Buildzeit eindeutige Hashes. Im JSX `className={styles.xxx}` durchgängig, camelCase statt kebab-case.

Dateien: `components/ui-verse/CampingLoader.module.css` (neu), `components/ui-verse/CampingLoader.tsx` (neu), `app/dashboard/loading.tsx` (Import umgehängt).

### Grillfleisch-Seite

Aufbau exakt nach dem Muster der Getränke-Seite: Auth-Guard in der Server-Page, interaktiver Teil in einer separaten Client-Komponente. `CamperGrillDashboard` hat seinen eigenen State — kein geteilter Context mit Getränken.

Die DB-Tabellen existieren noch nicht. Alle Supabase-Calls sind als `TODO:` vorbereitet; bis dahin laufen vier Fleischsorten als Dummy-Daten.

Dateien: `components/camper-grill-dashboard.tsx` (neu), `app/dashboard/grillfleisch/page.tsx` (neu), `app/dashboard/admin/grillfleisch/page.tsx` (Placeholder), `public/images/{steak,bratwurst,bauchspeck,haehnchen}.png`.

---

## 2026-07-16 — Getränke-UI-Sync

Nach dem Editorial-Overhaul hatte die Getränke-Seite noch das alte Layout — zentrierte Icons, `bg-card`-Token für den Deckel.

Deckel-Karte: `bg-card text-card-foreground` durch `style={{ backgroundColor: "#E5E4DE", color: "#4c503d" }}` ersetzt. Grund: theme-abhängige Tokens verhalten sich im Darkmode nicht vorhersehbar. Hart-kodierte Werte sind zuverlässiger.

Getränke-Grid: Von `<button>` mit zentriertem Icon auf Flex-Column umgebaut. Oben `aspect-square`-Bildbereich, unten Name/Preis links und `+1`-Badge rechts. Glassmorphism via `bg-white/5 backdrop-blur-md border-white/10`, Hover-Glow in `#D9FF3D`.

Dateien: `components/camper-beverage-dashboard.tsx` — zwei Stellen: Deckel-Card und Beverage-Button.

---

## 2026-07-16 → 2026-07-20 — Drink-Fotografie

### Erste Runde: Gläser

Sechs Glas-Fotos auf olivem Hintergrund `#4c503d`. Gleichzeitig `getBeverageImage()` eingebaut — mappt den DB-Getränkenamen per case-insensitiver Keyword-Suche auf einen Bildpfad. Kein Match → `null` → SVG-Icon-Fallback. `next/image` mit `fill` + `object-cover` sorgt dafür, dass die Bilder den quadratischen Bereich sauber ausfüllen.

### Zweite Runde: Markenflaschen

Glas-Fotos durch stehende Markenflaschen ersetzt — 10 Produkte, gleicher Olivhintergrund. Neu: Veltins, Fassbrause, Emsland Wasser, Sprite, Krombacher Radler, Bitburger Radler jeweils mit eigenem Bild.

Wichtig beim Mapping: spezifischere Patterns müssen vor allgemeineren stehen, sonst zieht `"Bitburger Radler"` das Pils-Bild. Reihenfolge im Code:

1. Schöfferhofer / grapefruit
2. Krombacher + radler
3. Bitburger + radler
4. radler (Fallback)
5. Bitburger / 0,0 / 0.0
6. Veltins, Fassbrause, Wasser/Emsland, Cola, Fanta, Sprite, Mate/Mio

Dateien: `components/camper-beverage-dashboard.tsx` (Image-Import, Mapping erweitert), `public/images/drinks/*.png` (10 Fotos, überschreiben die alten).

---

## 2026-07-20 — ai-anweisungen.md

Neue Datei im Root, damit KI-Sessions den nötigen Kontext mitbekommen ohne alles neu erklären zu müssen. Fünf Abschnitte: Projektübersicht, Dokumentations-Regeln (README vs. progress.md), Trigger-Befehl für Doku-Updates, Design-Tokens, Text-Humanizer-Styleguide.

Dateien: `ai-anweisungen.md` (neu).
