-- ============================================
-- InstaReel Analytics - Database Setup
-- Run this in Supabase SQL Editor
-- Safe to run multiple times (idempotent)
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom types (skip if already exist)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE allocation_strategy AS ENUM ('manual', 'equal', 'proportional_views', 'proportional_likes', 'proportional_engagement');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE import_status AS ENUM ('pending', 'processing', 'completed', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
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
CREATE TABLE IF NOT EXISTS public.reels (
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
CREATE TABLE IF NOT EXISTS public.campaign_reels (
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
CREATE TABLE IF NOT EXISTS public.import_history (
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

-- Indexes (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_reels_reel_url ON public.reels(reel_url);
CREATE INDEX IF NOT EXISTS idx_reels_published_date ON public.reels(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_reels_username ON public.reels(username);
CREATE INDEX IF NOT EXISTS idx_campaign_reels_campaign_id ON public.campaign_reels(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_reels_reel_id ON public.campaign_reels(reel_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON public.campaigns(created_by);
CREATE INDEX IF NOT EXISTS idx_import_history_imported_by ON public.import_history(imported_by);
CREATE INDEX IF NOT EXISTS idx_import_history_created_at ON public.import_history(created_at DESC);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers (drop first to avoid duplicates)
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER set_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_reels_updated_at ON public.reels;
CREATE TRIGGER set_reels_updated_at
  BEFORE UPDATE ON public.reels
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_campaign_reels_updated_at ON public.campaign_reels;
CREATE TRIGGER set_campaign_reels_updated_at
  BEFORE UPDATE ON public.campaign_reels
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_reels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts, then recreate
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Anyone can view active campaigns" ON public.campaigns;
CREATE POLICY "Anyone can view active campaigns" ON public.campaigns
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.campaigns;
CREATE POLICY "Admins can manage campaigns" ON public.campaigns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Anyone can view reels" ON public.reels;
CREATE POLICY "Anyone can view reels" ON public.reels
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage reels" ON public.reels;
CREATE POLICY "Admins can manage reels" ON public.reels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Anyone can view campaign reels" ON public.campaign_reels;
CREATE POLICY "Anyone can view campaign reels" ON public.campaign_reels
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Admins can manage campaign reels" ON public.campaign_reels;
CREATE POLICY "Admins can manage campaign reels" ON public.campaign_reels
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can view import history" ON public.import_history;
CREATE POLICY "Admins can view import history" ON public.import_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can manage import history" ON public.import_history;
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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
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

-- ========== FUNCTIONS ==========

-- Function to update campaign spent budgets
CREATE OR REPLACE FUNCTION public.update_campaign_spent_budgets()
RETURNS VOID AS $$
BEGIN
  UPDATE public.campaigns
  SET spent_budget = (
    SELECT COALESCE(SUM(promotion_spend), 0)
    FROM public.campaign_reels
    WHERE campaign_id = public.campaigns.id
  );
END;
$$ LANGUAGE plpgsql;

-- Function for budget allocation
CREATE OR REPLACE FUNCTION public.allocate_budget(
  p_campaign_id UUID,
  p_strategy TEXT,
  p_total_amount NUMERIC,
  p_reel_ids UUID[]
)
RETURNS TABLE(reel_id UUID, allocated_amount NUMERIC) AS $$
DECLARE
  v_reel_record RECORD;
  v_total_weight NUMERIC := 0;
  v_reel_weights RECORD;
BEGIN
  IF p_strategy = 'equal' THEN
    FOR v_reel_record IN SELECT * FROM unnest(p_reel_ids) AS rid LOOP
      RETURN QUERY SELECT v_reel_record.rid, p_total_amount / array_length(p_reel_ids, 1);
    END LOOP;
  ELSIF p_strategy = 'proportional_views' THEN
    FOR v_reel_weights IN 
      SELECT r.id as rid, r.views::NUMERIC as weight
      FROM public.reels r
      WHERE r.id = ANY(p_reel_ids)
    LOOP
      v_total_weight := v_total_weight + v_reel_weights.weight;
    END LOOP;
    IF v_total_weight > 0 THEN
      FOR v_reel_weights IN 
        SELECT r.id as rid, r.views::NUMERIC as weight
        FROM public.reels r
        WHERE r.id = ANY(p_reel_ids)
      LOOP
        RETURN QUERY SELECT v_reel_weights.rid, 
          ROUND((v_reel_weights.weight / v_total_weight) * p_total_amount, 2);
      END LOOP;
    END IF;
  ELSIF p_strategy = 'proportional_likes' THEN
    FOR v_reel_weights IN 
      SELECT r.id as rid, r.likes::NUMERIC as weight
      FROM public.reels r
      WHERE r.id = ANY(p_reel_ids)
    LOOP
      v_total_weight := v_total_weight + v_reel_weights.weight;
    END LOOP;
    IF v_total_weight > 0 THEN
      FOR v_reel_weights IN 
        SELECT r.id as rid, r.likes::NUMERIC as weight
        FROM public.reels r
        WHERE r.id = ANY(p_reel_ids)
      LOOP
        RETURN QUERY SELECT v_reel_weights.rid, 
          ROUND((v_reel_weights.weight / v_total_weight) * p_total_amount, 2);
      END LOOP;
    END IF;
  ELSIF p_strategy = 'proportional_engagement' THEN
    FOR v_reel_weights IN 
      SELECT r.id as rid, (r.likes + r.comments)::NUMERIC as weight
      FROM public.reels r
      WHERE r.id = ANY(p_reel_ids)
    LOOP
      v_total_weight := v_total_weight + v_reel_weights.weight;
    END LOOP;
    IF v_total_weight > 0 THEN
      FOR v_reel_weights IN 
        SELECT r.id as rid, (r.likes + r.comments)::NUMERIC as weight
        FROM public.reels r
        WHERE r.id = ANY(p_reel_ids)
      LOOP
        RETURN QUERY SELECT v_reel_weights.rid, 
          ROUND((v_reel_weights.weight / v_total_weight) * p_total_amount, 2);
      END LOOP;
    END IF;
  ELSE
    FOR v_reel_record IN SELECT * FROM unnest(p_reel_ids) AS rid LOOP
      RETURN QUERY SELECT v_reel_record.rid, 0::NUMERIC;
    END LOOP;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update campaign spent_budget when campaign_reels change
CREATE OR REPLACE FUNCTION public.update_campaign_spent_on_campaign_reels_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.campaigns
    SET spent_budget = (
      SELECT COALESCE(SUM(promotion_spend), 0)
      FROM public.campaign_reels
      WHERE campaign_id = NEW.campaign_id
    ),
    updated_at = NOW()
    WHERE id = NEW.campaign_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.campaigns
    SET spent_budget = (
      SELECT COALESCE(SUM(promotion_spend), 0)
      FROM public.campaign_reels
      WHERE campaign_id = OLD.campaign_id
    ),
    updated_at = NOW()
    WHERE id = OLD.campaign_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_campaign_spent ON public.campaign_reels;
CREATE TRIGGER trigger_update_campaign_spent
  AFTER INSERT OR UPDATE OR DELETE ON public.campaign_reels
  FOR EACH ROW EXECUTE FUNCTION public.update_campaign_spent_on_campaign_reels_change();
