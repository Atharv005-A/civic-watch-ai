import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface Feedback {
  id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  subject: string;
  message: string;
  rating: number | null;
  status: string;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

export function useFeedback() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: feedbacks = [], isLoading } = useQuery({
    queryKey: ['feedback', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Feedback[];
    },
    enabled: !!user,
  });

  const submitFeedback = useMutation({
    mutationFn: async (feedback: {
      name: string;
      email?: string;
      subject: string;
      message: string;
      rating: number;
    }) => {
      const { error } = await supabase.from('feedback').insert({
        user_id: user?.id,
        name: feedback.name,
        email: feedback.email || null,
        subject: feedback.subject,
        message: feedback.message,
        rating: feedback.rating,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast({ title: 'Feedback submitted!', description: 'Thank you for your feedback.' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const respondToFeedback = useMutation({
    mutationFn: async ({ id, response, status }: { id: string; response: string; status: string }) => {
      const { error } = await supabase
        .from('feedback')
        .update({ admin_response: response, status })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast({ title: 'Response saved!' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return { feedbacks, isLoading, submitFeedback, respondToFeedback };
}
