import { useSearchParams } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ComplaintForm } from '@/components/report/ComplaintForm';

const ReportPage = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') as 'civic' | 'anonymous' | null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Page Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Report an Issue
            </h1>
            <p className="text-muted-foreground">
              Submit a civic issue or anonymous whistleblower complaint. 
              Your report will be verified by AI and forwarded to the appropriate authorities.
            </p>
          </div>

          {/* Form */}
          <ComplaintForm defaultType={type === 'anonymous' ? 'anonymous' : 'civic'} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReportPage;
