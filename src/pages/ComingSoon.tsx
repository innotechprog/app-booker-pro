import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";

const ComingSoon = () => {
  return (
    <Layout>
      <SEO page="coming-soon" />
      <section className="min-h-[70vh] flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-gray-900 px-6 py-20 text-center">
        <div className="max-w-xl mx-auto">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">Coming Soon</h1>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            This page is under construction and will be available soon.<br />
            Stay tuned for exciting updates from IB Innovative Solutions!
          </p>
          <div className="flex justify-center">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="60" cy="60" r="55" stroke="#3B82F6" strokeWidth="10" fill="#1E293B" />
              <path d="M60 35v30l20 10" stroke="#3B82F6" strokeWidth="8" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </section>
      <Footer />
    </Layout>
  );
};

export default ComingSoon;
