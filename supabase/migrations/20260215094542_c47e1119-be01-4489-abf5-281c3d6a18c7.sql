-- Allow all authenticated users to view leaderboard data
CREATE POLICY "Anyone can view rewards for leaderboard"
ON public.user_rewards
FOR SELECT
USING (true);
