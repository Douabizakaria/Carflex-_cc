import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import heroImg from '@assets/generated_images/Luxury_hero_car_image_99c8298c.png';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/60 z-10" />
        <img
          src={heroImg}
          alt="Luxury car"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-24 md:py-32">
        <div className="max-w-2xl">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6" data-testid="text-hero-title">
            Drive Your Dream Car,{" "}
            <span className="text-primary">No Commitment</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            Subscribe to flexible monthly or annual car plans. Switch vehicles, pause, or cancel anytime. 
            Experience premium driving without the long-term commitment.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Link href="/packs">
              <Button size="lg" className="text-lg px-8 py-6" data-testid="button-view-packs">
                View Packs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6" data-testid="button-learn-more">
                Learn More
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">No long-term commitment</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-primary" />
              <span className="text-muted-foreground">5-star rated service</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
