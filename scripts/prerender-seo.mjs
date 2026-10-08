import fs from "node:fs";
import path from "node:path";

const DEFAULT_SITE_URL = "https://ib-innovativesolutions.com";

/** Load Vite env files. Already-set process.env values win. Later files override earlier ones. */
function loadEnvFiles() {
  const mode = process.env.MODE || "production";
  const files = [".env", ".env.local", `.env.${mode}`, `.env.${mode}.local`];
  const parsed = {};
  for (const file of files) {
    const full = path.resolve(file);
    if (!fs.existsSync(full)) continue;
    const text = fs.readFileSync(full, "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq <= 0) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      parsed[key] = value;
    }
  }
  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFiles();

if (["0", "false", "no"].includes(String(process.env.VITE_PRERENDER_SEO || "").toLowerCase())) {
  console.log("SEO prerender skipped (VITE_PRERENDER_SEO is disabled).");
  process.exit(0);
}

const SITE_URL = (process.env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");
const DIST_DIR = path.resolve("dist");
const INDEX_PATH = path.join(DIST_DIR, "index.html");

const seoByRoute = {
  "/": {
    title: "IB Innovative Solutions | Education, IT & Job Assistant",
    description:
      "Trusted professional services: tutoring, university applications, IT solutions, Send Me & Job Assistant bulk job applications. Gauteng & South Africa.",
    keywords:
      "IBIS, IB Innovative Solutions, education, tutoring, university applications, IT solutions, Send Me, Job Assistant, bulk job apply, South Africa, Gauteng, Johannesburg, Pretoria",
    image: "/ib-logo-white.png",
  },
  "/about": {
    title: "About IB Innovative Solutions | Trusted Services in South Africa",
    description:
      "Learn about IB Innovative Solutions and our mission to deliver reliable education, IT, and job support services across South Africa.",
    keywords:
      "about IBIS, IB Innovative Solutions, company profile, South Africa services",
    image: "/ib-logo-white.png",
  },
  "/contact": {
    title: "Contact Us | Get in Touch - IB Innovative Solutions",
    description:
      "Contact IBIS for education, IT, Send Me or Job Assistant. Phone, email & online enquiries. We respond promptly. Gauteng, South Africa.",
    keywords:
      "contact IBIS, get in touch, customer service, enquiry, South Africa, Gauteng, WhatsApp, support",
    image: "/ib-logo-white.png",
  },
  "/privacy": {
    title: "Privacy Policy - IB Innovative Solutions",
    description:
      "Read the IB Innovative Solutions privacy policy and learn how we protect your information.",
    keywords: "privacy policy, IBIS, data protection",
    image: "/ib-logo-white.png",
  },
  "/terms": {
    title: "Terms & Conditions - IB Innovative Solutions",
    description:
      "Review the terms and conditions for using IB Innovative Solutions services.",
    keywords: "terms and conditions, IBIS, service terms",
    image: "/ib-logo-white.png",
  },
  "/cookies": {
    title: "Cookie Policy - IB Innovative Solutions",
    description:
      "Understand how IB Innovative Solutions uses cookies and tracking technologies.",
    keywords: "cookie policy, IBIS, website cookies",
    image: "/ib-logo-white.png",
  },
  "/education": {
    title: "Education Services | Tutoring & University Applications - IBIS",
    description:
      "Tutoring, university applications & career guidance. Access all South African universities. Expert educational consulting & online learning. IBIS.",
    keywords:
      "education, tutoring, university applications, South African universities, career guidance, UCT, Wits, Stellenbosch, academic support, IBIS",
    image: "/og-image-education.jpg",
  },
  "/application-help": {
    title: "University Application Help | Admissions Support - IBIS",
    description:
      "Get one-on-one university application support for forms, documents, and submissions. Fast guidance for South African admissions requirements.",
    keywords:
      "application help, university admissions support, application forms, admission documents, South Africa universities, IBIS",
    image: "/og-image-education.jpg",
  },
  "/book-service": {
    title: "Send Me Services | Errands, Delivery & Personal Assistance - IBIS",
    description:
      "Book Send Me for errands, same-day delivery, personal assistance, and household task support. Fast, reliable on-demand help in Gauteng and across South Africa.",
    keywords:
      "Send Me services, errand running, same-day delivery, personal assistant, household tasks, on-demand help, Gauteng, South Africa, IBIS",
    image: "/og-image-send-me.jpg",
  },
  "/booking": {
    title: "Book Send Me Online | Errands, Delivery & Assistance - IBIS",
    description:
      "Submit your Send Me booking online for errands, delivery, and personal assistance. Share your address, preferred date, and service details for quick confirmation.",
    keywords:
      "book Send Me, Send Me booking online, errand booking, delivery booking, personal assistance booking, on-demand services, IBIS",
    image: "/og-image-send-me.jpg",
  },
  "/it-solutions": {
    title: "IT Solutions | Web Development & Tech Support - IBIS",
    description:
      "Web development, system maintenance & technical support. Digital solutions & technology consulting. Professional IT services.",
    keywords:
      "IT solutions, web development, tech support, digital solutions, software development, South Africa, IBIS",
    image: "/og-image-it.jpg",
  },
  "/universities": {
    title: "South African Universities | Applications & Admissions Help - IBIS",
    description:
      "Browse South African universities, compare programs, and apply through official portals. Get practical support for admissions, documents, and deadlines.",
    keywords:
      "South African universities, university applications, admissions help, application deadlines, UCT, Wits, UP, Stellenbosch, UNISA, IBIS",
    image: "/og-image-education.jpg",
  },
  "/recruiters": {
    title: "Recruiters | Find Talent with IBIS",
    description:
      "Connect with top candidates and manage recruitment workflows through IBIS recruiter tools.",
    keywords: "recruiters, hiring, talent search, recruitment, IBIS",
    image: "/ib-logo-white.png",
  },
  "/coming-soon": {
    title: "Coming Soon | IBIS",
    description:
      "This feature is currently in development and will be available soon. Stay tuned for updates from IB Innovative Solutions.",
    keywords: "coming soon, IBIS updates, new features",
    image: "/ib-logo-white.png",
  },
};

function absoluteUrl(route) {
  if (route === "/") {
    return SITE_URL;
  }

  return `${SITE_URL}${route}`;
}

function absoluteImage(imagePath) {
  if (!imagePath) {
    return `${SITE_URL}/ib-logo-black.png`;
  }

  return imagePath.startsWith("http") ? imagePath : `${SITE_URL}${imagePath}`;
}

const SEO_START = "<!-- seo-prerender:start -->";
const SEO_END = "<!-- seo-prerender:end -->";

function buildHead(route, data) {
  const url = absoluteUrl(route);
  const image = absoluteImage("/ib-logo-black.png");

  return `\n    ${SEO_START}\n    <title>${data.title}</title>\n    <meta name="description" content="${data.description}" />\n    <meta name="keywords" content="${data.keywords}" />\n    <meta name="author" content="IB Innovative Solutions" />\n    <meta name="robots" content="index, follow" />\n    <link rel="canonical" href="${url}" />\n\n    <meta property="og:title" content="${data.title}" />\n    <meta property="og:description" content="${data.description}" />\n    <meta property="og:image" content="${image}" />\n    <meta property="og:image:alt" content="${data.title} - IB Innovative Solutions" />\n    <meta property="og:url" content="${url}" />\n    <meta property="og:type" content="website" />\n    <meta property="og:site_name" content="IB Innovative Solutions" />\n    <meta property="og:locale" content="en_ZA" />\n\n    <meta name="twitter:card" content="summary_large_image" />\n    <meta name="twitter:title" content="${data.title}" />\n    <meta name="twitter:description" content="${data.description}" />\n    <meta name="twitter:image" content="${image}" />\n    <meta name="twitter:image:alt" content="${data.title} - IB Innovative Solutions" />\n    <meta name="twitter:site" content="@ibis_solutions" />\n    ${SEO_END}\n  `;
}

function stripSeoBlock(html) {
  const pattern = new RegExp(`\\s*${SEO_START}[\\s\\S]*?${SEO_END}\\s*`, "g");
  return html.replace(pattern, "\n");
}

function writeRouteHtml(route, html) {
  if (route === "/") {
    fs.writeFileSync(INDEX_PATH, html, "utf8");
    return;
  }

  const targetDir = path.join(DIST_DIR, route.replace(/^\//, ""));
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, "index.html"), html, "utf8");
}

function run() {
  if (!fs.existsSync(INDEX_PATH)) {
    throw new Error("dist/index.html not found. Run vite build first.");
  }

  const baseHtml = stripSeoBlock(fs.readFileSync(INDEX_PATH, "utf8"));

  for (const [route, data] of Object.entries(seoByRoute)) {
    const headMarkup = buildHead(route, data);
    const routeHtml = baseHtml.replace("</head>", `${headMarkup}\n  </head>`);
    writeRouteHtml(route, routeHtml);
  }

  console.log(
    `SEO prerender complete for ${Object.keys(seoByRoute).length} routes (${SITE_URL}).`
  );
}

run();
