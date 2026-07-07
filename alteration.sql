-- Add role column to users table to support RBAC
ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'CITIZEN';

-- Add office column to users table to support Admin offices
ALTER TABLE users ADD COLUMN IF NOT EXISTS office TEXT;

-- Add password_hash column to users table for authentication
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Update existing users with roles based on email patterns
UPDATE users SET role = 'ADMINISTRATOR' WHERE email LIKE '%admin%';
UPDATE users SET role = 'MP' WHERE email LIKE '%mp%';
UPDATE users SET role = 'CITIZEN' WHERE role IS NULL OR role = 'CITIZEN';
