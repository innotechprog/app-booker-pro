import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ServicesSection from "@/components/ServicesSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-hero-gradient">
      <Header />
      <Hero />
      <ServicesSection />
    </div>
  );
};

export default Index;
