import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function VehicleSearch() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");

  const cities = [
    "Paris", "Lyon", "Marseille", "Toulouse", "Nice", 
    "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille"
  ];

  const categories = [
    "Budget", "Midrange", "Luxury"
  ];

  const handleSearch = () => {
    if (!city || !category) {
      toast({
        title: "Please select both city and category",
        description: "Both fields are required to search",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Search initiated",
      description: `Searching for ${category} vehicles in ${city}`,
    });
  };

  const handleMonthlySubscription = () => {
    setLocation("/packs");
  };

  const handleManageBooking = () => {
    setLocation("/dashboard");
  };

  const handleLongTermLease = () => {
    toast({
      title: "Coming soon",
      description: "Long-term lease options will be available soon",
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto -mt-12 relative z-10">
      <Card className="shadow-2xl border-2">
        <CardContent className="p-6">
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="search" data-testid="tab-search">
                Search Now
              </TabsTrigger>
              <TabsTrigger 
                value="subscription" 
                onClick={handleMonthlySubscription}
                data-testid="tab-subscription"
              >
                Monthly Subscription
              </TabsTrigger>
              <TabsTrigger 
                value="booking" 
                onClick={handleManageBooking}
                data-testid="tab-booking"
              >
                Manage My Booking
              </TabsTrigger>
              <TabsTrigger 
                value="lease" 
                onClick={handleLongTermLease}
                data-testid="tab-lease"
              >
                Long-term Lease
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">City</label>
                  <Select value={city} onValueChange={setCity}>
                    <SelectTrigger data-testid="select-city">
                      <SelectValue placeholder="--Select--" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="--Select--" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={handleSearch} 
                    className="w-full" 
                    size="lg"
                    data-testid="button-search"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
