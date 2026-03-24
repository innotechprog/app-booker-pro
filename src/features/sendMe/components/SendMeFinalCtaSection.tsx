import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendMeFinalCta } from "@/features/sendMe/constants";

interface SendMeFinalCtaSectionProps {
  onBookNow: () => void;
}

const SendMeFinalCtaSection = ({ onBookNow }: SendMeFinalCtaSectionProps) => {
  return (
    <section className="relative">
      <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-100" />
      <div className="relative z-10 px-6 py-20">
        <div className="mx-auto max-w-4xl rounded-3xl border border-gray-200 bg-white/90 p-10 text-center shadow-sm">
          <h3 className="mb-4 text-4xl font-bold text-gray-900">{sendMeFinalCta.title}</h3>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">{sendMeFinalCta.description}</p>
          <Button className="h-12 rounded-xl bg-blue-600 px-8 text-lg font-semibold text-white hover:bg-blue-700" onClick={onBookNow}>
            {sendMeFinalCta.ctaLabel}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="mt-4 text-sm text-gray-500">{sendMeFinalCta.footnote}</p>
        </div>
      </div>
    </section>
  );
};

export default SendMeFinalCtaSection;
