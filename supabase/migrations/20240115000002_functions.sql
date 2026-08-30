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
  -- Calculate weights based on strategy
  IF p_strategy = 'equal' THEN
    -- Equal distribution
    FOR v_reel_record IN SELECT * FROM unnest(p_reel_ids) AS reel_id LOOP
      RETURN QUERY SELECT v_reel_record.reel_id, p_total_amount / array_length(p_reel_ids, 1);
    END LOOP;
    
  ELSIF p_strategy = 'proportional_views' THEN
    -- Proportional to organic views
    FOR v_reel_weights IN 
      SELECT reel_id, views::NUMERIC as weight
      FROM public.reels
      WHERE reel_id = ANY(p_reel_ids)
    LOOP
      v_total_weight := v_total_weight + v_reel_weights.weight;
    END LOOP;
    
    IF v_total_weight > 0 THEN
      FOR v_reel_weights IN 
        SELECT reel_id, views::NUMERIC as weight
        FROM public.reels
        WHERE reel_id = ANY(p_reel_ids)
      LOOP
        RETURN QUERY SELECT v_reel_weights.reel_id, 
          ROUND((v_reel_weights.weight / v_total_weight) * p_total_amount, 2);
      END LOOP;
    END IF;
    
  ELSIF p_strategy = 'proportional_likes' THEN
    -- Proportional to organic likes
    FOR v_reel_weights IN 
      SELECT reel_id, likes::NUMERIC as weight
      FROM public.reels
      WHERE reel_id = ANY(p_reel_ids)
    LOOP
      v_total_weight := v_total_weight + v_reel_weights.weight;
    END LOOP;
    
    IF v_total_weight > 0 THEN
      FOR v_reel_weights IN 
        SELECT reel_id, likes::NUMERIC as weight
        FROM public.reels
        WHERE reel_id = ANY(p_reel_ids)
      LOOP
        RETURN QUERY SELECT v_reel_weights.reel_id, 
          ROUND((v_reel_weights.weight / v_total_weight) * p_total_amount, 2);
      END LOOP;
    END IF;
    
  ELSIF p_strategy = 'proportional_engagement' THEN
    -- Proportional to engagement (likes + comments)
    FOR v_reel_weights IN 
      SELECT reel_id, (likes + comments)::NUMERIC as weight
      FROM public.reels
      WHERE reel_id = ANY(p_reel_ids)
    LOOP
      v_total_weight := v_total_weight + v_reel_weights.weight;
    END LOOP;
    
    IF v_total_weight > 0 THEN
      FOR v_reel_weights IN 
        SELECT reel_id, (likes + comments)::NUMERIC as weight
        FROM public.reels
        WHERE reel_id = ANY(p_reel_ids)
      LOOP
        RETURN QUERY SELECT v_reel_weights.reel_id, 
          ROUND((v_reel_weights.weight / v_total_weight) * p_total_amount, 2);
      END LOOP;
    END IF;
    
  ELSE
    -- Manual - return 0 for each, admin will enter manually
    FOR v_reel_record IN SELECT * FROM unnest(p_reel_ids) AS reel_id LOOP
      RETURN QUERY SELECT v_reel_record.reel_id, 0;
    END LOOP;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get reel analytics with campaign data
CREATE OR REPLACE FUNCTION public.get_reel_analytics(
  p_date_from DATE DEFAULT NULL,
  p_date_to DATE DEFAULT NULL,
  p_campaign_ids UUID[] DEFAULT NULL,
  p_usernames TEXT[] DEFAULT NULL,
  p_min_views BIGINT DEFAULT NULL,
  p_max_views BIGINT DEFAULT NULL,
  p_min_engagement_rate NUMERIC DEFAULT NULL,
  p_max_engagement_rate NUMERIC DEFAULT NULL,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  reel_url TEXT,
  username TEXT,
  title TEXT,
  description TEXT,
  hashtags TEXT[],
  full_caption TEXT,
  organic_views BIGINT,
  organic_likes BIGINT,
  organic_comments BIGINT,
  organic_plays BIGINT,
  duration_seconds INTEGER,
  published_date DATE,
  total_promotion_spend NUMERIC,
  total_promotion_views BIGINT,
  total_promotion_clicks BIGINT,
  total_promotion_impressions BIGINT,
  total_promotion_engagement BIGINT,
  total_views BIGINT,
  total_engagement BIGINT,
  engagement_rate NUMERIC,
  cost_per_1k_views NUMERIC
) AS $$
BEGIN
  RETURN QUERY
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
    (r.likes + r.comments + COALESCE(SUM(cr.promotion_engagement), 0)) AS total_engagement,
    CASE
      WHEN (r.views + COALESCE(SUM(cr.promotion_views), 0)) > 0
      THEN ROUND((r.likes + r.comments + COALESCE(SUM(cr.promotion_engagement), 0))::NUMERIC / (r.views + COALESCE(SUM(cr.promotion_views), 0)) * 100, 2)
      ELSE 0
    END AS engagement_rate,
    CASE
      WHEN COALESCE(SUM(cr.promotion_spend), 0) > 0 AND (r.views + COALESCE(SUM(cr.promotion_views), 0)) > 0
      THEN ROUND(COALESCE(SUM(cr.promotion_spend), 0) / ((r.views + COALESCE(SUM(cr.promotion_views), 0)) / 1000)::NUMERIC, 2)
      ELSE 0
    END AS cost_per_1k_views
  FROM public.reels r
  LEFT JOIN public.campaign_reels cr ON r.id = cr.reel_id
  LEFT JOIN public.campaigns c ON cr.campaign_id = c.id
  WHERE (p_date_from IS NULL OR r.published_date >= p_date_from)
    AND (p_date_to IS NULL OR r.published_date <= p_date_to)
    AND (p_campaign_ids IS NULL OR c.id = ANY(p_campaign_ids))
    AND (p_usernames IS NULL OR r.username = ANY(p_usernames))
    AND (p_min_views IS NULL OR (r.views + COALESCE(SUM(cr.promotion_views), 0)) >= p_min_views)
    AND (p_max_views IS NULL OR (r.views + COALESCE(SUM(cr.promotion_views), 0)) <= p_max_views)
    AND (p_min_engagement_rate IS NULL OR 
      CASE
        WHEN (r.views + COALESCE(SUM(cr.promotion_views), 0)) > 0
        THEN ROUND((r.likes + r.comments + COALESCE(SUM(cr.promotion_engagement), 0))::NUMERIC / (r.views + COALESCE(SUM(cr.promotion_views), 0)) * 100, 2)
        ELSE 0
      END >= p_min_engagement_rate)
    AND (p_max_engagement_rate IS NULL OR 
      CASE
        WHEN (r.views + COALESCE(SUM(cr.promotion_views), 0)) > 0
        THEN ROUND((r.likes + r.comments + COALESCE(SUM(cr.promotion_engagement), 0))::NUMERIC / (r.views + COALESCE(SUM(cr.promotion_views), 0)) * 100, 2)
        ELSE 0
      END <= p_max_engagement_rate)
  GROUP BY r.id
  ORDER BY r.published_date DESC
  LIMIT p_limit OFFSET p_offset;
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

CREATE TRIGGER trigger_update_campaign_spent
  AFTER INSERT OR UPDATE OR DELETE ON public.campaign_reels
  FOR EACH ROW EXECUTE FUNCTION public.update_campaign_spent_on_campaign_reels_change();