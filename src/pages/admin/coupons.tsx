import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Tag, Plus, Edit2, Trash2, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Coupon {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  max_uses: number | null;
  times_used: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

function CouponsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminAccess();
    }
  }, [user]);

  const checkAdminAccess = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user!.id)
        .single();

      if (error) throw error;

      if (data?.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      setIsAdmin(true);
      fetchCoupons();
    } catch (error) {
      console.error("Error checking admin access:", error);
      router.push("/dashboard");
    }
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const mockCoupons: Coupon[] = [
        {
          id: "1",
          code: "WELCOME20",
          discount_type: "percentage",
          discount_value: 20,
          max_uses: 100,
          times_used: 45,
          expires_at: "2026-12-31T23:59:59Z",
          is_active: true,
          created_at: "2026-06-01T00:00:00Z",
        },
        {
          id: "2",
          code: "SUMMER50",
          discount_type: "fixed",
          discount_value: 50,
          max_uses: null,
          times_used: 12,
          expires_at: null,
          is_active: true,
          created_at: "2026-06-15T00:00:00Z",
        },
      ];
      setCoupons(mockCoupons);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      toast({
        title: "Error",
        description: "Failed to load coupons",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied!",
      description: `Coupon code "${code}" copied to clipboard`,
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No expiration";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Coupon Codes</h1>
          <p className="text-muted-foreground">
            Create and manage discount codes for subscriptions
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-accent" />
                Active Coupons ({coupons.filter(c => c.is_active).length})
              </CardTitle>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gold text-gold-foreground hover:bg-gold/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Coupon
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create New Coupon</DialogTitle>
                    <DialogDescription>
                      Generate a new discount code for users
                    </DialogDescription>
                  </DialogHeader>
                  <CouponForm
                    onClose={() => setShowCreateDialog(false)}
                    onSuccess={fetchCoupons}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading coupons...
              </div>
            ) : coupons.length === 0 ? (
              <div className="text-center py-12">
                <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Coupons Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first discount code to get started
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Usage</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coupons.map((coupon) => (
                      <TableRow key={coupon.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="font-mono font-bold text-accent">
                              {coupon.code}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyCode(coupon.code)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          {coupon.discount_type === "percentage"
                            ? `${coupon.discount_value}% off`
                            : `$${coupon.discount_value} off`}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {coupon.times_used} / {coupon.max_uses || "∞"}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(coupon.expires_at)}
                        </TableCell>
                        <TableCell>
                          {coupon.is_active ? (
                            <Badge className="bg-accent text-white">Active</Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coupon Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• Coupon codes must be unique and are case-insensitive</p>
            <p>• Percentage discounts are capped at 100%</p>
            <p>• Fixed amount discounts are in USD</p>
            <p>• Leave max uses empty for unlimited redemptions</p>
            <p>• Expired coupons are automatically deactivated</p>
            <p>• Users can only apply one coupon per subscription purchase</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function CouponForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percentage" as "percentage" | "fixed",
    discount_value: "",
    max_uses: "",
    expires_at: "",
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast({
        title: "Coupon Created",
        description: `Coupon code "${formData.code}" has been created successfully`,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error creating coupon:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create coupon",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div>
        <Label htmlFor="code">Coupon Code</Label>
        <div className="flex gap-2 mt-2">
          <Input
            id="code"
            value={formData.code}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value.toUpperCase() })
            }
            placeholder="SUMMER2026"
            required
            maxLength={20}
            className="font-mono"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setFormData({
                ...formData,
                code: `PROMO${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
              })
            }
          >
            Generate
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="discount_type">Discount Type</Label>
        <Select
          value={formData.discount_type}
          onValueChange={(value: "percentage" | "fixed") =>
            setFormData({ ...formData, discount_type: value })
          }
        >
          <SelectTrigger id="discount_type" className="mt-2">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percentage">Percentage Off</SelectItem>
            <SelectItem value="fixed">Fixed Amount Off</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="discount_value">
          Discount Value ({formData.discount_type === "percentage" ? "%" : "$"})
        </Label>
        <Input
          id="discount_value"
          type="number"
          value={formData.discount_value}
          onChange={(e) =>
            setFormData({ ...formData, discount_value: e.target.value })
          }
          placeholder={formData.discount_type === "percentage" ? "20" : "50"}
          required
          min="1"
          max={formData.discount_type === "percentage" ? "100" : undefined}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="max_uses">
          Max Uses (leave empty for unlimited)
        </Label>
        <Input
          id="max_uses"
          type="number"
          value={formData.max_uses}
          onChange={(e) =>
            setFormData({ ...formData, max_uses: e.target.value })
          }
          placeholder="100"
          min="1"
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="expires_at">
          Expiration Date (optional)
        </Label>
        <Input
          id="expires_at"
          type="date"
          value={formData.expires_at}
          onChange={(e) =>
            setFormData({ ...formData, expires_at: e.target.value })
          }
          min={new Date().toISOString().split("T")[0]}
          className="mt-2"
        />
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg">
        <Label htmlFor="is_active">Active immediately</Label>
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, is_active: checked })
          }
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="flex-1 bg-gold text-gold-foreground hover:bg-gold/90"
        >
          {saving ? "Creating..." : "Create Coupon"}
        </Button>
      </div>
    </form>
  );
}

export default function CouponsPage() {
  return (
    <ProtectedRoute>
      <CouponsContent />
    </ProtectedRoute>
  );
}