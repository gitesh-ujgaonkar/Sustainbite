-- ============================================================
-- The Hunger Signal — Schema Migration 002
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Add kyc_remarks column to volunteers table to store rejection reasons
ALTER TABLE volunteers
  ADD COLUMN IF NOT EXISTS kyc_remarks TEXT;
