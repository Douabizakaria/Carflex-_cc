import { useQuery } from "@tanstack/react-query";
import { Users, CreditCard, Car, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

interface Stats {
  totalUsers: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
  totalRevenue: string;
}

export default function AdminDashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && user.role === "admin",
  });

  if (authLoading) {
    return (
      <div className="min-h-screen py-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    setLocation("/");
    return null;
  }

  if (statsLoading) {
    return (
      <div className="min-h-screen py-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading statistics...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      testId: "card-total-users",
    },
    {
      title: "Total Subscriptions",
      value: stats?.totalSubscriptions || 0,
      icon: Car,
      testId: "card-total-subscriptions",
    },
    {
      title: "Active Subscriptions",
      value: stats?.activeSubscriptions || 0,
      icon: CreditCard,
      testId: "card-active-subscriptions",
    },
    {
      title: "Total Revenue",
      value: `$${stats?.totalRevenue || "0.00"}`,
      icon: DollarSign,
      testId: "card-total-revenue",
    },
  ];

  return (
    <div className="min-h-screen py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2" data-testid="text-admin-title">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage Carflex platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat) => (
            <Card key={stat.title} data-testid={stat.testId}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                onClick={() => setLocation("/admin/users")}
                className="w-full text-left px-4 py-3 rounded-md hover-elevate active-elevate-2"
                data-testid="button-manage-users"
              >
                <Users className="h-5 w-5 inline-block mr-3" />
                Manage Users
              </button>
              <button
                onClick={() => setLocation("/admin/subscriptions")}
                className="w-full text-left px-4 py-3 rounded-md hover-elevate active-elevate-2"
                data-testid="button-manage-subscriptions"
              >
                <Car className="h-5 w-5 inline-block mr-3" />
                Manage Subscriptions
              </button>
              <button
                onClick={() => setLocation("/admin/packs")}
                className="w-full text-left px-4 py-3 rounded-md hover-elevate active-elevate-2"
                data-testid="button-manage-packs"
              >
                <CreditCard className="h-5 w-5 inline-block mr-3" />
                Manage Packs
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Activity tracking coming soon...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
