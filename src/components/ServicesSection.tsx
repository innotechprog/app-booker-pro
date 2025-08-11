import ServiceCard from "./ServiceCard";
import { Car, Package, User } from "lucide-react";

const ServicesSection = () => {
  const services = [
    {
      title: "Errand Running",
      description: "Let us handle your daily errands while you focus on what matters most. From grocery shopping to bill payments, we've got you covered.",
      icon: Car,
      features: [
        "Grocery Shopping",
        "Bill Payments",
        "Document Collection",
        "Banking Services",
        "Appointment Scheduling"
      ]
    },
    {
      title: "Delivery Services", 
      description: "Fast and reliable delivery services for packages, documents, and goods. We ensure your items reach their destination safely and on time.",
      icon: Package,
      features: [
        "Same-day Delivery",
        "Document Courier",
        "Package Pickup",
        "Express Services",
        "Tracking Updates"
      ]
    },
    {
      title: "Personal Assistance",
      description: "Comprehensive personal assistance tailored to your unique needs. From organizing schedules to providing specialized support.",
      icon: User,
      features: [
        "Schedule Management",
        "Event Planning",
        "Research Tasks",
        "Travel Arrangements",
        "Personal Shopping"
      ]
    }
  ];

  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              title={service.title}
              description={service.description}
              icon={service.icon}
              features={service.features}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;