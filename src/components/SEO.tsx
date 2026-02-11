import { Helmet } from 'react-helmet-async';

// Absolute site URL for canonical, OG images (required for social sharing)
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://ib-innovativesolutions.com';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  imageAlt?: string;
  url?: string;
  type?: string;
  page?: string;
  noindex?: boolean;
}

const SEO = ({
  title,
  description,
  keywords,
  image,
  imageAlt,
  url,
  type = "website",
  page = "home",
  noindex = false
}: SEOProps) => {
  // SEO data: titles 50–60 chars, descriptions 150–160 chars (Google guidelines)
  const seoData = {
    home: {
      title: "IB Innovative Solutions | Education, IT & Smart Apply",
      description: "Trusted professional services: tutoring, university applications, IT solutions, Send Me & Smart Apply bulk job applications. Gauteng & South Africa.",
      keywords: "IBIS, IB Innovative Solutions, education, tutoring, university applications, IT solutions, Send Me, Smart Apply, bulk job apply, South Africa, Gauteng, Johannesburg, Pretoria",
      image: "/ib-logo-white.png",
      url: `${SITE_URL}`,
    },
    education: {
      title: "Education Services | Tutoring & University Applications - IBIS",
      description: "Tutoring, university applications & career guidance. Access all South African universities. Expert educational consulting & online learning. IBIS.",
      keywords: "education, tutoring, university applications, South African universities, career guidance, UCT, Wits, Stellenbosch, academic support, IBIS",
      image: "/og-image-education.jpg",
      url: `${SITE_URL}/education`,
    },
    tutorials: {
      title: "Online Tutorials | Personalized Tutoring Grades 1-12 - IBIS",
      description: "Expert tutoring for any grade and subject. Flexible scheduling, curriculum coverage & progress tracking. Basic, Standard & Premium packages.",
      keywords: "online tutorials, tutoring, grades 1-12, mathematics, science, homework help, test prep, South Africa, IBIS",
      image: "/og-image-tutorials.jpg",
      url: `${SITE_URL}/tutorials`,
    },
    bookService: {
      title: "Send Me Services | Personal Assistance & Errands - IBIS",
      description: "Errand running, delivery & personal assistance. Household tasks & business support across Gauteng. Your trusted helping hand.",
      keywords: "Send Me, errand running, delivery, personal assistance, household tasks, Gauteng, South Africa, IBIS",
      image: "/og-image-send-me.jpg",
      url: `${SITE_URL}/book-service`,
    },
    itSolutions: {
      title: "IT Solutions | Web Development & Tech Support - IBIS",
      description: "Web development, system maintenance & technical support. Digital solutions & technology consulting. Professional IT services.",
      keywords: "IT solutions, web development, tech support, digital solutions, software development, South Africa, IBIS",
      image: "/og-image-it.jpg",
      url: `${SITE_URL}/it-solutions`,
    },
    smartApply: {
      title: "Smart Apply | Bulk Job Applications with AI Emails - IBIS",
      description: "Apply to many companies at once. AI generates email subjects & bodies. Add emails & topics, edit, then send. Bulk job applications made easy.",
      keywords: "Smart Apply, bulk job applications, AI email generator, job applications, mass apply, job search, South Africa, IBIS",
      image: "/og-image-smart-apply.jpg",
      url: `${SITE_URL}/smart-apply`,
    },
    contact: {
      title: "Contact Us | Get in Touch - IB Innovative Solutions",
      description: "Contact IBIS for education, IT, Send Me or Smart Apply. Phone, email & online enquiries. We respond promptly. Gauteng, South Africa.",
      keywords: "contact IBIS, get in touch, customer service, enquiry, South Africa, Gauteng, WhatsApp, support",
      image: "/ib-logo-white.png",
      url: `${SITE_URL}/contact`,
    },
    login: {
      title: "Login - IBIS | Access Your Account",
      description: "Log in to your IBIS account. Manage services, bookings and your dashboard. Secure access.",
      keywords: "IBIS login, account access, user dashboard, secure login",
      image: "/og-image-login.jpg",
      url: `${SITE_URL}/learner/login`,
    },
    register: {
      title: "Register - IBIS | Create Your Account",
      description: "Join IBIS. Create your account to book education, IT solutions and personal assistance services.",
      keywords: "IBIS register, sign up, join IBIS, service booking, registration",
      image: "/og-image-register.jpg",
      url: `${SITE_URL}/learner/register`,
    },
    booking: {
      title: "Book Services - IBIS | Easy Online Booking",
      description: "Book IBIS services online. Education, IT and personal assistance. Secure payment and flexible scheduling.",
      keywords: "book services, online booking, IBIS booking, service reservation",
      image: "/og-image-booking.jpg",
      url: `${SITE_URL}/booking`,
    },
    dashboard: {
      title: "Dashboard - IBIS | Manage Your Services",
      description: "Manage your IBIS bookings, service history and account. Personalized dashboard.",
      keywords: "IBIS dashboard, service management, booking history",
      image: "/og-image-dashboard.jpg",
      url: `${SITE_URL}/dashboard`,
    },
    billing: {
      title: "Billing & Payments - IBIS | Secure Payments",
      description: "Secure billing for IBIS services. PayFast, bank transfer. Transparent pricing and invoices.",
      keywords: "billing, payments, PayFast, invoice, IBIS",
      image: "/og-image-billing.jpg",
      url: `${SITE_URL}/billing`,
    },
    agentRegister: {
      title: "Agent Registration - IBIS | Join Our Team",
      description: "Become an IBIS agent or service provider. Flexible registration and support.",
      keywords: "agent registration, join IBIS, service provider, IBIS careers",
      image: "/og-image-agent-register.jpg",
      url: `${SITE_URL}/agent-register`,
    },
    adminDashboard: {
      title: "Admin Dashboard - IBIS | System Administration",
      description: "IBIS admin dashboard. Monitor applications, manage users and operations.",
      keywords: "admin dashboard, IBIS admin, user management",
      image: "/og-image-admin.jpg",
      url: `${SITE_URL}/admin`,
    },
    agentDashboard: {
      title: "Agent Dashboard - IBIS | Service Management",
      description: "Manage service requests, assignments and performance. Tools for IBIS agents.",
      keywords: "agent dashboard, service management, IBIS agents",
      image: "/og-image-agent-dashboard.jpg",
      url: `${SITE_URL}/agent-dashboard`,
    },
    invoices: {
      title: "Invoices - IBIS | Invoice Management",
      description: "View, download and track your IBIS invoices and payment history.",
      keywords: "invoices, invoice management, IBIS, payment history",
      image: "/og-image-invoices.jpg",
      url: `${SITE_URL}/invoices`,
    },
    notFound: {
      title: "Page Not Found (404) - IB Innovative Solutions",
      description: "This page doesn't exist. Return to IBIS homepage for education, IT, Send Me and Smart Apply services.",
      keywords: "404, page not found, IBIS",
      image: "/og-image-404.jpg",
      url: `${SITE_URL}/404`,
    },
  };

  // Pages that should not be indexed (private/account pages)
  const noindexPages = new Set(['login', 'register', 'dashboard', 'adminDashboard', 'agentDashboard', 'billing', 'invoices']);
  const shouldNoindex = noindex || noindexPages.has(page);

  // Get SEO data for current page
  const currentSeo = seoData[page as keyof typeof seoData] || seoData.home;

  // Use provided props or fall back to page defaults
  const finalTitle = title || currentSeo.title;
  const finalDescription = description || currentSeo.description;
  const finalKeywords = keywords || currentSeo.keywords;
  const finalImagePath = image || currentSeo.image;
  const finalImage = finalImagePath.startsWith('http') ? finalImagePath : `${SITE_URL}${finalImagePath}`;
  const finalUrl = url || currentSeo.url;
  const finalImageAlt = imageAlt || `${finalTitle} - IB Innovative Solutions`;

  return (
    <Helmet>
      {/* Primary Meta Tags (SEO standards: title 50-60 chars, description 150-160 chars) */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content="IB Innovative Solutions" />
      <meta name="robots" content={shouldNoindex ? "noindex, nofollow" : "index, follow"} />
      <meta name="googlebot" content={shouldNoindex ? "noindex, nofollow" : "index, follow"} />
      <meta name="language" content="en" />
      <meta name="revisit-after" content="7 days" />
      <link rel="canonical" href={finalUrl} />

      {/* Open Graph (Facebook, LinkedIn): absolute URLs required */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:alt" content={finalImageAlt} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="IB Innovative Solutions" />
      <meta property="og:locale" content="en_ZA" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      <meta name="twitter:image:alt" content={finalImageAlt} />
      <meta name="twitter:site" content="@ibis_solutions" />

      {/* Theme / PWA (viewport lives in index.html only) */}
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      
      {/* Structured Data (Schema.org) - Organization + WebSite for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "IB Innovative Solutions",
          "alternateName": "IBIS",
          "url": SITE_URL,
          "logo": `${SITE_URL}/ib-logo-white.png`,
          "description": "Solutions you can trust everyday. Education support, IT solutions, Send Me and Smart Apply bulk job applications. South Africa.",
          "address": {
            "@type": "PostalAddress",
            "addressRegion": "Gauteng",
            "addressCountry": "ZA"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "telephone": "+27-68-424-0852",
            "email": "info@ib-innovativesolutions.com",
            "availableLanguage": "English",
            "areaServed": "ZA"
          },
          "sameAs": [
            "https://www.facebook.com/profile.php?id=61584161858604",
            "https://twitter.com/ibis_solutions",
            "https://linkedin.com/company/ibisolutions"
          ],
          "serviceArea": {
            "@type": "GeoCircle",
            "geoMidpoint": {
              "@type": "GeoCoordinates",
              "latitude": -26.2041,
              "longitude": 28.0473
            },
            "geoRadius": "50000"
          },
          "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "IBIS Services",
            "itemListElement": [
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Education Services", "description": "Tutoring, university applications, career guidance" } },
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Send Me Services", "description": "Personal assistance and errand running" } },
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "IT Solutions", "description": "Web development and technical support" } },
              { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Smart Apply", "description": "Bulk job applications with AI-generated emails" } }
            ]
          }
        })}
      </script>
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "IB Innovative Solutions",
          "url": SITE_URL,
          "description": "Professional services: education, IT solutions, Send Me, Smart Apply. Gauteng & South Africa.",
          "publisher": { "@type": "Organization", "name": "IB Innovative Solutions" }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
