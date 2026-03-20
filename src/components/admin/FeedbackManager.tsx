import { useState } from 'react';
import { MessageSquare, Star, Search, Send, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useFeedback, type Feedback } from '@/hooks/useFeedback';
import { useSearch } from '@/hooks/useSearch';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const FeedbackManager = () => {
  const { feedbacks, isLoading, respondToFeedback } = useFeedback();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [responseText, setResponseText] = useState('');
  const [responseStatus, setResponseStatus] = useState('reviewed');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = statusFilter === 'all'
    ? feedbacks
    : feedbacks.filter(f => f.status === statusFilter);

  const { searchQuery, setSearchQuery, filteredItems } = useSearch(
    filtered,
    ['name', 'email', 'subject', 'message']
  );

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('feedback').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      toast.success('Feedback deleted');
      setDeleteId(null);
    },
    onError: () => toast.error('Failed to delete feedback'),
  });

  const handleRespond = () => {
    if (!selectedFeedback || !responseText.trim()) return;
    respondToFeedback.mutate(
      { id: selectedFeedback.id, response: responseText, status: responseStatus },
      {
        onSuccess: () => {
          setSelectedFeedback(null);
          setResponseText('');
        },
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <Badge variant="default">New</Badge>;
      case 'reviewed': return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">Reviewed</Badge>;
      case 'resolved': return <Badge className="bg-success/20 text-success border-success/30">Resolved</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-xs text-muted-foreground">No rating</span>;
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className={`w-3.5 h-3.5 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`} />
        ))}
      </div>
    );
  };

  return (
    <Card variant="glass">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Feedback Management
            </CardTitle>
            <CardDescription>View and respond to user feedback</CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search feedback..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? 'No feedback matches your search' : 'No feedback found'}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map((fb) => (
              <div
                key={fb.id}
                className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                onClick={() => {
                  setSelectedFeedback(fb);
                  setResponseText(fb.admin_response || '');
                  setResponseStatus(fb.status === 'new' ? 'reviewed' : fb.status);
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">{fb.subject}</p>
                      {getStatusBadge(fb.status)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{fb.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{fb.name}</span>
                      {fb.email && <span>{fb.email}</span>}
                      <span>{format(new Date(fb.created_at), 'MMM d, yyyy')}</span>
                      {renderStars(fb.rating)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteId(fb.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {fb.admin_response && (
                  <div className="mt-2 p-2 rounded bg-accent/10 text-sm">
                    <span className="font-medium text-accent">Response: </span>
                    <span className="text-muted-foreground line-clamp-1">{fb.admin_response}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Respond Dialog */}
      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedFeedback?.subject}</DialogTitle>
            <DialogDescription>
              From {selectedFeedback?.name} · {selectedFeedback?.created_at && format(new Date(selectedFeedback.created_at), 'MMM d, yyyy h:mm a')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-1">Message</p>
              <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">{selectedFeedback?.message}</p>
            </div>
            <div className="flex items-center gap-4">
              {renderStars(selectedFeedback?.rating ?? null)}
              {getStatusBadge(selectedFeedback?.status || '')}
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Admin Response</p>
              <Textarea
                placeholder="Type your response..."
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <p className="text-sm font-medium mb-1">Set Status</p>
              <Select value={responseStatus} onValueChange={setResponseStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedFeedback(null)}>Cancel</Button>
            <Button onClick={handleRespond} disabled={!responseText.trim() || respondToFeedback.isPending} className="gap-2">
              <Send className="w-4 h-4" />
              {respondToFeedback.isPending ? 'Sending...' : 'Send Response'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete this feedback entry.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
