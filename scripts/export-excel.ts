import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

interface ReelExport {
  id: string;
  reel_url: string;
  username: string;
  title: string | null;
  description: string | null;
  hashtags: string[] | null;
  full_caption: string | null;
  organic_views: number;
  organic_likes: number;
  organic_comments: number;
  organic_plays: number;
  total_promotion_spend: number;
  total_promotion_views: number;
  total_promotion_clicks: number;
  total_promotion_impressions: number;
  total_promotion_engagement: number;
  total_views: number;
  total_engagement: number;
  engagement_rate: number;
  cost_per_1k_views: number;
  duration_seconds: number | null;
  published_date: string;
}

async function exportToExcel() {
  console.log('📊 Exporting analytics to Excel...');

  const { data: reels, error } = await supabase
    .from('reel_analytics')
    .select('*')
    .order('published_date', { ascending: false });

  if (error) {
    console.error('Error fetching reels:', error);
    process.exit(1);
  }

  if (!reels || reels.length === 0) {
    console.log('No reels found to export');
    process.exit(0);
  }

  const workbook = XLSX.utils.book_new();

  // Reels data sheet
  const reelsData = reels.map((reel: ReelExport, index: number) => ({
    Rank: index + 1,
    'Reel URL': reel.reel_url,
    Username: reel.username,
    Title: reel.title || '',
    Description: reel.description || '',
    Hashtags: reel.hashtags?.join(', ') || '',
    'Full Caption': reel.full_caption || '',
    'Organic Views': reel.organic_views,
    'Organic Likes': reel.organic_likes,
    'Organic Comments': reel.organic_comments,
    'Organic Plays': reel.organic_plays,
    'Promotion Spend': reel.total_promotion_spend,
    'Promotion Views': reel.total_promotion_views,
    'Promotion Clicks': reel.total_promotion_clicks,
    'Promotion Impressions': reel.total_promotion_impressions,
    'Promotion Engagement': reel.total_promotion_engagement,
    'Total Views': reel.total_views,
    'Total Engagement': reel.total_engagement,
    'Engagement Rate (%)': reel.engagement_rate,
    'Cost per 1K Views': reel.cost_per_1k_views,
    Duration: reel.duration_seconds ? `${reel.duration_seconds}s` : '',
    'Published Date': reel.published_date,
  }));

  const worksheet = XLSX.utils.json_to_sheet(reelsData);
  
  const cols = [
    { wch: 6 },   // Rank
    { wch: 50 },  // Reel URL
    { wch: 20 },  // Username
    { wch: 30 },  // Title
    { wch: 40 },  // Description
    { wch: 30 },  // Hashtags
    { wch: 50 },  // Full Caption
    { wch: 15 },  // Organic Views
    { wch: 15 },  // Organic Likes
    { wch: 15 },  // Organic Comments
    { wch: 15 },  // Organic Plays
    { wch: 18 },  // Promotion Spend
    { wch: 18 },  // Promotion Views
    { wch: 18 },  // Promotion Clicks
    { wch: 20 },  // Promotion Impressions
    { wch: 22 },  // Promotion Engagement
    { wch: 15 },  // Total Views
    { wch: 20 },  // Total Engagement
    { wch: 18 },  // Engagement Rate
    { wch: 18 },  // Cost per 1K Views
    { wch: 10 },  // Duration
    { wch: 15 },  // Published Date
  ];
  worksheet['!cols'] = cols;

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reels Analytics');

  // Campaigns sheet
  const { data: campaigns } = await supabase
    .from('campaign_analytics')
    .select('*')
    .order('created_at', { ascending: false });

  if (campaigns && campaigns.length > 0) {
    const campaignsData = campaigns.map((c: any) => ({
      'Campaign Name': c.name,
      Description: c.description || '',
      'Total Budget': c.total_budget,
      'Actual Spend': c.actual_spend,
      'Budget Utilization (%)': c.budget_utilization_pct,
      'Reel Count': c.reel_count,
      'Promotion Views': c.total_promotion_views,
      'Promotion Clicks': c.total_promotion_clicks,
      'Promotion Impressions': c.total_promotion_impressions,
      'Promotion Engagement': c.total_promotion_engagement,
      'Start Date': c.start_date,
      'End Date': c.end_date,
      Status: c.is_active ? 'Active' : 'Inactive',
    }));

    const campaignsSheet = XLSX.utils.json_to_sheet(campaignsData);
    campaignsSheet['!cols'] = [
      { wch: 30 }, { wch: 40 }, { wch: 18 }, { wch: 18 }, { wch: 22 },
      { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 22 }, { wch: 22 },
      { wch: 15 }, { wch: 15 }, { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(workbook, campaignsSheet, 'Campaigns');
  }

  // Summary sheet
  const totalSpend = reels.reduce((sum: number, r: ReelExport) => sum + r.total_promotion_spend, 0);
  const totalViews = reels.reduce((sum: number, r: ReelExport) => sum + r.total_views, 0);
  const totalEngagement = reels.reduce((sum: number, r: ReelExport) => sum + r.total_engagement, 0);
  const avgEngagementRate = reels.length > 0 
    ? reels.reduce((sum: number, r: ReelExport) => sum + r.engagement_rate, 0) / reels.length 
    : 0;

  const summaryData = [
    { Metric: 'Total Reels', Value: reels.length },
    { Metric: 'Total Promotion Spend', Value: totalSpend },
    { Metric: 'Total Views', Value: totalViews },
    { Metric: 'Total Engagement', Value: totalEngagement },
    { Metric: 'Average Engagement Rate', Value: avgEngagementRate.toFixed(2) + '%' },
    { Metric: 'Export Date', Value: new Date().toLocaleString() },
  ];

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 30 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  const filename = `insta-reel-analytics-export-${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, filename);
  
  console.log(`✅ Export saved to: ${filename}`);
  console.log(`   Reels: ${reels.length}`);
  console.log(`   Campaigns: ${campaigns?.length || 0}`);
}

exportToExcel().catch(console.error);