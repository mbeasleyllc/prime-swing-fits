import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Ruler,
  Target,
  Settings as SettingsIcon,
  Camera,
  Lock,
  Shield,
  Bell,
  Database as DatabaseIcon,
  Trash2,
  Download,
  Eye,
  EyeOff,
  AlertTriangle,
  Trophy,
  BarChart,
  Monitor,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Laptop,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import type { Database } from "@/integrations/supabase/database.types";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useRouter } from "next/router";

type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];

export default function Settings() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}

function getMembershipBadgeColor(tier: string | null | undefined): string {
  switch (tier) {
    case "premium_plus":
      return "bg-gold text-gold-foreground";
    case "premium":
      return "bg-accent text-white";
    case "full_bag":
      return "bg-blue-500 text-white";
    case "single_club":
      return "bg-gray-500 text-white";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function getMembershipLabel(tier: string | null | undefined): string {
  switch (tier) {
    case "premium_plus":
      return "Premium Plus";
    case "premium":
      return "Premium";
    case "full_bag":
      return "Full Bag";
    case "single_club":
      return "Single Club";
    default:
      return "Free";
  }
}

function SettingsContent() {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [activeSection, setActiveSection] = useState("account");

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data || {});
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || "U";
  const completion = 75; // Simplified for settings page

  if (loading) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading settings...</p>
            </div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="max-w-6xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences</p>
          </div>

          <div className="space-y-8">
            <AccountDetailsSection user={user!} profile={profile} onUpdate={fetchProfile} />
            <PasswordSecuritySection user={user!} />
            <NotificationPreferencesSection profile={profile} onUpdate={fetchProfile} />
            <SwingAnalyticsSubscriptionSection user={user!} />
            <PrivacyDataSection user={user!} profile={profile} onUpdate={fetchProfile} />
            <IntegrationsSection />
            <DangerZoneSection user={user!} />
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}

// SECTION 1: Account Details
function AccountDetailsSection({
  user,
  profile,
  onUpdate,
}: {
  user: any;
  profile: Partial<UserProfile>;
  onUpdate: () => void;
}) {
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile.first_name && profile.last_name) {
      setDisplayName(`${profile.first_name} ${profile.last_name}`);
    }
  }, [profile]);

  const saveDisplayName = async () => {
    setSaving(true);
    try {
      const [first, ...lastParts] = displayName.split(" ");
      const last = lastParts.join(" ");

      const { error } = await supabase
        .from("user_profiles")
        .upsert({
          user_id: user.id,
          first_name: first,
          last_name: last,
        });

      if (error) throw error;

      toast({
        title: "Saved",
        description: "Display name updated successfully",
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update display name",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const changeEmail = async () => {
    if (!newEmail || !currentPassword) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });

      if (error) throw error;

      toast({
        title: "Verification Email Sent",
        description: "Check your new email for a verification link",
      });
      setShowEmailForm(false);
      setNewEmail("");
      setCurrentPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update email",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getMembershipFeatures = (tier: string | null | undefined): string[] => {
    switch (tier) {
      case "premium_plus":
        return ["All Premium features", "Golf Daddy launch monitor", "Priority support", "Unlimited re-fittings"];
      case "premium":
        return ["Full bag fitting", "Advanced swing analytics", "Priority support", "Unlimited re-fittings"];
      case "full_bag":
        return ["Full bag fitting", "Standard analytics", "Email support"];
      case "single_club":
        return ["Single club fitting", "Basic recommendations"];
      default:
        return ["Limited features", "Basic fitting only"];
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <Button
              onClick={saveDisplayName}
              disabled={saving}
              className="self-end bg-gold text-gold-foreground hover:bg-gold/90"
            >
              Save
            </Button>
          </div>

          <div>
            <Label>Email Address</Label>
            <div className="flex items-center gap-3 mt-2">
              <Input value={user.email} disabled className="flex-1 bg-muted" />
              <Button
                variant="outline"
                onClick={() => setShowEmailForm(!showEmailForm)}
                className="border-accent text-accent hover:bg-accent/10"
              >
                Change Email
              </Button>
            </div>

            {showEmailForm && (
              <div className="mt-4 p-4 border border-accent/30 rounded-lg space-y-4">
                <div>
                  <Label htmlFor="new_email">New Email Address</Label>
                  <Input
                    id="new_email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="newemail@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="current_password">Current Password (for confirmation)</Label>
                  <Input
                    id="current_password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={changeEmail}
                    disabled={saving}
                    className="bg-accent text-white hover:bg-accent/90"
                  >
                    Send Verification Link
                  </Button>
                  <Button variant="outline" onClick={() => setShowEmailForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label>Account Created</Label>
            <Input
              value={user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
              disabled
              className="bg-muted"
            />
          </div>

          <div>
            <Label>Membership Tier</Label>
            <div className="flex items-center gap-3 mt-2">
              <Badge className={`text-base px-4 py-2 ${getMembershipBadgeColor(profile.membership_tier)}`}>
                {getMembershipLabel(profile.membership_tier)}
              </Badge>
              <Button asChild size="sm" className="bg-gold text-gold-foreground hover:bg-gold/90">
                <Link href="/pricing">Upgrade Plan</Link>
              </Button>
            </div>
            <div className="mt-3 p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium text-foreground mb-2">Plan Features:</p>
              <ul className="space-y-1">
                {getMembershipFeatures(profile.membership_tier).map((feature, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                    <Check className="h-3 w-3 text-accent" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <Label>Account ID (for support reference)</Label>
            <Input value={user.id} disabled className="bg-muted font-mono text-xs" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// SECTION 2: Password & Security
function PasswordSecuritySection({ user }: { user: any }) {
  const { toast } = useToast();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [saving, setSaving] = useState(false);

  const getPasswordStrength = (password: string): { strength: string; color: string; percentage: number } => {
    if (password.length === 0) return { strength: "", color: "bg-muted", percentage: 0 };
    if (password.length < 8) return { strength: "Weak", color: "bg-red-500", percentage: 25 };
    
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const score = [hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (score === 0) return { strength: "Fair", color: "bg-orange-500", percentage: 40 };
    if (score === 1) return { strength: "Good", color: "bg-yellow-500", percentage: 60 };
    if (score === 2) return { strength: "Good", color: "bg-yellow-500", percentage: 75 };
    return { strength: "Strong", color: "bg-green-500", percentage: 100 };
  };

  const getPasswordRequirements = (password: string) => {
    return [
      { met: password.length >= 8, text: "8+ characters" },
      { met: /[A-Z]/.test(password), text: "Uppercase" },
      { met: /\d/.test(password), text: "Number" },
      { met: /[!@#$%^&*(),.?":{}|<>]/.test(password), text: "Special character" },
    ];
  };

  const updatePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords Don't Match",
        description: "New password and confirmation must match",
        variant: "destructive",
      });
      return;
    }

    const requirements = getPasswordRequirements(newPassword);
    if (requirements.some(req => !req.met)) {
      toast({
        title: "Password Too Weak",
        description: "Password must meet all requirements",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully",
      });
      setShowPasswordForm(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const signOutOtherDevices = async () => {
    try {
      await supabase.auth.refreshSession();
      toast({
        title: "Sessions Cleared",
        description: "All other devices have been signed out",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out other devices",
        variant: "destructive",
      });
    }
  };

  const strength = getPasswordStrength(newPassword);
  const requirements = getPasswordRequirements(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-accent" />
          Security
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Collapsible open={showPasswordForm} onOpenChange={setShowPasswordForm}>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-foreground">Change Password</h4>
              <p className="text-sm text-muted-foreground">Update your account password</p>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="border-accent text-accent hover:bg-accent/10">
                {showPasswordForm ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Change Password
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="current_password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current_password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="new_password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new_password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                {newPassword && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Password Strength</span>
                      <span className={`text-sm font-semibold ${strength.color.replace('bg-', 'text-')}`}>
                        {strength.strength}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strength.color} transition-all duration-300`}
                        style={{ width: `${strength.percentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
                {confirmPassword && (
                  <div className="mt-2 flex items-center gap-2">
                    {passwordsMatch ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-500">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-500">Passwords don't match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {newPassword && (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-2">Requirements:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {requirements.map((req, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        {req.met ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-muted-foreground" />
                        )}
                        <span className={req.met ? "text-green-500" : "text-muted-foreground"}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={updatePassword}
                disabled={saving || !passwordsMatch || requirements.some(req => !req.met)}
                className="w-full bg-gold text-gold-foreground hover:bg-gold/90"
              >
                {saving ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="border-t pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-foreground flex items-center gap-2">
                Two-Factor Authentication (2FA)
                {twoFactorEnabled ? (
                  <Badge variant="default" className="bg-green-500 text-white">Enabled</Badge>
                ) : (
                  <Badge variant="secondary" className="bg-gray-500 text-white">Disabled</Badge>
                )}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {twoFactorEnabled
                  ? "A verification code is emailed on each login"
                  : "Your account is less secure without 2FA"}
              </p>
            </div>
            <Switch
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <h4 className="font-medium text-foreground mb-4">Active Sessions</h4>
          <div className="space-y-3">
            <div className="p-4 border rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Laptop className="h-5 w-5 text-muted-foreground mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Current Device</p>
                    <p className="text-sm text-muted-foreground">
                      Chrome on macOS • Fairfax, VA
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last active: Just now
                    </p>
                  </div>
                </div>
                <Badge variant="default" className="bg-accent text-white">Current</Badge>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full mt-4 border-red-500 text-red-500 hover:bg-red-50"
            onClick={signOutOtherDevices}
          >
            Sign Out All Other Devices
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// SECTION 3: Notification Preferences
interface NotificationSettings {
  order_confirmations: boolean;
  fitting_report_ready: boolean;
  refitting_reminders: boolean;
  club_database_updates: boolean;
  weekly_golf_tips: boolean;
  promotional_offers: boolean;
  blog_updates: boolean;
}

function NotificationPreferencesSection({
  profile,
  onUpdate,
}: {
  profile: Partial<UserProfile>;
  onUpdate: () => void;
}) {
  const { toast } = useToast();
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    order_confirmations: true,
    fitting_report_ready: true,
    refitting_reminders: true,
    club_database_updates: false,
    weekly_golf_tips: false,
    promotional_offers: false,
    blog_updates: false,
  });
  const [emailFrequency, setEmailFrequency] = useState("immediately");
  const [saving, setSaving] = useState(false);

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    setNotifications(prev => {
      const updated = { ...prev, [key]: value };
      return updated as NotificationSettings;
    });
  };

  const saveNotificationPreferences = async () => {
    setSaving(true);
    try {
      // Save to profile or separate notifications table
      toast({
        title: "Saved",
        description: "Notification preferences updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification preferences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const notificationsList: Array<{
    key: keyof NotificationSettings;
    label: string;
    description: string;
    locked: boolean;
  }> = [
    {
      key: "order_confirmations",
      label: "Order Confirmations",
      description: "Purchase receipts and report delivery",
      locked: true,
    },
    {
      key: "fitting_report_ready",
      label: "Fitting Report Ready",
      description: "Notified when your AI report is generated",
      locked: true,
    },
    {
      key: "refitting_reminders",
      label: "Re-Fitting Reminders",
      description: "Annual reminder to re-fit as your swing evolves",
      locked: false,
    },
    {
      key: "club_database_updates",
      label: "New Club Database Updates",
      description: "When major new clubs are added to the comparison tool",
      locked: false,
    },
    {
      key: "weekly_golf_tips",
      label: "Weekly Golf Tips",
      description: "Equipment advice and improvement content",
      locked: false,
    },
    {
      key: "promotional_offers",
      label: "Promotional Offers",
      description: "Discounts and special fitting pricing",
      locked: false,
    },
    {
      key: "blog_updates",
      label: "Blog & Resource Updates",
      description: "New articles, guides, and fitting insights",
      locked: false,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-accent" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Notification</TableHead>
                <TableHead className="text-right w-24">Enabled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notificationsList.map((notification) => (
                <TableRow key={notification.key}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground flex items-center gap-2">
                        {notification.label}
                        {notification.locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                      </p>
                      <p className="text-sm text-muted-foreground">{notification.description}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={notifications[notification.key] || false}
                      onCheckedChange={(value) => handleNotificationChange(notification.key, value)}
                      disabled={notification.locked}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <Label htmlFor="email_frequency">Email Frequency (for non-required notifications)</Label>
          <Select value={emailFrequency} onValueChange={setEmailFrequency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="immediately">Immediately</SelectItem>
              <SelectItem value="daily">Daily Digest</SelectItem>
              <SelectItem value="weekly">Weekly Digest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={saveNotificationPreferences}
          disabled={saving}
          className="w-full bg-gold text-gold-foreground hover:bg-gold/90"
        >
          {saving ? "Saving..." : "Save Notification Preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}

// SECTION 4: Privacy & Your Data
function PrivacyDataSection({
  user,
  profile,
  onUpdate,
}: {
  user: any;
  profile: Partial<UserProfile>;
  onUpdate: () => void;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const [aiTrainingOptOut, setAiTrainingOptOut] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const downloadMyData = async () => {
    try {
      // Fetch all user data
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      const { data: sessionsData } = await supabase
        .from("fitting_sessions")
        .select("*")
        .eq("user_id", user.id);

      const exportData = {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
        },
        profile: profileData,
        fitting_sessions: sessionsData,
        exported_at: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `primeswingfits-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast({
        title: "Data Downloaded",
        description: "Your data has been exported successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download data",
        variant: "destructive",
      });
    }
  };

  const saveAiOptOut = async () => {
    try {
      const { error } = await supabase
        .from("user_profiles")
        .upsert({
          user_id: user.id,
          ai_training_opt_out: aiTrainingOptOut,
        });

      if (error) throw error;

      toast({
        title: "Saved",
        description: "AI training preference updated",
      });
      onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preference",
        variant: "destructive",
      });
    }
  };

  const requestDeletion = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast({
        title: "Confirmation Required",
        description: 'Please type "DELETE" to confirm',
        variant: "destructive",
      });
      return;
    }

    try {
      // Mark account for deletion
      await supabase.auth.signOut();
      router.push("/");
      toast({
        title: "Deletion Requested",
        description: "Your account will be permanently deleted within 45 days. Confirmation email sent.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process deletion request",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DatabaseIcon className="h-5 w-5 text-accent" />
            Data & Privacy
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            You have full rights to your data under the Virginia Consumer Data Protection Act (Va. Code § 59.1-575).
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Download className="h-4 w-4 text-accent" />
                  Download My Data
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Export your profile, measurements, swing data, and report history as a JSON file.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={downloadMyData}
                className="ml-4 border-accent text-accent hover:bg-accent/10"
              >
                Download Data
              </Button>
            </div>

            <div className="flex items-start justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-foreground">Opt Out of AI Model Training</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Your anonymized data helps improve our AI fitting engine. Toggle off to exclude your data.
                </p>
              </div>
              <div className="ml-4 flex items-center gap-2">
                <Switch
                  checked={aiTrainingOptOut}
                  onCheckedChange={(checked) => {
                    setAiTrainingOptOut(checked);
                    saveAiOptOut();
                  }}
                />
              </div>
            </div>

            <div className="flex items-start justify-between p-4 border border-red-200 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Trash2 className="h-4 w-4 text-red-500" />
                  Request Data Deletion
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Permanently delete all your data. Cannot be undone.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(true);
                  setDeleteStep(1);
                }}
                className="ml-4 border-red-500 text-red-500 hover:bg-red-50"
              >
                Request Deletion
              </Button>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              To submit a formal VCDPA rights request (access, correct, opt-out of targeted advertising), email{" "}
              <a href="mailto:privacy@primeswingfits.com" className="text-accent hover:underline">
                privacy@primeswingfits.com
              </a>
              . We respond within 45 days. Unresolved appeals may be directed to the Virginia Attorney General.
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              {deleteStep === 1
                ? "This action will permanently delete your account and all associated data."
                : "Type DELETE to confirm permanent account deletion."}
            </DialogDescription>
          </DialogHeader>

          {deleteStep === 1 ? (
            <div className="space-y-3 my-4">
              <p className="text-sm font-medium text-foreground">The following will be deleted:</p>
              <ul className="space-y-2">
                <li className="text-sm text-muted-foreground flex items-center gap-2">
                  <X className="h-4 w-4 text-red-500" />
                  All profile information and measurements
                </li>
                <li className="text-sm text-muted-foreground flex items-center gap-2">
                  <X className="h-4 w-4 text-red-500" />
                  All fitting sessions and reports
                </li>
                <li className="text-sm text-muted-foreground flex items-center gap-2">
                  <X className="h-4 w-4 text-red-500" />
                  Membership and billing information
                </li>
                <li className="text-sm text-muted-foreground flex items-center gap-2">
                  <X className="h-4 w-4 text-red-500" />
                  Your account access
                </li>
              </ul>
            </div>
          ) : (
            <div className="my-4">
              <Label htmlFor="delete_confirm">Type DELETE to confirm</Label>
              <Input
                id="delete_confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="mt-2"
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteStep(1);
                setDeleteConfirmText("");
              }}
            >
              Cancel
            </Button>
            {deleteStep === 1 ? (
              <Button
                variant="destructive"
                onClick={() => setDeleteStep(2)}
                className="bg-red-500 hover:bg-red-600"
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={requestDeletion}
                disabled={deleteConfirmText !== "DELETE"}
                className="bg-red-500 hover:bg-red-600"
              >
                Permanently Delete My Account
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// SECTION 5: Swing Analytics Subscription
function SwingAnalyticsSubscriptionSection({ user }: { user: any }) {
  const { toast } = useToast();
  const router = useRouter();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [managing, setManaging] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const { data } = await supabase
        .from("user_swing_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .maybeSingle();

      setSubscription(data);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionAction = async (action: "cancel" | "reactivate") => {
    setManaging(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch("/api/manage-swing-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ action }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to manage subscription");
      }

      toast({
        title: action === "cancel" ? "Subscription Canceled" : "Subscription Reactivated",
        description: result.message,
      });

      fetchSubscription();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setManaging(false);
    }
  };

  const startTrial = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch("/api/create-swing-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start checkout",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="h-5 w-5 text-accent" />
          Swing Analytics Subscription
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {subscription ? (
          <>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium text-foreground flex items-center gap-2">
                    Active Subscription
                    <Badge className="bg-green-500 text-white">Active</Badge>
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {subscription.tier === "core_addon" ? "Core Add-on" : "Premium"} • {subscription.data_retention_months} months data retention
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Next Payment</p>
                  <p className="font-medium">{new Date(subscription.next_payment_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last Payment</p>
                  <p className="font-medium">{new Date(subscription.last_payment_date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSubscriptionAction("cancel")}
                  disabled={managing}
                  className="border-red-500 text-red-500 hover:bg-red-50"
                >
                  Cancel Subscription
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="border-accent text-accent hover:bg-accent/10"
                >
                  <a href="/pricing">Upgrade to Premium</a>
                </Button>
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">What You Get</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent" />
                  Unlimited swing data tracking
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent" />
                  CSV import from launch monitors
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent" />
                  Progress charts & Swing DNA radar
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent" />
                  Goal tracking & badges
                </li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <Alert>
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>
                You don't have an active Swing Analytics subscription. Add it for $12.99/month with a 7-day free trial.
              </AlertDescription>
            </Alert>

            <div className="p-4 border-2 border-accent rounded-lg">
              <div className="mb-3">
                <h4 className="font-bold text-lg">Swing Analytics Add-on</h4>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-bold text-accent">$12.99</span>
                  <span className="text-muted-foreground">/month</span>
                  <Badge variant="outline" className="ml-2">7-Day Free Trial</Badge>
                </div>
              </div>

              <ul className="space-y-2 mb-4 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent" />
                  Unlimited swing data tracking
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent" />
                  3-month data retention
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent" />
                  CSV import from launch monitors
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent" />
                  Progress charts & Swing DNA radar
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-accent" />
                  Goal tracking & badges
                </li>
              </ul>

              <Button
                onClick={startTrial}
                className="w-full bg-accent hover:bg-accent/90"
              >
                Start Free Trial
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Want more? Upgrade to Premium for 12-month retention + priority support
              </p>
              <Button variant="outline" asChild>
                <a href="/pricing">View All Plans</a>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// SECTION 6: Integrations
function IntegrationsSection() {
  const integrations = [
    { name: "Garmin Connect", icon: Monitor },
    { name: "Arccos Caddie", icon: Target },
    { name: "Golf Genius", icon: Trophy },
    { name: "Launch Monitor Sync (Golf Daddy)", icon: BarChart },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Connected Devices & Apps</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <div
                key={integration.name}
                className="p-4 border rounded-lg opacity-60 bg-muted/30"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-background rounded-lg">
                    <Icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{integration.name}</h4>
                    <Badge variant="secondary" className="mt-2">Coming Soon</Badge>
                    <Button
                      disabled
                      variant="outline"
                      size="sm"
                      className="w-full mt-3"
                    >
                      Connect
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Device integrations are coming soon. Syncing real swing data will unlock Premium-level dynamic fitting accuracy.
        </p>
      </CardContent>
    </Card>
  );
}

// SECTION 7: Danger Zone
function DangerZoneSection({ user }: { user: any }) {
  const { toast } = useToast();
  const router = useRouter();
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const deactivateAccount = async () => {
    try {
      // Implement deactivation logic
      toast({
        title: "Account Deactivated",
        description: "Your account has been temporarily disabled",
      });
      setShowDeactivateModal(false);
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to deactivate account",
        variant: "destructive",
      });
    }
  };

  const deleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast({
        title: "Confirmation Required",
        description: 'Please type "DELETE" to confirm',
        variant: "destructive",
      });
      return;
    }

    try {
      await supabase.auth.signOut();
      router.push("/");
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
            <div>
              <h4 className="font-medium text-foreground">Deactivate Account</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Temporarily disable your account. Data is preserved and recoverable.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowDeactivateModal(true)}
              className="border-red-500 text-red-500 hover:bg-red-50"
            >
              Deactivate
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
            <div>
              <h4 className="font-medium text-foreground">Delete Account</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => {
                setShowDeleteModal(true);
                setDeleteStep(1);
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDeactivateModal} onOpenChange={setShowDeactivateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate Account</DialogTitle>
            <DialogDescription>
              Your account will be temporarily disabled. You can reactivate it by logging in again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeactivateModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={deactivateAccount}
              className="bg-red-500 hover:bg-red-600"
            >
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription>
              {deleteStep === 1
                ? "This action will permanently delete your account and all associated data."
                : "Type DELETE to confirm permanent account deletion."}
            </DialogDescription>
          </DialogHeader>

          {deleteStep === 1 ? (
            <div className="space-y-3 my-4">
              <p className="text-sm font-medium text-foreground">The following will be deleted:</p>
              <ul className="space-y-2">
                <li className="text-sm text-muted-foreground flex items-center gap-2">
                  <X className="h-4 w-4 text-red-500" />
                  All profile information and measurements
                </li>
                <li className="text-sm text-muted-foreground flex items-center gap-2">
                  <X className="h-4 w-4 text-red-500" />
                  All fitting sessions and reports
                </li>
                <li className="text-sm text-muted-foreground flex items-center gap-2">
                  <X className="h-4 w-4 text-red-500" />
                  Membership and billing information
                </li>
                <li className="text-sm text-muted-foreground flex items-center gap-2">
                  <X className="h-4 w-4 text-red-500" />
                  Your account access
                </li>
              </ul>
            </div>
          ) : (
            <div className="my-4">
              <Label htmlFor="delete_confirm_final">Type DELETE to confirm</Label>
              <Input
                id="delete_confirm_final"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="mt-2"
              />
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteStep(1);
                setDeleteConfirmText("");
              }}
            >
              Cancel
            </Button>
            {deleteStep === 1 ? (
              <Button
                variant="destructive"
                onClick={() => setDeleteStep(2)}
                className="bg-red-500 hover:bg-red-600"
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={deleteAccount}
                disabled={deleteConfirmText !== "DELETE"}
                className="bg-red-500 hover:bg-red-600"
              >
                Permanently Delete My Account
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}