import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserWithRole {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  role: 'citizen' | 'authority' | 'admin';
  complaints_count: number;
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<UserWithRole[]> => {
      // Get profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;

      // Get user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');
      
      if (rolesError) throw rolesError;

      // Get complaints count per user
      const { data: complaints, error: complaintsError } = await supabase
        .from('complaints')
        .select('reporter_id');
      
      if (complaintsError) throw complaintsError;

      // Map roles to users
      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);
      
      // Count complaints per user
      const complaintsCount = new Map<string, number>();
      complaints?.forEach(c => {
        if (c.reporter_id) {
          complaintsCount.set(c.reporter_id, (complaintsCount.get(c.reporter_id) || 0) + 1);
        }
      });

      return (profiles || []).map(profile => ({
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        avatar_url: profile.avatar_url,
        created_at: profile.created_at,
        role: (roleMap.get(profile.id) || 'citizen') as 'citizen' | 'authority' | 'admin',
        complaints_count: complaintsCount.get(profile.id) || 0,
      }));
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: 'citizen' | 'authority' | 'admin' }) => {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update user role');
      console.error(error);
    },
  });
}
