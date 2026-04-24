import { ArrowRight, CheckCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendMeHeroContent } from "@/features/sendMe/constants";
import { sendMeDarkGradient } from "@/features/sendMe/constants/layout";
import { SEND_ME_BRAND_BLUE, SEND_ME_BTN_PRIMARY_LG } from "@/features/sendMe/buttonStyles";

interface SendMeHeroSectionProps {
  onBookNow: () => void;
}

const SendMeHeroSection = ({ onBookNow }: SendMeHeroSectionProps) => {
  return (
    <section className={`relative overflow-hidden ${sendMeDarkGradient}`}>
      <div className="pointer-events-none absolute inset-0 select-none opacity-30">
        <svg width="100%" height="100%" viewBox="0 0 1440 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
          <circle cx="1200" cy="100" r="180" fill="#fff" fillOpacity="0.07" />
          <circle cx="200" cy="400" r="120" fill="#fff" fillOpacity="0.04" />
          <circle cx="800" cy="300" r="100" fill="#fff" fillOpacity="0.06" />
        </svg>
      </div>
      <div className="relative z-10 mx-auto flex min-h-[520px] w-full max-w-6xl items-center px-6 py-20">
        <div className="w-full text-center">
          <div className="mx-auto mb-6 inline-flex items-center justify-center rounded-full bg-white/10 p-3 ring-1 ring-white/20">
            <Send className="h-10 w-10 text-white" />
          </div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-blue-100/90">{sendMeHeroContent.eyebrow}</p>
          <h1 className="mb-6 text-4xl font-bold text-white md:text-6xl">{sendMeHeroContent.title}</h1>
          <p className="mx-auto mb-8 max-w-3xl text-base leading-relaxed text-white/90 md:text-xl">{sendMeHeroContent.description}</p>
          <div className="mb-10 flex flex-wrap justify-center gap-3">
            {sendMeHeroContent.highlights.map((highlight) => (
              <div key={highlight} className="flex items-center space-x-2 rounded-full bg-white/20 px-4 py-2 backdrop-blur-sm">
                <CheckCircle className="h-5 w-5 text-white" />
                <span className="text-white">{highlight}</span>
              </div>
            ))}
          </div>
          <Button className={SEND_ME_BTN_PRIMARY_LG} style={{ backgroundColor: SEND_ME_BRAND_BLUE }} onClick={onBookNow}>
            {sendMeHeroContent.ctaLabel}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default SendMeHeroSection;
