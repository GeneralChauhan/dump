-- Insert dummy users into auth.users table first
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'emma.photographer@example.com',
  '$2a$10$dummy.hash.for.testing.purposes.only',
  now(),
  now(),
  now(),
  '{"full_name": "Emma Rodriguez", "age": 26, "location": "Los Angeles, CA", "gender": "female"}',
  false,
  '',
  '',
  '',
  ''
),
(
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'michael.chef@example.com',
  '$2a$10$dummy.hash.for.testing.purposes.only',
  now(),
  now(),
  now(),
  '{"full_name": "Michael Chen", "age": 30, "location": "Chicago, IL", "gender": "male"}',
  false,
  '',
  '',
  '',
  ''
),
(
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sophia.curator@example.com',
  '$2a$10$dummy.hash.for.testing.purposes.only',
  now(),
  now(),
  now(),
  '{"full_name": "Sophia Martinez", "age": 28, "location": "New York, NY", "gender": "female"}',
  false,
  '',
  '',
  '',
  ''
),
(
  '44444444-4444-4444-4444-444444444444',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'james.traveler@example.com',
  '$2a$10$dummy.hash.for.testing.purposes.only',
  now(),
  now(),
  now(),
  '{"full_name": "James Wilson", "age": 32, "location": "Seattle, WA", "gender": "male"}',
  false,
  '',
  '',
  '',
  ''
),
(
  '55555555-5555-5555-5555-555555555555',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'alex.developer@example.com',
  '$2a$10$dummy.hash.for.testing.purposes.only',
  now(),
  now(),
  now(),
  '{"full_name": "Alex Thompson", "age": 29, "location": "Austin, TX", "gender": "non-binary"}',
  false,
  '',
  '',
  '',
  ''
),
(
  '66666666-6666-6666-6666-666666666666',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'maya.artist@example.com',
  '$2a$10$dummy.hash.for.testing.purposes.only',
  now(),
  now(),
  now(),
  '{"full_name": "Maya Patel", "age": 25, "location": "San Francisco, CA", "gender": "female"}',
  false,
  '',
  '',
  '',
  ''
);

-- The profiles will be automatically created by the trigger, but let's update them with better data
UPDATE public.profiles 
SET 
  bio = 'Passionate about photography and outdoor adventures. Looking for someone who enjoys hiking and trying new restaurants. I love capturing moments and exploring new places!',
  profile_image_url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=600',
  deposit_amount = 50
WHERE user_id = '11111111-1111-1111-1111-111111111111';

UPDATE public.profiles 
SET 
  bio = 'Software engineer by day, amateur chef by night. Looking for someone to share my culinary experiments with. I enjoy cooking international cuisines and discovering new flavors.',
  profile_image_url = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
  deposit_amount = 75
WHERE user_id = '22222222-2222-2222-2222-222222222222';

UPDATE public.profiles 
SET 
  bio = 'Art gallery curator with a love for cinema and fine wine. Seeking intellectual conversations and cultural experiences. I appreciate the finer things in life and meaningful connections.',
  profile_image_url = 'https://images.unsplash.com/photo-1664575602554-2087b04935a5?auto=format&fit=crop&q=80&w=600',
  deposit_amount = 100
WHERE user_id = '33333333-3333-3333-3333-333333333333';

UPDATE public.profiles 
SET 
  bio = 'Passionate traveler who has visited over 30 countries. Looking for someone to explore new places and cultures with. Adventure awaits, and I want to share it with someone special.',
  profile_image_url = 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=600',
  deposit_amount = 80
WHERE user_id = '44444444-4444-4444-4444-444444444444';

UPDATE public.profiles 
SET 
  bio = 'Full-stack developer with a passion for creating innovative solutions. When not coding, I enjoy rock climbing, board games, and exploring local coffee shops.',
  profile_image_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
  deposit_amount = 60
WHERE user_id = '55555555-5555-5555-5555-555555555555';

UPDATE public.profiles 
SET 
  bio = 'Digital artist and yoga instructor. I believe in living mindfully and creating beautiful things. Looking for someone who shares my love for creativity and wellness.',
  profile_image_url = 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=600',
  deposit_amount = 45
WHERE user_id = '66666666-6666-6666-6666-666666666666';