import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCivicCategories, useAnonymousCategories, useSpecialCategories } from '@/hooks/useCategories';
import { useSiteContent } from '@/hooks/useSiteContent';
import { Skeleton } from '@/components/ui/skeleton';

export function CategoriesSection() {
  const navigate = useNavigate();
  const { data: civicCategories, isLoading: civicLoading } = useCivicCategories();
  const { data: anonymousCategories, isLoading: anonLoading } = useAnonymousCategories();
  const { data: specialCategories, isLoading: specialLoading } = useSpecialCategories();
  const { data: content } = useSiteContent('categories');

  const isLoading = civicLoading || anonLoading || specialLoading;

  const handleCategoryClick = (categorySlug: string, type: 'civic' | 'anonymous' | 'special') => {
    navigate(`/report?type=${type === 'special' ? 'anonymous' : type}&category=${categorySlug}`);
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-medium text-accent mb-4"
          >
            {content?.subtitle || 'COMPLAINT CATEGORIES'}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4"
          >
            {content?.title || 'What Can You Report?'}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground"
          >
            {content?.content || 'From everyday civic issues to sensitive whistleblower complaints - we\'ve got you covered'}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Civic Issues */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                <span className="text-2xl">🏙️</span>
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground">Civic Issues</h3>
                <p className="text-sm text-muted-foreground">Public infrastructure problems</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {isLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))
              ) : (
                civicCategories?.map((category, index) => (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleCategoryClick(category.slug, 'civic')}
                    className="flex flex-col items-center p-4 rounded-xl bg-background hover:bg-accent/10 hover:border-accent border border-transparent transition-all cursor-pointer group"
                  >
                    <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                      {category.icon}
                    </span>
                    <span className="text-xs font-medium text-foreground text-center">
                      {category.name}
                    </span>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>

          {/* Anonymous Reports */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 border-anonymous/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-anonymous flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground">Anonymous Reports</h3>
                <p className="text-sm text-muted-foreground">Sensitive whistleblower complaints</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {isLoading ? (
                Array(7).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))
              ) : (
                anonymousCategories?.map((category, index) => (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleCategoryClick(category.slug, 'anonymous')}
                    className="flex flex-col items-center p-4 rounded-xl bg-background hover:bg-anonymous/10 hover:border-anonymous border border-transparent transition-all cursor-pointer group"
                  >
                    <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                      {category.icon}
                    </span>
                    <span className="text-xs font-medium text-foreground text-center">
                      {category.name}
                    </span>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>

          {/* Special Reports (Children, Women, Disabled) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 border-pink-500/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground">Special Reports</h3>
                <p className="text-sm text-muted-foreground">Women, Children & Disabled</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
              {isLoading ? (
                Array(6).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))
              ) : (
                specialCategories?.map((category, index) => (
                  <motion.button
                    key={category.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleCategoryClick(category.slug, 'special')}
                    className="flex flex-col items-center p-4 rounded-xl bg-background hover:bg-pink-500/10 hover:border-pink-500 border border-transparent transition-all cursor-pointer group"
                  >
                    <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                      {category.icon}
                    </span>
                    <span className="text-xs font-medium text-foreground text-center">
                      {category.name}
                    </span>
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
