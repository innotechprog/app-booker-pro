import Footer from "@/components/Footer";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

const AboutPage = () => {
  return (
    <Layout>
      <SEO
        title="About IB Innovative Solutions"
        description="Learn about IB Innovative Solutions, our mission, and the services we provide across education, IT, Send Me, and Job Assistant."
        url="https://ib-innovativesolutions.com/about"
      />
      <section className="bg-gradient-to-b from-[#0a183d] via-[#183a7a] to-[#07122c] px-6 pb-20 pt-32 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-6 text-5xl font-bold md:text-6xl">About Us</h1>
          <p className="max-w-3xl text-lg leading-8 text-white/90 md:text-xl">
            IB Innovative Solutions delivers practical support across education, IT services, personal assistance,
            and digital job application tools. We focus on dependable service, clear communication, and solutions
            that make day-to-day work easier for our clients.
          </p>
        </div>
      </section>
      <section className="bg-white px-6 py-16 text-slate-900">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold text-slate-950">What We Do</h2>
            <p className="leading-7 text-slate-700">
              We help learners, businesses, and job seekers with tailored services ranging from tutoring and
              university support to web solutions, errands, and bulk job application workflows.
            </p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm">
            <h2 className="mb-4 text-2xl font-semibold text-slate-950">How We Work</h2>
            <p className="leading-7 text-slate-700">
              Our approach is simple: understand the need, respond quickly, and deliver a solution that is useful,
              practical, and easy to access online.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </Layout>
  );
};

export default AboutPage;