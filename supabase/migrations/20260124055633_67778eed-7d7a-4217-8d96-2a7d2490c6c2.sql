-- Create user_rewards table for reward points
CREATE TABLE public.user_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'Newcomer',
  badges TEXT[] DEFAULT '{}',
  complaints_submitted INTEGER NOT NULL DEFAULT 0,
  complaints_resolved INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.user_rewards ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_rewards
CREATE POLICY "Users can view their own rewards"
ON public.user_rewards
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own rewards"
ON public.user_rewards
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own rewards"
ON public.user_rewards
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all rewards"
ON public.user_rewards
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all rewards"
ON public.user_rewards
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add assigned_worker column to complaints if it doesn't exist
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS assigned_worker_name TEXT;

-- Allow admins to delete complaints
CREATE POLICY "Admins can delete complaints"
ON public.complaints
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger to update timestamps
CREATE TRIGGER update_user_rewards_updated_at
BEFORE UPDATE ON public.user_rewards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to award points when complaint is resolved
CREATE OR REPLACE FUNCTION public.award_points_on_resolution()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only process when status changes to resolved
  IF NEW.status = 'resolved' AND OLD.status != 'resolved' AND NEW.reporter_id IS NOT NULL THEN
    -- Insert or update user rewards
    INSERT INTO public.user_rewards (user_id, points, complaints_resolved)
    VALUES (NEW.reporter_id, 50, 1)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      points = user_rewards.points + 50,
      complaints_resolved = user_rewards.complaints_resolved + 1,
      level = CASE 
        WHEN user_rewards.points + 50 >= 500 THEN 'Champion'
        WHEN user_rewards.points + 50 >= 200 THEN 'Active Citizen'
        WHEN user_rewards.points + 50 >= 100 THEN 'Contributor'
        ELSE 'Newcomer'
      END,
      badges = CASE
        WHEN user_rewards.complaints_resolved + 1 >= 10 AND NOT 'Problem Solver' = ANY(user_rewards.badges) 
        THEN array_append(user_rewards.badges, 'Problem Solver')
        WHEN user_rewards.complaints_resolved + 1 >= 5 AND NOT 'Helpful Citizen' = ANY(user_rewards.badges)
        THEN array_append(user_rewards.badges, 'Helpful Citizen')
        ELSE user_rewards.badges
      END,
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

-- Function to award points when complaint is submitted
CREATE OR REPLACE FUNCTION public.award_points_on_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.reporter_id IS NOT NULL THEN
    INSERT INTO public.user_rewards (user_id, points, complaints_submitted)
    VALUES (NEW.reporter_id, 10, 1)
    ON CONFLICT (user_id)
    DO UPDATE SET
      points = user_rewards.points + 10,
      complaints_submitted = user_rewards.complaints_submitted + 1,
      badges = CASE
        WHEN user_rewards.complaints_submitted + 1 >= 10 AND NOT 'Reporter' = ANY(user_rewards.badges)
        THEN array_append(user_rewards.badges, 'Reporter')
        WHEN user_rewards.complaints_submitted + 1 >= 1 AND NOT 'First Report' = ANY(user_rewards.badges)
        THEN array_append(user_rewards.badges, 'First Report')
        ELSE user_rewards.badges
      END,
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers for awarding points
CREATE TRIGGER award_points_on_complaint_resolved
AFTER UPDATE ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION public.award_points_on_resolution();

CREATE TRIGGER award_points_on_complaint_submitted
AFTER INSERT ON public.complaints
FOR EACH ROW
EXECUTE FUNCTION public.award_points_on_submission();