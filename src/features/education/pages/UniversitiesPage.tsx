import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, ExternalLink, MapPin as MapPinIcon } from "lucide-react";
import { Building2 } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

/** 2027 admissions window (indicative). Confirm on each institution’s site. */
const southAfricanUniversities = [
  { id: 1, name: "University of Cape Town (UCT)", location: "Cape Town, Western Cape", website: "https://www.uct.ac.za", applicationUrl: "https://applyonline.uct.ac.za/", type: "Public", established: 1829, applicationsOpen: "1 April 2026", typicalClosing: "31 July 2026", programs: ["Arts", "Commerce", "Engineering", "Health Sciences", "Law", "Science"], icon: Building2 },
  { id: 2, name: "University of the Witwatersrand (Wits)", location: "Johannesburg, Gauteng", website: "https://www.wits.ac.za", applicationUrl: "https://www.wits.ac.za/applications/", type: "Public", established: 1896, applicationsOpen: "1 March 2026", typicalClosing: "30 June / 30 Sept 2026", programs: ["Arts", "Commerce", "Engineering", "Health Sciences", "Law", "Science"], icon: Building2 },
  { id: 3, name: "Stellenbosch University", location: "Stellenbosch, Western Cape", website: "https://www.sun.ac.za", applicationUrl: "https://student.sun.ac.za//signup", type: "Public", established: 1866, applicationsOpen: "1 April 2026", typicalClosing: "31 July 2026", programs: ["Arts", "Commerce", "Engineering", "Health Sciences", "Law", "Science", "Theology"], icon: Building2 },
  { id: 4, name: "University of Pretoria (UP)", location: "Pretoria, Gauteng", website: "https://www.up.ac.za", applicationUrl: "https://www.up.ac.za/online-application", type: "Public", established: 1908, applicationsOpen: "1 April 2026", typicalClosing: "30 June 2026", programs: ["Arts", "Commerce", "Engineering", "Health Sciences", "Law", "Science", "Education"], icon: Building2 },
  { id: 5, name: "University of Johannesburg (UJ)", location: "Johannesburg, Gauteng", website: "https://www.uj.ac.za", applicationUrl: "https://registration.uj.ac.za/pls/prodi41/gen.gw1pkg.gw1startup?x_processcode=ITS_OAP", type: "Public", established: 2005, applicationsOpen: "1 April 2026", typicalClosing: "30 September 2026", programs: ["Arts", "Commerce", "Engineering", "Health Sciences", "Law", "Science", "Education"], icon: Building2 },
  { id: 6, name: "University of KwaZulu-Natal (UKZN)", location: "Durban, KwaZulu-Natal", website: "https://www.ukzn.ac.za", applicationUrl: "https://www.cao.ac.za/Apply.aspx?content=Apply", type: "Public", established: 2004, applicationsOpen: "March / April 2026", typicalClosing: "30 September 2026", programs: ["Arts", "Commerce", "Engineering", "Health Sciences", "Law", "Science", "Agriculture"], icon: Building2 },
  { id: 7, name: "Rhodes University", location: "Grahamstown, Eastern Cape", website: "https://www.ru.ac.za", applicationUrl: "https://ross.ru.ac.za/", type: "Public", established: 1904, applicationsOpen: "1 April 2026", typicalClosing: "30 September 2026", programs: ["Arts", "Commerce", "Education", "Law", "Pharmacy", "Science"], icon: Building2 },
  { id: 8, name: "University of the Free State (UFS)", location: "Bloemfontein, Free State", website: "https://www.ufs.ac.za", applicationUrl: "https://apply.ufs.ac.za/", type: "Public", established: 1904, applicationsOpen: "1 April 2026", typicalClosing: "30 September 2026", programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Natural Sciences"], icon: Building2 },
  { id: 9, name: "North-West University (NWU)", location: "Potchefstroom, North West", website: "https://www.nwu.ac.za", applicationUrl: "https://studies.nwu.ac.za/undergraduate-studies/application", type: "Public", established: 2004, applicationsOpen: "1 March 2026", typicalClosing: "31 August 2026", programs: ["Arts", "Commerce", "Education", "Engineering", "Health Sciences", "Law", "Natural Sciences"], icon: Building2 },
  { id: 10, name: "University of Limpopo", location: "Polokwane, Limpopo", website: "https://www.ul.ac.za", applicationUrl: "https://ulc-prod-webserver.ul.ac.za/pls/prodi41/gen.gw1pkg.gw1view", type: "Public", established: 2005, applicationsOpen: "1 April 2026", typicalClosing: "30 September 2026", programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Science"], icon: Building2 },
  { id: 11, name: "University of Venda", location: "Thohoyandou, Limpopo", website: "https://www.univen.ac.za", applicationUrl: "https://univenierp01.univen.ac.za/pls/prodi41/gen.gw1pkg.gw1startup?x_processcode=ITS_OAP", type: "Public", established: 1982, applicationsOpen: "1 April 2026", typicalClosing: "30 September 2026", programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Science"], icon: Building2 },
  { id: 12, name: "University of Fort Hare", location: "Alice, Eastern Cape", website: "https://www.ufh.ac.za", applicationUrl: "https://ienabler.ufh.ac.za/pls/prodi41/w99pkg.mi_login", type: "Public", established: 1916, applicationsOpen: "1 April 2026", typicalClosing: "30 September 2026", programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Science"], icon: Building2 },
  { id: 13, name: "University of the Western Cape (UWC)", location: "Cape Town, Western Cape", website: "https://www.uwc.ac.za", applicationUrl: "https://www.uwc.ac.za/admission-and-financial-aid/apply", type: "Public", established: 1959, applicationsOpen: "1 April 2026", typicalClosing: "30 September 2026", programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Natural Sciences"], icon: Building2 },
  { id: 14, name: "University of Zululand", location: "KwaDlangezwa, KwaZulu-Natal", website: "https://www.unizulu.ac.za", applicationUrl: "https://www.cao.ac.za/Apply.aspx?content=Apply", type: "Public", established: 1960, applicationsOpen: "1 April 2026", typicalClosing: "30 September 2026", programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Science"], icon: Building2 },
  { id: 15, name: "Walter Sisulu University", location: "Mthatha, Eastern Cape", website: "https://www.wsu.ac.za", applicationUrl: "https://wsu.ac.za/index.php/en/undergraduate-programmes/new-students/admission-requirement", type: "Public", established: 2005, applicationsOpen: "1 April 2026", typicalClosing: "30 September 2026", programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Science"], icon: Building2 },
  { id: 16, name: "Cape Peninsula University of Technology (CPUT)", location: "Cape Town, Western Cape", website: "https://www.cput.ac.za", applicationUrl: "https://alecto.cput.ac.za/pls/prodi41/gen.gw1pkg.gw1startup?x_processcode=ITS_OAP", type: "Public", established: 2005, applicationsOpen: "May 2026", typicalClosing: "30 September 2026", programs: ["Applied Sciences", "Business", "Education", "Engineering", "Health Sciences"], icon: Building2 },
  { id: 17, name: "Central University of Technology (CUT)", location: "Bloemfontein, Free State", website: "https://www.cut.ac.za", applicationUrl: "https://www.cut.ac.za/apply", type: "Public", established: 1981, applicationsOpen: "April / May 2026", typicalClosing: "30 September 2026", programs: ["Applied Sciences", "Business", "Engineering", "Health Sciences"], icon: Building2 },
  { id: 18, name: "Durban University of Technology (DUT)", location: "Durban, KwaZulu-Natal", website: "https://www.dut.ac.za", applicationUrl: "https://www.cao.ac.za/Apply.aspx?content=Apply", type: "Public", established: 2002, applicationsOpen: "1 April 2026", typicalClosing: "30 September 2026", programs: ["Applied Sciences", "Business", "Engineering", "Health Sciences"], icon: Building2 },
  { id: 19, name: "Mangosuthu University of Technology (MUT)", location: "Durban, KwaZulu-Natal", website: "https://www.mut.ac.za", applicationUrl: "https://www.cao.ac.za/Apply.aspx?content=Apply", type: "Public", established: 1979, applicationsOpen: "1 April 2026", typicalClosing: "30 September 2026", programs: ["Applied Sciences", "Business", "Engineering"], icon: Building2 },
  { id: 20, name: "Tshwane University of Technology (TUT)", location: "Pretoria, Gauteng", website: "https://www.tut.ac.za", applicationUrl: "https://applications-prod.tut.ac.za/", type: "Public", established: 2004, applicationsOpen: "March / April 2026", typicalClosing: "30 September 2026", programs: ["Applied Sciences", "Business", "Engineering", "Health Sciences"], icon: Building2 },
  { id: 21, name: "Vaal University of Technology (VUT)", location: "Vanderbijlpark, Gauteng", website: "https://www.vut.ac.za", applicationUrl: "https://www.vut.ac.za/apply", type: "Public", established: 1966, applicationsOpen: "1 April 2026", typicalClosing: "30 September 2026", programs: ["Applied Sciences", "Business", "Engineering", "Health Sciences"], icon: Building2 },
  { id: 22, name: "University of South Africa (UNISA)", location: "Pretoria, Gauteng", website: "https://www.unisa.ac.za", applicationUrl: "https://www.unisa.ac.za/apply", type: "Public", established: 1873, applicationsOpen: "1 September 2026", typicalClosing: "Varies (late in year)", programs: ["Arts", "Commerce", "Education", "Law", "Science"], icon: Building2 },
  { id: 23, name: "Sol Plaatje University", location: "Kimberley, Northern Cape", website: "https://www.spu.ac.za", applicationUrl: "https://applications-prod.spu.ac.za/", type: "Public", established: 2014, applicationsOpen: "1 April 2026", typicalClosing: "30 September 2026", programs: ["Arts", "Commerce", "Education", "Natural Sciences"], icon: Building2 },
  { id: 24, name: "University of Mpumalanga", location: "Mbombela, Mpumalanga", website: "https://www.ump.ac.za", applicationUrl: "https://www.ump.ac.za/Study-with-us/Application-Process/Online-Applications.aspx", type: "Public", established: 2014, applicationsOpen: "1 April 2026", typicalClosing: "30 September 2026", programs: ["Agriculture", "Arts", "Commerce", "Education"], icon: Building2 },
];

/**
 * Future late-application messaging: add e.g. `lateApplication?: boolean` on entries above,
 * or a `Set` of ids, when you want badges or filters again (previously shown on cards).
 */

const UniversitiesPage = () => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [universitySearch, setUniversitySearch] = React.useState("");
  const filteredUniversities = southAfricanUniversities.filter(
    (university) =>
      university.name.toLowerCase().includes(universitySearch.toLowerCase()) ||
      university.location.toLowerCase().includes(universitySearch.toLowerCase()) ||
      university.programs.some((program) => program.toLowerCase().includes(universitySearch.toLowerCase())),
  );

  return (
    <Layout>
      <SEO
        page="universities"
        title="South African Universities | IB Innovative Solutions"
        description="IBIS - Innovative Business Solutions"
        keywords="universities, south africa, university applications, application deadlines, 2027 admissions, university assistance, IB Innovative Solutions, education, public universities, apply online, university help"
      />
      <div className="relative bg-white">
        <div className="absolute inset-0"></div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">South African Universities</h2>
            <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-700">
              Explore all public universities in South Africa and apply directly through their official websites.
            </p>
            <p className="mx-auto mt-3 max-w-3xl text-sm text-gray-600">
              Application open and typical closing dates are indicative for 2027 undergraduate intakes—confirm on each university’s admissions page.
            </p>
          </div>

          <div className="mb-6 rounded border-l-4 border-blue-600 bg-blue-50 p-4 text-blue-900 shadow">
            <h2 className="mb-2 text-lg font-bold">Need Application Help?</h2>
            <ul className="ml-6 list-disc">
              <li>Email: <a href="mailto:innocent38318@gmail.com" className="text-blue-700 underline">innocent38318@gmail.com</a></li>
              <li>Call: <a href="tel:0684240852" className="text-blue-700 underline">068 424 0852</a></li>
            </ul>
            <p className="mt-2">Or use the Need Assistance button below to get help with your application.</p>
          </div>

          <div className="mx-auto mb-12 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
              <Input
                type="text"
                placeholder="Search universities by name, location, or programs..."
                value={universitySearch}
                onChange={(e) => setUniversitySearch(e.target.value)}
                className="rounded-2xl border-0 bg-white/95 py-4 pl-12 pr-4 text-lg text-gray-900 shadow-lg transition-all duration-300 placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-white/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredUniversities.map((university) => {
              const IconComponent = university.icon;
              const maxProgramTags = 4;
              const visiblePrograms = university.programs.slice(0, maxProgramTags);
              const morePrograms = university.programs.length - maxProgramTags;
              return (
                <Card
                  key={university.id}
                  className="group flex h-full flex-col rounded-xl border-0 bg-white shadow-xl transition-all duration-300 hover:shadow-2xl"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-1 items-start space-x-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-lg font-bold leading-snug text-blue-600 transition-colors group-hover:text-blue-700">
                            {university.name}
                          </CardTitle>
                          <div className="mt-1.5 flex items-start gap-2">
                            <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                            <span className="text-sm text-gray-600">{university.location}</span>
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={`shrink-0 rounded-full px-2.5 py-0.5 ${
                          university.type === "Public" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                        }`}
                      >
                        {university.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col pt-0">
                    <div className="flex-1 space-y-3">
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="text-gray-600">Established:</span>
                        <span className="font-semibold text-gray-900">{university.established}</span>
                      </div>
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="shrink-0 text-gray-600">Applications open:</span>
                        <span className="text-right font-semibold text-gray-900">{university.applicationsOpen}</span>
                      </div>
                      <div className="flex justify-between gap-3 text-sm">
                        <span className="shrink-0 text-gray-600">Typical closing:</span>
                        <span className="text-right font-semibold text-gray-900">{university.typicalClosing}</span>
                      </div>
                      <div>
                        <p className="mb-2 text-sm font-medium text-gray-700">Programs:</p>
                        <div className="flex flex-wrap gap-1.5">
                          {visiblePrograms.map((program) => (
                            <Badge
                              key={program}
                              variant="outline"
                              className="rounded-full border-gray-300 bg-white font-normal text-gray-700 hover:bg-gray-50"
                            >
                              {program}
                            </Badge>
                          ))}
                          {morePrograms > 0 && (
                            <Badge
                              variant="outline"
                              className="rounded-full border-gray-300 bg-gray-50 font-normal text-gray-600"
                            >
                              +{morePrograms} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-auto flex space-x-2 border-t border-gray-200 pt-4">
                      <Button variant="outline" className="flex-1 border-blue-600 bg-white text-blue-600 hover:border-blue-700 hover:bg-blue-600 hover:text-white" onClick={() => window.open(university.website, "_blank")}>
                        <Globe className="mr-2 h-4 w-4" />
                        Website
                      </Button>
                      <Button className="flex-1 bg-blue-600 text-white hover:bg-blue-700" onClick={() => window.open(university.applicationUrl, "_blank")}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Apply Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
      <RibbonButton />
    </Layout>
  );
};

function RibbonButton() {
  const navigate = useNavigate();
  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 50 }} className="flex items-center justify-center bg-blue-600 py-3 shadow-lg">
      <Button className="rounded-full border border-blue-600 bg-white px-6 py-2 font-bold text-blue-600 shadow hover:bg-blue-50 hover:text-blue-700" onClick={() => navigate("/application-help")}>
        Need Assistance
      </Button>
    </div>
  );
}

export default UniversitiesPage;
