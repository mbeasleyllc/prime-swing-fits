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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Users, Search, Shield, Crown, Zap, Check, X, Archive, ArchiveRestore, XCircle, User, Lock, Settings, AlertTriangle, Key, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
    first_name?: string | null;
    last_name?: string | null;
    phone_number?: string | null;
    city?: string | null;
    state?: string | null;
    handicap_index?: number | null;
    years_playing?: string | null;
    height_ft?: number | null;
    height_in?: number | null;
    dominant_hand?: string | null;
    swing_speed_range?: string | null;
    ball_flight?: string | null;
    driver_distance?: string | null;
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
  const [fullProfileData, setFullProfileData] = useState<any>(null);
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
              .select("*")
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
            user_profiles: userProfiles.data || { subscription_tier: null },
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

  const handleOpenManageDialog = async (user: UserWithSubscription) => {
    setEditingUser(user);
    
    // Fetch full profile data
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();
    
    setFullProfileData(data || {});
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

  const handleUpdateProfile = async (userId: string, profileData: any) => {
    setSaving(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      const response = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, profileData }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      fetchUsers();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordAction = async (userId: string, action: "set" | "reset", newPassword?: string) => {
    setSaving(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      const body = action === "set" 
        ? { userId, action: "set_password", newPassword }
        : { userId, sendPasswordReset: true };
      
      const response = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process password action");
      }

      toast({
        title: "Success",
        description: action === "set" ? "Password updated successfully" : "Password reset email sent",
      });
    } catch (error: any) {
      console.error("Error with password action:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to process password action",
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
                                onClick={() => handleOpenManageDialog(u)}
                              >
                                Manage
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <User className="h-5 w-5 text-accent" />
                                  Manage User
                                </DialogTitle>
                                <DialogDescription>
                                  {u.email}
                                </DialogDescription>
                              </DialogHeader>
                              {fullProfileData !== null && (
                                <UserEditForm
                                  user={u}
                                  profileData={fullProfileData}
                                  onSaveAccess={handleUpdateUser}
                                  onSaveProfile={handleUpdateProfile}
                                  onPasswordAction={handlePasswordAction}
                                  onArchive={() => setConfirmArchive(u)}
                                  onUnarchive={() => setConfirmUnarchive(u)}
                                  onCancelSubscriptions={() => setConfirmCancelSubs(u)}
                                  saving={saving}
                                />
                              )}
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
  profileData,
  onSaveAccess,
  onSaveProfile,
  onPasswordAction,
  onArchive,
  onUnarchive,
  onCancelSubscriptions,
  saving,
}: {
  user: UserWithSubscription;
  profileData: any;
  onSaveAccess: (userId: string, updates: any) => void;
  onSaveProfile: (userId: string, profileData: any) => void;
  onPasswordAction: (userId: string, action: "set" | "reset", password?: string) => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onCancelSubscriptions: () => void;
  saving: boolean;
}) {
  // Access tab state
  const [role, setRole] = useState(user.profiles?.role || "user");
  const [subscriptionTier, setSubscriptionTier] = useState(
    user.user_profiles?.subscription_tier || "none"
  );
  const [swingAnalytics, setSwingAnalytics] = useState(
    user.user_swing_subscriptions.length > 0
  );

  // Profile tab state
  const [profile, setProfile] = useState({
    email: user.email || "",
    first_name: profileData?.first_name || "",
    last_name: profileData?.last_name || "",
    phone_number: profileData?.phone_number || "",
    city: profileData?.city || "",
    state: profileData?.state || "",
    handicap_index: profileData?.handicap_index || "",
    years_playing: profileData?.years_playing || "",
    height_ft: profileData?.height_ft || "",
    height_in: profileData?.height_in || "",
    dominant_hand: profileData?.dominant_hand || "",
    swing_speed_range: profileData?.swing_speed_range || "",
    ball_flight: profileData?.ball_flight || "",
    driver_distance: profileData?.driver_distance || "",
  });

  // Security tab state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sendReset, setSendReset] = useState(false);

  const handleAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveAccess(user.id, {
      role,
      subscription_tier: subscriptionTier === "none" ? null : subscriptionTier,
      swing_analytics: swingAnalytics,
    });
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Sanitize numeric fields: convert empty strings to null
    const sanitizedProfile = {
      ...profile,
      handicap_index: profile.handicap_index === "" ? null : profile.handicap_index,
      height_ft: profile.height_ft === "" ? null : profile.height_ft,
      height_in: profile.height_in === "" ? null : profile.height_in,
    };
    
    onSaveProfile(user.id, sanitizedProfile);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (sendReset) {
      onPasswordAction(user.id, "reset");
      setSendReset(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      return;
    }

    onPasswordAction(user.id, "set", newPassword);
    setNewPassword("");
    setConfirmPassword("");
  };

  const hasActiveSubscriptions = subscriptionTier !== "none" || swingAnalytics;

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="profile">
          <User className="h-4 w-4 mr-2" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="access">
          <Settings className="h-4 w-4 mr-2" />
          Access
        </TabsTrigger>
        <TabsTrigger value="security">
          <Lock className="h-4 w-4 mr-2" />
          Security
        </TabsTrigger>
        <TabsTrigger value="actions">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Actions
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-4 mt-4">
        <form onSubmit={handleProfileSubmit} className="space-y-6">
          {/* Account Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Mail className="h-4 w-4 text-accent" />
              <h3 className="font-semibold text-sm">Account Information</h3>
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="user@example.com"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Used for login and account communications
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={profile.first_name}
                  onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={profile.last_name}
                  onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <User className="h-4 w-4 text-accent" />
              <h3 className="font-semibold text-sm">Contact Information</h3>
            </div>
            
            <div>
              <Label htmlFor="phone_number">Phone Number</Label>
              <Input
                id="phone_number"
                type="tel"
                value={profile.phone_number}
                onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <User className="h-4 w-4 text-accent" />
              <h3 className="font-semibold text-sm">Location</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  placeholder="Denver"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={profile.state}
                  onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                  placeholder="CO"
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          {/* Physical Attributes Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <User className="h-4 w-4 text-accent" />
              <h3 className="font-semibold text-sm">Physical Attributes</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="height_ft">Height (ft)</Label>
                <Input
                  id="height_ft"
                  type="number"
                  value={profile.height_ft}
                  onChange={(e) => setProfile({ ...profile, height_ft: e.target.value })}
                  placeholder="6"
                  min="4"
                  max="7"
                />
              </div>
              <div>
                <Label htmlFor="height_in">Height (in)</Label>
                <Input
                  id="height_in"
                  type="number"
                  value={profile.height_in}
                  onChange={(e) => setProfile({ ...profile, height_in: e.target.value })}
                  placeholder="2"
                  min="0"
                  max="11"
                />
              </div>
              <div>
                <Label htmlFor="dominant_hand">Dominant Hand</Label>
                <Select value={profile.dominant_hand} onValueChange={(val) => setProfile({ ...profile, dominant_hand: val })}>
                  <SelectTrigger id="dominant_hand">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="right">Right</SelectItem>
                    <SelectItem value="left">Left</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Golf Profile Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b">
              <Zap className="h-4 w-4 text-accent" />
              <h3 className="font-semibold text-sm">Golf Profile</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="handicap_index">Handicap Index</Label>
                <Input
                  id="handicap_index"
                  type="number"
                  step="0.1"
                  value={profile.handicap_index}
                  onChange={(e) => setProfile({ ...profile, handicap_index: e.target.value })}
                  placeholder="12.5"
                />
              </div>
              <div>
                <Label htmlFor="years_playing">Years Playing</Label>
                <Select value={profile.years_playing} onValueChange={(val) => setProfile({ ...profile, years_playing: val })}>
                  <SelectTrigger id="years_playing">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="less_than_1">Less than 1 year</SelectItem>
                    <SelectItem value="1-3">1-3 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="5-10">5-10 years</SelectItem>
                    <SelectItem value="10_plus">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="swing_speed_range">Swing Speed Range</Label>
                <Select value={profile.swing_speed_range} onValueChange={(val) => setProfile({ ...profile, swing_speed_range: val })}>
                  <SelectTrigger id="swing_speed_range">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under_70">Under 70 mph</SelectItem>
                    <SelectItem value="70-80">70-80 mph</SelectItem>
                    <SelectItem value="80-90">80-90 mph</SelectItem>
                    <SelectItem value="90-100">90-100 mph</SelectItem>
                    <SelectItem value="100-110">100-110 mph</SelectItem>
                    <SelectItem value="110_plus">110+ mph</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ball_flight">Ball Flight</Label>
                <Select value={profile.ball_flight} onValueChange={(val) => setProfile({ ...profile, ball_flight: val })}>
                  <SelectTrigger id="ball_flight">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="big_slice">Big Slice</SelectItem>
                    <SelectItem value="soft_fade">Soft Fade</SelectItem>
                    <SelectItem value="straight">Straight</SelectItem>
                    <SelectItem value="soft_draw">Soft Draw</SelectItem>
                    <SelectItem value="big_hook">Big Hook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="driver_distance">Driver Distance</Label>
              <Select value={profile.driver_distance} onValueChange={(val) => setProfile({ ...profile, driver_distance: val })}>
                <SelectTrigger id="driver_distance">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under_150">Under 150 yards</SelectItem>
                  <SelectItem value="150-175">150-175 yards</SelectItem>
                  <SelectItem value="175-200">175-200 yards</SelectItem>
                  <SelectItem value="200-225">200-225 yards</SelectItem>
                  <SelectItem value="225-250">225-250 yards</SelectItem>
                  <SelectItem value="250_plus">250+ yards</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gold text-gold-foreground hover:bg-gold/90"
            >
              {saving ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </TabsContent>

      <TabsContent value="access" className="space-y-4 mt-4">
        <form onSubmit={handleAccessSubmit} className="space-y-6">
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
              {saving ? "Saving..." : "Save Access Settings"}
            </Button>
          </div>
        </form>
      </TabsContent>

      <TabsContent value="security" className="space-y-4 mt-4">
        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium">
              Password Management Options
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              Set a new password directly or send a password reset email to the user
            </p>
          </div>

          <div className="flex items-center space-x-3 p-4 border rounded-lg">
            <Checkbox
              id="send-reset"
              checked={sendReset}
              onCheckedChange={(checked) => {
                setSendReset(checked as boolean);
                if (checked) {
                  setNewPassword("");
                  setConfirmPassword("");
                }
              }}
            />
            <div className="flex-1">
              <Label htmlFor="send-reset" className="font-semibold cursor-pointer">
                Send Password Reset Email
              </Label>
              <p className="text-xs text-muted-foreground mt-1">
                User will receive an email with instructions to reset their password
              </p>
            </div>
            <Mail className="h-5 w-5 text-muted-foreground" />
          </div>

          {!sendReset && (
            <>
              <div>
                <Label htmlFor="new-password" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  minLength={6}
                />
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
                {newPassword && confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
                )}
              </div>
            </>
          )}

          <div className="pt-4 border-t">
            <Button
              type="submit"
              disabled={saving || (!sendReset && (!newPassword || newPassword !== confirmPassword))}
              className="w-full bg-gold text-gold-foreground hover:bg-gold/90"
            >
              {saving ? "Processing..." : sendReset ? "Send Password Reset Email" : "Set New Password"}
            </Button>
          </div>
        </form>
      </TabsContent>

      <TabsContent value="actions" className="space-y-4 mt-4">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">Dangerous Actions</p>
          <p className="text-xs text-muted-foreground">
            These actions will affect the user's account status and access
          </p>
          
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
      </TabsContent>
    </Tabs>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute>
      <UsersContent />
    </ProtectedRoute>
  );
}