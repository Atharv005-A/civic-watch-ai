import { motion } from 'framer-motion';
import { 
  Database, 
  Lock, 
  Map, 
  Brain, 
  Cloud,
  Zap,
  Shield,
  Eye
} from 'lucide-react';

const technologies = [
  {
    category: 'Frontend',
    items: [
      { name: 'React + TypeScript', icon: '⚛️' },
      { name: 'Tailwind CSS', icon: '🎨' },
      { name: 'Google Fonts', icon: '🔤' },
      { name: 'reCAPTCHA v3', icon: '🤖' },
    ]
  },
  {
    category: 'Backend',
    items: [
      { name: 'Laravel (PHP)', icon: '🐘' },
      { name: 'REST APIs', icon: '🔌' },
      { name: 'MVC Architecture', icon: '📐' },
    ]
  },
  {
    category: 'Database',
    items: [
      { name: 'MySQL', icon: '🗄️' },
      { name: 'Firebase Firestore', icon: '🔥' },
      { name: 'Cloud Storage', icon: '☁️' },
    ]
  },
  {
    category: 'Google AI',
    items: [
      { name: 'Natural Language API', icon: '💬' },
      { name: 'Vision API', icon: '👁️' },
      { name: 'Vertex AI', icon: '🧠' },
    ]
  },
];

const features = [
  { icon: Brain, title: 'AI Verification', desc: 'Fake report detection' },
  { icon: Map, title: 'Smart Mapping', desc: 'Location intelligence' },
  { icon: Lock, title: 'Anonymous Mode', desc: 'Identity protection' },
  { icon: Shield, title: 'Encrypted Data', desc: 'AES encryption' },
  { icon: Eye, title: 'Real-time Tracking', desc: 'Live status updates' },
  { icon: Zap, title: 'Instant Alerts', desc: 'FCM notifications' },
];

export function TechStackSection() {
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
            POWERED BY
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            Technology Stack
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground"
          >
            Built with industry-leading Google Technologies for reliability, security, and intelligence
          </motion.p>
        </div>

        {/* Tech Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-16">
          {technologies.map((tech, techIndex) => (
            <motion.div
              key={tech.category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: techIndex * 0.1 }}
              className="glass-card p-6"
            >
              <h3 className="font-display text-lg font-semibold text-foreground mb-4 pb-2 border-b border-border">
                {tech.category}
              </h3>
              <ul className="space-y-3">
                {tech.items.map((item, index) => (
                  <li key={item.name} className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Features Row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto"
        >
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="text-center p-4 rounded-xl bg-muted/50 hover:bg-accent/10 transition-colors group"
            >
              <feature.icon className="w-8 h-8 mx-auto mb-2 text-accent group-hover:scale-110 transition-transform" />
              <h4 className="text-sm font-medium text-foreground">{feature.title}</h4>
              <p className="text-xs text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
