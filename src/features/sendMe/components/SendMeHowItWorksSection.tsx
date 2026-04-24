import { sendMeHowItWorksSteps, sendMeHowItWorksTitle, SEND_ME_BRAND_BLUE } from "@/features/sendMe/constants";

const SendMeHowItWorksSection = () => {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">{sendMeHowItWorksTitle}</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {sendMeHowItWorksSteps.map((step, index) => (
            <div key={step.title} className="mx-auto flex max-w-xs flex-col items-center rounded-2xl border border-gray-100 bg-gray-50/60 p-5 text-center">
              <div
                className="mb-2 flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
                style={{ backgroundColor: SEND_ME_BRAND_BLUE }}
              >
                {index + 1}
              </div>
              <span className="font-medium text-gray-800">{step.title}</span>
              <p className="mt-1 text-sm text-gray-500">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SendMeHowItWorksSection;
