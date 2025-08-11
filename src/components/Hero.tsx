import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-[70vh] flex items-center justify-center px-6 py-12">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-4">
          Send Me
        </h1>
        
        <h2 className="text-2xl md:text-3xl text-muted-foreground font-medium mb-8">
          Your Trusted Helping Hand
        </h2>
        
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-12">
          Send Me Agent is a reliable service designed to assist individuals who need help completing 
          tasks they cannot manage due to time constraints. Whether it's running errands, organizing 
          schedules, delivering items, or providing specialized support, Send Me Agent connects you 
          with capable agents who prioritize efficiency and quality. With Send Me Agent, you can regain 
          control of your time while ensuring your tasks are handled with care and professionalism. 
          Let us take the load off your shoulders, so you can focus on what truly matters.
        </p>
        
        <Button 
          size="lg" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-semibold rounded-lg shadow-glow transition-all duration-300 hover:shadow-glow/80"
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          Whatsapp Me!
        </Button>
      </div>
    </section>
  );
};

export default Hero;