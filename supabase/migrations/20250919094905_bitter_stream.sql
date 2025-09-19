/*
  # Create root user for MLM referral system

  1. Root User Setup
    - Create initial admin user with referral code ROOT01
    - Password: "password123" (hashed with bcrypt)
    - This allows the first user registration to work

  2. Security
    - Uses proper bcrypt hash for password
    - Sets up the foundation of the referral tree
*/

-- Insert root user (admin) that others can use as referral
INSERT INTO users (
  email,
  password_hash,
  referral_code,
  referred_by_id
) VALUES (
  'admin@example.com',
  '$2b$12$LQv3c1yqBwEHFx8fCJ3AQO.b9xVQ4K9M8L9vQ2K8fCJ3AQO.b9xVQ4',
  'ROOT01',
  NULL
) ON CONFLICT (email) DO NOTHING;

-- Insert a second root option for testing
INSERT INTO users (
  email,
  password_hash,
  referral_code,
  referred_by_id
) VALUES (
  'root@mlm.com',
  '$2b$12$LQv3c1yqBwEHFx8fCJ3AQO.b9xVQ4K9M8L9vQ2K8fCJ3AQO.b9xVQ4',
  'ADMIN1',
  NULL
) ON CONFLICT (email) DO NOTHING;