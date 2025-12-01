import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Subscription, User, Pack } from "@shared/schema";
import { ArrowLeft } from "lucide-react";

type SubscriptionWithDetails = Subscription & { user: User; pack: Pack };

export default function AdminSubscriptionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [editSubscription, setEditSubscription] = useState<SubscriptionWithDetails | null>(null);
  const [editForm, setEditForm] = useState({
    status: "active",
    vehicle: "",
    mileageUsed: 0,
  });

  const { data: subscriptions = [], isLoading: subsLoading } = useQuery<SubscriptionWithDetails[]>({
    queryKey: ["/api/admin/subscriptions"],
    enabled: !!user && user.role === "admin",
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<Subscription> }) => {
      const res = await apiRequest("PATCH", `/api/admin/subscriptions/${data.id}`, data.updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscriptions"] });
      setEditSubscription(null);
      toast({
        title: "Subscription updated",
        description: "Subscription has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update subscription",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (sub: SubscriptionWithDetails) => {
    setEditSubscription(sub);
    setEditForm({
      status: sub.status,
      vehicle: sub.vehicle || "",
      mileageUsed: sub.mileageUsed,
    });
  };

  const handleSave = () => {
    if (!editSubscription) return;
    updateSubscriptionMutation.mutate({
      id: editSubscription.id,
      updates: editForm,
    });
  };

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

  return (
    <div className="min-h-screen py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setLocation("/admin")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold mb-2" data-testid="text-page-title">
              Subscription Management
            </h1>
            <p className="text-muted-foreground">Manage all active and inactive subscriptions</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Subscriptions ({subscriptions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {subsLoading ? (
              <p className="text-center py-4 text-muted-foreground">Loading subscriptions...</p>
            ) : subscriptions.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No subscriptions found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Pack</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Mileage</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.user.name}</TableCell>
                      <TableCell>{sub.pack.name}</TableCell>
                      <TableCell>
                        <Badge variant={sub.status === "active" ? "default" : "secondary"}>
                          {sub.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{sub.vehicle || "Not assigned"}</TableCell>
                      <TableCell>
                        {sub.mileageUsed}
                        {sub.pack.mileageLimit ? `/${sub.pack.mileageLimit}` : ""}
                      </TableCell>
                      <TableCell>
                        {new Date(sub.nextBillingDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(sub)}
                          data-testid={`button-edit-${sub.id}`}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!editSubscription} onOpenChange={() => setEditSubscription(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Subscription</DialogTitle>
              <DialogDescription>
                Update subscription details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) => setEditForm({ ...editForm, status: value })}
                >
                  <SelectTrigger id="edit-status" data-testid="select-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-vehicle">Vehicle</Label>
                <Input
                  id="edit-vehicle"
                  value={editForm.vehicle}
                  onChange={(e) => setEditForm({ ...editForm, vehicle: e.target.value })}
                  placeholder="e.g., BMW X3 2024"
                  data-testid="input-vehicle"
                />
              </div>
              <div>
                <Label htmlFor="edit-mileage">Mileage Used</Label>
                <Input
                  id="edit-mileage"
                  type="number"
                  value={editForm.mileageUsed}
                  onChange={(e) => setEditForm({ ...editForm, mileageUsed: Number(e.target.value) })}
                  data-testid="input-mileage"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditSubscription(null)}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateSubscriptionMutation.isPending}
                data-testid="button-save"
              >
                {updateSubscriptionMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
