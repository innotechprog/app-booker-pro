import { Button } from "@/components/ui/button";
import heroImage from "@/images/hero.png";

const Hero = () => {
  return (
    <section 
      className="min-h-[80vh] flex items-center justify-center px-6 py-6 relative"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      {/* Centered Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              IB Innovative Solutions
            </h1>
            
            <h2 className="text-2xl md:text-3xl text-white font-medium">
              Solutions you can trust everyday.
            </h2>
          </div>
          
          <p className="text-lg text-gray-200 max-w-2xl mx-auto leading-relaxed">
            We are committed to provide you with best solutions that is beyond your expectation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 text-lg font-semibold rounded-lg"
              onClick={() => window.location.href = '/contact'}
            >
              Contact Us
            </Button>
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 text-lg font-semibold rounded-lg border border-gray-600"
            >
              <a href="#services" aria-label="Learn more about our services">
                Learn more
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;