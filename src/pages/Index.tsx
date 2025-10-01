import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import ServicesSection from "@/components/ServicesSection";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const Index = () => {
  return (
    <Layout>
      <SEO page="home" />
      <div className="bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        <Hero />
      </div>
      
      {/* Services section with enhanced styling */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50"></div>
        <div className="relative z-10">
          <ServicesSection />
        </div>
      </div>
      
      {/* Contact section with enhanced styling */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-gray-100"></div>
        <div className="relative z-10">
          <Contact />
        </div>
      </div>
      
      {/* Footer hidden for logged-in learners */}
      {localStorage.getItem('learnerData') === null && <Footer />}
    </Layout>
  );
};

export default Index;
