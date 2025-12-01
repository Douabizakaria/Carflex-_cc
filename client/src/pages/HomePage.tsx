import { Shield, Zap, Repeat, Award } from "lucide-react";
import Hero from "@/components/Hero";
import VehicleSearch from "@/components/VehicleSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import howItWorksImg from '@assets/generated_images/How_it_works_lifestyle_image_b9536e4b.png';

export default function HomePage() {
  const benefits = [
    {
      icon: Shield,
      title: "Fully Insured",
      description: "Comprehensive insurance coverage included with every subscription plan",
    },
    {
      icon: Zap,
      title: "Instant Access",
      description: "Get on the road within 48 hours of signing up",
    },
    {
      icon: Repeat,
      title: "Flexible Switching",
      description: "Change vehicles as your needs evolve, no penalties",
    },
    {
      icon: Award,
      title: "Premium Service",
      description: "24/7 support and roadside assistance included",
    },
  ];

  return (
    <div className="min-h-screen">
      <Hero />
      
      <div className="px-4 md:px-6 lg:px-8 pb-12">
        <VehicleSearch />
      </div>

      <section className="py-24 md:py-32 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Carflex?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the freedom of driving without the burden of ownership
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center hover-elevate" data-testid={`card-benefit-${index}`}>
                <CardHeader>
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                How It Works
              </h2>
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Choose Your Pack</h3>
                    <p className="text-muted-foreground">
                      Select from Budget, Midrange, or Luxury based on your needs and lifestyle
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Complete Your Profile</h3>
                    <p className="text-muted-foreground">
                      Quick and easy signup with instant verification
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Start Driving</h3>
                    <p className="text-muted-foreground">
                      Pick up your vehicle and hit the road within 48 hours
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src={howItWorksImg}
                alt="Customer receiving car keys"
                className="aspect-square rounded-lg object-cover w-full shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
