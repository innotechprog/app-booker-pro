import { sendMeReasons, sendMeReasonsTitle, SEND_ME_BRAND_BLUE } from "@/features/sendMe/constants";

const SendMeReasonsSection = () => {
  return (
    <section className="bg-blue-50 py-20">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <h2 className="mb-6 text-3xl font-bold text-blue-900">{sendMeReasonsTitle}</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {sendMeReasons.map((reason) => {
            const IconComponent = reason.icon;
            return (
              <div key={reason.title} className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
                <IconComponent className="mx-auto mb-2 h-10 w-10" style={{ color: SEND_ME_BRAND_BLUE }} />
                <h4 className="mb-2 font-semibold text-blue-700">{reason.title}</h4>
                <p className="text-sm text-gray-600">{reason.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SendMeReasonsSection;
