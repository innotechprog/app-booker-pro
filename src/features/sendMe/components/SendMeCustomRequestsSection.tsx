import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { beyondExamples, sendMeCustomRequestContent } from "@/features/sendMe/constants";
import { SEND_ME_BRAND_BLUE, SEND_ME_BTN_PRIMARY_MD } from "@/features/sendMe/buttonStyles";

interface SendMeCustomRequestsSectionProps {
  onBookNow: () => void;
}

const SendMeCustomRequestsSection = ({ onBookNow }: SendMeCustomRequestsSectionProps) => {
  return (
    <section className="bg-white px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">{sendMeCustomRequestContent.eyebrow}</p>
          <h3 className="mt-1 text-2xl font-bold text-blue-900">{sendMeCustomRequestContent.title}</h3>
          <p className="mt-2 max-w-3xl text-gray-700">{sendMeCustomRequestContent.description}</p>
          <ul className="mt-4 grid grid-cols-1 gap-2 text-sm text-gray-700 md:grid-cols-2">
            {beyondExamples.map((item) => (
              <li key={item} className="flex items-start gap-2 rounded-lg bg-white px-3 py-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <Button type="button" onClick={onBookNow} className={SEND_ME_BTN_PRIMARY_MD} style={{ backgroundColor: SEND_ME_BRAND_BLUE }}>
              {sendMeCustomRequestContent.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SendMeCustomRequestsSection;
