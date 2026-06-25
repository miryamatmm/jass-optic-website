-- Migration : dissociation RDV pro / particulier
-- Date : 2026-06-23
--
-- Avant : tous les créneaux et réservations sont considérés comme "pro"
-- Après : on distingue deux types, 'pro' (par défaut) et 'particulier'
--
-- À exécuter dans Supabase > SQL Editor (en prod + en dev si besoin)

-- 1) Slots : ajout d'une colonne `type`
ALTER TABLE slots
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'pro';

ALTER TABLE slots
  DROP CONSTRAINT IF EXISTS slots_type_check;

ALTER TABLE slots
  ADD CONSTRAINT slots_type_check
  CHECK (type IN ('pro', 'particulier'));

CREATE INDEX IF NOT EXISTS slots_type_idx
  ON slots (type);

-- 2) Reservations : ajout d'une colonne `type`
ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'pro';

ALTER TABLE reservations
  DROP CONSTRAINT IF EXISTS reservations_type_check;

ALTER TABLE reservations
  ADD CONSTRAINT reservations_type_check
  CHECK (type IN ('pro', 'particulier'));

CREATE INDEX IF NOT EXISTS reservations_type_idx
  ON reservations (type);