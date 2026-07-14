-- Migration: Enable Realtime for Dashboard & News Tables

-- Tabellen zur Supabase Realtime Publication hinzufügen.
-- Wenn sie schon existieren, wird der Fehler durch den do block gefangen, oder man nutzt ALTER PUBLICATION.
-- Da Supabase keine saubere 'ADD TABLE IF NOT EXISTS' syntax für PUBLICATIONS hat,
-- nutzen wir einen sicheren PL/pgSQL block, oder fügen sie einfach hinzu, wenn sie nicht drin sind.

BEGIN;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'consumptions'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE consumptions;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'news'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE news;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'news_delete_requests'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE news_delete_requests;
    END IF;
END $$;

COMMIT;
