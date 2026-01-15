import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import ContactSection from "@/components/Contact";
import Footer from "@/components/Footer";

const Contact = () => {
  return (
    <Layout>
      <SEO page="contact" />
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-[#0a183d] via-[#183a7a] to-[#07122c] py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">Contact Us</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed mb-8">
            We're here to help you with any questions, service requests, or project inquiries. Reach out and our team will respond promptly.
          </p>
        </div>
      </section>
      {/* Contact Section (matches index) */}
      <div className="bg-white">
        <ContactSection />
        <Footer />
      </div>
    </Layout>
  );
};

export default Contact;
