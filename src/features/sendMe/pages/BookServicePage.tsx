import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";
import {
  SendMeCustomRequestsSection,
  SendMeFinalCtaSection,
  SendMeHeroSection,
  SendMeHowItWorksSection,
  SendMeReasonsSection,
  SendMeServicesGridSection,
} from "@/features/sendMe/components";

const BookServicePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceFromLanding = searchParams.get("service")?.trim();

  const handleBookNow = () => {
    const service = serviceFromLanding || "Send Me";
    navigate(`/booking?service=${encodeURIComponent(service)}`);
  };

  return (
    <Layout>
      <SEO
        page="bookService"
        title="Send Me | On-Demand Errands, Delivery & Assistance - IBIS"
        description="Personal errand running, delivery services, and on-demand assistance. Book Send Me for household tasks, event and childcare support, custom requests, and more across Gauteng and South Africa."
        keywords="Send Me, on-demand personal assistance, running errands, delivery services, household tasks, event assistance, childcare support, custom requests, document collection, shopping assistance, Gauteng, South Africa"
      />
      <SendMeHeroSection onBookNow={handleBookNow} />
      <SendMeServicesGridSection />
      <SendMeCustomRequestsSection onBookNow={handleBookNow} />
      <SendMeHowItWorksSection />
      <SendMeReasonsSection />
      <SendMeFinalCtaSection onBookNow={handleBookNow} />

      <Footer />
    </Layout>
  );
};

export default BookServicePage;
