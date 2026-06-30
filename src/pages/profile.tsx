import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  User,
  Ruler,
  Target,
  Settings,
  Camera,
  Lock,
  Info,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  TrendingUp,
  Trophy,
  BarChart,
  SettingsIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/router";

type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
type FittingSession = Database["public"]["Tables"]["fitting_sessions"]["Row"];

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("personal-info");
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [sessions, setSessions] = useState<FittingSession[]>([]);
  const [showMeasureGuide, setShowMeasureGuide] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchSessions();
      fetchAvatarUrl();
    }
  }, [user]);

  const fetchAvatarUrl = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user!.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      setAvatarUrl(data?.avatar_url || null);
    } catch (error) {
      console.error("Error fetching avatar:", error);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") throw error;
      setProfile(data || {});
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("fitting_sessions")
        .select("*")
        .eq("user_id", user!.id)
        .eq("status", "completed")
        .order("completed_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };

  const calculateCompletion = (): number => {
    let score = 0;
    
    if (profile.first_name && profile.last_name) score += 5;
    if (profile.phone_number) score += 3;
    if (profile.city && profile.state) score += 4;
    if (profile.date_of_birth) score += 3;
    if (profile.handicap_index !== undefined) score += 3;
    if (profile.years_playing) score += 2;
    
    if (profile.height_ft && profile.height_in !== undefined) score += 7;
    if (profile.wrist_to_floor) score += 10;
    if (profile.hand_size) score += 5;
    if (profile.dominant_hand) score += 3;
    
    if (profile.swing_speed_range) score += 8;
    if (profile.ball_flight) score += 6;
    if (profile.miss_direction) score += 4;
    if (profile.attack_angle) score += 4;
    if (profile.club_path) score += 4;
    if (profile.driver_distance) score += 4;
    
    if (profile.primary_goals && profile.primary_goals.length > 0) score += 8;
    if (profile.club_budget) score += 5;
    if (profile.preferred_brands && profile.preferred_brands.length > 0) score += 6;
    if (profile.club_priorities && profile.club_priorities.length > 0) score += 6;
    
    return Math.min(score, 100);
  };

  const saveSection = async (section: string, data: Partial<UserProfile>) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("user_profiles")
        .upsert({
          user_id: user!.id,
          ...profile,
          ...data,
        });

      if (error) throw error;

      if (section === "swing-profile" || section === "measurements") {
        const swingProfile = {
          swingSpeed: data.swing_speed_range || profile.swing_speed_range,
          handicap: data.handicap_index || profile.handicap_index,
          flex: getFlexFromSwingSpeed(data.swing_speed_range || profile.swing_speed_range),
          height_ft: data.height_ft || profile.height_ft,
          height_in: data.height_in || profile.height_in,
          wrist_to_floor: data.wrist_to_floor || profile.wrist_to_floor,
          hand_size: data.hand_size || profile.hand_size,
          dominant_hand: data.dominant_hand || profile.dominant_hand,
        };
        localStorage.setItem("psfSwingProfile", JSON.stringify(swingProfile));
      }

      setProfile(prev => ({ ...prev, ...data }));
      
      toast({
        title: "Saved",
        description: `${getSectionName(section)} updated successfully`,
      });
      
      await fetchProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getFlexFromSwingSpeed = (speed: string | null | undefined): string => {
    if (!speed) return "R";
    switch (speed) {
      case "under_70":
      case "70-80":
        return "L";
      case "80-90":
        return "R";
      case "90-100":
        return "S";
      case "100-110":
      case "110_plus":
        return "X";
      default:
        return "R";
    }
  };

  const getSectionName = (section: string): string => {
    const names: Record<string, string> = {
      "personal-info": "Personal Information",
      "measurements": "Measurements",
      "swing-profile": "Swing Profile",
      "preferences": "Preferences & Goals",
      "fitting-history": "Fitting History",
    };
    return names[section] || section;
  };

  const getMembershipBadgeColor = (tier: string | null | undefined): string => {
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
  };

  const getMembershipLabel = (tier: string | null | undefined): string => {
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
  };

  const completion = calculateCompletion();
  const userInitials = user?.email?.substring(0, 2).toUpperCase() || "U";

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          avatar_url: publicUrl,
        });

      if (updateError) throw updateError;

      // Refresh avatar URL
      await fetchAvatarUrl();
      
      toast({
        title: "Success",
        description: "Avatar uploaded successfully",
      });
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      setUploadError(error.message || "Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block lg:w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  {/* Avatar Section */}
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={avatarUrl || undefined} />
                        <AvatarFallback className="text-2xl bg-gold/20 text-gold font-semibold">
                          {user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-0 right-0 p-2 bg-gold text-gold-foreground rounded-full cursor-pointer hover:bg-gold/90 transition-colors shadow-lg"
                        title="Upload new avatar"
                      >
                        <Camera className="h-4 w-4" />
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={isUploading}
                      />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {profile?.first_name} {profile?.last_name}
                      </h2>
                      <p className="text-muted-foreground">{user?.email}</p>
                      {isUploading && (
                        <p className="text-sm text-gold mt-2">Uploading avatar...</p>
                      )}
                      {uploadError && (
                        <p className="text-sm text-destructive mt-2">{uploadError}</p>
                      )}
                    </div>
                  </div>
                  
                  <h2 className="font-bold text-xl text-foreground mb-1">
                    {profile.first_name && profile.last_name
                      ? `${profile.first_name} ${profile.last_name}`
                      : "Your Name"}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-3 truncate">
                    {user?.email}
                  </p>
                  
                  <Badge className={getMembershipBadgeColor(profile.membership_tier)}>
                    {getMembershipLabel(profile.membership_tier)}
                  </Badge>
                  
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Profile Completion</span>
                      <span className="text-sm font-bold text-accent">{completion}%</span>
                    </div>
                    <Progress value={completion} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {completion}% Complete — A fuller profile means a more accurate AI fitting.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <nav className="space-y-1">
                    <button
                      onClick={() => setActiveSection("personal-info")}
                      className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                        activeSection === "personal-info"
                          ? "bg-accent text-white"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <User className="h-4 w-4" />
                      <span className="font-medium">Personal Info</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveSection("measurements")}
                      className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                        activeSection === "measurements"
                          ? "bg-accent text-white"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <Ruler className="h-4 w-4" />
                      <span className="font-medium">Measurements</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveSection("swing-profile")}
                      className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                        activeSection === "swing-profile"
                          ? "bg-accent text-white"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <Trophy className="h-4 w-4" />
                      <span className="font-medium">Swing Profile</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveSection("preferences")}
                      className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                        activeSection === "preferences"
                          ? "bg-accent text-white"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <Target className="h-4 w-4" />
                      <span className="font-medium">Preferences</span>
                    </button>
                    
                    <button
                      onClick={() => setActiveSection("fitting-history")}
                      className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                        activeSection === "fitting-history"
                          ? "bg-accent text-white"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <BarChart className="h-4 w-4" />
                      <span className="font-medium">Fitting History</span>
                    </button>
                    
                    <Link
                      href="/profile/settings"
                      className="w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors hover:bg-muted text-foreground"
                    >
                      <Settings className="h-4 w-4" />
                      <span className="font-medium">Settings</span>
                    </Link>
                  </nav>
                </CardContent>
              </Card>
            </div>
          </aside>

          <div className="lg:hidden mb-6 overflow-x-auto">
            <div className="flex gap-2 min-w-max pb-2">
              <Button
                variant={activeSection === "personal-info" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSection("personal-info")}
                className={activeSection === "personal-info" ? "bg-accent text-white" : ""}
              >
                <User className="h-4 w-4 mr-2" />
                Personal Info
              </Button>
              <Button
                variant={activeSection === "measurements" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSection("measurements")}
                className={activeSection === "measurements" ? "bg-accent text-white" : ""}
              >
                <Ruler className="h-4 w-4 mr-2" />
                Measurements
              </Button>
              <Button
                variant={activeSection === "swing-profile" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSection("swing-profile")}
                className={activeSection === "swing-profile" ? "bg-accent text-white" : ""}
              >
                <Trophy className="h-4 w-4 mr-2" />
                Swing Profile
              </Button>
              <Button
                variant={activeSection === "preferences" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSection("preferences")}
                className={activeSection === "preferences" ? "bg-accent text-white" : ""}
              >
                <Target className="h-4 w-4 mr-2" />
                Preferences
              </Button>
              <Button
                variant={activeSection === "fitting-history" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveSection("fitting-history")}
                className={activeSection === "fitting-history" ? "bg-accent text-white" : ""}
              >
                <BarChart className="h-4 w-4 mr-2" />
                History
              </Button>
            </div>
          </div>

          <main className="flex-1 space-y-8">
            {activeSection === "personal-info" && (
              <PersonalInfoSection
                profile={profile}
                saving={saving}
                onSave={(data) => saveSection("personal-info", data)}
              />
            )}

            {activeSection === "measurements" && (
              <MeasurementsSection
                profile={profile}
                saving={saving}
                showMeasureGuide={showMeasureGuide}
                onToggleGuide={() => setShowMeasureGuide(!showMeasureGuide)}
                onSave={(data) => saveSection("measurements", data)}
              />
            )}

            {activeSection === "swing-profile" && (
              <SwingProfileSection
                profile={profile}
                saving={saving}
                onSave={(data) => saveSection("swing-profile", data)}
              />
            )}

            {activeSection === "preferences" && (
              <PreferencesSection
                profile={profile}
                saving={saving}
                onSave={(data) => saveSection("preferences", data)}
              />
            )}

            {activeSection === "fitting-history" && (
              <FittingHistorySection sessions={sessions} />
            )}
          </main>
        </div>
      </div>
    </AppLayout>
  );
}

function PersonalInfoSection({
  profile,
  saving,
  onSave,
}: {
  profile: Partial<UserProfile>;
  saving: boolean;
  onSave: (data: Partial<UserProfile>) => void;
}) {
  const [formData, setFormData] = useState({
    first_name: profile.first_name || "",
    last_name: profile.last_name || "",
    phone_number: profile.phone_number || "",
    city: profile.city || "",
    state: profile.state || "",
    date_of_birth: profile.date_of_birth || "",
    gender: profile.gender || "",
    handicap_index: profile.handicap_index?.toString() || "",
    years_playing: profile.years_playing || "",
  });

  useEffect(() => {
    setFormData({
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      phone_number: profile.phone_number || "",
      city: profile.city || "",
      state: profile.state || "",
      date_of_birth: profile.date_of_birth || "",
      gender: profile.gender || "",
      handicap_index: profile.handicap_index?.toString() || "",
      years_playing: profile.years_playing || "",
    });
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      handicap_index: formData.handicap_index ? parseFloat(formData.handicap_index) : null,
    } as Partial<UserProfile>);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="John"
              />
            </div>
            <div>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              Email Address
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Change email in Settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Input
              id="email"
              value={profile.user_id ? "user-email@example.com" : ""}
              disabled
              className="bg-muted"
            />
          </div>

          <div>
            <Label htmlFor="phone_number">Phone Number (optional)</Label>
            <Input
              id="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Alexandria"
              />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="VA"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
            />
          </div>

          <div>
            <Label>Gender (optional)</Label>
            <RadioGroup
              value={formData.gender}
              onValueChange={(value) => setFormData({ ...formData, gender: value })}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male" className="font-normal cursor-pointer">Male</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female" className="font-normal cursor-pointer">Female</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="prefer_not_to_say" id="prefer_not_to_say" />
                <Label htmlFor="prefer_not_to_say" className="font-normal cursor-pointer">Prefer not to say</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="handicap_index" className="flex items-center gap-2">
              Handicap Index (0-54)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Used to calibrate recommendation difficulty</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Input
              id="handicap_index"
              type="number"
              min="0"
              max="54"
              step="0.1"
              value={formData.handicap_index}
              onChange={(e) => setFormData({ ...formData, handicap_index: e.target.value })}
              placeholder="15.0"
            />
          </div>

          <div>
            <Label htmlFor="years_playing">Years Playing Golf</Label>
            <Select
              value={formData.years_playing}
              onValueChange={(value) => setFormData({ ...formData, years_playing: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="less_than_1">Less than 1 year</SelectItem>
                <SelectItem value="1-3">1–3 years</SelectItem>
                <SelectItem value="3-5">3–5 years</SelectItem>
                <SelectItem value="5-10">5–10 years</SelectItem>
                <SelectItem value="10_plus">10+ years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={saving} className="w-full md:w-auto bg-gold text-gold-foreground hover:bg-gold/90">
            {saving ? "Saving..." : "Save Personal Info"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function MeasurementsSection({
  profile,
  saving,
  showMeasureGuide,
  onToggleGuide,
  onSave,
}: {
  profile: Partial<UserProfile>;
  saving: boolean;
  showMeasureGuide: boolean;
  onToggleGuide: () => void;
  onSave: (data: Partial<UserProfile>) => void;
}) {
  const [formData, setFormData] = useState({
    height_ft: profile.height_ft?.toString() || "",
    height_in: profile.height_in?.toString() || "",
    wrist_to_floor: profile.wrist_to_floor?.toString() || "",
    hand_size: profile.hand_size || "",
    dominant_hand: profile.dominant_hand || "",
  });

  useEffect(() => {
    setFormData({
      height_ft: profile.height_ft?.toString() || "",
      height_in: profile.height_in?.toString() || "",
      wrist_to_floor: profile.wrist_to_floor?.toString() || "",
      hand_size: profile.hand_size || "",
      dominant_hand: profile.dominant_hand || "",
    });
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      height_ft: formData.height_ft ? parseInt(formData.height_ft) : null,
      height_in: formData.height_in ? parseInt(formData.height_in) : null,
      wrist_to_floor: formData.wrist_to_floor ? parseFloat(formData.wrist_to_floor) : null,
      hand_size: formData.hand_size || null,
      dominant_hand: formData.dominant_hand || null,
    } as Partial<UserProfile>);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Body Measurements</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleGuide}
          >
            <Info className="h-4 w-4 mr-2" />
            {showMeasureGuide ? "Hide" : "Show"} Guide
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Collapsible open={showMeasureGuide}>
          <CollapsibleContent>
            <div className="mb-6 p-6 bg-muted/50 rounded-lg border border-border">
              <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Ruler className="h-5 w-5 text-accent" />
                How to Measure for Club Fitting
              </h4>
              
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-foreground mb-2">📏 Height</h5>
                  <p className="text-sm text-muted-foreground">
                    Stand with your back against a wall, barefoot. Mark the top of your head and measure from floor to mark. Enter feet and inches separately.
                  </p>
                </div>

                <div>
                  <h5 className="font-medium text-foreground mb-2">📐 Wrist-to-Floor</h5>
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>CRITICAL for club length fitting.</strong> Wear golf shoes or dress shoes (1" heel). Stand straight with arms relaxed at sides.
                  </p>
                  <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                    <li>Have someone measure from the crease of your wrist (where watch sits)</li>
                    <li>Straight down to the floor</li>
                    <li>Do NOT bend arms or wrists</li>
                    <li>Measure in inches (decimal is OK, e.g., 34.5")</li>
                  </ol>
                </div>

                <div>
                  <h5 className="font-medium text-foreground mb-2">✋ Hand Size</h5>
                  <p className="text-sm text-muted-foreground">
                    Measure from the base of your palm to the tip of your middle finger:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mt-2">
                    <li><strong>Small:</strong> Less than 7 inches</li>
                    <li><strong>Medium:</strong> 7–8.5 inches</li>
                    <li><strong>Large:</strong> 8.5–9.5 inches</li>
                    <li><strong>Extra Large:</strong> Over 9.5 inches</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-medium text-foreground mb-2">🎯 Dominant Hand</h5>
                  <p className="text-sm text-muted-foreground">
                    Select the hand you swing with (the hand lower on the grip). Right-handed golfers swing right-handed clubs.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-accent/10 rounded border border-accent/30">
                <p className="text-sm text-foreground flex items-start gap-2">
                  <Info className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Pro Tip:</strong> Wrist-to-floor is the single most important measurement for club length. 
                    Get it accurate to within ±0.25" for best fitting results. Have someone help you measure.
                  </span>
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="flex items-center gap-2">
              Height
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Your total height affects club length recommendations</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="height_ft" className="text-xs text-muted-foreground">
                  Feet
                </Label>
                <Select
                  value={formData.height_ft}
                  onValueChange={(value) => setFormData({ ...formData, height_ft: value })}
                >
                  <SelectTrigger id="height_ft">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 ft</SelectItem>
                    <SelectItem value="5">5 ft</SelectItem>
                    <SelectItem value="6">6 ft</SelectItem>
                    <SelectItem value="7">7 ft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="height_in" className="text-xs text-muted-foreground">
                  Inches
                </Label>
                <Select
                  value={formData.height_in}
                  onValueChange={(value) => setFormData({ ...formData, height_in: value })}
                >
                  <SelectTrigger id="height_in">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {[...Array(12)].map((_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i} in
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formData.height_ft && formData.height_in && (
              <p className="text-sm text-muted-foreground mt-2">
                Total: {formData.height_ft}'{formData.height_in}" (
                {parseInt(formData.height_ft) * 12 + parseInt(formData.height_in)} inches)
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="wrist_to_floor" className="flex items-center gap-2">
              Wrist-to-Floor Measurement (inches)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-accent/20 rounded text-xs font-medium text-accent">
                      <TrendingUp className="h-3 w-3" />
                      CRITICAL
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Most important measurement for club length fitting. Stand straight with arms relaxed, 
                      measure from wrist crease to floor. Accuracy to ±0.25" is ideal.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Input
              id="wrist_to_floor"
              type="number"
              min="20"
              max="50"
              step="0.25"
              inputMode="decimal"
              value={formData.wrist_to_floor}
              onChange={(e) => setFormData({ ...formData, wrist_to_floor: e.target.value })}
              placeholder="e.g., 34.5"
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Typical range: Men 32-37", Women 29-34". Click "Show Guide" above for measurement instructions.
            </p>
          </div>

          <div>
            <Label htmlFor="hand_size" className="flex items-center gap-2">
              Hand Size
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Determines proper grip thickness and club feel</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Select
              value={formData.hand_size}
              onValueChange={(value) => setFormData({ ...formData, hand_size: value })}
            >
              <SelectTrigger id="hand_size">
                <SelectValue placeholder="Select hand size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (under 7")</SelectItem>
                <SelectItem value="medium">Medium (7–8.5")</SelectItem>
                <SelectItem value="large">Large (8.5–9.5")</SelectItem>
                <SelectItem value="extra_large">Extra Large (over 9.5")</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Measure from base of palm to middle fingertip
            </p>
          </div>

          <div>
            <Label className="flex items-center gap-2 mb-3">
              Dominant Hand / Swing Direction
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The hand lower on the grip determines your swing direction</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <RadioGroup
              value={formData.dominant_hand}
              onValueChange={(value) => setFormData({ ...formData, dominant_hand: value })}
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="right" id="right_hand" />
                <Label htmlFor="right_hand" className="font-normal cursor-pointer flex-1">
                  <div>
                    <div className="font-medium">Right-Handed</div>
                    <div className="text-xs text-muted-foreground">Right hand lower on grip, face target on right</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="left" id="left_hand" />
                <Label htmlFor="left_hand" className="font-normal cursor-pointer flex-1">
                  <div>
                    <div className="font-medium">Left-Handed</div>
                    <div className="text-xs text-muted-foreground">Left hand lower on grip, face target on left</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button 
              type="submit" 
              disabled={saving} 
              className="flex-1 bg-gold text-gold-foreground hover:bg-gold/90"
            >
              {saving ? "Saving..." : "Save Measurements"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onToggleGuide}
              className="flex-1 sm:flex-initial"
            >
              <Info className="h-4 w-4 mr-2" />
              {showMeasureGuide ? "Hide" : "Show"} Guide
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function SwingProfileSection({
  profile,
  saving,
  onSave,
}: {
  profile: Partial<UserProfile>;
  saving: boolean;
  onSave: (data: Partial<UserProfile>) => void;
}) {
  const [formData, setFormData] = useState({
    swing_speed_range: profile.swing_speed_range || "",
    ball_flight: profile.ball_flight || "",
    miss_direction: profile.miss_direction || "",
    attack_angle: profile.attack_angle || "",
    club_path: profile.club_path || "",
    driver_distance: profile.driver_distance?.toString() || "",
  });

  useEffect(() => {
    setFormData({
      swing_speed_range: profile.swing_speed_range || "",
      ball_flight: profile.ball_flight || "",
      miss_direction: profile.miss_direction || "",
      attack_angle: profile.attack_angle || "",
      club_path: profile.club_path || "",
      driver_distance: profile.driver_distance?.toString() || "",
    });
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      swing_speed_range: formData.swing_speed_range || null,
      ball_flight: formData.ball_flight || null,
      miss_direction: formData.miss_direction || null,
      attack_angle: formData.attack_angle || null,
      club_path: formData.club_path || null,
      driver_distance: formData.driver_distance ? parseInt(formData.driver_distance) : null,
    } as Partial<UserProfile>);
  };

  const getFlexRecommendation = (speedRange: string): string => {
    switch (speedRange) {
      case "under_70":
        return "Senior Flex (A) or Ladies Flex (L)";
      case "70-80":
        return "Senior Flex (A) or Regular Flex (R)";
      case "80-90":
        return "Regular Flex (R)";
      case "90-100":
        return "Stiff Flex (S)";
      case "100-110":
        return "Stiff Flex (S) or Extra Stiff (X)";
      case "110_plus":
        return "Extra Stiff Flex (X)";
      default:
        return "—";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-accent" />
          Swing Profile & Characteristics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 bg-accent/10 rounded-lg border border-accent/30">
          <p className="text-sm text-foreground flex items-start gap-2">
            <Info className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
            <span>
              Your swing characteristics help us recommend the perfect club specs. If you don't know these values yet, 
              visit a launch monitor or complete a fitting session — we'll populate this automatically from your swing data.
            </span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="swing_speed_range" className="flex items-center gap-2">
              Swing Speed (Driver)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 px-2 py-0.5 bg-accent/20 rounded text-xs font-medium text-accent">
                      <TrendingUp className="h-3 w-3" />
                      CRITICAL
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Most important factor for shaft flex selection. Measured in MPH with driver. 
                      Can be measured at any launch monitor facility or driving range with TrackMan/FlightScope.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Select
              value={formData.swing_speed_range}
              onValueChange={(value) => setFormData({ ...formData, swing_speed_range: value })}
            >
              <SelectTrigger id="swing_speed_range" className="text-base">
                <SelectValue placeholder="Select your driver swing speed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under_70">Under 70 mph (Senior/Junior)</SelectItem>
                <SelectItem value="70-80">70–80 mph (Beginner/Senior)</SelectItem>
                <SelectItem value="80-90">80–90 mph (Average Golfer)</SelectItem>
                <SelectItem value="90-100">90–100 mph (Above Average)</SelectItem>
                <SelectItem value="100-110">100–110 mph (Advanced Player)</SelectItem>
                <SelectItem value="110_plus">110+ mph (Tour/Elite Level)</SelectItem>
              </SelectContent>
            </Select>
            {formData.swing_speed_range && (
              <div className="mt-3 p-3 bg-muted rounded-lg">
                <p className="text-sm text-foreground">
                  <strong>Recommended Shaft Flex:</strong> {getFlexRecommendation(formData.swing_speed_range)}
                </p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="driver_distance" className="flex items-center gap-2">
              Average Driver Distance (yards)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Your typical driver carry + roll distance on a flat fairway</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Input
              id="driver_distance"
              type="number"
              min="100"
              max="400"
              step="5"
              inputMode="numeric"
              value={formData.driver_distance}
              onChange={(e) => setFormData({ ...formData, driver_distance: e.target.value })}
              placeholder="e.g., 250"
              className="text-lg"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Total distance (carry + roll). Average PGA Tour: 295 yards. Average male amateur: 220 yards.
            </p>
          </div>

          <div>
            <Label htmlFor="ball_flight" className="flex items-center gap-2">
              Typical Ball Flight Pattern
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>The predominant curve shape your shots take when hit solidly</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Select
              value={formData.ball_flight}
              onValueChange={(value) => setFormData({ ...formData, ball_flight: value })}
            >
              <SelectTrigger id="ball_flight">
                <SelectValue placeholder="Select your ball flight" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draw">Draw (right-to-left for RH golfer)</SelectItem>
                <SelectItem value="straight">Straight</SelectItem>
                <SelectItem value="fade">Fade (left-to-right for RH golfer)</SelectItem>
                <SelectItem value="hook">Hook (strong right-to-left)</SelectItem>
                <SelectItem value="slice">Slice (strong left-to-right)</SelectItem>
                <SelectItem value="variable">Variable (inconsistent)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              This affects lie angle and face angle recommendations
            </p>
          </div>

          <div>
            <Label htmlFor="miss_direction" className="flex items-center gap-2">
              Miss Tendency
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>When you miss, which direction do your shots typically go?</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Select
              value={formData.miss_direction}
              onValueChange={(value) => setFormData({ ...formData, miss_direction: value })}
            >
              <SelectTrigger id="miss_direction">
                <SelectValue placeholder="Select your miss direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left (Pull/Hook for RH)</SelectItem>
                <SelectItem value="right">Right (Push/Slice for RH)</SelectItem>
                <SelectItem value="both">Both Sides</SelectItem>
                <SelectItem value="none">Consistent (Rare Misses)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="attack_angle" className="flex items-center gap-2">
              Attack Angle (Driver)
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      The vertical direction your clubhead moves through impact. Positive = ascending (hitting up), 
                      Negative = descending (hitting down). Affects optimal driver loft.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Select
              value={formData.attack_angle}
              onValueChange={(value) => setFormData({ ...formData, attack_angle: value })}
            >
              <SelectTrigger id="attack_angle">
                <SelectValue placeholder="Select your attack angle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="steep_down">Steep Down (−5° or more)</SelectItem>
                <SelectItem value="slightly_down">Slightly Down (−2° to −5°)</SelectItem>
                <SelectItem value="level">Level (±1°)</SelectItem>
                <SelectItem value="slightly_up">Slightly Up (+2° to +5°)</SelectItem>
                <SelectItem value="steep_up">Steep Up (+5° or more)</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Tour average: +1° to +3° (hitting slightly up). Affects driver loft recommendation.
            </p>
          </div>

          <div>
            <Label htmlFor="club_path" className="flex items-center gap-2">
              Club Path
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      The horizontal direction your club travels through impact relative to target line. 
                      In-to-out produces draws, out-to-in produces fades. Affects lie angle fitting.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </Label>
            <Select
              value={formData.club_path}
              onValueChange={(value) => setFormData({ ...formData, club_path: value })}
            >
              <SelectTrigger id="club_path">
                <SelectValue placeholder="Select your club path" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_to_in">In-to-In (Straight)</SelectItem>
                <SelectItem value="in_to_out_slight">In-to-Out Slight (1-4°)</SelectItem>
                <SelectItem value="in_to_out_strong">In-to-Out Strong (5°+)</SelectItem>
                <SelectItem value="out_to_in_slight">Out-to-In Slight (1-4°)</SelectItem>
                <SelectItem value="out_to_in_strong">Out-to-In Strong (5°+)</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Measured with launch monitor. Neutral path = 0°. Positive = in-to-out (draw), Negative = out-to-in (fade).
            </p>
          </div>

          <div className="pt-4 border-t">
            <div className="mb-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-accent" />
                How to Get Accurate Data
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>Launch Monitor Session:</strong> Visit a facility with TrackMan, FlightScope, or Foresight GCQuad (30-60 min, $30-$75)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>Golf Simulator:</strong> Many indoor simulators provide swing data (TopGolf, X-Golf, Full Swing)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>Pro Shop Fitting:</strong> Quick 15-min assessment at most golf retailers (often free with purchase)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span><strong>Best Guess:</strong> If unavailable, estimate based on typical distances and ball flight</span>
                </li>
              </ul>
            </div>

            <Button 
              type="submit" 
              disabled={saving} 
              className="w-full bg-gold text-gold-foreground hover:bg-gold/90"
            >
              {saving ? "Saving..." : "Save Swing Profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function PreferencesSection({ profile, saving, onSave }: any) {
  return <div>Preferences section placeholder</div>;
}

function FittingHistorySection({ sessions }: any) {
  return <div>Fitting history section placeholder</div>;
}