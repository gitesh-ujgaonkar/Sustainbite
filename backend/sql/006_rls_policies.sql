-- ============================================================
-- The Hunger Signal — Schema Migration 006
-- Run this in the Supabase SQL Editor
-- Feature: Row Level Security (RLS) Lockdown
-- ============================================================

-- ── 1. Enable Row Level Security natively ─────────────────────
ALTER TABLE "public"."restaurants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."volunteers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."deliveries" ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────────────────────
-- ── 2. Deliveries Table Policies ──────────────────────────────
-- ──────────────────────────────────────────────────────────────

-- [SELECT] Allow any authenticated user (Restaurant, Volunteer, Admin) to view all deliveries
-- CRITICAL for WebSocket `postgres_changes` streaming arrays logic on the Next.js Dashboards
CREATE POLICY "Allow authenticated read on deliveries" 
  ON "public"."deliveries" 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- [INSERT] Only allow Restaurants to create deliveries, and they must assign their own auth_id
CREATE POLICY "Allow authenticated insert on deliveries" 
  ON "public"."deliveries" 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = restaurant_id);

-- [UPDATE] Allow Restaurants to edit their food entries OR allow Volunteers to update the status claiming/cancelling
-- Uses conditional grouping checking both identities
CREATE POLICY "Allow authenticated update on deliveries" 
  ON "public"."deliveries" 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = restaurant_id OR auth.uid() = volunteer_id);

-- [DELETE] Strictly lock destructiveness down to ONLY the assigning Restaurant
CREATE POLICY "Allow authenticated delete on deliveries" 
  ON "public"."deliveries" 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = restaurant_id);


-- ──────────────────────────────────────────────────────────────
-- ── 3. Volunteers Table Policies ──────────────────────────────
-- ──────────────────────────────────────────────────────────────

-- [SELECT] Global authenticated read so Restaurants can see who is picking up their food
CREATE POLICY "Allow authenticated read on volunteers" 
  ON "public"."volunteers" 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- [INSERT] Allow users to register a volunteer profile upon sign up via Next.js Auth loop
CREATE POLICY "Allow authenticated insert on volunteers" 
  ON "public"."volunteers" 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

-- [UPDATE] Restrict updates to only the volunteer who owns the profile
CREATE POLICY "Allow authenticated update on volunteers" 
  ON "public"."volunteers" 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- [DELETE] Account deletion locked to self
CREATE POLICY "Allow authenticated delete on volunteers" 
  ON "public"."volunteers" 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = id);


-- ──────────────────────────────────────────────────────────────
-- ── 4. Restaurants Table Policies ─────────────────────────────
-- ──────────────────────────────────────────────────────────────

-- [SELECT] Global authenticated read so Volunteers see which restaurant created the active tasks
CREATE POLICY "Allow authenticated read on restaurants" 
  ON "public"."restaurants" 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- [INSERT] Allow users to register a restaurant profile natively 
CREATE POLICY "Allow authenticated insert on restaurants" 
  ON "public"."restaurants" 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);

-- [UPDATE] Restrict updates locally restricting to the restaurant who owns the profile
CREATE POLICY "Allow authenticated update on restaurants" 
  ON "public"."restaurants" 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- [DELETE] Account deletion locked to self natively
CREATE POLICY "Allow authenticated delete on restaurants" 
  ON "public"."restaurants" 
  FOR DELETE 
  TO authenticated 
  USING (auth.uid() = id);
