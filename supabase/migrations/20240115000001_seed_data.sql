-- Seed data for development/testing
-- Run this after the initial schema migration

-- Insert test admin user (password: admin123)
-- Note: In production, create users through Supabase Auth UI or API
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@insta-reel.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  '{"full_name": "Admin User", "avatar_url": ""}'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert test regular user (password: user123)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'user@insta-reel.com',
  crypt('user123', gen_salt('bf')),
  NOW(),
  '{"full_name": "Regular User", "avatar_url": ""}'::jsonb,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Profiles will be created automatically by the trigger

-- Sample campaign with ₹4,27,000 budget
INSERT INTO public.campaigns (id, name, description, total_budget, spent_budget, start_date, end_date, is_active, created_by)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Summer Collection Launch 2024',
  'Promoting our summer fashion collection across Instagram Reels',
  427000.00,
  0.00,
  '2024-03-01',
  '2024-06-30',
  TRUE,
  '00000000-0000-0000-0000-000000000001'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.campaigns (id, name, description, total_budget, spent_budget, start_date, end_date, is_active, created_by)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Festival Sale Campaign',
  'Diwali festival promotional campaign',
  250000.00,
  0.00,
  '2024-10-01',
  '2024-11-15',
  TRUE,
  '00000000-0000-0000-0000-000000000001'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.campaigns (id, name, description, total_budget, spent_budget, start_date, end_date, is_active, created_by)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  'New Year Special',
  'New year promotional offers',
  180000.00,
  0.00,
  '2024-12-15',
  '2025-01-31',
  FALSE,
  '00000000-0000-0000-0000-000000000001'
) ON CONFLICT (id) DO NOTHING;

-- Sample reels data (organic metrics)
INSERT INTO public.reels (id, reel_url, username, title, description, hashtags, full_caption, views, likes, comments, plays, duration_seconds, published_date)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'https://www.instagram.com/reel/ABC123/', 'fashionista_isha', 'Summer Vibes Outfit', 'Check out this amazing summer outfit!', ARRAY['summer', 'fashion', 'ootd', 'style'], 'Check out this amazing summer outfit! Perfect for those hot days ☀️ #summer #fashion #ootd #style', 1250000, 45200, 1250, 1250000, 30, '2024-03-15'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'https://www.instagram.com/reel/DEF456/', 'style_by_rahul', 'Beach Day Essentials', 'Must-have items for your beach trip', ARRAY['beach', 'travel', 'essentials', 'summer'], 'Must-have items for your beach trip 🏖️ Pack these and you are good to go! #beach #travel #essentials #summer', 890000, 32100, 890, 890000, 25, '2024-03-20'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'https://www.instagram.com/reel/GHI789/', 'fashionista_isha', 'Evening Party Look', 'Transform your look for the party', ARRAY['party', 'evening', 'glam', 'makeup'], 'Transform your look for the party ✨ This makeup tutorial will save you! #party #evening #glam #makeup', 2100000, 78500, 2100, 2100000, 45, '2024-04-01'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 'https://www.instagram.com/reel/JKL012/', 'beauty_bypriya', 'Skincare Routine', 'My daily skincare routine for glowing skin', ARRAY['skincare', 'routine', 'glow', 'beauty'], 'My daily skincare routine for glowing skin 💫 Consistency is key! #skincare #routine #glow #beauty', 567000, 28900, 1560, 567000, 60, '2024-04-10'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 'https://www.instagram.com/reel/MNO345/', 'style_by_rahul', 'Office Wear Ideas', 'Professional yet stylish office outfits', ARRAY['office', 'workwear', 'professional', 'style'], 'Professional yet stylish office outfits 👔 Look sharp every day! #office #workwear #professional #style', 340000, 15600, 567, 340000, 28, '2024-04-15'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', 'https://www.instagram.com/reel/PQR678/', 'fashionista_isha', 'Monsoon Fashion', 'Stay stylish in the rain', ARRAY['monsoon', 'rain', 'fashion', 'waterproof'], 'Stay stylish in the rain ☔ Waterproof yet fashionable! #monsoon #rain #fashion #waterproof', 780000, 34200, 980, 780000, 32, '2024-05-01'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7', 'https://www.instagram.com/reel/STU901/', 'beauty_bypriya', 'Quick Makeup Hack', '5-minute makeup for busy mornings', ARRAY['makeup', 'hack', 'quick', 'beauty'], '5-minute makeup for busy mornings ⏰ Save time but look amazing! #makeup #hack #quick #beauty', 1450000, 56700, 1890, 1450000, 20, '2024-05-10'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa8', 'https://www.instagram.com/reel/VWX234/', 'style_by_rahul', 'Winter Layering Guide', 'How to layer like a pro', ARRAY['winter', 'layering', 'guide', 'fashion'], 'How to layer like a pro 🧣 Stay warm and stylish! #winter #layering #guide #fashion', 620000, 27800, 756, 620000, 35, '2024-05-20'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa9', 'https://www.instagram.com/reel/YZA567/', 'fashionista_isha', 'Accessories Styling', 'Elevate any outfit with accessories', ARRAY['accessories', 'styling', 'jewelry', 'fashion'], 'Elevate any outfit with accessories ✨ Small details make big impact! #accessories #styling #jewelry #fashion', 430000, 19800, 623, 430000, 22, '2024-06-01'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa10', 'https://www.instagram.com/reel/BCD890/', 'beauty_bypriya', 'Hair Care Tips', 'Healthy hair routine', ARRAY['haircare', 'healthy', 'routine', 'beauty'], 'Healthy hair routine 💇‍♀️ Your hair deserves the best! #haircare #healthy #routine #beauty', 310000, 14500, 456, 310000, 40, '2024-06-10')
ON CONFLICT (reel_url) DO NOTHING;

-- Assign reels to campaigns with promotion spend
INSERT INTO public.campaign_reels (campaign_id, reel_id, promotion_spend, promotion_views, promotion_clicks, promotion_impressions, promotion_engagement)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 85000.00, 450000, 3200, 480000, 12500),
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 62000.00, 320000, 2100, 340000, 8900),
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 120000.00, 680000, 4500, 720000, 18500),
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', 45000.00, 210000, 1500, 220000, 6200),
  ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 35000.00, 150000, 980, 160000, 4100),
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', 78000.00, 380000, 2800, 400000, 11200),
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7', 95000.00, 520000, 3600, 550000, 14500),
  ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa8', 52000.00, 280000, 1900, 300000, 8100)
ON CONFLICT (campaign_id, reel_id) DO NOTHING;

-- Update campaign spent budgets
UPDATE public.campaigns SET spent_budget = (
  SELECT COALESCE(SUM(promotion_spend), 0) FROM public.campaign_reels WHERE campaign_id = public.campaigns.id
) WHERE id IN ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222');