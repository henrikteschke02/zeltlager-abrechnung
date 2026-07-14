# zeltlager-abrechnung
Digitale Getränke/Fleisch/Brötchen-Strichliste für mobile Endgeräte

Zeltlager Manager (3-in-1 Abrechnungs-App)

Modulare Web-App zur Digitalisierung der Lager-Abrechnung (Getränke, Grillfleisch, Brötchen). Next.js + Supabase.

Problem

Klassische Zettel-Abrechnung bei Zeltlagern führt zu:


Fehlerquoten durch aufgeweichte Papierlisten am Kühlwagen
fehlender Übersicht ("was hab ich schon getrunken?")
stundenlanger manueller Endabrechnung am letzten Tag


Lösung

Jeder Camper hat einen Account, trägt Konsum in Echtzeit ein, die Endabrechnung läuft automatisch.

Entstehungsgeschichte: erster MVP mit Lovable gebaut, diese Version ist der Rewrite mit robuster Architektur.

Module

Getränke-Deckel


Mobile-First, große Touch-Ziele für Bedienung am Kühlwagen
Animierter "Pegel-Elch" als Tagesanzeige (Reset 6:00 Uhr)
"Hydration Hero" – Auszeichnung für meisten Wasserkonsum


Grillfleisch-Umlage


Erfassung pro Tag/Person, faire Kostenteilung


Brötchen-Bestellsystem


Digitale Vorbestellung, automatische Kontobelastung


Tech-Stack


Frontend: Next.js (App Router), React, Tailwind CSS, shadcn/ui
Backend/Auth: Supabase (PostgreSQL, Row Level Security)
Animation: Framer Motion


Status

In aktiver Entwicklung.
