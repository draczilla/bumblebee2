/*
  # Create users table for MLM referral system

  1. New Tables
    - `users`
      - `id` (serial, primary key)
      - `public_id` (uuid, unique, default gen_random_uuid())
      - `email` (varchar, unique)
      - `password_hash` (varchar)
      - `referral_code` (varchar, unique)
      - `referred_by_id` (integer, foreign key to users.id)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `users` table
    - Add policy for service role to manage all users
    - Add policy for authenticated users to read their own data
    - Add policy for authenticated users to update their own data

  3. Indexes
    - Email index for fast lookups
    - Referral code index for fast lookups
    - Referred by ID index for hierarchy queries
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  public_id UUID UNIQUE DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  referral_code VARCHAR(10) UNIQUE NOT NULL,
  referred_by_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referred_by_id ON users(referred_by_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for service role to manage all users (for API operations)
CREATE POLICY "Service role can manage all users"
  ON users
  FOR ALL
  TO public
  USING (auth.role() = 'service_role');

-- Policy for authenticated users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO public
  USING (auth.uid()::text = public_id::text);

-- Policy for authenticated users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO public
  USING (auth.uid()::text = public_id::text);