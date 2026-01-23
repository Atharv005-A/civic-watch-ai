import { motion } from 'framer-motion';
import { 
  FileText, 
  Shield, 
  Brain, 
  MapPin, 
  Bell, 
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useSiteContent } from '@/hooks/useSiteContent';
import { Skeleton } from '@/components/ui/skeleton';

const defaultSteps = [
  {
    icon: FileText,
    title: 'Submit Report',
    description: 'File a civic issue or anonymous whistleblower complaint with location and evidence.',
    color: 'bg-accent'
  },
  {
    icon: Shield,
    title: 'Security Check',
    description: 'Authentication and verification to ensure secure submissions.',
    color: 'bg-info'
  },
  {
    icon: Brain,
    title: 'AI Analysis',
    description: 'AI analyzes content, detects fakes, and scores credibility.',
    color: 'bg-anonymous'
  },
  {
    icon: MapPin,
    title: 'Location Processing',
    description: 'Maps geocode location and identify the responsible ward/department.',
    color: 'bg-warning'
  },
  {
    icon: Bell,
    title: 'Authority Alert',
    description: 'Relevant department receives notification with prioritized complaint details.',
    color: 'bg-success'
  },
  {
    icon: CheckCircle,
    title: 'Resolution',
    description: 'Track progress in real-time until the issue is fully resolved.',
    color: 'bg-accent'
  },
];

export function WorkflowSection() {
  const { data: content, isLoading } = useSiteContent('workflow');

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-medium text-accent mb-4"
          >
            HOW IT WORKS
          </motion.span>
          {isLoading ? (
            <>
              <Skeleton className="h-10 w-3/4 mx-auto mb-4" />
              <Skeleton className="h-6 w-1/2 mx-auto" />
            </>
          ) : (
            <>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4"
              >
                {content?.title || 'Complete System Workflow'}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground"
              >
                {content?.subtitle || 'From complaint submission to resolution - powered by AI'}
              </motion.p>
            </>
          )}
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-accent via-anonymous to-success hidden lg:block" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {defaultSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="glass-card p-6 hover:shadow-xl transition-all duration-300 group h-full">
                  {/* Step Number */}
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-card border-2 border-accent flex items-center justify-center text-sm font-bold text-accent shadow-md">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>

                  {/* Arrow (on larger screens) */}
                  {index < defaultSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
