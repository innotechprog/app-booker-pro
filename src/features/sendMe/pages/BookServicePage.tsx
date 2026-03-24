import { useNavigate } from "react-router-dom";
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

  const handleBookNow = () => {
    navigate("/booking?service=Send%20Me");
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
