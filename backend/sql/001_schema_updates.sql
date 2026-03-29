-- ============================================================
-- The Hunger Signal — Schema Migration 001
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ── 1. Add KYC columns to volunteers table ──────────────────
ALTER TABLE volunteers
  ADD COLUMN IF NOT EXISTS id_document_url TEXT,
  ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'PENDING';

-- Add CHECK constraint for valid status values
ALTER TABLE volunteers
  ADD CONSTRAINT chk_approval_status
  CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED', 'BANNED'));

-- Index for fast filtering of pending volunteers
CREATE INDEX IF NOT EXISTS idx_volunteers_approval_status
  ON volunteers (approval_status);


-- ── 2. Create admins table ──────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  name       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Only service_role can read admins (backend server-side only)
CREATE POLICY "Service role can manage admins"
  ON admins
  FOR ALL
  USING (auth.role() = 'service_role');


-- ── 3. Seed initial admin user ──────────────────────────────
-- Replace with your actual admin email
INSERT INTO admins (email, name)
VALUES ('admin@sustainbite.com', 'System Administrator')
ON CONFLICT (email) DO NOTHING;


-- ── 4. Create Supabase Storage bucket for volunteer IDs ─────
-- NOTE: Run this via Supabase Dashboard > Storage > New Bucket
-- or use the following SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('volunteer_ids', 'volunteer_ids', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Authenticated users can upload to volunteer_ids
CREATE POLICY "Authenticated users can upload volunteer IDs"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'volunteer_ids'
    AND auth.role() = 'authenticated'
  );

-- Storage policy: Public read access for admin review
CREATE POLICY "Public read access for volunteer IDs"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'volunteer_ids');

-- Storage policy: Service role can delete (for cleanup)
CREATE POLICY "Service role can delete volunteer IDs"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'volunteer_ids'
    AND auth.role() = 'service_role'
  );
