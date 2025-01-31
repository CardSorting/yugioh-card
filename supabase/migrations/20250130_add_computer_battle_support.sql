-- Create computer player if it doesn't exist
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at
)
SELECT
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001'::uuid,
  'authenticated',
  'authenticated',
  'computer@yugioh-card-maker.com',
  crypt('computer-password', gen_salt('bf')),
  now(),
  now(),
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'computer@yugioh-card-maker.com'
);

-- Create default computer card
INSERT INTO saved_cards (
  id,
  user_id,
  card_data,
  image_url
)
SELECT
  '00000000-0000-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  '{
    "name": "Computer Opponent",
    "description": "A mysterious opponent controlled by the computer",
    "type": "Computer",
    "attack": "???",
    "defense": "???",
    "level": "?",
    "attribute": "UNKNOWN"
  }'::jsonb,
  '/images/default.jpg'
WHERE EXISTS (
  SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000001'::uuid
);

-- Add is_computer_battle column to active_battles
ALTER TABLE active_battles
ADD COLUMN IF NOT EXISTS is_computer_battle boolean NOT NULL DEFAULT false;
