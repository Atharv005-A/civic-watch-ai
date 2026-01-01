export interface Complaint {
  id: string;
  type: 'civic' | 'anonymous';
  category: string;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    ward?: string;
  };
  status: 'pending' | 'investigating' | 'in-progress' | 'resolved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'critical';
  credibilityScore: number;
  evidence?: string[];
  reporterName?: string;
  reporterEmail?: string;
  reporterPhone?: string;
  anonymousId?: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  department?: string;
  resolution?: string;
  aiAnalysis?: {
    sentiment: 'positive' | 'neutral' | 'negative';
    fakeProbability: number;
    keywords: string[];
    suggestedDepartment: string;
    urgencyScore: number;
  };
}

export interface ComplaintCategory {
  id: string;
  name: string;
  icon: string;
  type: 'civic' | 'anonymous' | 'both';
  description: string;
}

export const CIVIC_CATEGORIES: ComplaintCategory[] = [
  { id: 'pothole', name: 'Pothole', icon: '🕳️', type: 'civic', description: 'Road damage or potholes' },
  { id: 'garbage', name: 'Garbage Overflow', icon: '🗑️', type: 'civic', description: 'Overflowing garbage bins' },
  { id: 'water', name: 'Water Leakage', icon: '💧', type: 'civic', description: 'Water pipe leaks or flooding' },
  { id: 'streetlight', name: 'Streetlight', icon: '💡', type: 'civic', description: 'Non-functional street lights' },
  { id: 'traffic', name: 'Traffic Signal', icon: '🚦', type: 'civic', description: 'Traffic signal issues' },
  { id: 'drainage', name: 'Drainage', icon: '🌊', type: 'civic', description: 'Blocked or broken drains' },
  { id: 'road', name: 'Road Damage', icon: '🛣️', type: 'civic', description: 'Road surface damage' },
  { id: 'other-civic', name: 'Other', icon: '📋', type: 'civic', description: 'Other civic issues' },
];

export const ANONYMOUS_CATEGORIES: ComplaintCategory[] = [
  { id: 'corruption', name: 'Corruption', icon: '💰', type: 'anonymous', description: 'Report corrupt practices' },
  { id: 'harassment', name: 'Harassment', icon: '⚠️', type: 'anonymous', description: 'Report harassment incidents' },
  { id: 'threat', name: 'Threats/Violence', icon: '🚨', type: 'anonymous', description: 'Report threats or violence' },
  { id: 'fraud', name: 'Fraud', icon: '📄', type: 'anonymous', description: 'Report fraudulent activities' },
  { id: 'misconduct', name: 'Misconduct', icon: '👤', type: 'anonymous', description: 'Report official misconduct' },
  { id: 'unsafe', name: 'Unsafe Area', icon: '🔴', type: 'anonymous', description: 'Report unsafe public areas' },
  { id: 'other-anon', name: 'Other', icon: '🔒', type: 'anonymous', description: 'Other sensitive issues' },
];

export interface DashboardStats {
  totalComplaints: number;
  pendingComplaints: number;
  resolvedComplaints: number;
  averageResolutionTime: number;
  credibilityAverage: number;
  hotspotAreas: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'authority' | 'admin';
  department?: string;
  avatar?: string;
}
