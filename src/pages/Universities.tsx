import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Globe, ExternalLink, MapPin as MapPinIcon } from "lucide-react";
import { Building2 } from "lucide-react";
import Layout from "@/components/Layout";
import Header from "@/components/Header";
import SEO from "@/components/SEO";

const southAfricanUniversities = [
  {
    id: 1,
    name: "University of Cape Town (UCT)",
    location: "Cape Town, Western Cape",
    website: "https://www.uct.ac.za",
    applicationUrl: "https://applyonline.uct.ac.za/",
    type: "Public",
    established: 1829,
    programs: ["Arts", "Commerce", "Engineering", "Health Sciences", "Law", "Science"],
    icon: Building2,
    lateApplication: true
  },
  {
    id: 2,
    name: "University of the Witwatersrand (Wits)",
    location: "Johannesburg, Gauteng",
    website: "https://www.wits.ac.za",
    applicationUrl: "https://www.wits.ac.za/applications/",
    type: "Public",
    established: 1896,
    programs: ["Arts", "Commerce", "Engineering", "Health Sciences", "Law", "Science"],
    icon: Building2,
    lateApplication: true
  },
  {
    id: 3,
    name: "Stellenbosch University",
    location: "Stellenbosch, Western Cape",
    website: "https://www.sun.ac.za",
    applicationUrl: "https://student.sun.ac.za//signup",
    type: "Public",
    established: 1866,
    programs: ["Arts", "Commerce", "Engineering", "Health Sciences", "Law", "Science", "Theology"],
    icon: Building2,
    lateApplication: true
  },
  {
    id: 4,
    name: "University of Pretoria (UP)",
    location: "Pretoria, Gauteng",
    website: "https://www.up.ac.za",
    applicationUrl: "https://www.up.ac.za/online-application",
    type: "Public",
    established: 1908,
    programs: ["Arts", "Commerce", "Engineering", "Health Sciences", "Law", "Science", "Education"],
    icon: Building2,
    lateApplication: true
  },
  {
    id: 5,
    name: "University of Johannesburg (UJ)",
    location: "Johannesburg, Gauteng",
    website: "https://www.uj.ac.za",
    applicationUrl: "https://registration.uj.ac.za/pls/prodi41/gen.gw1pkg.gw1startup?x_processcode=ITS_OAP",
    type: "Public",
    established: 2005,
    programs: ["Arts", "Commerce", "Engineering", "Health Sciences", "Law", "Science", "Education"],
    icon: Building2,
    lateApplication: true
  },
  {
    id: 6,
    name: "University of KwaZulu-Natal (UKZN)",
    location: "Durban, KwaZulu-Natal",
    website: "https://www.ukzn.ac.za",
    applicationUrl: "https://www.cao.ac.za/Apply.aspx?content=Apply",
    type: "Public",
    established: 2004,
    programs: ["Arts", "Commerce", "Engineering", "Health Sciences", "Law", "Science", "Agriculture"],
    icon: Building2,
    lateApplication: true
  },
  {
    id: 7,
    name: "Rhodes University",
    location: "Grahamstown, Eastern Cape",
    website: "https://www.ru.ac.za",
    applicationUrl: "https://ross.ru.ac.za/",
    type: "Public",
    established: 1904,
    programs: ["Arts", "Commerce", "Education", "Law", "Pharmacy", "Science"],
    icon: Building2,
    lateApplication: true
  },
  {
    id: 8,
    name: "University of the Free State (UFS)",
    location: "Bloemfontein, Free State",
    website: "https://www.ufs.ac.za",
    applicationUrl: "https://apply.ufs.ac.za/",
    type: "Public",
    established: 1904,
    programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Natural Sciences"],
    icon: Building2,
    lateApplication: true
  },
  {
    id: 9,
    name: "North-West University (NWU)",
    location: "Potchefstroom, North West",
    website: "https://www.nwu.ac.za",
    applicationUrl: "https://studies.nwu.ac.za/undergraduate-studies/application",
    type: "Public",
    established: 2004,
    programs: ["Arts", "Commerce", "Education", "Engineering", "Health Sciences", "Law", "Natural Sciences"],
    icon: Building2,
    lateApplication: true
  },
  {
    id: 10,
    name: "University of Limpopo",
    location: "Polokwane, Limpopo",
    website: "https://www.ul.ac.za",
    applicationUrl: "https://ulc-prod-webserver.ul.ac.za/pls/prodi41/gen.gw1pkg.gw1view",
    type: "Public",
    established: 2005,
    programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Science"],
    icon: Building2,
    lateApplication: true
  },
  {
    id: 11,
    name: "University of Venda",
    location: "Thohoyandou, Limpopo",
    website: "https://www.univen.ac.za",
    applicationUrl: "https://univenierp01.univen.ac.za/pls/prodi41/gen.gw1pkg.gw1startup?x_processcode=ITS_OAP",
    type: "Public",
    established: 1982,
    programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Science"],
    icon: Building2,
    lateApplication: true
  },
  {
    id: 12,
    name: "University of Fort Hare",
    location: "Alice, Eastern Cape",
    website: "https://www.ufh.ac.za",
    applicationUrl: "https://ienabler.ufh.ac.za/pls/prodi41/w99pkg.mi_login",
    type: "Public",
    established: 1916,
    programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Science"],
    icon: Building2,
    lateApplication: true
  },
  {
    id: 13,
    name: "University of the Western Cape (UWC)",
    location: "Cape Town, Western Cape",
    website: "https://www.uwc.ac.za",
    applicationUrl: "https://www.uwc.ac.za/admission-and-financial-aid/apply",
    type: "Public",
    established: 1959,
    programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Natural Sciences"],
    icon: Building2,
    lateApplication: true
  },
  {
    id: 14,
    name: "University of Zululand",
    location: "KwaDlangezwa, KwaZulu-Natal",
    website: "https://www.unizulu.ac.za",
    applicationUrl: "https://www.cao.ac.za/Apply.aspx?content=Apply",
    type: "Public",
    established: 1960,
    programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Science"],
    icon: Building2,
    lateApplication: true
  },
  {
    id: 15,
    name: "Walter Sisulu University",
    location: "Mthatha, Eastern Cape",
    website: "https://www.wsu.ac.za",
    applicationUrl: "https://wsu.ac.za/index.php/en/undergraduate-programmes/new-students/admission-requirement",
    type: "Public",
    established: 2005,
    programs: ["Arts", "Commerce", "Education", "Health Sciences", "Law", "Science"],
    icon: Building2,
    lateApplication: true
  },
  {
    id: 16,
    name: "Cape Peninsula University of Technology (CPUT)",
    location: "Cape Town, Western Cape",
    website: "https://www.cput.ac.za",
    applicationUrl: "https://alecto.cput.ac.za/pls/prodi41/gen.gw1pkg.gw1startup?x_processcode=ITS_OAP",
    type: "Public",
    established: 2005,
    programs: ["Applied Sciences", "Business", "Education", "Engineering", "Health Sciences"],
    icon: Building2
  },
  {
    id: 17,
    name: "Central University of Technology (CUT)",
    location: "Bloemfontein, Free State",
    website: "https://www.cut.ac.za",
    applicationUrl: "https://www.cut.ac.za/apply",
    type: "Public",
    established: 1981,
    programs: ["Applied Sciences", "Business", "Engineering", "Health Sciences"],
    icon: Building2
  },
  {
    id: 18,
    name: "Durban University of Technology (DUT)",
    location: "Durban, KwaZulu-Natal",
    website: "https://www.dut.ac.za",
    applicationUrl: "https://www.cao.ac.za/Apply.aspx?content=Apply",
    type: "Public",
    established: 2002,
    programs: ["Applied Sciences", "Business", "Engineering", "Health Sciences"],
    icon: Building2
  },
  {
    id: 19,
    name: "Mangosuthu University of Technology (MUT)",
    location: "Durban, KwaZulu-Natal",
    website: "https://www.mut.ac.za",
    applicationUrl: "https://www.cao.ac.za/Apply.aspx?content=Apply",
    type: "Public",
    established: 1979,
    programs: ["Applied Sciences", "Business", "Engineering"],
    icon: Building2
  },
  {
    id: 20,
    name: "Tshwane University of Technology (TUT)",
    location: "Pretoria, Gauteng",
    website: "https://www.tut.ac.za",
    applicationUrl: "https://applications-prod.tut.ac.za/",
    type: "Public",
    established: 2004,
    programs: ["Applied Sciences", "Business", "Engineering", "Health Sciences"],
    icon: Building2,
    lateApplication: true
  },
  {
    id: 21,
    name: "Vaal University of Technology (VUT)",
    location: "Vanderbijlpark, Gauteng",
    website: "https://www.vut.ac.za",
    applicationUrl: "https://www.vut.ac.za/apply",
    type: "Public",
    established: 1966,
    programs: ["Applied Sciences", "Business", "Engineering", "Health Sciences"],
    icon: Building2,
    lateApplication: true
  },
  {
    id: 22,
    name: "University of South Africa (UNISA)",
    location: "Pretoria, Gauteng",
    website: "https://www.unisa.ac.za",
    applicationUrl: "https://www.unisa.ac.za/apply",
    type: "Public",
    established: 1873,
    programs: ["Arts", "Commerce", "Education", "Law", "Science"],
    icon: Building2,
    lateApplication: true
  },
  {
    id: 23,
    name: "Sol Plaatje University",
    location: "Kimberley, Northern Cape",
    website: "https://www.spu.ac.za",
    applicationUrl: "https://applications-prod.spu.ac.za/",
    type: "Public",
    established: 2014,
    programs: ["Arts", "Commerce", "Education", "Natural Sciences"],
    icon: Building2,
    lateApplication: true
  },
  {
    id: 24,
    name: "University of Mpumalanga",
    location: "Mbombela, Mpumalanga",
    website: "https://www.ump.ac.za",
    applicationUrl: "https://www.ump.ac.za/Study-with-us/Application-Process/Online-Applications.aspx",
    type: "Public",
    established: 2014,
    programs: ["Agriculture", "Arts", "Commerce", "Education"],
    icon: Building2,
    lateApplication: true
  }
];


import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Universities = () => {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const [universitySearch, setUniversitySearch] = React.useState("");
  const filteredUniversities = southAfricanUniversities.filter(university =>
    university.name.toLowerCase().includes(universitySearch.toLowerCase()) ||
    university.location.toLowerCase().includes(universitySearch.toLowerCase()) ||
    university.programs.some(program =>
      program.toLowerCase().includes(universitySearch.toLowerCase())
    )
  );

  return (
    <Layout>
      <SEO
        page="universities"
        title="South African Universities | IB Innovative Solutions"
        description="IBIS - Innovative Business Solutions"
        keywords="universities, south africa, university applications, late application, university assistance, IB Innovative Solutions, education, public universities, apply online, university help"
        ogTitle="South African Universities | IB Innovative Solutions"
        ogDescription="IBIS - Innovative Business Solutions"
        ogImage="/ib-logo.png"
        ogType="website"
        ogUrl="https://ib-innovativesolutions.com/universities"
        twitterCard="summary_large_image"
        twitterSite="@ibis_solutions"
        twitterTitle="South African Universities | IB Innovative Solutions"
        twitterDescription="IBIS - Innovative Business Solutions"
        twitterImage="/ib-logo.png"
      />
      <div className="relative bg-white">
        <div className="absolute inset-0"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              South African Universities
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Explore all public universities in South Africa and apply directly through their official websites
            </p>
            <div className="mt-6 flex items-center justify-center space-x-4 text-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                <span className="text-sm font-medium">24 Public Universities</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                <span className="text-sm font-medium">Direct Applications</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                <span className="text-sm font-medium">Official Links</span>
              </div>
            </div>
          </div>
            {/* Contact Info Section */}
            <div className="mb-6 bg-blue-50 border-l-4 border-blue-600 p-4 rounded text-blue-900 shadow">
              <h2 className="font-bold text-lg mb-2">Need Application Help?</h2>
              <ul className="list-disc ml-6">
                <li>Email: <a href="mailto:innocent38318@gmail.com" className="text-blue-700 underline">innocent38318@gmail.com</a></li>
                <li>Call: <a href="tel:0684240852" className="text-blue-700 underline">068 424 0852</a></li>
              </ul>
              <p className="mt-2">Or use the Need Assistance button below to get help with your application.</p>
            </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search universities by name, location, or programs..."
                value={universitySearch}
                onChange={(e) => setUniversitySearch(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg bg-white/95 backdrop-blur-sm border-0 rounded-2xl shadow-lg focus:ring-2 focus:ring-white/50 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-500"
              />
            </div>
            {universitySearch && (
              <p className="text-center text-gray-700 mt-4">
                Showing {filteredUniversities.length} of {southAfricanUniversities.length} universities
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUniversities.length > 0 ? (
              filteredUniversities.map((university) => {
                const IconComponent = university.icon;
                return (
                  <Card key={university.id} className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-xl h-full flex flex-col bg-white"> 
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {university.name}
                            </CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <MapPinIcon className="h-4 w-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{university.location}</span>
                            </div>
                            {university.lateApplication && (
                              <Badge className="bg-green-600 text-white ml-1 animate-blink">Late Application Open</Badge>
                            )}
                          </div>
                        </div>
                        <Badge className={`${
                          university.type === "Public" 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-green-100 text-green-800"
                        }`}>
                          {university.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <div className="space-y-4 flex-1">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Established:</span>
                            <span className="font-medium text-gray-900">{university.established}</span>
                          </div>
                        </div>
                       
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900 text-sm">Programs:</h4>
                          <div className="flex flex-wrap gap-1">
                            {university.programs.slice(0, 4).map((program, index) => (
                              <Badge key={index} variant="outline" className="text-xs text-gray-600 border-gray-300">
                                {program}
                              </Badge>
                            ))}
                            {university.programs.length > 4 && (
                              <Badge variant="outline" className="text-xs text-gray-600 border-gray-300">
                                +{university.programs.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                     
                      <div className="flex space-x-2 pt-4 border-t border-gray-200 mt-auto">
                        <Button 
                          variant="outline"
                          className="flex-1 bg-white text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white hover:border-blue-700"
                          onClick={() => window.open(university.website, '_blank')}
                        >
                          <Globe className="mr-2 h-4 w-4" />
                          Website
                        </Button>
                        <Button 
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => window.open(university.applicationUrl, '_blank')}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Apply Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">No universities found</h3>
                  <p className="text-gray-600 mb-4">
                    No universities match your search for "{universitySearch}"
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setUniversitySearch("")}
                  >
                    Clear Search
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    {/* Ribbon Button at Bottom */}
    {/* Ribbon Button at Bottom */}
    <RibbonButton />
  </Layout>
 );
};


// Ribbon Button Component
function RibbonButton() {
  const navigate = useNavigate();
  return (
    <div style={{position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 50}} className="bg-blue-600 py-3 flex justify-center items-center shadow-lg">
      <Button
        className="bg-white text-blue-600 font-bold px-6 py-2 rounded-full border border-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow"
        onClick={() => navigate('/application-help')}
      >
        Need Assistance
      </Button>
    </div>
  );
}

export default Universities;
