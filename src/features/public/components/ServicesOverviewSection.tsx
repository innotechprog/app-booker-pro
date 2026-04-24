import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { publicServices } from "@/features/public/constants";

const ServicesOverviewSection = () => {
  const navigate = useNavigate();
  const hasSmartApplyToken = !!localStorage.getItem("smart_apply_token");
  const visibleServices = hasSmartApplyToken
    ? publicServices
    : publicServices.filter((service) => service.route !== "/smart-apply");

  return (
    <section className="relative px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <h2 className="mb-6 bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-5xl font-bold text-transparent">Our Services</h2>
          <p className="mx-auto max-w-3xl text-xl leading-relaxed text-gray-600">
            Discover our comprehensive range of professional services designed to meet your needs with excellence and reliability
          </p>
        </div>

        <div className="mb-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {visibleServices.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div key={index} className="group relative" style={{ animationDelay: `${index * 100}ms` }}>
                <div
                  className="flex h-full cursor-pointer flex-col items-center justify-center space-y-4 rounded-2xl border-0 bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-sm font-medium text-white shadow-lg transition-all duration-500 hover:scale-105 hover:from-blue-900 hover:to-blue-800 hover:shadow-2xl hover:shadow-blue-500/25"
                  onClick={() => navigate(service.route)}
                >
                  <div className="relative">
                    <IconComponent className="h-12 w-12 text-blue-400 transition-colors duration-300 group-hover:text-blue-300" />
                    <div className="absolute -inset-3 rounded-full bg-blue-400/20 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100"></div>
                  </div>
                  <div className="space-y-2 text-center">
                    <h3 className="text-xl font-bold leading-tight">{service.name}</h3>
                    <p className="text-sm leading-relaxed text-gray-300">{service.description}</p>
                    {service.features && (
                      <ul className="mt-2 space-y-1 text-xs text-blue-100">
                        {service.features.map((feature: string, idx: number) => (
                          <li key={idx} className="flex items-center justify-center">
                            <span className="mr-2 h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/0 to-blue-600/0 transition-all duration-300 group-hover:from-blue-600/10 group-hover:to-blue-600/5"></div>
              </div>
            );
          })}
        </div>

        <div className="text-center">
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 p-8 shadow-xl">
            <h3 className="mb-4 text-2xl font-bold text-white">Have questions or need a custom solution?</h3>
            <p className="mx-auto mb-6 max-w-2xl text-blue-100">
              Reach out to our team and we&apos;ll help you find the perfect service for your needs.
            </p>
            <Button
              size="lg"
              className="rounded-xl bg-white px-8 py-3 text-lg font-semibold text-blue-600 shadow-lg transition-all duration-300 hover:bg-gray-100 hover:shadow-xl"
              onClick={() => navigate("/contact")}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesOverviewSection;
