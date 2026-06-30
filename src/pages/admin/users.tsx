import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Users, Search, Shield, Crown, Zap, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface UserWithSubscription {
  id: string;
  email: string;
  created_at: string;
  profiles: {
    role: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
  user_profiles: {
    subscription_tier: string | null;
  } | null;
  user_swing_subscriptions: {
    status: string;
    plan_id: string;
  }[];
}

function UsersContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithSubscription[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithSubscription | null>(null);
  const [saving, setSaving] = useState(false);

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
      fetchUsers();
    } catch (error) {
      console.error("Error checking admin access:", error);
      router.push("/dashboard");
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, created_at, role, avatar_url")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch additional subscription data for each user
      const usersWithSubs = await Promise.all(
        (data || []).map(async (profile) => {
          const [userProfiles, swingSubs] = await Promise.all([
            supabase
              .from("user_profiles")
              .select("subscription_tier, first_name, last_name")
              .eq("id", profile.id)
              .maybeSingle(),
            supabase
              .from("user_swing_subscriptions")
              .select("status, plan_id")
              .eq("user_id", profile.id)
              .eq("status", "active"),
          ]);

          return {
            id: profile.id,
            email: profile.email || "",
            created_at: profile.created_at || "",
            profiles: {
              role: profile.role || "user",
              first_name: userProfiles.data?.first_name || null,
              last_name: userProfiles.data?.last_name || null,
            },
            user_profiles: {
              subscription_tier: userProfiles.data?.subscription_tier || null,
            },
            user_swing_subscriptions: swingSubs.data || [],
          };
        })
      );

      setUsers(usersWithSubs);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    setSaving(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      const response = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, updates }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update user");
      }

      toast({
        title: "Success",
        description: "User updated successfully",
      });

      fetchUsers();
      setEditingUser(null);
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.profiles?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.profiles?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    return role === "admin" ? (
      <Badge className="bg-accent text-white">
        <Shield className="h-3 w-3 mr-1" />
        Admin
      </Badge>
    ) : (
      <Badge variant="outline">User</Badge>
    );
  };

  const getTierBadge = (tier: string | null) => {
    if (!tier) return <Badge variant="outline">None</Badge>;
    
    const tierConfig: Record<string, { icon: any; color: string; label: string }> = {
      entry: { icon: Zap, color: "bg-blue-500 text-white", label: "Entry" },
      core: { icon: Check, color: "bg-accent text-white", label: "Core" },
      premium: { icon: Crown, color: "bg-purple-500 text-white", label: "Premium" },
      premium_plus: { icon: Crown, color: "bg-gold text-gold-foreground", label: "Premium Plus" },
    };

    const config = tierConfig[tier] || tierConfig.entry;
    const Icon = config.icon;

    return (
      <Badge className={config.color}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
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
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
          <p className="text-muted-foreground">
            Manage user roles and subscription access
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                All Users ({filteredUsers.length})
              </CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading users...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Club Fitting Tier</TableHead>
                      <TableHead>Swing Analytics</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.email}</TableCell>
                        <TableCell>
                          {u.profiles?.first_name || u.profiles?.last_name
                            ? `${u.profiles.first_name || ""} ${u.profiles.last_name || ""}`.trim()
                            : "—"}
                        </TableCell>
                        <TableCell>{getRoleBadge(u.profiles?.role || "user")}</TableCell>
                        <TableCell>
                          {getTierBadge(u.user_profiles?.subscription_tier || null)}
                        </TableCell>
                        <TableCell>
                          {u.user_swing_subscriptions.length > 0 ? (
                            <Badge className="bg-accent text-white">Active</Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(u.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingUser(u)}
                              >
                                Manage
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Manage User Access</DialogTitle>
                                <DialogDescription>
                                  Update roles and subscription tiers for {u.email}
                                </DialogDescription>
                              </DialogHeader>
                              <UserEditForm
                                user={u}
                                onSave={handleUpdateUser}
                                saving={saving}
                              />
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}

function UserEditForm({
  user,
  onSave,
  saving,
}: {
  user: UserWithSubscription;
  onSave: (userId: string, updates: any) => void;
  saving: boolean;
}) {
  const [role, setRole] = useState(user.profiles?.role || "user");
  const [subscriptionTier, setSubscriptionTier] = useState(
    user.user_profiles?.subscription_tier || ""
  );
  const [swingAnalytics, setSwingAnalytics] = useState(
    user.user_swing_subscriptions.length > 0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(user.id, {
      role,
      subscription_tier: subscriptionTier || null,
      swing_analytics: swingAnalytics,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-4">
      <div>
        <Label htmlFor="role" className="text-base font-semibold mb-3 block">
          User Role
        </Label>
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger id="role">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">User (Standard Access)</SelectItem>
            <SelectItem value="admin">Admin (Full Access)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-2">
          Admins can access admin panel and manage all users
        </p>
      </div>

      <div>
        <Label htmlFor="tier" className="text-base font-semibold mb-3 block">
          Club Fitting Tier
        </Label>
        <Select value={subscriptionTier} onValueChange={setSubscriptionTier}>
          <SelectTrigger id="tier">
            <SelectValue placeholder="Select tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">None (No Access)</SelectItem>
            <SelectItem value="entry">Entry - Single Club Fitting</SelectItem>
            <SelectItem value="core">Core - Full Bag Fitting</SelectItem>
            <SelectItem value="premium">Premium - Advanced Full Bag</SelectItem>
            <SelectItem value="premium_plus">Premium Plus - Complete Pro Setup</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-2">
          Controls access to club fitting features and equipment database
        </p>
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex-1">
          <Label htmlFor="swing" className="font-semibold">
            Swing Analytics Access
          </Label>
          <p className="text-xs text-muted-foreground mt-1">
            Import swing data, track progress, view analytics
          </p>
        </div>
        <Switch
          id="swing"
          checked={swingAnalytics}
          onCheckedChange={setSwingAnalytics}
        />
      </div>

      <div className="pt-4 border-t flex gap-3">
        <Button
          type="submit"
          disabled={saving}
          className="flex-1 bg-gold text-gold-foreground hover:bg-gold/90"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute>
      <UsersContent />
    </ProtectedRoute>
  );
}