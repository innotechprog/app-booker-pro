import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Home, ArrowLeft } from "lucide-react";
import {
  SEND_ME_BRAND_BLUE,
  SEND_ME_BTN_OUTLINE_ON_DARK,
  SEND_ME_BTN_PRIMARY_MD,
} from "@/features/sendMe/buttonStyles";
import { sendMeDarkPageShell } from "@/features/sendMe/constants/layout";

const BookingSuccessPage = () => {
  return (
    <Layout>
      <SEO page="bookingSuccess" />
      <div className={sendMeDarkPageShell}>
        <div className="mx-auto max-w-lg px-4 py-16">
          <Card className="border-white/20 bg-white/10 backdrop-blur-sm text-center">
            <CardHeader className="space-y-4 pb-2">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 ring-2 ring-emerald-400/50">
                <CheckCircle2 className="h-9 w-9 text-emerald-300" aria-hidden />
              </div>
              <CardTitle className="text-2xl text-white">Booking received</CardTitle>
              <CardDescription className="text-base text-white/85 leading-relaxed">
                Thank you for choosing Send Me. Your request has been submitted successfully. One of our agents will
                contact you soon using the details you provided.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-center">
              <Button asChild className={SEND_ME_BTN_PRIMARY_MD} style={{ backgroundColor: SEND_ME_BRAND_BLUE }}>
                <Link to="/book-service" className="inline-flex items-center justify-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Send Me
                </Link>
              </Button>
              <Button asChild variant="outline" className={SEND_ME_BTN_OUTLINE_ON_DARK}>
                <Link to="/" className="inline-flex items-center justify-center gap-2">
                  <Home className="h-4 w-4" />
                  Home
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default BookingSuccessPage;
