import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PackCard from "@/components/PackCard";
import ComparisonTable from "@/components/ComparisonTable";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import type { Pack } from "@shared/schema";
import budgetCarImg from '@assets/generated_images/Budget_pack_car_81b93d9f.png';
import midrangeCarImg from '@assets/generated_images/Midrange_pack_car_46b1bfb8.png';
import luxuryCarImg from '@assets/generated_images/Luxury_pack_car_b996ba79.png';

const packImages: Record<string, string> = {
  "Budget": budgetCarImg,
  "Midrange": midrangeCarImg,
  "Luxury": luxuryCarImg,
};

export default function PacksPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");
  const [loading, setLoading] = useState(false);

  const { data: packs, isLoading } = useQuery<Pack[]>({
    queryKey: ["/api/packs"],
  });

  const handleSelectPack = async (pack: Pack) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to subscribe to a pack",
        variant: "destructive",
      });
      setLocation("/auth");
      return;
    }

    // Prevent multiple simultaneous clicks
    if (loading) {
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/create-checkout-session", {
        packId: pack.id,
        billingPeriod,
      });

      const data = await res.json();

      if (data.url) {
        // Redirect to Stripe checkout (loading state will persist until redirect completes)
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Error",
        description: "Failed to initiate checkout. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading packs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-packs-title">
            Choose Your Perfect Plan
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Flexible subscription plans designed for every lifestyle and budget
          </p>

          <div className="inline-flex items-center gap-4 p-1 bg-muted rounded-lg">
            <Button
              variant={billingPeriod === "monthly" ? "default" : "ghost"}
              onClick={() => setBillingPeriod("monthly")}
              className="rounded-md"
              data-testid="button-monthly"
            >
              Monthly
            </Button>
            <Button
              variant={billingPeriod === "yearly" ? "default" : "ghost"}
              onClick={() => setBillingPeriod("yearly")}
              className="rounded-md"
              data-testid="button-yearly"
            >
              Yearly
              <span className="ml-2 text-xs bg-primary-foreground text-primary px-2 py-0.5 rounded-full">
                Save 17%
              </span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
          {packs?.map((pack) => (
            <PackCard
              key={pack.id}
              name={pack.name}
              subtitle={pack.subtitle}
              image={packImages[pack.name] || budgetCarImg}
              priceMonthly={Number(pack.priceMonthly)}
              priceYearly={Number(pack.priceYearly)}
              features={pack.features}
              isPopular={pack.isPopular}
              billingPeriod={billingPeriod}
              onSelect={() => handleSelectPack(pack)}
            />
          ))}
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Compare All Features</h2>
          <ComparisonTable />
        </div>
      </div>
    </div>
  );
}
