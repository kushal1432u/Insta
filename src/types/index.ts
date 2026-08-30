export type UserRole = 'admin' | 'user';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  total_budget: number;
  spent_budget: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Reel {
  id: string;
  reel_url: string;
  username: string;
  title: string | null;
  description: string | null;
  hashtags: string[] | null;
  full_caption: string | null;
  views: number;
  likes: number;
  comments: number;
  plays: number;
  duration_seconds: number | null;
  published_date: string;
  fetched_at: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignReel {
  id: string;
  campaign_id: string;
  reel_id: string;
  promotion_spend: number;
  promotion_views: number;
  promotion_clicks: number;
  promotion_impressions: number;
  promotion_engagement: number;
  allocated_at: string;
  updated_at: string;
  reel?: Reel;
}

export interface ImportHistory {
  id: string;
  filename: string;
  total_rows: number;
  new_records: number;
  updated_records: number;
  skipped_records: number;
  error_records: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_details: Record<string, unknown> | null;
  imported_by: string | null;
  created_at: string;
  completed_at: string | null;
}

export type AllocationStrategy = 
  | 'manual' 
  | 'equal' 
  | 'proportional_views' 
  | 'proportional_likes' 
  | 'proportional_engagement';

export interface AllocationInput {
  campaign_id: string;
  strategy: AllocationStrategy;
  reel_ids: string[];
  total_amount?: number;
}

export interface ReelAnalytics {
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
  duration_seconds: number | null;
  published_date: string;
  fetched_at: string;
  total_promotion_spend: number;
  total_promotion_views: number;
  total_promotion_clicks: number;
  total_promotion_impressions: number;
  total_promotion_engagement: number;
  total_views: number;
  total_engagement: number;
  engagement_rate: number;
  cost_per_1k_views: number;
}

export interface CampaignAnalytics {
  id: string;
  name: string;
  description: string | null;
  total_budget: number;
  spent_budget: number;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  reel_count: number;
  actual_spend: number;
  total_promotion_views: number;
  total_promotion_clicks: number;
  total_promotion_impressions: number;
  total_promotion_engagement: number;
  budget_utilization_pct: number;
}

export interface DashboardMetrics {
  total_promotion_spend: number;
  total_reels: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  total_engagement: number;
  avg_views_per_reel: number;
  cost_per_1k_views: number;
  engagement_rate: number;
}

export interface HighlightCard {
  label: string;
  value: string | number;
  reel_id: string;
  reel_url?: string;
  reel_title: string | null;
  metric_type: 'views' | 'likes' | 'comments' | 'engagement_rate' | 'spend' | 'cost_efficiency';
}

export interface ChartDataPoint {
  date: string;
  views: number;
  engagement: number;
  spend: number;
  reel_title?: string;
}

export interface CampaignComparisonPoint {
  campaign_id: string;
  campaign_name: string;
  spend: number;
  views: number;
  engagement: number;
  cpm: number;
  cpe: number;
}

export interface XLSXRow {
  'Reel URL': string;
  Username: string;
  Likes: number;
  Comments: number;
  'Published Date': string;
  Title?: string;
  Description?: string;
  Hashtags?: string;
  'Full Caption'?: string;
  'Views/Plays': number;
  Duration?: number;
}

export interface ImportPreview {
  valid_rows: XLSXRow[];
  invalid_rows: { row: XLSXRow; errors: string[] }[];
  duplicates: string[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
    duplicates: number;
    skipped: number;
    new_records: number;
    updated_records: number;
  };
}

export interface FilterState {
  date_from: string | null;
  date_to: string | null;
  campaign_ids: string[];
  min_views: number | null;
  max_views: number | null;
  min_engagement_rate: number | null;
  max_engagement_rate: number | null;
  usernames: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ========== New Analytics Types ==========

export interface OverviewMetric {
  title: string;
  value: string;
  change?: number;
  changeDirection?: 'up' | 'down' | 'neutral';
  subMetrics?: { label: string; value: string | number; change?: number; changeDirection?: 'up' | 'down' }[];
  sparklineData?: number[];
}

export interface AdCampaignRow {
  id: string;
  title: string;
  thumbnail?: string;
  status: 'Active' | 'Paused' | 'Completed' | 'Draft';
  results: number;
  resultType: string;
  costPerResult: number;
  amountSpent: number;
  views: number;
  viewers: number;
  startDate: string;
  endDate: string;
  createdBy?: string;
  reel_url?: string;
}

export interface AdDetail {
  id: string;
  title: string;
  publishedDate: string;
  type: string;
  status: 'Active' | 'Paused' | 'Completed';
  reel_url?: string;
  finishesIn?: string;
  goal: string;
  platforms: string;
  amountSpent: number;
  dailyBudget: number;
  startDate: string;
  endDate: string;
  createdBy: string;
  postEngagements: number;
  costPerEngagement: number;
  views: number;
  viewers: number;
  engagementTimeline: { date: string; value: number }[];
  viewsTimeline: { date: string; value: number }[];
  engagementBreakdown: {
    threeSecViews: number;
    postReactions: number;
    postShares: number;
    postSaves: number;
    linkClicks: number;
  };
  clicks: {
    linkClicks: number;
    ctr: number;
  };
  facebookLikes: number;
  video: {
    videoPlays: number;
    thruPlays: number;
    avgPlayTime: string;
    threeSecPlays: number;
  };
  audience: AudienceDemographic[];
  placements: PlacementData[];
  locations: LocationData[];
}

export interface AudienceDemographic {
  ageGroup: string;
  women: number;
  men: number;
  nonBinary: number;
}

export interface PlacementData {
  name: string;
  value: number;
  color: string;
}

export interface LocationData {
  name: string;
  value: number;
  color: string;
}

export interface TimelineDataPoint {
  date: string;
  value: number;
}