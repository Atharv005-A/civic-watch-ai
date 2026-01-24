import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserReward {
  id: string;
  user_id: string;
  points: number;
  level: string;
  badges: string[];
  complaints_submitted: number;
  complaints_resolved: number;
  created_at: string;
  updated_at: string;
}

export function useUserRewards() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-rewards', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_rewards')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      
      // Return default rewards if none exist
      if (!data) {
        return {
          id: '',
          user_id: user.id,
          points: 0,
          level: 'Newcomer',
          badges: [],
          complaints_submitted: 0,
          complaints_resolved: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as UserReward;
      }
      
      return data as UserReward;
    },
    enabled: !!user?.id,
  });
}

export function useAllUserRewards() {
  return useQuery({
    queryKey: ['all-user-rewards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_rewards')
        .select('*')
        .order('points', { ascending: false });
      
      if (error) throw error;
      return data as UserReward[];
    },
  });
}

// Badge definitions
export const BADGE_DEFINITIONS = {
  'First Report': {
    icon: '🎯',
    description: 'Submitted your first complaint',
    color: 'bg-blue-500/20 text-blue-400',
  },
  'Reporter': {
    icon: '📝',
    description: 'Submitted 10 or more complaints',
    color: 'bg-purple-500/20 text-purple-400',
  },
  'Helpful Citizen': {
    icon: '🤝',
    description: 'Had 5 complaints resolved',
    color: 'bg-green-500/20 text-green-400',
  },
  'Problem Solver': {
    icon: '⭐',
    description: 'Had 10 complaints resolved',
    color: 'bg-yellow-500/20 text-yellow-400',
  },
  'Champion': {
    icon: '🏆',
    description: 'Reached Champion level with 500+ points',
    color: 'bg-orange-500/20 text-orange-400',
  },
};

export const LEVEL_DEFINITIONS = {
  'Newcomer': {
    icon: '🌱',
    minPoints: 0,
    color: 'text-slate-400',
  },
  'Contributor': {
    icon: '🌿',
    minPoints: 100,
    color: 'text-green-400',
  },
  'Active Citizen': {
    icon: '🌳',
    minPoints: 200,
    color: 'text-blue-400',
  },
  'Champion': {
    icon: '🏆',
    minPoints: 500,
    color: 'text-yellow-400',
  },
};
