import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ComplaintCategory {
  id: string;
  name: string;
  icon: string;
  type: 'civic' | 'anonymous' | 'special';
  description: string;
  slug: string;
  is_active: boolean;
  display_order: number;
}

export function useCategories(type?: 'civic' | 'anonymous' | 'special') {
  return useQuery({
    queryKey: ['complaint-categories', type],
    queryFn: async () => {
      let query = supabase
        .from('complaint_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (type) {
        query = query.eq('type', type);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as ComplaintCategory[];
    },
  });
}

export function useCivicCategories() {
  return useCategories('civic');
}

export function useAnonymousCategories() {
  return useCategories('anonymous');
}

export function useSpecialCategories() {
  return useCategories('special');
}

export function useAllCategories() {
  return useCategories();
}
