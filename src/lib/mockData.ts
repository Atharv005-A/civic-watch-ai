import { Complaint, DashboardStats } from '@/types/complaint';

// Generate mock complaints for demo
export const mockComplaints: Complaint[] = [
  {
    id: 'CIV-001',
    type: 'civic',
    category: 'pothole',
    title: 'Large pothole on Main Street',
    description: 'A dangerous pothole has formed near the bus stop on Main Street. Multiple vehicles have been damaged.',
    location: {
      lat: 28.6139,
      lng: 77.2090,
      address: 'Main Street, Near Bus Stop, Ward 12',
      ward: 'Ward 12'
    },
    status: 'investigating',
    priority: 'high',
    credibilityScore: 85,
    evidence: ['/placeholder.svg'],
    reporterName: 'Rahul Sharma',
    reporterEmail: 'rahul@example.com',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16'),
    department: 'Public Works',
    aiAnalysis: {
      sentiment: 'negative',
      fakeProbability: 12,
      keywords: ['pothole', 'dangerous', 'damage', 'bus stop'],
      suggestedDepartment: 'Road Maintenance',
      urgencyScore: 78
    }
  },
  {
    id: 'CIV-002',
    type: 'civic',
    category: 'garbage',
    title: 'Garbage overflow at market area',
    description: 'The garbage bin near the vegetable market has been overflowing for 3 days. It is creating a health hazard.',
    location: {
      lat: 28.6200,
      lng: 77.2150,
      address: 'Vegetable Market, Sector 5, Ward 8',
      ward: 'Ward 8'
    },
    status: 'pending',
    priority: 'medium',
    credibilityScore: 92,
    reporterName: 'Priya Patel',
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
    department: 'Sanitation',
    aiAnalysis: {
      sentiment: 'negative',
      fakeProbability: 5,
      keywords: ['garbage', 'overflow', 'health hazard', 'market'],
      suggestedDepartment: 'Sanitation',
      urgencyScore: 65
    }
  },
  {
    id: 'CIV-003',
    type: 'civic',
    category: 'streetlight',
    title: 'Multiple streetlights not working',
    description: 'Five streetlights on Park Road have stopped working. The area becomes very dark and unsafe at night.',
    location: {
      lat: 28.6080,
      lng: 77.2200,
      address: 'Park Road, Near Central Park, Ward 15',
      ward: 'Ward 15'
    },
    status: 'in-progress',
    priority: 'high',
    credibilityScore: 88,
    reporterName: 'Amit Kumar',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-17'),
    assignedTo: 'Electrical Team Alpha',
    department: 'Electrical',
    aiAnalysis: {
      sentiment: 'negative',
      fakeProbability: 8,
      keywords: ['streetlight', 'dark', 'unsafe', 'night'],
      suggestedDepartment: 'Electrical',
      urgencyScore: 72
    }
  },
  {
    id: 'ANON-001',
    type: 'anonymous',
    category: 'corruption',
    title: 'Bribery at permit office',
    description: 'Officials at the building permit office are demanding extra payments for processing applications. Standard fee is Rs. 500 but they ask for Rs. 5000.',
    location: {
      lat: 28.6300,
      lng: 77.2100,
      address: 'Municipal Building, Civil Lines',
    },
    status: 'investigating',
    priority: 'critical',
    credibilityScore: 78,
    anonymousId: 'ANON-7X8K2M',
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-15'),
    department: 'Anti-Corruption',
    aiAnalysis: {
      sentiment: 'negative',
      fakeProbability: 15,
      keywords: ['bribery', 'permit', 'payment', 'officials'],
      suggestedDepartment: 'Anti-Corruption Cell',
      urgencyScore: 85
    }
  },
  {
    id: 'ANON-002',
    type: 'anonymous',
    category: 'harassment',
    title: 'Harassment by security guards',
    description: 'Security guards at the government hospital are harassing patients and demanding money for entry. This has been happening for weeks.',
    location: {
      lat: 28.6250,
      lng: 77.2050,
      address: 'Government Hospital, Sector 10',
    },
    status: 'pending',
    priority: 'high',
    credibilityScore: 82,
    anonymousId: 'ANON-9P3L7N',
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17'),
    department: 'Health Services',
    aiAnalysis: {
      sentiment: 'negative',
      fakeProbability: 10,
      keywords: ['harassment', 'security', 'hospital', 'money'],
      suggestedDepartment: 'Hospital Administration',
      urgencyScore: 80
    }
  },
  {
    id: 'CIV-004',
    type: 'civic',
    category: 'water',
    title: 'Water pipe burst causing flooding',
    description: 'A main water pipe has burst causing flooding on the street. Water is being wasted and the road is blocked.',
    location: {
      lat: 28.6180,
      lng: 77.2300,
      address: 'Industrial Area, Block B, Ward 22',
      ward: 'Ward 22'
    },
    status: 'resolved',
    priority: 'critical',
    credibilityScore: 95,
    reporterName: 'Sanjay Verma',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-06'),
    department: 'Water Works',
    resolution: 'Pipe repaired and road cleaned. Issue resolved within 24 hours.',
    aiAnalysis: {
      sentiment: 'negative',
      fakeProbability: 3,
      keywords: ['water', 'burst', 'flooding', 'road blocked'],
      suggestedDepartment: 'Water Works',
      urgencyScore: 95
    }
  },
];

export const mockDashboardStats: DashboardStats = {
  totalComplaints: 1247,
  pendingComplaints: 156,
  resolvedComplaints: 982,
  averageResolutionTime: 3.5,
  credibilityAverage: 84.2,
  hotspotAreas: ['Ward 12', 'Ward 8', 'Sector 5', 'Civil Lines', 'Industrial Area']
};

export const getStatusColor = (status: Complaint['status']) => {
  switch (status) {
    case 'pending': return 'warning';
    case 'investigating': return 'info';
    case 'in-progress': return 'info';
    case 'resolved': return 'success';
    case 'rejected': return 'destructive';
    default: return 'secondary';
  }
};

export const getPriorityColor = (priority: Complaint['priority']) => {
  switch (priority) {
    case 'low': return 'secondary';
    case 'medium': return 'warning';
    case 'high': return 'destructive';
    case 'critical': return 'urgent';
    default: return 'secondary';
  }
};

export const getCredibilityColor = (score: number) => {
  if (score >= 80) return 'bg-success';
  if (score >= 60) return 'bg-warning';
  if (score >= 40) return 'bg-orange-500';
  return 'bg-destructive';
};

export const generateAnonymousId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'ANON-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
