import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import ContactSection from "@/components/Contact";
import Footer from "@/components/Footer";

const ContactPage = () => {
  return (
    <Layout>
      <SEO page="contact" />
      <section className="relative bg-gradient-to-b from-[#0a183d] via-[#183a7a] to-[#07122c] px-6 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <h1 className="mb-6 text-6xl font-bold text-white md:text-7xl">Contact Us</h1>
          <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-white/90">
            We&apos;re here to help you with any questions, service requests, or project inquiries. Reach out and our team will respond promptly.
          </p>
        </div>
      </section>
      <div className="bg-white">
        <ContactSection />
        <Footer />
      </div>
    </Layout>
  );
};

export default ContactPage;
