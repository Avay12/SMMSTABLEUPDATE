import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorks from "@/components/landing/HowItWorks";
import PlatformsSection from "@/components/landing/PlatformsSection";
import PaymentMethodsSection from "@/components/landing/PaymentMethodsSection";
import SocialProofSection from "@/components/landing/SocialProofSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import useDocumentMeta from "@/hooks/useDocumentMeta";
import { PAGE_SEO } from "@/lib/seo";

const Index = () => {
  useDocumentMeta(PAGE_SEO.home);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <HeroSection />
        <PaymentMethodsSection />
        <FeaturesSection />
        <HowItWorks />
        <PlatformsSection />
        <SocialProofSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
