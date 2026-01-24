import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MapPin,
  Clock,
  User,
  Lock,
  AlertTriangle,
  FileImage,
  Tag,
  Building,
  CheckCircle,
  XCircle,
  Loader2,
  Brain,
  ExternalLink,
} from 'lucide-react';
import { ComplaintData } from '@/hooks/useComplaintsData';
import { getStatusColor, getPriorityColor, getCredibilityColor } from '@/lib/mockData';

interface ComplaintDetailModalProps {
  complaint: ComplaintData | null;
  open: boolean;
  onClose: () => void;
}

function CredibilityBar({ score }: { score: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Credibility Score</span>
        <span className="font-medium">{score}%</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full ${getCredibilityColor(score)}`}
        />
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export function ComplaintDetailModal({ complaint, open, onClose }: ComplaintDetailModalProps) {
  if (!complaint) return null;

  const isAnonymous = complaint.type === 'anonymous';
  const createdDate = new Date(complaint.created_at);
  const updatedDate = new Date(complaint.updated_at);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'investigating':
        return <Loader2 className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        {/* Header with Status Bar */}
        <div className={`h-1.5 ${
          complaint.status === 'resolved' ? 'bg-success' :
          complaint.status === 'pending' ? 'bg-warning' :
          complaint.status === 'investigating' ? 'bg-info' :
          'bg-accent'
        }`} />
        
        <ScrollArea className="max-h-[calc(90vh-1.5rem)]">
          <div className="p-6">
            <DialogHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  isAnonymous ? 'bg-anonymous/20 text-anonymous' : 'bg-accent/20 text-accent'
                }`}>
                  {isAnonymous ? <Lock className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-mono text-xs text-muted-foreground">{complaint.complaint_id}</p>
                  <DialogTitle className="text-xl">{complaint.title}</DialogTitle>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant={getStatusColor(complaint.status as any) as any} className="gap-1">
                  {getStatusIcon(complaint.status)}
                  {complaint.status.replace('-', ' ')}
                </Badge>
                <Badge variant={getPriorityColor(complaint.priority as any) as any}>
                  {complaint.priority} priority
                </Badge>
                <Badge variant="outline">{complaint.category}</Badge>
                <Badge variant={isAnonymous ? 'outline' : 'secondary'}>
                  {isAnonymous ? 'Anonymous' : 'Civic'}
                </Badge>
              </div>
            </DialogHeader>

            <Separator className="my-4" />

            {/* Description */}
            <div className="mb-6">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <FileImage className="w-4 h-4" />
                Description
              </h4>
              <p className="text-muted-foreground text-sm leading-relaxed bg-muted/50 p-4 rounded-lg">
                {complaint.description}
              </p>
            </div>

            {/* Credibility Score */}
            <div className="mb-6">
              <CredibilityBar score={complaint.credibility_score} />
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <InfoRow
                icon={MapPin}
                label="Location"
                value={complaint.location_address}
              />
              <InfoRow
                icon={Building}
                label="Ward"
                value={complaint.location_ward}
              />
              <InfoRow
                icon={Building}
                label="Department"
                value={complaint.department || complaint.ai_suggested_department}
              />
              <InfoRow
                icon={User}
                label="Assigned Worker"
                value={complaint.assigned_to || 'Not assigned'}
              />
              <InfoRow
                icon={Clock}
                label="Submitted"
                value={createdDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              />
              <InfoRow
                icon={Clock}
                label="Last Updated"
                value={updatedDate.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              />
            </div>

            {/* Reporter Info (if not anonymous) */}
            {!isAnonymous && (complaint.reporter_name || complaint.reporter_email) && (
              <>
                <Separator className="my-4" />
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Reporter Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoRow icon={User} label="Name" value={complaint.reporter_name} />
                    <InfoRow icon={User} label="Email" value={complaint.reporter_email} />
                    <InfoRow icon={User} label="Phone" value={complaint.reporter_phone} />
                  </div>
                </div>
              </>
            )}

            {/* AI Analysis */}
            {(complaint.ai_sentiment || complaint.ai_keywords?.length || complaint.ai_fake_probability) && (
              <>
                <Separator className="my-4" />
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    AI Analysis
                  </h4>
                  <div className="space-y-4 bg-muted/30 p-4 rounded-lg">
                    {complaint.ai_sentiment && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Sentiment</span>
                        <Badge variant={
                          complaint.ai_sentiment === 'positive' ? 'success' :
                          complaint.ai_sentiment === 'negative' ? 'destructive' : 'secondary'
                        }>
                          {complaint.ai_sentiment}
                        </Badge>
                      </div>
                    )}
                    {complaint.ai_fake_probability !== null && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Fake Probability</span>
                        <span className={`text-sm font-medium ${
                          complaint.ai_fake_probability > 50 ? 'text-destructive' : 'text-success'
                        }`}>
                          {complaint.ai_fake_probability}%
                        </span>
                      </div>
                    )}
                    {complaint.ai_urgency_score !== null && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Urgency Score</span>
                        <span className="text-sm font-medium">{complaint.ai_urgency_score}/100</span>
                      </div>
                    )}
                    {complaint.ai_keywords && complaint.ai_keywords.length > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Keywords</p>
                        <div className="flex flex-wrap gap-1.5">
                          {complaint.ai_keywords.map((keyword) => (
                            <span
                              key={keyword}
                              className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Evidence */}
            {complaint.evidence && complaint.evidence.length > 0 && (
              <>
                <Separator className="my-4" />
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <FileImage className="w-4 h-4" />
                    Evidence ({complaint.evidence.length} files)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {complaint.evidence.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative group rounded-lg overflow-hidden border hover:border-accent transition-colors"
                      >
                        <img
                          src={url}
                          alt={`Evidence ${index + 1}`}
                          className="w-full h-24 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <ExternalLink className="w-5 h-5 text-white" />
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Resolution */}
            {complaint.resolution && (
              <>
                <Separator className="my-4" />
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    Resolution
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed bg-success/10 p-4 rounded-lg border border-success/20">
                    {complaint.resolution}
                  </p>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                variant="accent"
                className="gap-2"
                onClick={() => {
                  window.open(
                    `https://www.google.com/maps?q=${complaint.location_lat},${complaint.location_lng}`,
                    '_blank'
                  );
                }}
              >
                <MapPin className="w-4 h-4" />
                View on Map
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
