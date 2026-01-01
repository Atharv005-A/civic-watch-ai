import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { WorkflowSection } from '@/components/home/WorkflowSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { TechStackSection } from '@/components/home/TechStackSection';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <WorkflowSection />
        <CategoriesSection />
        <TechStackSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
