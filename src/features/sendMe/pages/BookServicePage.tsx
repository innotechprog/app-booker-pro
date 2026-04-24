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
      <SEO page="bookService" />
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
