import { sendMeServices, sendMeServicesIntro } from "@/features/sendMe/constants";

const SendMeServicesGridSection = () => {
  return (
    <section className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50" />
      <div className="relative z-10 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">{sendMeServicesIntro.eyebrow}</p>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">{sendMeServicesIntro.title}</h2>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600">{sendMeServicesIntro.description}</p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sendMeServices.map((service) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={service.name}
                  className="group flex min-h-[180px] flex-col rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="rounded-lg bg-blue-50 p-2 transition-colors group-hover:bg-blue-100">
                      <IconComponent className="h-6 w-6 text-blue-700" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-600">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SendMeServicesGridSection;
