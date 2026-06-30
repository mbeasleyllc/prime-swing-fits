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
import { useRouter } from "next/navigation";

type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
type FittingSession = Database["public"]["Tables"]["fitting_sessions"]["Row"];

export default function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("info");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("personal-info");
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [sessions, setSessions] = useState<FittingSession[]>([]);
  const [showMeasureGuide, setShowMeasureGuide] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchSessions();
    }
  }, [user]);

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
        .from("users")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Refresh profile data
      await fetchProfile();
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      setUploadError(error.message || "Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
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
                        <AvatarImage src={profile?.avatar_url} />
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

          <div className="flex flex-wrap gap-2 mb-6">
            <Button
              variant={activeTab === "info" ? "default" : "outline"}
              onClick={() => setActiveTab("info")}
              className={activeTab === "info" ? "bg-gold hover:bg-gold/90" : ""}
            >
              <User className="h-4 w-4 mr-2" />
              Profile Info
            </Button>
            <Button
              variant={activeTab === "measurements" ? "default" : "outline"}
              onClick={() => setActiveTab("measurements")}
              className={activeTab === "measurements" ? "bg-gold hover:bg-gold/90" : ""}
            >
              <Ruler className="h-4 w-4 mr-2" />
              Measurements
            </Button>
            <Button
              variant={activeTab === "swing" ? "default" : "outline"}
              onClick={() => setActiveTab("swing")}
              className={activeTab === "swing" ? "bg-gold hover:bg-gold/90" : ""}
            >
              <Target className="h-4 w-4 mr-2" />
              Swing Profile
            </Button>
            <Button
              variant={activeTab === "goals" ? "default" : "outline"}
              onClick={() => setActiveTab("goals")}
              className={activeTab === "goals" ? "bg-gold hover:bg-gold/90" : ""}
            >
              <Trophy className="h-4 w-4 mr-2" />
              Goals
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/profile/settings")}
            >
              <SettingsIcon className="h-4 w-4 mr-2" />
              Settings
            </Button>
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

function MeasurementsSection({ profile, saving, showMeasureGuide, onToggleGuide, onSave }: any) {
  return <div>Measurements section placeholder</div>;
}

function SwingProfileSection({ profile, saving, onSave }: any) {
  return <div>Swing profile section placeholder</div>;
}

function PreferencesSection({ profile, saving, onSave }: any) {
  return <div>Preferences section placeholder</div>;
}

function FittingHistorySection({ sessions }: any) {
  return <div>Fitting history section placeholder</div>;
}