import { Button } from "@/components/ui/button";
import heroImage from "@/images/hero.png";
import { heroContent } from "@/features/public/constants";

const HeroSection = () => {
  return (
    <section
      className="relative flex min-h-[80vh] items-center justify-center px-6 py-6"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="mb-4 text-5xl font-bold text-white md:text-6xl">{heroContent.title}</h1>

            <h2 className="text-2xl font-medium text-white md:text-3xl">{heroContent.subtitle}</h2>
          </div>

          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-200">{heroContent.description}</p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              className="rounded-lg bg-gray-800 px-8 py-4 text-lg font-semibold text-white hover:bg-gray-700"
              onClick={() => {
                window.location.href = "/contact";
              }}
            >
              {heroContent.primaryActionLabel}
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="rounded-lg border border-gray-600 bg-gray-800 px-8 py-4 text-lg font-semibold text-white hover:bg-gray-700"
            >
              <a href="#services" aria-label="Learn more about our services">
                {heroContent.secondaryActionLabel}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
