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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Pack } from "@shared/schema";
import { ArrowLeft, Plus } from "lucide-react";

export default function AdminPacksPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [editPack, setEditPack] = useState<Pack | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    subtitle: "",
    priceMonthly: "",
    priceYearly: "",
    mileageLimit: "",
    features: "",
    isPopular: false,
  });

  const { data: packs = [], isLoading: packsLoading } = useQuery<Pack[]>({
    queryKey: ["/api/admin/packs"],
    enabled: !!user && user.role === "admin",
  });

  const updatePackMutation = useMutation({
    mutationFn: async (data: { id: string; updates: Partial<Pack> }) => {
      const res = await apiRequest("PATCH", `/api/admin/packs/${data.id}`, data.updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/packs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/packs"] });
      setEditPack(null);
      toast({
        title: "Pack updated",
        description: "Pack has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update pack",
        variant: "destructive",
      });
    },
  });

  const createPackMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/admin/packs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/packs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/packs"] });
      setIsCreating(false);
      resetForm();
      toast({
        title: "Pack created",
        description: "New pack has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create pack",
        variant: "destructive",
      });
    },
  });

  const deletePackMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/packs/${id}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/packs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/packs"] });
      toast({
        title: "Pack deleted",
        description: "Pack has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete pack",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      subtitle: "",
      priceMonthly: "",
      priceYearly: "",
      mileageLimit: "",
      features: "",
      isPopular: false,
    });
  };

  const handleEdit = (pack: Pack) => {
    setEditPack(pack);
    setFormData({
      name: pack.name,
      subtitle: pack.subtitle,
      priceMonthly: pack.priceMonthly,
      priceYearly: pack.priceYearly,
      mileageLimit: pack.mileageLimit?.toString() || "",
      features: pack.features.join("\n"),
      isPopular: pack.isPopular,
    });
  };

  const handleCreate = () => {
    setIsCreating(true);
    resetForm();
  };

  const handleSave = () => {
    const data = {
      name: formData.name,
      subtitle: formData.subtitle,
      priceMonthly: formData.priceMonthly,
      priceYearly: formData.priceYearly,
      mileageLimit: formData.mileageLimit ? Number(formData.mileageLimit) : null,
      features: formData.features.split("\n").filter((f) => f.trim()),
      isPopular: formData.isPopular,
    };

    if (editPack) {
      updatePackMutation.mutate({
        id: editPack.id,
        updates: data,
      });
    } else {
      createPackMutation.mutate(data);
    }
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
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
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
                Pack Management
              </h1>
              <p className="text-muted-foreground">Manage subscription packs and pricing</p>
            </div>
          </div>
          <Button onClick={handleCreate} data-testid="button-create">
            <Plus className="h-4 w-4 mr-2" />
            Create Pack
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Packs ({packs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {packsLoading ? (
              <p className="text-center py-4 text-muted-foreground">Loading packs...</p>
            ) : packs.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">No packs found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Subtitle</TableHead>
                    <TableHead>Monthly</TableHead>
                    <TableHead>Yearly</TableHead>
                    <TableHead>Mileage Limit</TableHead>
                    <TableHead>Popular</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packs.map((pack) => (
                    <TableRow key={pack.id}>
                      <TableCell className="font-medium">{pack.name}</TableCell>
                      <TableCell>{pack.subtitle}</TableCell>
                      <TableCell>${pack.priceMonthly}</TableCell>
                      <TableCell>${pack.priceYearly}</TableCell>
                      <TableCell>{pack.mileageLimit || "Unlimited"}</TableCell>
                      <TableCell>
                        {pack.isPopular && <Badge>Popular</Badge>}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(pack)}
                            data-testid={`button-edit-${pack.id}`}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deletePackMutation.mutate(pack.id)}
                            data-testid={`button-delete-${pack.id}`}
                          >
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!editPack || isCreating} onOpenChange={() => {
          setEditPack(null);
          setIsCreating(false);
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editPack ? "Edit Pack" : "Create New Pack"}</DialogTitle>
              <DialogDescription>
                {editPack ? "Update pack details" : "Create a new subscription pack"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pack-name">Name</Label>
                  <Input
                    id="pack-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Budget"
                    data-testid="input-name"
                  />
                </div>
                <div>
                  <Label htmlFor="pack-subtitle">Subtitle</Label>
                  <Input
                    id="pack-subtitle"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="e.g., Economy & Compact"
                    data-testid="input-subtitle"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pack-monthly">Monthly Price ($)</Label>
                  <Input
                    id="pack-monthly"
                    type="number"
                    value={formData.priceMonthly}
                    onChange={(e) => setFormData({ ...formData, priceMonthly: e.target.value })}
                    placeholder="299"
                    data-testid="input-monthly"
                  />
                </div>
                <div>
                  <Label htmlFor="pack-yearly">Yearly Price ($)</Label>
                  <Input
                    id="pack-yearly"
                    type="number"
                    value={formData.priceYearly}
                    onChange={(e) => setFormData({ ...formData, priceYearly: e.target.value })}
                    placeholder="2990"
                    data-testid="input-yearly"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="pack-mileage">Mileage Limit (leave empty for unlimited)</Label>
                <Input
                  id="pack-mileage"
                  type="number"
                  value={formData.mileageLimit}
                  onChange={(e) => setFormData({ ...formData, mileageLimit: e.target.value })}
                  placeholder="1500"
                  data-testid="input-mileage"
                />
              </div>
              <div>
                <Label htmlFor="pack-features">Features (one per line)</Label>
                <Textarea
                  id="pack-features"
                  value={formData.features}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Economy and compact vehicles&#10;1,500 miles per month&#10;Basic insurance included"
                  rows={6}
                  data-testid="input-features"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pack-popular"
                  checked={formData.isPopular}
                  onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                  data-testid="checkbox-popular"
                />
                <Label htmlFor="pack-popular">Mark as popular</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setEditPack(null);
                  setIsCreating(false);
                }}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updatePackMutation.isPending || createPackMutation.isPending}
                data-testid="button-save"
              >
                {updatePackMutation.isPending || createPackMutation.isPending
                  ? "Saving..."
                  : editPack
                  ? "Update Pack"
                  : "Create Pack"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
