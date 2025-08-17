import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import heroImage from "@/images/hero.png";

const Hero = () => {
  return (
    <section className="min-h-[80vh] flex items-center px-6 py-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Side - Text Content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              IB Innovative Solutions
            </h1>
            
            <h2 className="text-2xl md:text-3xl text-white font-medium">
              Trusted solutions you can trust everyday.
            </h2>
          </div>
          
          <p className="text-lg text-gray-300 max-w-2xl leading-relaxed">
            We are committed to provide you with best solutions that is beyond your expectation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 text-lg font-semibold rounded-lg"
            >
              Request a quote
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg font-semibold rounded-lg"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Whatsapp us
            </Button>
          </div>
        </div>
        
        {/* Right Side - Hero Image */}
        <div className="relative h-[600px] flex items-center justify-center hidden lg:flex">
          <img 
            src={heroImage} 
            alt="IB Innovative Solutions Hero" 
            className="w-full h-full object-contain max-w-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;