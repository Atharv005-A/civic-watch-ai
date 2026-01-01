import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Eye, 
  MapPin, 
  Clock,
  AlertTriangle,
  User,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockComplaints, getStatusColor, getPriorityColor, getCredibilityColor } from '@/lib/mockData';
import { Complaint } from '@/types/complaint';

interface ComplaintCardProps {
  complaint: Complaint;
}

function CredibilityMeter({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="credibility-bar flex-1">
        <div 
          className={`credibility-fill ${getCredibilityColor(score)}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-sm font-medium text-foreground">{score}%</span>
    </div>
  );
}

function ComplaintCard({ complaint }: ComplaintCardProps) {
  const isAnonymous = complaint.type === 'anonymous';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card variant="glass" className="overflow-hidden card-hover">
        {/* Status Bar */}
        <div className={`h-1 ${
          complaint.status === 'resolved' ? 'bg-success' :
          complaint.status === 'pending' ? 'bg-warning' :
          complaint.status === 'investigating' ? 'bg-info' :
          'bg-accent'
        }`} />
        
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isAnonymous ? 'bg-anonymous/20 text-anonymous' : 'bg-accent/20 text-accent'
              }`}>
                {isAnonymous ? <Lock className="w-5 h-5" /> : <User className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-mono text-xs text-muted-foreground">{complaint.id}</p>
                <h3 className="font-medium text-foreground line-clamp-1">{complaint.title}</h3>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={getStatusColor(complaint.status) as any}>
                {complaint.status.replace('-', ' ')}
              </Badge>
              <Badge variant={getPriorityColor(complaint.priority) as any} className="text-xs">
                {complaint.priority} priority
              </Badge>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {complaint.description}
          </p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {complaint.location.ward || 'Location Available'}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {new Date(complaint.createdAt).toLocaleDateString()}
            </span>
            {complaint.department && (
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                {complaint.department}
              </span>
            )}
          </div>

          {/* Credibility Score */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Credibility Score</span>
              {complaint.aiAnalysis && (
                <span className="text-xs text-muted-foreground">
                  Fake probability: {complaint.aiAnalysis.fakeProbability}%
                </span>
              )}
            </div>
            <CredibilityMeter score={complaint.credibilityScore} />
          </div>

          {/* AI Keywords */}
          {complaint.aiAnalysis && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {complaint.aiAnalysis.keywords.slice(0, 4).map((keyword) => (
                <span 
                  key={keyword}
                  className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground"
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="accent" size="sm" className="flex-1 gap-1.5">
              <Eye className="w-4 h-4" />
              View Details
            </Button>
            <Button variant="outline" size="sm">
              <MapPin className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function ComplaintsList() {
  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search complaints by ID, title, or location..."
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      {/* Complaints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockComplaints.map((complaint) => (
          <ComplaintCard key={complaint.id} complaint={complaint} />
        ))}
      </div>
    </div>
  );
}
