-- Add an OTP column to deliveries table for secure pickup verification
ALTER TABLE deliveries
  ADD COLUMN IF NOT EXISTS pickup_otp VARCHAR(6);
