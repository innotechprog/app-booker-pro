import Footer from "@/components/Footer";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

const legalContent = {
  privacy: {
    title: "Privacy Policy",
    description: "How IB Innovative Solutions collects, uses, and protects personal information.",
    intro:
      "We collect only the information needed to deliver our services, respond to enquiries, process bookings, and manage customer accounts.",
    sections: [
      {
        heading: "Information We Collect",
        body:
          "This may include your name, email address, phone number, address details, booking information, account details, and any information you provide when contacting us or using our services.",
      },
      {
        heading: "How We Use Information",
        body:
          "We use your information to provide services, communicate updates, process requests, improve our platform, and meet legal or operational requirements.",
      },
      {
        heading: "Data Protection",
        body:
          "We take reasonable technical and organisational steps to protect your information from unauthorised access, loss, or misuse. Access is limited to people who need it to deliver the service.",
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    description: "The basic terms that apply when using IB Innovative Solutions services and website.",
    intro:
      "By using our website or services, you agree to use them lawfully and to provide accurate information when making enquiries, bookings, or account registrations.",
    sections: [
      {
        heading: "Service Use",
        body:
          "Services are provided subject to availability, suitability, and confirmation where required. We may decline or limit a request where necessary for operational, safety, or legal reasons.",
      },
      {
        heading: "User Responsibilities",
        body:
          "You are responsible for the accuracy of the information you submit and for using the platform in a way that does not disrupt, misuse, or compromise our systems or services.",
      },
      {
        heading: "Changes and Availability",
        body:
          "We may update, improve, suspend, or remove parts of the service from time to time. Continued use after updates means you accept the revised terms.",
      },
    ],
  },
  cookies: {
    title: "Cookie Policy",
    description: "How IB Innovative Solutions uses cookies and similar technologies on the website.",
    intro:
      "We use cookies and similar technologies to support site functionality, improve user experience, and understand how the site is used.",
    sections: [
      {
        heading: "Essential Cookies",
        body:
          "These help core parts of the website work correctly, such as session handling, navigation, and security-related behaviour.",
      },
      {
        heading: "Analytics and Performance",
        body:
          "We may use analytics-related storage or similar tooling to understand traffic patterns, performance issues, and which sections of the site are most useful.",
      },
      {
        heading: "Managing Cookies",
        body:
          "You can control cookies through your browser settings. Disabling some cookies may affect how parts of the website function.",
      },
    ],
  },
} as const;

type LegalPageKind = keyof typeof legalContent;

interface LegalPageProps {
  kind: LegalPageKind;
}

const LegalPage = ({ kind }: LegalPageProps) => {
  const content = legalContent[kind];

  return (
    <Layout>
      <SEO title={`${content.title} | IB Innovative Solutions`} description={content.description} />
      <section className="bg-gradient-to-b from-[#0a183d] via-[#183a7a] to-[#07122c] px-6 pb-20 pt-32 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-6 text-5xl font-bold md:text-6xl">{content.title}</h1>
          <p className="max-w-3xl text-lg leading-8 text-white/90 md:text-xl">{content.description}</p>
        </div>
      </section>
      <section className="bg-white px-6 py-16 text-slate-900">
        <div className="mx-auto max-w-4xl space-y-8 rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm md:p-10">
          <p className="leading-7 text-slate-700">{content.intro}</p>
          {content.sections.map((section) => (
            <div key={section.heading} className="space-y-2">
              <h2 className="text-2xl font-semibold text-slate-950">{section.heading}</h2>
              <p className="leading-7 text-slate-700">{section.body}</p>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </Layout>
  );
};

export default LegalPage;