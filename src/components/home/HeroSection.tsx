import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  Brain, 
  MapPin, 
  Lock,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Users,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useHeroStats } from '@/hooks/useDynamicStats';
import { useSiteContent } from '@/hooks/useSiteContent';
import { Skeleton } from '@/components/ui/skeleton';

export function HeroSection() {
  const { data: stats, isLoading: statsLoading } = useHeroStats();
  const { data: heroContent, isLoading: contentLoading } = useSiteContent('hero');

  const heroStats = [
    { label: 'Issues Resolved', value: stats?.issuesResolved || 0, icon: CheckCircle },
    { label: 'Active Reports', value: stats?.activeReports || 0, icon: AlertTriangle },
    { label: 'Citizens Served', value: stats?.citizensServed || 0, icon: Users },
    { label: 'Resolution Rate', value: `${stats?.resolutionRate || 0}%`, icon: BarChart3 },
  ];

  return (
    <section className="relative min-h-screen hero-gradient overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-anonymous/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white/5 rounded-full" />
      </div>

      <div className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm text-white/90 mb-8"
          >
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            AI-Powered Civic Platform
            <ArrowRight className="w-4 h-4" />
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
          >
            {contentLoading ? (
              <Skeleton className="h-16 w-3/4 mx-auto bg-white/10" />
            ) : (
              <>
                {heroContent?.title || 'Smart Civic Issue'}
                <span className="block mt-2">
                  <span className="text-accent">{heroContent?.subtitle || 'Prediction'}</span> & Protection
                </span>
              </>
            )}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {heroContent?.content || 'Report civic issues with AI-powered verification. Submit sensitive complaints anonymously. Help authorities predict and prevent problems before they occur.'}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link to="/report">
              <Button variant="hero" size="xl" className="gap-2 min-w-[200px]">
                <FileText className="w-5 h-5" />
                Report Issue
              </Button>
            </Link>
            <Link to="/report?type=anonymous">
              <Button variant="anonymous" size="xl" className="gap-2 min-w-[200px]">
                <Lock className="w-5 h-5" />
                Anonymous Report
              </Button>
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {statsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="glass-dark p-4 rounded-xl text-center">
                  <Skeleton className="w-5 h-5 mx-auto mb-2 bg-white/10" />
                  <Skeleton className="h-8 w-16 mx-auto mb-1 bg-white/10" />
                  <Skeleton className="h-3 w-20 mx-auto bg-white/10" />
                </div>
              ))
            ) : (
              heroStats.map((stat) => (
                <div
                  key={stat.label}
                  className="glass-dark p-4 rounded-xl text-center"
                >
                  <stat.icon className="w-5 h-5 text-accent mx-auto mb-2" />
                  <div className="font-display text-2xl font-bold text-white">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </div>
                  <div className="text-xs text-white/60">{stat.label}</div>
                </div>
              ))
            )}
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-20"
        >
          {[
            {
              icon: FileText,
              title: 'Dual Reporting',
              description: 'Report civic issues openly or submit sensitive complaints anonymously with full protection.',
              color: 'text-accent'
            },
            {
              icon: Brain,
              title: 'AI Verification',
              description: 'AI analyzes reports for authenticity, detects fake complaints, and prioritizes urgency.',
              color: 'text-info'
            },
            {
              icon: MapPin,
              title: 'Predictive Mapping',
              description: 'Heatmaps and trend analysis help authorities predict and prevent future issues.',
              color: 'text-warning'
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="glass-dark p-6 rounded-2xl hover:bg-white/10 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 ${feature.color} group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-white/60 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 bg-white rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
