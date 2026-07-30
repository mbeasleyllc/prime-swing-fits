import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Users, Search, Shield, Crown, Zap, Check, X, Archive, ArchiveRestore, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserWithSubscription {
  id: string;
  email: string;
  created_at: string;
  archived?: boolean;
  profiles: {
    role: string;
    first_name: string | null;
    last_name: string | null;
    archived?: boolean;
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
  const [showArchived, setShowArchived] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithSubscription | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Confirmation dialogs
  const [confirmArchive, setConfirmArchive] = useState<UserWithSubscription | null>(null);
  const [confirmUnarchive, setConfirmUnarchive] = useState<UserWithSubscription | null>(null);
  const [confirmCancelSubs, setConfirmCancelSubs] = useState<UserWithSubscription | null>(null);
  
  // Bulk update state
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showBulkDialog, setShowBulkDialog] = useState(false);
  const [bulkAction, setBulkAction] = useState<"role" | "tier" | "swing" | null>(null);
  const [bulkValue, setBulkValue] = useState<string>("");
  const [bulkProcessing, setBulkProcessing] = useState(false);

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
        .select("id, email, created_at, role, avatar_url, archived")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const usersWithSubs = await Promise.all(
        (data || []).map(async (profile) => {
          const [userProfiles, swingSubs] = await Promise.all([
            supabase
              .from("user_profiles")
              .select("subscription_tier, first_name, last_name")
              .eq("user_id", profile.id)
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
            archived: profile.archived || false,
            profiles: {
              role: profile.role || "user",
              first_name: userProfiles.data?.first_name || null,
              last_name: userProfiles.data?.last_name || null,
              archived: profile.archived || false,
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

  const handleArchiveUser = async (userId: string) => {
    setSaving(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      const response = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, action: "archive" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to archive user");
      }

      toast({
        title: "User Archived",
        description: "The user account has been archived and access disabled",
      });

      fetchUsers();
      setConfirmArchive(null);
      setEditingUser(null);
    } catch (error: any) {
      console.error("Error archiving user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to archive user",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUnarchiveUser = async (userId: string) => {
    setSaving(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      const response = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, action: "unarchive" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to restore user");
      }

      toast({
        title: "User Restored",
        description: "The user account has been restored and access re-enabled",
      });

      fetchUsers();
      setConfirmUnarchive(null);
      setEditingUser(null);
    } catch (error: any) {
      console.error("Error restoring user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to restore user",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancelSubscriptions = async (userId: string) => {
    setSaving(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      const response = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, action: "cancel_subscriptions" }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to cancel subscriptions");
      }

      toast({
        title: "Subscriptions Canceled",
        description: "All user subscriptions have been canceled",
      });

      fetchUsers();
      setConfirmCancelSubs(null);
      setEditingUser(null);
    } catch (error: any) {
      console.error("Error canceling subscriptions:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscriptions",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Bulk selection handlers
  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const clearSelection = () => {
    setSelectedUsers(new Set());
  };

  // Bulk update handlers
  const handleBulkUpdate = async () => {
    if (!bulkAction || selectedUsers.size === 0) return;

    setBulkProcessing(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const updates: any = {};

      if (bulkAction === "role") {
        updates.role = bulkValue;
      } else if (bulkAction === "tier") {
        updates.subscription_tier = bulkValue === "none" ? null : bulkValue;
      } else if (bulkAction === "swing") {
        updates.swing_analytics = bulkValue === "enable";
      }

      let successCount = 0;
      let failCount = 0;

      for (const userId of selectedUsers) {
        try {
          const response = await fetch("/api/admin/update-user", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ userId, updates }),
          });

          if (response.ok) {
            successCount++;
          } else {
            failCount++;
          }
        } catch {
          failCount++;
        }
      }

      toast({
        title: "Bulk Update Complete",
        description: `${successCount} users updated successfully${failCount > 0 ? `, ${failCount} failed` : ""}`,
      });

      await fetchUsers();
      clearSelection();
      setShowBulkDialog(false);
      setBulkAction(null);
      setBulkValue("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Bulk update failed",
        variant: "destructive",
      });
    } finally {
      setBulkProcessing(false);
    }
  };

  const openBulkDialog = (action: "role" | "tier" | "swing") => {
    if (selectedUsers.size === 0) {
      toast({
        title: "No Users Selected",
        description: "Please select at least one user to perform bulk actions",
        variant: "destructive",
      });
      return;
    }
    setBulkAction(action);
    setBulkValue("");
    setShowBulkDialog(true);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.profiles?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.profiles?.last_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesArchived = showArchived ? true : !u.archived;
    
    return matchesSearch && matchesArchived;
  });

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
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-muted-foreground">
            Manage user roles, subscriptions, and account status
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-accent" />
                    All Users ({filteredUsers.length})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="show-archived"
                      checked={showArchived}
                      onCheckedChange={setShowArchived}
                    />
                    <Label htmlFor="show-archived" className="text-sm text-muted-foreground cursor-pointer">
                      Show Archived
                    </Label>
                  </div>
                </div>
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

              {/* Bulk Actions Bar */}
              {selectedUsers.size > 0 && (
                <div className="flex flex-wrap items-center gap-3 p-4 bg-accent/10 border border-accent/20 rounded-lg">
                  <Badge className="bg-accent text-white">
                    {selectedUsers.size} {selectedUsers.size === 1 ? "user" : "users"} selected
                  </Badge>
                  <div className="flex-1" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openBulkDialog("role")}
                  >
                    Update Roles
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openBulkDialog("tier")}
                  >
                    Update Tiers
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openBulkDialog("swing")}
                  >
                    Swing Analytics
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearSelection}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
              )}
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
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                          onCheckedChange={toggleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Status</TableHead>
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
                      <TableRow key={u.id} className={u.archived ? "opacity-60" : ""}>
                        <TableCell>
                          <Checkbox
                            checked={selectedUsers.has(u.id)}
                            onCheckedChange={() => toggleUserSelection(u.id)}
                          />
                        </TableCell>
                        <TableCell>
                          {u.archived ? (
                            <Badge variant="destructive">
                              <Archive className="h-3 w-3 mr-1" />
                              Archived
                            </Badge>
                          ) : (
                            <Badge className="bg-accent text-white">Active</Badge>
                          )}
                        </TableCell>
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
                                  Update roles, subscriptions, and account status for {u.email}
                                </DialogDescription>
                              </DialogHeader>
                              <UserEditForm
                                user={u}
                                onSave={handleUpdateUser}
                                onArchive={() => setConfirmArchive(u)}
                                onUnarchive={() => setConfirmUnarchive(u)}
                                onCancelSubscriptions={() => setConfirmCancelSubs(u)}
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

      {/* Bulk Update Dialog */}
      <AlertDialog open={showBulkDialog} onOpenChange={setShowBulkDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Bulk Update {selectedUsers.size} {selectedUsers.size === 1 ? "User" : "Users"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkAction === "role" && "Select a role to apply to all selected users"}
              {bulkAction === "tier" && "Select a club fitting tier to apply to all selected users"}
              {bulkAction === "swing" && "Enable or disable Swing Analytics access for all selected users"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            {bulkAction === "role" && (
              <Select value={bulkValue} onValueChange={setBulkValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User (Standard Access)</SelectItem>
                  <SelectItem value="admin">Admin (Full Access)</SelectItem>
                </SelectContent>
              </Select>
            )}
            
            {bulkAction === "tier" && (
              <Select value={bulkValue} onValueChange={setBulkValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (No Access)</SelectItem>
                  <SelectItem value="entry">Entry - Single Club Fitting</SelectItem>
                  <SelectItem value="core">Core - Full Bag Fitting</SelectItem>
                  <SelectItem value="premium">Premium - Advanced Full Bag</SelectItem>
                  <SelectItem value="premium_plus">Premium Plus - Complete Pro Setup</SelectItem>
                </SelectContent>
              </Select>
            )}
            
            {bulkAction === "swing" && (
              <Select value={bulkValue} onValueChange={setBulkValue}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enable">Enable Swing Analytics</SelectItem>
                  <SelectItem value="disable">Disable Swing Analytics</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkUpdate}
              disabled={!bulkValue || bulkProcessing}
              className="bg-gold text-gold-foreground hover:bg-gold/90"
            >
              {bulkProcessing ? "Processing..." : `Update ${selectedUsers.size} ${selectedUsers.size === 1 ? "User" : "Users"}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Archive Confirmation */}
      <AlertDialog open={!!confirmArchive} onOpenChange={() => setConfirmArchive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive User Account</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive {confirmArchive?.email} and disable their login access. All data will be preserved and the account can be restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmArchive && handleArchiveUser(confirmArchive.id)}
              disabled={saving}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {saving ? "Archiving..." : "Archive Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Unarchive Confirmation */}
      <AlertDialog open={!!confirmUnarchive} onOpenChange={() => setConfirmUnarchive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore User Account</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore {confirmUnarchive?.email} and re-enable their login access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmUnarchive && handleUnarchiveUser(confirmUnarchive.id)}
              disabled={saving}
              className="bg-accent text-white hover:bg-accent/90"
            >
              {saving ? "Restoring..." : "Restore Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Subscriptions Confirmation */}
      <AlertDialog open={!!confirmCancelSubs} onOpenChange={() => setConfirmCancelSubs(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel All Subscriptions</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel both Club Fitting and Swing Analytics subscriptions for {confirmCancelSubs?.email}. The user will lose access to premium features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmCancelSubs && handleCancelSubscriptions(confirmCancelSubs.id)}
              disabled={saving}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {saving ? "Canceling..." : "Cancel Subscriptions"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

function UserEditForm({
  user,
  onSave,
  onArchive,
  onUnarchive,
  onCancelSubscriptions,
  saving,
}: {
  user: UserWithSubscription;
  onSave: (userId: string, updates: any) => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onCancelSubscriptions: () => void;
  saving: boolean;
}) {
  const [role, setRole] = useState(user.profiles?.role || "user");
  const [subscriptionTier, setSubscriptionTier] = useState(
    user.user_profiles?.subscription_tier || "none"
  );
  const [swingAnalytics, setSwingAnalytics] = useState(
    user.user_swing_subscriptions.length > 0
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(user.id, {
      role,
      subscription_tier: subscriptionTier === "none" ? null : subscriptionTier,
      swing_analytics: swingAnalytics,
    });
  };

  const hasActiveSubscriptions = subscriptionTier !== "none" || swingAnalytics;

  return (
    <div className="space-y-6 mt-4">
      <form onSubmit={handleSubmit} className="space-y-6">
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
              <SelectItem value="none">None (No Access)</SelectItem>
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

      <div className="pt-4 border-t space-y-3">
        <p className="text-sm font-semibold text-muted-foreground">Account Actions</p>
        
        {hasActiveSubscriptions && (
          <Button
            variant="outline"
            className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={onCancelSubscriptions}
            disabled={saving}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Cancel All Subscriptions
          </Button>
        )}
        
        {user.archived ? (
          <Button
            variant="outline"
            className="w-full justify-start text-accent border-accent/20 hover:bg-accent/10"
            onClick={onUnarchive}
            disabled={saving}
          >
            <ArchiveRestore className="h-4 w-4 mr-2" />
            Restore Account
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={onArchive}
            disabled={saving}
          >
            <Archive className="h-4 w-4 mr-2" />
            Archive Account
          </Button>
        )}
      </div>
    </div>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute>
      <UsersContent />
    </ProtectedRoute>
  );
}