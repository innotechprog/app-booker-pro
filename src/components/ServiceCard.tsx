import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
}

const ServiceCard = ({ title, description, icon: Icon, features }: ServiceCardProps) => {
  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow/20 group">
      <CardContent className="p-8 text-center space-y-6">
        <div className="flex justify-center mb-4">
          <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
            <Icon className="h-8 w-8 text-primary" />
          </div>
        </div>
        
        <h3 className="text-2xl font-bold text-card-foreground mb-4">
          {title}
        </h3>
        
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {description}
        </p>
        
        <ul className="space-y-2 text-sm text-muted-foreground mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></span>
              {feature}
            </li>
          ))}
        </ul>
        
        <Button 
          variant="outline" 
          className="w-full border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
        >
          Book Service
        </Button>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;