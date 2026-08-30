import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seed() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const { data: adminAuth, error: adminAuthError } = await supabase.auth.admin.createUser({
    email: 'admin@insta-reel.com',
    password: 'admin123',
    email_confirm: true,
    user_metadata: { full_name: 'Admin User' },
  });

  if (adminAuthError) {
    console.log('Admin user may already exist:', adminAuthError.message);
  } else {
    console.log('✅ Admin user created:', adminAuth.user?.email);
  }

  // Create regular user
  const { data: userAuth, error: userAuthError } = await supabase.auth.admin.createUser({
    email: 'user@insta-reel.com',
    password: 'user123',
    email_confirm: true,
    user_metadata: { full_name: 'Regular User' },
  });

  if (userAuthError) {
    console.log('Regular user may already exist:', userAuthError.message);
  } else {
    console.log('✅ Regular user created:', userAuth.user?.email);
  }

  // Get profile IDs
  const adminId = adminAuth.user?.id || '00000000-0000-0000-0000-000000000001';
  const userId = userAuth.user?.id || '00000000-0000-0000-0000-000000000002';

  // Update profiles with roles
  await supabase
    .from('profiles')
    .upsert([
      { id: adminId, email: 'admin@insta-reel.com', full_name: 'Admin User', role: 'admin' },
      { id: userId, email: 'user@insta-reel.com', full_name: 'Regular User', role: 'user' },
    ], { onConflict: 'id' });

  console.log('✅ Profiles updated with roles');

  // Create sample campaigns
  const { data: campaigns, error: campaignsError } = await supabase
    .from('campaigns')
    .upsert([
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Summer Collection Launch 2024',
        description: 'Promoting our summer fashion collection across Instagram Reels',
        total_budget: 427000.00,
        spent_budget: 0.00,
        start_date: '2024-03-01',
        end_date: '2024-06-30',
        is_active: true,
        created_by: adminId,
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Festival Sale Campaign',
        description: 'Diwali festival promotional campaign',
        total_budget: 250000.00,
        spent_budget: 0.00,
        start_date: '2024-10-01',
        end_date: '2024-11-15',
        is_active: true,
        created_by: adminId,
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'New Year Special',
        description: 'New year promotional offers',
        total_budget: 180000.00,
        spent_budget: 0.00,
        start_date: '2024-12-15',
        end_date: '2025-01-31',
        is_active: false,
        created_by: adminId,
      },
    ], { onConflict: 'id' })
    .select();

  if (campaignsError) {
    console.error('Campaigns error:', campaignsError);
  } else {
    console.log('✅ Campaigns created:', campaigns?.length);
  }

  // Create sample reels
  const reels = [
    {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
      reel_url: 'https://www.instagram.com/reel/ABC123/',
      username: 'fashionista_isha',
      title: 'Summer Vibes Outfit',
      description: 'Check out this amazing summer outfit!',
      hashtags: ['summer', 'fashion', 'ootd', 'style'],
      full_caption: 'Check out this amazing summer outfit! Perfect for those hot days ☀️ #summer #fashion #ootd #style',
      views: 1250000,
      likes: 45200,
      comments: 1250,
      plays: 1250000,
      duration_seconds: 30,
      published_date: '2024-03-15',
    },
    {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
      reel_url: 'https://www.instagram.com/reel/DEF456/',
      username: 'style_by_rahul',
      title: 'Beach Day Essentials',
      description: 'Must-have items for your beach trip',
      hashtags: ['beach', 'travel', 'essentials', 'summer'],
      full_caption: 'Must-have items for your beach trip 🏖️ Pack these and you are good to go! #beach #travel #essentials #summer',
      views: 890000,
      likes: 32100,
      comments: 890,
      plays: 890000,
      duration_seconds: 25,
      published_date: '2024-03-20',
    },
    {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
      reel_url: 'https://www.instagram.com/reel/GHI789/',
      username: 'fashionista_isha',
      title: 'Evening Party Look',
      description: 'Transform your look for the party',
      hashtags: ['party', 'evening', 'glam', 'makeup'],
      full_caption: 'Transform your look for the party ✨ This makeup tutorial will save you! #party #evening #glam #makeup',
      views: 2100000,
      likes: 78500,
      comments: 2100,
      plays: 2100000,
      duration_seconds: 45,
      published_date: '2024-04-01',
    },
    {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4',
      reel_url: 'https://www.instagram.com/reel/JKL012/',
      username: 'beauty_bypriya',
      title: 'Skincare Routine',
      description: 'My daily skincare routine for glowing skin',
      hashtags: ['skincare', 'routine', 'glow', 'beauty'],
      full_caption: 'My daily skincare routine for glowing skin 💫 Consistency is key! #skincare #routine #glow #beauty',
      views: 567000,
      likes: 28900,
      comments: 1560,
      plays: 567000,
      duration_seconds: 60,
      published_date: '2024-04-10',
    },
    {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5',
      reel_url: 'https://www.instagram.com/reel/MNO345/',
      username: 'style_by_rahul',
      title: 'Office Wear Ideas',
      description: 'Professional yet stylish office outfits',
      hashtags: ['office', 'workwear', 'professional', 'style'],
      full_caption: 'Professional yet stylish office outfits 👔 Look sharp every day! #office #workwear #professional #style',
      views: 340000,
      likes: 15600,
      comments: 567,
      plays: 340000,
      duration_seconds: 28,
      published_date: '2024-04-15',
    },
    {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6',
      reel_url: 'https://www.instagram.com/reel/PQR678/',
      username: 'fashionista_isha',
      title: 'Monsoon Fashion',
      description: 'Stay stylish in the rain',
      hashtags: ['monsoon', 'rain', 'fashion', 'waterproof'],
      full_caption: 'Stay stylish in the rain ☔ Waterproof yet fashionable! #monsoon #rain #fashion #waterproof',
      views: 780000,
      likes: 34200,
      comments: 980,
      plays: 780000,
      duration_seconds: 32,
      published_date: '2024-05-01',
    },
    {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7',
      reel_url: 'https://www.instagram.com/reel/STU901/',
      username: 'beauty_bypriya',
      title: 'Quick Makeup Hack',
      description: '5-minute makeup for busy mornings',
      hashtags: ['makeup', 'hack', 'quick', 'beauty'],
      full_caption: '5-minute makeup for busy mornings ⏰ Save time but look amazing! #makeup #hack #quick #beauty',
      views: 1450000,
      likes: 56700,
      comments: 1890,
      plays: 1450000,
      duration_seconds: 20,
      published_date: '2024-05-10',
    },
    {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa8',
      reel_url: 'https://www.instagram.com/reel/VWX234/',
      username: 'style_by_rahul',
      title: 'Winter Layering Guide',
      description: 'How to layer like a pro',
      hashtags: ['winter', 'layering', 'guide', 'fashion'],
      full_caption: 'How to layer like a pro 🧣 Stay warm and stylish! #winter #layering #guide #fashion',
      views: 620000,
      likes: 27800,
      comments: 756,
      plays: 620000,
      duration_seconds: 35,
      published_date: '2024-05-20',
    },
    {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa9',
      reel_url: 'https://www.instagram.com/reel/YZA567/',
      username: 'fashionista_isha',
      title: 'Accessories Styling',
      description: 'Elevate any outfit with accessories',
      hashtags: ['accessories', 'styling', 'jewelry', 'fashion'],
      full_caption: 'Elevate any outfit with accessories ✨ Small details make big impact! #accessories #styling #jewelry #fashion',
      views: 430000,
      likes: 19800,
      comments: 623,
      plays: 430000,
      duration_seconds: 22,
      published_date: '2024-06-01',
    },
    {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaa10',
      reel_url: 'https://www.instagram.com/reel/BCD890/',
      username: 'beauty_bypriya',
      title: 'Hair Care Tips',
      description: 'Healthy hair routine',
      hashtags: ['haircare', 'healthy', 'routine', 'beauty'],
      full_caption: 'Healthy hair routine 💇‍♀️ Your hair deserves the best! #haircare #healthy #routine #beauty',
      views: 310000,
      likes: 14500,
      comments: 456,
      plays: 310000,
      duration_seconds: 40,
      published_date: '2024-06-10',
    },
  ];

  const { error: reelsError } = await supabase
    .from('reels')
    .upsert(reels, { onConflict: 'reel_url' });

  if (reelsError) {
    console.error('Reels error:', reelsError);
  } else {
    console.log('✅ Reels created:', reels.length);
  }

  // Create campaign_reels assignments
  const campaignReels = [
    { campaign_id: '11111111-1111-1111-1111-111111111111', reel_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', promotion_spend: 85000.00, promotion_views: 450000, promotion_clicks: 3200, promotion_impressions: 480000, promotion_engagement: 12500 },
    { campaign_id: '11111111-1111-1111-1111-111111111111', reel_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', promotion_spend: 62000.00, promotion_views: 320000, promotion_clicks: 2100, promotion_impressions: 340000, promotion_engagement: 8900 },
    { campaign_id: '11111111-1111-1111-1111-111111111111', reel_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', promotion_spend: 120000.00, promotion_views: 680000, promotion_clicks: 4500, promotion_impressions: 720000, promotion_engagement: 18500 },
    { campaign_id: '11111111-1111-1111-1111-111111111111', reel_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa4', promotion_spend: 45000.00, promotion_views: 210000, promotion_clicks: 1500, promotion_impressions: 220000, promotion_engagement: 6200 },
    { campaign_id: '11111111-1111-1111-1111-111111111111', reel_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', promotion_spend: 35000.00, promotion_views: 150000, promotion_clicks: 980, promotion_impressions: 160000, promotion_engagement: 4100 },
    { campaign_id: '22222222-2222-2222-2222-222222222222', reel_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', promotion_spend: 78000.00, promotion_views: 380000, promotion_clicks: 2800, promotion_impressions: 400000, promotion_engagement: 11200 },
    { campaign_id: '22222222-2222-2222-2222-222222222222', reel_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7', promotion_spend: 95000.00, promotion_views: 520000, promotion_clicks: 3600, promotion_impressions: 550000, promotion_engagement: 14500 },
    { campaign_id: '22222222-2222-2222-2222-222222222222', reel_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa8', promotion_spend: 52000.00, promotion_views: 280000, promotion_clicks: 1900, promotion_impressions: 300000, promotion_engagement: 8100 },
  ];

  const { error: crError } = await supabase
    .from('campaign_reels')
    .upsert(campaignReels, { onConflict: 'campaign_id,reel_id' });

  if (crError) {
    console.error('Campaign reels error:', crError);
  } else {
    console.log('✅ Campaign reels created:', campaignReels.length);
  }

  // Update campaign spent budgets
  await supabase.rpc('update_campaign_spent_budgets');

  console.log('🎉 Seed completed successfully!');
  console.log('\n📋 Demo Credentials:');
  console.log('   Admin: admin@insta-reel.com / admin123');
  console.log('   User:  user@insta-reel.com / user123');
}

seed().catch(console.error);