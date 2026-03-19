import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface ServiceInfoCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
}

const ServiceInfoCard = ({ title, description, icon: Icon, features }: ServiceInfoCardProps) => {
  return (
    <Card className="group border-border bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-glow/20">
      <CardContent className="space-y-6 p-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-primary/10 p-4 transition-colors group-hover:bg-primary/20">
            <Icon className="h-8 w-8 text-primary" />
          </div>
        </div>

        <h3 className="mb-4 text-2xl font-bold text-card-foreground">{title}</h3>

        <p className="mb-6 leading-relaxed text-muted-foreground">{description}</p>

        <ul className="mb-6 space-y-2 text-sm text-muted-foreground">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center justify-center">
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-primary"></span>
              {feature}
            </li>
          ))}
        </ul>

        <Button
          variant="outline"
          className="w-full border-primary/30 text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
          onClick={() => {
            const searchParams = new URLSearchParams({ service: title });
            window.location.href = `/book-service?${searchParams.toString()}`;
          }}
        >
          Book Service
        </Button>
      </CardContent>
    </Card>
  );
};

export default ServiceInfoCard;
