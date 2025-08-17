import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  page?: string;
}

const SEO = ({ 
  title, 
  description, 
  keywords, 
  image, 
  url, 
  type = "website",
  page = "home"
}: SEOProps) => {
  // Default SEO data for different pages
  const seoData = {
    home: {
      title: "IB Innovative Solutions - Trusted Solutions You Can Trust Everyday",
      description: "IBIS provides comprehensive professional services including education support, IT solutions, and personal assistance. Get reliable, secure, and efficient services across Gauteng, South Africa.",
      keywords: "IBIS, IB Innovative Solutions, professional services, education support, IT solutions, personal assistance, errand running, delivery services, tutoring, university applications, South Africa, Gauteng, Johannesburg, Pretoria",
      image: "/og-image-home.jpg",
      url: "https://ibis.com"
    },
    education: {
      title: "Education Services - IBIS | Tutoring, University Applications & Career Guidance",
      description: "Comprehensive educational support including tutoring, university applications, career guidance, and access to all South African universities. Expert educational consulting and online learning solutions.",
      keywords: "education services, tutoring, university applications, South African universities, career guidance, educational consulting, online learning, academic support, UCT, Wits, Stellenbosch, Pretoria University",
      image: "/og-image-education.jpg",
      url: "https://ibis.com/education"
    },
    bookService: {
      title: "Send Me Services - IBIS | Personal Assistance & Errand Running",
      description: "Your trusted helping hand for all your errands and tasks. Professional delivery services, personal assistance, household tasks, and business support across Gauteng, South Africa.",
      keywords: "send me services, errand running, delivery services, personal assistance, household tasks, business support, grocery shopping, prescription pickup, dry cleaning, meal delivery, South Africa, Gauteng",
      image: "/og-image-send-me.jpg",
      url: "https://ibis.com/book-service"
    },
    itSolutions: {
      title: "IT Solutions - IBIS | Web Development & Technical Support",
      description: "Professional IT services including web development, system maintenance, technical support, and digital solutions. Expert technology consulting and implementation services.",
      keywords: "IT solutions, web development, system maintenance, technical support, digital solutions, technology consulting, software development, IT services, South Africa",
      image: "/og-image-it.jpg",
      url: "https://ibis.com/it-solutions"
    },
    login: {
      title: "Login - IBIS | Access Your Account",
      description: "Login to your IBIS account to manage your services, bookings, and access exclusive features. Secure and easy access to your personalized dashboard.",
      keywords: "IBIS login, account access, user dashboard, secure login, service management, booking management",
      image: "/og-image-login.jpg",
      url: "https://ibis.com/login"
    },
    register: {
      title: "Register - IBIS | Create Your Account",
      description: "Join IBIS today and access our comprehensive range of professional services. Create your account to start booking education support, IT solutions, and personal assistance services.",
      keywords: "IBIS register, create account, sign up, join IBIS, service booking, user registration",
      image: "/og-image-register.jpg",
      url: "https://ibis.com/register"
    },
    booking: {
      title: "Book Services - IBIS | Easy Online Booking",
      description: "Book your preferred IBIS services online. Easy booking for education support, IT solutions, and personal assistance. Secure payment options and flexible scheduling.",
      keywords: "book services, online booking, service reservation, IBIS booking, education booking, IT services booking, personal assistance booking",
      image: "/og-image-booking.jpg",
      url: "https://ibis.com/booking"
    },
    dashboard: {
      title: "Dashboard - IBIS | Manage Your Services",
      description: "Access your IBIS dashboard to manage bookings, view service history, and track your account. Personalized dashboard for all your service needs.",
      keywords: "IBIS dashboard, service management, booking history, account dashboard, user dashboard",
      image: "/og-image-dashboard.jpg",
      url: "https://ibis.com/dashboard"
    },
    billing: {
      title: "Billing & Payments - IBIS | Secure Payment Processing",
      description: "Secure billing and payment processing for IBIS services. Multiple payment options including PayFast and bank transfer. Transparent pricing and invoice management.",
      keywords: "billing, payments, PayFast, bank transfer, invoice management, secure payments, IBIS billing",
      image: "/og-image-billing.jpg",
      url: "https://ibis.com/billing"
    },
    agentRegister: {
      title: "Agent Registration - IBIS | Join Our Team",
      description: "Become an IBIS agent or service provider. Join our team and help deliver exceptional services. Flexible registration process with comprehensive support.",
      keywords: "agent registration, service provider registration, join IBIS, become an agent, IBIS careers, service provider application",
      image: "/og-image-agent-register.jpg",
      url: "https://ibis.com/agent-register"
    },
    adminDashboard: {
      title: "Admin Dashboard - IBIS | System Administration",
      description: "Administrative dashboard for IBIS system management. Monitor applications, manage users, and oversee service operations.",
      keywords: "admin dashboard, system administration, IBIS admin, user management, application monitoring",
      image: "/og-image-admin.jpg",
      url: "https://ibis.com/admin"
    },
    agentDashboard: {
      title: "Agent Dashboard - IBIS | Service Management",
      description: "Agent dashboard for managing service requests, tracking assignments, and monitoring performance. Professional tools for IBIS agents.",
      keywords: "agent dashboard, service management, agent tools, assignment tracking, performance monitoring",
      image: "/og-image-agent-dashboard.jpg",
      url: "https://ibis.com/agent-dashboard"
    },
    invoices: {
      title: "Invoices - IBIS | Invoice Management",
      description: "Manage your IBIS invoices and payment history. View, download, and track all your service invoices in one place.",
      keywords: "invoices, invoice management, payment history, IBIS invoices, service invoices",
      image: "/og-image-invoices.jpg",
      url: "https://ibis.com/invoices"
    },
    notFound: {
      title: "Page Not Found - IBIS | 404 Error",
      description: "The page you're looking for doesn't exist. Return to IBIS homepage to access our services.",
      keywords: "404, page not found, error page, IBIS services",
      image: "/og-image-404.jpg",
      url: "https://ibis.com/404"
    }
  };

  // Get SEO data for current page
  const currentSeo = seoData[page as keyof typeof seoData] || seoData.home;

  // Use provided props or fall back to page defaults
  const finalTitle = title || currentSeo.title;
  const finalDescription = description || currentSeo.description;
  const finalKeywords = keywords || currentSeo.keywords;
  const finalImage = image || currentSeo.image;
  const finalUrl = url || currentSeo.url;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="author" content="IB Innovative Solutions" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={finalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="IB Innovative Solutions" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      <meta name="twitter:site" content="@ibis_solutions" />
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#2563eb" />
      <meta name="msapplication-TileColor" content="#2563eb" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={finalUrl} />
      
      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "IB Innovative Solutions",
          "alternateName": "IBIS",
          "url": "https://ibis.com",
          "logo": "https://ibis.com/logo.png",
          "description": "Trusted solutions you can trust everyday. Comprehensive professional services including education support, IT solutions, and personal assistance.",
          "address": {
            "@type": "PostalAddress",
            "addressRegion": "Gauteng",
            "addressCountry": "ZA"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "contactType": "customer service",
            "availableLanguage": "English"
          },
          "sameAs": [
            "https://facebook.com/ibisolutions",
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
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Education Services",
                  "description": "Tutoring, university applications, and career guidance"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "Send Me Services",
                  "description": "Personal assistance and errand running"
                }
              },
              {
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": "IT Solutions",
                  "description": "Web development and technical support"
                }
              }
            ]
          }
        })}
      </script>
    </Helmet>
  );
};

export default SEO;
