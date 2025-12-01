import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { User, CreditCard, Car, Settings, LogOut, Edit } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import type { Subscription, Pack, Payment } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DashboardPage() {
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  const { data: subscription, isLoading: subscriptionLoading } = useQuery<Subscription & { pack: Pack } | null>({
    queryKey: ["/api/user/subscription"],
    enabled: !!user,
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ["/api/user/payments"],
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name?: string; phone?: string; address?: string }) => {
      const res = await apiRequest("PATCH", "/api/user/profile", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setEditProfileOpen(false);
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(editForm);
  };

  const handleCancelSubscription = () => {
    toast({
      title: "Cancellation requested",
      description: "We'll process your request within 24 hours.",
    });
  };

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    setLocation("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2" data-testid="text-dashboard-title">
              Welcome back, {user.name.split(' ')[0]}!
            </h1>
            <p className="text-muted-foreground">Manage your subscription and profile</p>
          </div>
          <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {subscriptionLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading subscription data...</p>
          </div>
        ) : (
          <>
            {subscription ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card data-testid="card-subscription-status">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Subscription</CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{subscription.pack.name} Pack</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <Badge variant="default" className="mt-2">
                        {subscription.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </p>
                  </CardContent>
                </Card>

                <Card data-testid="card-next-billing">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${subscription.billingPeriod === "monthly" 
                        ? Number(subscription.pack.priceMonthly) 
                        : Number(subscription.pack.priceYearly)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Due on {new Date(subscription.nextBillingDate).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>

                <Card data-testid="card-mileage">
                  <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Mileage Used</CardTitle>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {subscription.mileageUsed}
                      {subscription.pack.mileageLimit ? `/${subscription.pack.mileageLimit}` : " miles"}
                    </div>
                    {subscription.pack.mileageLimit && (
                      <div className="w-full bg-muted rounded-full h-2 mt-2">
                        <div
                          className="bg-primary h-2 rounded-full"
                          style={{ 
                            width: `${Math.min((subscription.mileageUsed / subscription.pack.mileageLimit) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="mb-8">
                <CardContent className="py-12 text-center">
                  <Car className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h2 className="text-2xl font-bold mb-2">No Active Subscription</h2>
                  <p className="text-muted-foreground mb-6">
                    You don't have an active subscription yet. Choose a pack to get started!
                  </p>
                  <Button onClick={() => setLocation("/packs")}>
                    View Subscription Packs
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
            <TabsTrigger value="subscription" data-testid="tab-subscription">Subscription</TabsTrigger>
            <TabsTrigger value="payments" data-testid="tab-payments">Payment History</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Your personal details and contact information</CardDescription>
                  </div>
                  <Button onClick={() => {
                    setEditForm({
                      name: user.name,
                      phone: user.phone || "",
                      address: user.address || "",
                    });
                    setEditProfileOpen(true);
                  }} data-testid="button-edit-profile">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-muted-foreground text-sm">Full Name</Label>
                    <p className="text-lg font-medium mt-1" data-testid="text-profile-name">{user.name}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">Email Address</Label>
                    <p className="text-lg font-medium mt-1" data-testid="text-profile-email">{user.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">Phone Number</Label>
                    <p className="text-lg font-medium mt-1" data-testid="text-profile-phone">
                      {user.phone || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground text-sm">Address</Label>
                    <p className="text-lg font-medium mt-1" data-testid="text-profile-address">
                      {user.address || "Not provided"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
                <CardDescription>Manage your subscription and vehicle</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {subscription ? (
                  <>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-muted-foreground text-sm">Pack</Label>
                        <p className="text-lg font-medium mt-1">{subscription.pack.name}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-sm">Billing Period</Label>
                        <p className="text-lg font-medium mt-1 capitalize">{subscription.billingPeriod}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-sm">Current Vehicle</Label>
                        <p className="text-lg font-medium mt-1">{subscription.vehicle || "Not assigned"}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-sm">Start Date</Label>
                        <p className="text-lg font-medium mt-1">
                          {new Date(subscription.startDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                      <Button variant="outline">Change Vehicle</Button>
                      <Button variant="destructive" onClick={handleCancelSubscription}>
                        Cancel Subscription
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">You don't have an active subscription.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
                <CardDescription>View all your past payments and invoices</CardDescription>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <p className="text-muted-foreground text-center py-4">Loading payments...</p>
                ) : payments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Invoice</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>${Number(payment.amount).toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={payment.status === "completed" ? "default" : "secondary"}>
                              {payment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <a href="#" className="text-primary hover:underline">
                              {payment.invoiceNumber}
                            </a>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No payment history available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={editProfileOpen} onOpenChange={setEditProfileOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update your personal information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  data-testid="input-edit-name"
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  data-testid="input-edit-phone"
                />
              </div>
              <div>
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  data-testid="input-edit-address"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditProfileOpen(false)}
                data-testid="button-cancel-edit"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveProfile}
                disabled={updateProfileMutation.isPending}
                data-testid="button-save-profile"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </div>
  );
}
