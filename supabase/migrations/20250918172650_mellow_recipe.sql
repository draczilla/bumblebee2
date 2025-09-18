/*
  # Create users table for MLM referral system

  1. New Tables
    - `users`
      - `id` (SERIAL PRIMARY KEY) - Internal unique identifier
      - `public_id` (UUID, UNIQUE) - Public-facing UUID for external references
      - `email` (VARCHAR(255), UNIQUE) - User's email address for authentication
      - `password_hash` (VARCHAR(255)) - Bcrypt hashed password
      - `referral_code` (VARCHAR(10), UNIQUE) - User's unique referral code to share
      - `referred_by_id` (INTEGER, FOREIGN KEY) - References the user who referred this user
      - `created_at` (TIMESTAMPTZ) - Account creation timestamp

  2. Indexes
    - Index on `referred_by_id` for efficient upline/downline queries
    - Unique indexes automatically created for UNIQUE constraints

  3. Security
    - Foreign key constraint ensures referral relationships are valid
    - ON DELETE SET NULL ensures user deletion doesn't break referral chains
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

-- Create index for efficient referral queries
CREATE INDEX IF NOT EXISTS idx_users_referred_by_id ON users(referred_by_id);

-- Create index for referral code lookups
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);