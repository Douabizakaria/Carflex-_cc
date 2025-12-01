import { Check } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PackCardProps {
  name: string;
  subtitle: string;
  image: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  isPopular?: boolean;
  billingPeriod: "monthly" | "yearly";
  onSelect: () => void;
}

export default function PackCard({
  name,
  subtitle,
  image,
  priceMonthly,
  priceYearly,
  features,
  isPopular = false,
  billingPeriod,
  onSelect,
}: PackCardProps) {
  const price = billingPeriod === "monthly" ? priceMonthly : priceYearly;
  const savings = billingPeriod === "yearly" ? Math.round(((priceMonthly * 12 - priceYearly) / (priceMonthly * 12)) * 100) : 0;

  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-lg ${isPopular ? 'border-primary shadow-md' : ''}`} data-testid={`card-pack-${name.toLowerCase()}`}>
      {isPopular && (
        <div className="absolute top-0 right-0">
          <Badge className="rounded-none rounded-bl-md" data-testid="badge-popular">
            Most Popular
          </Badge>
        </div>
      )}
      
      <CardHeader className="p-0">
        <div className="aspect-[4/3] overflow-hidden">
          <img
            src={image}
            alt={`${name} pack vehicle`}
            className="w-full h-full object-cover"
          />
        </div>
      </CardHeader>

      <CardContent className="p-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-1" data-testid={`text-pack-${name.toLowerCase()}`}>{name}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-4xl font-bold tabular-nums" data-testid={`text-price-${name.toLowerCase()}`}>
              ${price.toLocaleString()}
            </span>
            <span className="text-muted-foreground">
              /{billingPeriod === "monthly" ? "mo" : "yr"}
            </span>
          </div>
          {billingPeriod === "yearly" && savings > 0 && (
            <p className="text-sm text-primary font-medium">Save {savings}% with annual billing</p>
          )}
        </div>

        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="p-8 pt-0">
        <Button
          className="w-full"
          variant={isPopular ? "default" : "outline"}
          onClick={onSelect}
          data-testid={`button-select-${name.toLowerCase()}`}
        >
          Select {name}
        </Button>
      </CardFooter>
    </Card>
  );
}
