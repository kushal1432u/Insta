import { z } from 'zod';

export const reelSchema = z.object({
  reel_url: z.string().url('Invalid URL').refine(
    (url) => url.includes('instagram.com/reel/'),
    'Must be an Instagram Reel URL'
  ),
  username: z.string().min(1, 'Username is required').max(100),
  title: z.string().max(200).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  hashtags: z.array(z.string()).optional().nullable(),
  full_caption: z.string().max(5000).optional().nullable(),
  views: z.number().int().min(0).default(0),
  likes: z.number().int().min(0).default(0),
  comments: z.number().int().min(0).default(0),
  plays: z.number().int().min(0).default(0),
  duration_seconds: z.number().int().min(0).optional().nullable(),
  published_date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Invalid date format'
  ),
});

export const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(100),
  description: z.string().max(1000).optional().nullable(),
  total_budget: z.number().min(0, 'Budget must be positive'),
  start_date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Invalid start date'
  ).optional().nullable(),
  end_date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    'Invalid end date'
  ).optional().nullable(),
  is_active: z.boolean().default(true),
});

export const campaignReelSchema = z.object({
  campaign_id: z.string().uuid('Invalid campaign ID'),
  reel_id: z.string().uuid('Invalid reel ID'),
  promotion_spend: z.number().min(0).default(0),
  promotion_views: z.number().int().min(0).default(0),
  promotion_clicks: z.number().int().min(0).default(0),
  promotion_impressions: z.number().int().min(0).default(0),
  promotion_engagement: z.number().int().min(0).default(0),
});

export const allocationSchema = z.object({
  campaign_id: z.string().uuid('Invalid campaign ID'),
  strategy: z.enum([
    'manual',
    'equal',
    'proportional_views',
    'proportional_likes',
    'proportional_engagement',
  ]),
  reel_ids: z.array(z.string().uuid()).min(1, 'At least one reel required'),
  total_amount: z.number().min(0).optional(),
});

export const xlsxRowSchema = z.object({
  'Reel URL': z.string().min(1, 'Reel URL is required'),
  Username: z.string().min(1, 'Username is required'),
  Likes: z.number().int().min(0),
  Comments: z.number().int().min(0),
  'Published Date': z.string().min(1, 'Published date is required'),
  Title: z.string().optional(),
  Description: z.string().optional(),
  Hashtags: z.string().optional(),
  'Full Caption': z.string().optional(),
  'Views/Plays': z.number().int().min(0),
  Duration: z.number().int().min(0).optional(),
});

export const filterSchema = z.object({
  date_from: z.string().optional().nullable(),
  date_to: z.string().optional().nullable(),
  campaign_ids: z.array(z.string().uuid()).optional(),
  min_views: z.number().int().min(0).optional().nullable(),
  max_views: z.number().int().min(0).optional().nullable(),
  min_engagement_rate: z.number().min(0).max(100).optional().nullable(),
  max_engagement_rate: z.number().min(0).max(100).optional().nullable(),
  usernames: z.array(z.string()).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = loginSchema.extend({
  full_name: z.string().min(1, 'Full name is required').max(100),
  confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

export const profileUpdateSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(100).optional(),
  avatar_url: z.string().url('Invalid URL').optional().nullable(),
});

export type ReelInput = z.infer<typeof reelSchema>;
export type CampaignInput = z.infer<typeof campaignSchema>;
export type CampaignReelInput = z.infer<typeof campaignReelSchema>;
export type AllocationInput = z.infer<typeof allocationSchema>;
export type XLSXRowInput = z.infer<typeof xlsxRowSchema>;
export type FilterInput = z.infer<typeof filterSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;