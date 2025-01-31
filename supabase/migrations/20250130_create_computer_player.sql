-- Create computer player account
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
  gen_random_uuid(),
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

-- Give computer player some initial cards
INSERT INTO saved_cards (user_id, name, type, attribute, level, atk, def, description)
SELECT 
  (SELECT id FROM auth.users WHERE email = 'computer@yugioh-card-maker.com'),
  'Computer Dragon',
  'Monster',
  'LIGHT',
  8,
  3000,
  2500,
  'A powerful dragon controlled by artificial intelligence.'
WHERE EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'computer@yugioh-card-maker.com'
);
