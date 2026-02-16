import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Star, Crown, Users, TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardUser {
  id: string;
  user_id: string;
  points: number;
  level: string;
  badges: string[] | null;
  complaints_submitted: number;
  complaints_resolved: number;
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

// Demo user names for users without profiles
const DEMO_NAMES: Record<string, string> = {
  'a1000001-0000-0000-0000-000000000001': 'Aarav Sharma',
  'a1000001-0000-0000-0000-000000000002': 'Ananya Desai',
  'a1000001-0000-0000-0000-000000000003': 'Vivaan Patel',
  'a1000001-0000-0000-0000-000000000004': 'Diya Iyer',
  'a1000001-0000-0000-0000-000000000005': 'Arjun Reddy',
  'a1000001-0000-0000-0000-000000000006': 'Priya Nair',
  'a1000001-0000-0000-0000-000000000007': 'Kabir Singh',
  'a1000001-0000-0000-0000-000000000008': 'Meera Joshi',
  'a1000001-0000-0000-0000-000000000009': 'Rohan Gupta',
  'a1000001-0000-0000-0000-000000000010': 'Ishita Verma',
  'a1000001-0000-0000-0000-000000000011': 'Aditya Kumar',
  'a1000001-0000-0000-0000-000000000012': 'Sneha Chatterjee',
  'a1000001-0000-0000-0000-000000000013': 'Dev Malhotra',
  'a1000001-0000-0000-0000-000000000014': 'Riya Kapoor',
  'a1000001-0000-0000-0000-000000000015': 'Harsh Mehta',
  'a1000001-0000-0000-0000-000000000016': 'Kavya Rao',
  'a1000001-0000-0000-0000-000000000017': 'Yash Saxena',
  'a1000001-0000-0000-0000-000000000018': 'Pooja Bhatt',
  'a1000001-0000-0000-0000-000000000019': 'Rahul Mishra',
  'a1000001-0000-0000-0000-000000000020': 'Neha Agarwal',
};

const getUserName = (user: LeaderboardUser): string => {
  return user.profile?.full_name || DEMO_NAMES[user.user_id] || 'Anonymous Citizen';
};

const LEVEL_COLORS = {
  'Champion': '#eab308',
  'Active Citizen': '#a855f7',
  'Contributor': '#3b82f6',
  'Newcomer': '#6b7280',
};

const LeaderboardPage = () => {
  const [activeTab, setActiveTab] = useState('points');

  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const { data: rewards, error: rewardsError } = await supabase
        .from('user_rewards')
        .select('*')
        .order('points', { ascending: false })
        .limit(50);
      
      if (rewardsError) throw rewardsError;
      
      const userIds = rewards?.map(r => r.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return rewards?.map(reward => ({
        ...reward,
        profile: profileMap.get(reward.user_id) || null
      })) as LeaderboardUser[];
    },
  });

  const totalPoints = leaderboard?.reduce((sum, u) => sum + u.points, 0) || 0;
  const totalSubmitted = leaderboard?.reduce((sum, u) => sum + u.complaints_submitted, 0) || 0;
  const totalResolved = leaderboard?.reduce((sum, u) => sum + u.complaints_resolved, 0) || 0;
  const avgPoints = leaderboard?.length ? Math.round(totalPoints / leaderboard.length) : 0;

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Champion': return <Crown className="w-5 h-5 text-yellow-500" />;
      case 'Active Citizen': return <Star className="w-5 h-5 text-purple-500" />;
      case 'Contributor': return <Award className="w-5 h-5 text-blue-500" />;
      default: return <Medal className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-8 h-8 text-yellow-500" />;
    if (index === 1) return <Medal className="w-7 h-7 text-gray-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />;
    return null;
  };

  const getBadgeColor = (badge: string) => {
    const colors: Record<string, string> = {
      'First Report': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Reporter': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Helpful Citizen': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'Problem Solver': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };
    return colors[badge] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const sortedLeaderboard = leaderboard ? [...leaderboard].sort((a, b) => {
    if (activeTab === 'points') return b.points - a.points;
    if (activeTab === 'submitted') return b.complaints_submitted - a.complaints_submitted;
    if (activeTab === 'resolved') return b.complaints_resolved - a.complaints_resolved;
    return 0;
  }) : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-24">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Community Leaderboard</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Celebrating our most active citizens who are making a difference in the community. 
            Earn points by reporting issues and getting them resolved!
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Citizens</p>
                <p className="text-2xl font-bold">{leaderboard?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-2xl font-bold">{totalPoints.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issues Resolved</p>
                <p className="text-2xl font-bold">{totalResolved}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Points</p>
                <p className="text-2xl font-bold">{avgPoints}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="points">By Points</TabsTrigger>
            <TabsTrigger value="submitted">By Reports</TabsTrigger>
            <TabsTrigger value="resolved">By Resolved</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Top Citizens
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4">
                        <Skeleton className="w-8 h-8 rounded-full" />
                        <Skeleton className="w-12 h-12 rounded-full" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 mb-2" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-8 w-20" />
                      </div>
                    ))}
                  </div>
                ) : sortedLeaderboard.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No citizens on the leaderboard yet.</p>
                    <p className="text-sm">Be the first to report an issue!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sortedLeaderboard.map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
                          index < 3 
                            ? 'bg-gradient-to-r from-yellow-500/5 to-transparent border border-yellow-500/10' 
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        {/* Rank */}
                        <div className="w-10 flex justify-center">
                          {getRankIcon(index) || (
                            <span className="text-lg font-bold text-muted-foreground">
                              {index + 1}
                            </span>
                          )}
                        </div>

                        {/* Avatar */}
                        <Avatar className="w-12 h-12 border-2 border-muted">
                          <AvatarFallback className="bg-gradient-to-br from-accent to-primary text-white">
                            {getUserName(user).charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold truncate">
                              {getUserName(user)}
                            </span>
                            {getLevelIcon(user.level)}
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {user.level}
                            </Badge>
                            {user.badges?.slice(0, 2).map((badge) => (
                              <Badge 
                                key={badge} 
                                variant="outline" 
                                className={`text-xs ${getBadgeColor(badge)}`}
                              >
                                {badge}
                              </Badge>
                            ))}
                            {user.badges && user.badges.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{user.badges.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="text-right">
                          <div className="font-bold text-lg text-accent">
                            {activeTab === 'points' && `${user.points} pts`}
                            {activeTab === 'submitted' && `${user.complaints_submitted} reports`}
                            {activeTab === 'resolved' && `${user.complaints_resolved} resolved`}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.complaints_submitted} submitted • {user.complaints_resolved} resolved
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Points Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <Card className="bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-accent" />
                How to Earn Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-background/50">
                  <div className="text-2xl font-bold text-green-500">+10</div>
                  <div className="text-sm font-medium">Submit a Report</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Report an issue in your community
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background/50">
                  <div className="text-2xl font-bold text-blue-500">+50</div>
                  <div className="text-sm font-medium">Issue Resolved</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    When your reported issue gets fixed
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background/50">
                  <div className="flex gap-2 mb-1">
                    <Badge className="bg-green-500/20 text-green-400 text-xs">First Report</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Submit your first complaint
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background/50">
                  <div className="flex gap-2 mb-1">
                    <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">Problem Solver</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Have 10+ issues resolved
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default LeaderboardPage;
