import { Clock3 } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

const ComingSoon = () => {
  return (
    <Layout>
      <SEO
        title="Coming Soon | IBIS"
        description="This feature is currently in development and will be available soon. Stay tuned for updates from IB Innovative Solutions."
        type="website"
        url="https://ib-innovativesolutions.com/coming-soon"
      />
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1f4fcf] via-[#1b49c1] to-[#173ca8] pb-24 pt-32 md:pb-28 md:pt-36">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_55%)]" />
        <div className="relative mx-auto max-w-4xl px-6 text-center text-white">
          <h1 className="mb-3 text-5xl font-extrabold tracking-tight md:text-7xl">Coming Soon</h1>
          <p className="mx-auto max-w-3xl text-lg text-blue-100 md:text-2xl">
            This page is under construction and will be available soon.
          </p>
          <p className="mx-auto mt-2 max-w-3xl text-base text-blue-100/95 md:text-xl">
            Stay tuned for exciting updates from IB Innovative Solutions!
          </p>
          <div className="mx-auto mt-12 flex h-24 w-24 items-center justify-center rounded-full border-4 border-blue-300/80 bg-blue-900/35 shadow-lg md:h-28 md:w-28">
            <Clock3 className="h-12 w-12 text-blue-100 md:h-14 md:w-14" />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ComingSoon;
