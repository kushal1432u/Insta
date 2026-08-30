-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom types
CREATE TYPE user_role AS ENUM ('admin', 'user');
CREATE TYPE allocation_strategy AS ENUM ('manual', 'equal', 'proportional_views', 'proportional_likes', 'proportional_engagement');
CREATE TYPE import_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE public.campaigns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  total_budget NUMERIC(15,2) NOT NULL DEFAULT 0,
  spent_budget NUMERIC(15,2) NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reels table (organic metrics only)
CREATE TABLE public.reels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reel_url TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  title TEXT,
  description TEXT,
  hashtags TEXT[],
  full_caption TEXT,
  views BIGINT NOT NULL DEFAULT 0,
  likes BIGINT NOT NULL DEFAULT 0,
  comments BIGINT NOT NULL DEFAULT 0,
  plays BIGINT NOT NULL DEFAULT 0,
  duration_seconds INTEGER,
  published_date DATE NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Campaign Reels junction table (paid promotion metrics)
CREATE TABLE public.campaign_reels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  reel_id UUID NOT NULL REFERENCES public.reels(id) ON DELETE CASCADE,
  promotion_spend NUMERIC(15,2) NOT NULL DEFAULT 0,
  promotion_views BIGINT NOT NULL DEFAULT 0,
  promotion_clicks BIGINT NOT NULL DEFAULT 0,
  promotion_impressions BIGINT NOT NULL DEFAULT 0,
  promotion_engagement BIGINT NOT NULL DEFAULT 0,
  allocated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(campaign_id, reel_id)
);

-- Import history table
CREATE TABLE public.import_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  filename TEXT NOT NULL,
  total_rows INTEGER NOT NULL DEFAULT 0,
  new_records INTEGER NOT NULL DEFAULT 0,
  updated_records INTEGER NOT NULL DEFAULT 0,
  skipped_records INTEGER NOT NULL DEFAULT 0,
  error_records INTEGER NOT NULL DEFAULT 0,
  status import_status NOT NULL DEFAULT 'pending',
  error_details JSONB,
  imported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Indexes for performance
CREATE INDEX idx_reels_reel_url ON public.reels(reel_url);
CREATE INDEX idx_reels_published_date ON public.reels(published_date DESC);
CREATE INDEX idx_reels_username ON public.reels(username);
CREATE INDEX idx_campaign_reels_campaign_id ON public.campaign_reels(campaign_id);
CREATE INDEX idx_campaign_reels_reel_id ON public.campaign_reels(reel_id);
CREATE INDEX idx_campaigns_created_by ON public.campaigns(created_by);
CREATE INDEX idx_import_history_imported_by ON public.import_history(imported_by);
CREATE INDEX idx_import_history_created_at ON public.import_history(created_at DESC);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_reels_updated_at
  BEFORE UPDATE ON public.reels
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_campaign_reels_updated_at
  BEFORE UPDATE ON public.campaign_reels
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_history ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Campaigns policies
CREATE POLICY "Anyone can view active campaigns" ON public.campaigns
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage campaigns" ON public.campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Reels policies
CREATE POLICY "Anyone can view reels" ON public.reels
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage reels" ON public.reels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Campaign Reels policies
CREATE POLICY "Anyone can view campaign reels" ON public.campaign_reels
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage campaign reels" ON public.campaign_reels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Import History policies
CREATE POLICY "Admins can view import history" ON public.import_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage import history" ON public.import_history
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- View for reel analytics with campaign spend
CREATE OR REPLACE VIEW public.reel_analytics AS
SELECT
  r.id,
  r.reel_url,
  r.username,
  r.title,
  r.description,
  r.hashtags,
  r.full_caption,
  r.views AS organic_views,
  r.likes AS organic_likes,
  r.comments AS organic_comments,
  r.plays AS organic_plays,
  r.duration_seconds,
  r.published_date,
  COALESCE(SUM(cr.promotion_spend), 0) AS total_promotion_spend,
  COALESCE(SUM(cr.promotion_views), 0) AS total_promotion_views,
  COALESCE(SUM(cr.promotion_clicks), 0) AS total_promotion_clicks,
  COALESCE(SUM(cr.promotion_impressions), 0) AS total_promotion_impressions,
  COALESCE(SUM(cr.promotion_engagement), 0) AS total_promotion_engagement,
  (r.views + COALESCE(SUM(cr.promotion_views), 0)) AS total_views,
  (r.likes + COALESCE(SUM(cr.promotion_engagement), 0)) AS total_engagement,
  CASE
    WHEN (r.views + COALESCE(SUM(cr.promotion_views), 0)) > 0
    THEN ROUND((r.likes + COALESCE(SUM(cr.promotion_engagement), 0))::NUMERIC / (r.views + COALESCE(SUM(cr.promotion_views), 0)) * 100, 2)
    ELSE 0
  END AS engagement_rate,
  CASE
    WHEN COALESCE(SUM(cr.promotion_spend), 0) > 0 AND (r.views + COALESCE(SUM(cr.promotion_views), 0)) > 0
    THEN ROUND(COALESCE(SUM(cr.promotion_spend), 0) / ((r.views + COALESCE(SUM(cr.promotion_views), 0)) / 1000)::NUMERIC, 2)
    ELSE 0
  END AS cost_per_1k_views
FROM public.reels r
LEFT JOIN public.campaign_reels cr ON r.id = cr.reel_id
GROUP BY r.id;

-- View for campaign analytics
CREATE OR REPLACE VIEW public.campaign_analytics AS
SELECT
  c.id,
  c.name,
  c.description,
  c.total_budget,
  c.spent_budget,
  c.start_date,
  c.end_date,
  c.is_active,
  COUNT(cr.reel_id) AS reel_count,
  COALESCE(SUM(cr.promotion_spend), 0) AS actual_spend,
  COALESCE(SUM(cr.promotion_views), 0) AS total_promotion_views,
  COALESCE(SUM(cr.promotion_clicks), 0) AS total_promotion_clicks,
  COALESCE(SUM(cr.promotion_impressions), 0) AS total_promotion_impressions,
  COALESCE(SUM(cr.promotion_engagement), 0) AS total_promotion_engagement,
  ROUND(COALESCE(SUM(cr.promotion_spend), 0) / NULLIF(c.total_budget, 0) * 100, 2) AS budget_utilization_pct
FROM public.campaigns c
LEFT JOIN public.campaign_reels cr ON c.id = cr.campaign_id
GROUP BY c.id;