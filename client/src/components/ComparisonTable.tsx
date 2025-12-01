import { Check, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ComparisonTable() {
  const features = [
    { name: "Vehicle Category", budget: "Economy & Compact", midrange: "Sedans & SUVs", luxury: "Premium & Sports" },
    { name: "Monthly Mileage", budget: "1,500 miles", midrange: "2,500 miles", luxury: "Unlimited" },
    { name: "Insurance Coverage", budget: true, midrange: true, luxury: true },
    { name: "Roadside Assistance", budget: true, midrange: true, luxury: true },
    { name: "Vehicle Swaps/Month", budget: "1", midrange: "2", luxury: "Unlimited" },
    { name: "Premium Support", budget: false, midrange: true, luxury: true },
    { name: "Concierge Service", budget: false, midrange: false, luxury: true },
    { name: "Airport Delivery", budget: false, midrange: false, luxury: true },
  ];

  return (
    <div className="overflow-x-auto">
      <Table data-testid="table-comparison">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px] sticky left-0 bg-background z-10">Feature</TableHead>
            <TableHead className="text-center">Budget</TableHead>
            <TableHead className="text-center bg-primary/5">Midrange</TableHead>
            <TableHead className="text-center">Luxury</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.map((feature, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium sticky left-0 bg-background z-10">
                {feature.name}
              </TableCell>
              <TableCell className="text-center">
                {typeof feature.budget === "boolean" ? (
                  feature.budget ? (
                    <Check className="h-5 w-5 text-primary mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground mx-auto" />
                  )
                ) : (
                  <span className="text-sm">{feature.budget}</span>
                )}
              </TableCell>
              <TableCell className="text-center bg-primary/5">
                {typeof feature.midrange === "boolean" ? (
                  feature.midrange ? (
                    <Check className="h-5 w-5 text-primary mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground mx-auto" />
                  )
                ) : (
                  <span className="text-sm">{feature.midrange}</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {typeof feature.luxury === "boolean" ? (
                  feature.luxury ? (
                    <Check className="h-5 w-5 text-primary mx-auto" />
                  ) : (
                    <X className="h-5 w-5 text-muted-foreground mx-auto" />
                  )
                ) : (
                  <span className="text-sm">{feature.luxury}</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
