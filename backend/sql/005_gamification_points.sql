-- ============================================================
-- Gamification Schema Update
-- Adding green_points to restaurants to mirror volunteers
-- ============================================================

ALTER TABLE public.restaurants 
  ADD COLUMN IF NOT EXISTS green_points INT DEFAULT 0;

ALTER TABLE public.volunteers 
  ADD COLUMN IF NOT EXISTS green_points INT DEFAULT 0;
