import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Send, MessageSquare, Clock, CheckCircle2, MessageCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useFeedback } from '@/hooks/useFeedback';
import { Navigate } from 'react-router-dom';

function StarRating({ rating, onRate }: { rating: number; onRate: (r: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate(star)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`w-7 h-7 ${star <= rating ? 'fill-warning text-warning' : 'text-muted-foreground/30'}`}
          />
        </button>
      ))}
    </div>
  );
}

const statusConfig: Record<string, { label: string; variant: 'pending' | 'investigating' | 'resolved'; icon: typeof Clock }> = {
  new: { label: 'New', variant: 'pending', icon: Clock },
  reviewed: { label: 'Reviewed', variant: 'investigating', icon: MessageCircle },
  resolved: { label: 'Resolved', variant: 'resolved', icon: CheckCircle2 },
};

export default function FeedbackPage() {
  const { user, displayName } = useAuth();
  const { feedbacks, isLoading, submitFeedback } = useFeedback();
  const [name, setName] = useState(displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);

  if (!user) return <Navigate to="/auth" replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim() || rating === 0) return;
    submitFeedback.mutate(
      { name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim(), rating },
      {
        onSuccess: () => {
          setSubject('');
          setMessage('');
          setRating(0);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-accent" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Share Your Feedback
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Help us improve Civic-Eye. Your feedback matters and shapes the future of our platform.
            </p>
          </motion.div>

          <Tabs defaultValue="submit" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="submit" className="gap-2">
                <Send className="w-4 h-4" />
                Submit Feedback
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <Clock className="w-4 h-4" />
                My Feedback
              </TabsTrigger>
            </TabsList>

            <TabsContent value="submit">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">New Feedback</CardTitle>
                    <CardDescription>Rate your experience and share your thoughts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required maxLength={100} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email (optional)</Label>
                          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" maxLength={255} />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary of your feedback" required maxLength={200} />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Tell us more about your experience..." rows={5} required maxLength={2000} />
                      </div>

                      <div className="space-y-2">
                        <Label>Rating</Label>
                        <StarRating rating={rating} onRate={setRating} />
                        {rating === 0 && (
                          <p className="text-xs text-muted-foreground">Please select a rating</p>
                        )}
                      </div>

                      <Button type="submit" variant="accent" size="lg" className="w-full gap-2" disabled={submitFeedback.isPending || rating === 0}>
                        <Send className="w-4 h-4" />
                        {submitFeedback.isPending ? 'Submitting...' : 'Submit Feedback'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            <TabsContent value="history">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                {isLoading ? (
                  <Card><CardContent className="p-8 text-center text-muted-foreground">Loading your feedback...</CardContent></Card>
                ) : feedbacks.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground">You haven't submitted any feedback yet.</p>
                    </CardContent>
                  </Card>
                ) : (
                  feedbacks.map((fb) => {
                    const config = statusConfig[fb.status] || statusConfig.new;
                    const StatusIcon = config.icon;
                    return (
                      <Card key={fb.id}>
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-foreground truncate">{fb.subject}</h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {new Date(fb.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star key={s} className={`w-3.5 h-3.5 ${s <= (fb.rating || 0) ? 'fill-warning text-warning' : 'text-muted-foreground/20'}`} />
                                ))}
                              </div>
                              <Badge variant={config.variant} className="gap-1">
                                <StatusIcon className="w-3 h-3" />
                                {config.label}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{fb.message}</p>
                          {fb.admin_response && (
                            <div className="mt-4 p-3 rounded-lg bg-accent/5 border border-accent/10">
                              <p className="text-xs font-medium text-accent mb-1">Admin Response</p>
                              <p className="text-sm text-foreground">{fb.admin_response}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
