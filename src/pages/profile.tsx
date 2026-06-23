import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  BarChart
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
        .single();

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
    
    // Personal Info (20%)
    if (profile.first_name && profile.last_name) score += 5;
    if (profile.phone_number) score += 3;
    if (profile.city && profile.state) score += 4;
    if (profile.date_of_birth) score += 3;
    if (profile.handicap_index !== undefined) score += 3;
    if (profile.years_playing) score += 2;
    
    // Measurements (25%)
    if (profile.height_ft && profile.height_in !== undefined) score += 7;
    if (profile.wrist_to_floor) score += 10;
    if (profile.hand_size) score += 5;
    if (profile.dominant_hand) score += 3;
    
    // Swing Profile (30%)
    if (profile.swing_speed_range) score += 8;
    if (profile.ball_flight) score += 6;
    if (profile.miss_direction) score += 4;
    if (profile.attack_angle) score += 4;
    if (profile.club_path) score += 4;
    if (profile.driver_distance) score += 4;
    
    // Preferences (25%)
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

      // Update localStorage for swing profile if applicable
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT SIDEBAR - Desktop */}
          <aside className="hidden lg:block lg:w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* User Avatar & Info */}
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="relative inline-block mb-4">
                    <Avatar className="w-24 h-24">
                      <AvatarFallback className="bg-accent text-white text-2xl">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-gold text-gold-foreground hover:bg-gold/90"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
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
                  
                  {/* Profile Completion */}
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

              {/* Navigation Links */}
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

          {/* MOBILE TAB STRIP */}
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

          {/* RIGHT CONTENT */}
          <main className="flex-1 space-y-8">
            {/* SECTION 1: Personal Information */}
            {activeSection === "personal-info" && (
              <PersonalInfoSection
                profile={profile}
                saving={saving}
                onSave={(data) => saveSection("personal-info", data)}
              />
            )}

            {/* SECTION 2: Measurements */}
            {activeSection === "measurements" && (
              <MeasurementsSection
                profile={profile}
                saving={saving}
                showMeasureGuide={showMeasureGuide}
                onToggleGuide={() => setShowMeasureGuide(!showMeasureGuide)}
                onSave={(data) => saveSection("measurements", data)}
              />
            )}

            {/* SECTION 3: Swing Profile */}
            {activeSection === "swing-profile" && (
              <SwingProfileSection
                profile={profile}
                saving={saving}
                onSave={(data) => saveSection("swing-profile", data)}
              />
            )}

            {/* SECTION 4: Preferences & Goals */}
            {activeSection === "preferences" && (
              <PreferencesSection
                profile={profile}
                saving={saving}
                onSave={(data) => saveSection("preferences", data)}
              />
            )}

            {/* SECTION 5: Fitting History */}
            {activeSection === "fitting-history" && (
              <FittingHistorySection sessions={sessions} />
            )}
          </main>
        </div>

        {/* BOTTOM CTA BANNER */}
        <div className="mt-12 bg-gradient-to-r from-gold to-amber-500 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gold-foreground mb-3">
            Profile updated? Get a fresh AI fitting →
          </h3>
          <Button asChild size="lg" className="bg-accent text-white hover:bg-accent/90">
            <Link href="/fitting/new">
              <TrendingUp className="h-5 w-5 mr-2" />
              Start Fitting
            </Link>
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// COMPONENT: Personal Info Section
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

// COMPONENT: Measurements Section
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
    glove_size: profile.glove_size || "",
  });

  useEffect(() => {
    setFormData({
      height_ft: profile.height_ft?.toString() || "",
      height_in: profile.height_in?.toString() || "",
      wrist_to_floor: profile.wrist_to_floor?.toString() || "",
      hand_size: profile.hand_size || "",
      dominant_hand: profile.dominant_hand || "",
      glove_size: profile.glove_size || "",
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
      glove_size: formData.glove_size || null,
    } as Partial<UserProfile>);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Measurements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            <Info className="h-4 w-4 inline mr-2" />
            Your measurements are the foundation of your fitting. Precise data = better recommendations.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label htmlFor="height_ft">Height (Feet)</Label>
              <Select
                value={formData.height_ft}
                onValueChange={(value) => setFormData({ ...formData, height_ft: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Feet" />
                </SelectTrigger>
                <SelectContent>
                  {[4, 5, 6, 7].map((ft) => (
                    <SelectItem key={ft} value={ft.toString()}>
                      {ft} ft
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="height_in">Height (Inches)</Label>
              <Select
                value={formData.height_in}
                onValueChange={(value) => setFormData({ ...formData, height_in: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Inches" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i).map((inch) => (
                    <SelectItem key={inch} value={inch.toString()}>
                      {inch} in
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="wrist_to_floor">Wrist-to-Floor (inches, 27-45")</Label>
            <Input
              id="wrist_to_floor"
              type="number"
              min="27"
              max="45"
              step="0.5"
              value={formData.wrist_to_floor}
              onChange={(e) => setFormData({ ...formData, wrist_to_floor: e.target.value })}
              placeholder="34.5"
            />
            
            <Collapsible open={showMeasureGuide} onOpenChange={onToggleGuide} className="mt-3">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="text-accent hover:text-accent/80">
                  {showMeasureGuide ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Hide Measuring Guide
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      How to Measure
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Stand straight in flat shoes. Let arm hang naturally. Measure from wrist crease to floor.
                </p>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div>
            <Label>Hand Size</Label>
            <RadioGroup
              value={formData.hand_size}
              onValueChange={(value) => setFormData({ ...formData, hand_size: value })}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="small" id="small" />
                <Label htmlFor="small" className="font-normal cursor-pointer">
                  Small <span className="text-muted-foreground">(Undersized grip)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="font-normal cursor-pointer">
                  Medium <span className="text-muted-foreground">(Standard grip)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="large" />
                <Label htmlFor="large" className="font-normal cursor-pointer">
                  Large <span className="text-muted-foreground">(Midsize grip)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="xl" id="xl" />
                <Label htmlFor="xl" className="font-normal cursor-pointer">
                  XL <span className="text-muted-foreground">(Jumbo grip)</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Dominant Hand</Label>
            <RadioGroup
              value={formData.dominant_hand}
              onValueChange={(value) => setFormData({ ...formData, dominant_hand: value })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="right" id="right" />
                <Label htmlFor="right" className="font-normal cursor-pointer">Right</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="left" id="left" />
                <Label htmlFor="left" className="font-normal cursor-pointer">Left</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="glove_size">Glove Size (optional)</Label>
            <Select
              value={formData.glove_size}
              onValueChange={(value) => setFormData({ ...formData, glove_size: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="S">Small</SelectItem>
                <SelectItem value="M">Medium</SelectItem>
                <SelectItem value="ML">Medium-Large</SelectItem>
                <SelectItem value="L">Large</SelectItem>
                <SelectItem value="XL">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={saving} className="w-full md:w-auto bg-gold text-gold-foreground hover:bg-gold/90">
            {saving ? "Saving..." : "Save Measurements"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// COMPONENT: Swing Profile Section
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
    driver_distance: profile.driver_distance || "",
    iron_7_distance: profile.iron_7_distance?.toString() || "",
    preferred_ball_height: profile.preferred_ball_height || "",
  });

  useEffect(() => {
    setFormData({
      swing_speed_range: profile.swing_speed_range || "",
      ball_flight: profile.ball_flight || "",
      miss_direction: profile.miss_direction || "",
      attack_angle: profile.attack_angle || "",
      club_path: profile.club_path || "",
      driver_distance: profile.driver_distance || "",
      iron_7_distance: profile.iron_7_distance?.toString() || "",
      preferred_ball_height: profile.preferred_ball_height || "",
    });
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      iron_7_distance: formData.iron_7_distance ? parseInt(formData.iron_7_distance) : null,
    } as Partial<UserProfile>);
  };

  const getFlexRecommendation = (speed: string): string => {
    switch (speed) {
      case "under_70":
      case "70-80":
        return "Ladies flex recommended";
      case "80-90":
        return "Regular flex recommended";
      case "90-100":
        return "Stiff flex recommended";
      case "100-110":
      case "110_plus":
        return "Extra stiff flex recommended";
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Swing Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-900">
            <Info className="h-4 w-4 inline mr-2" />
            Your swing profile powers the AI engine. More accurate data = more precise fitting reports.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="swing_speed_range">Estimated Driver Swing Speed</Label>
            <Select
              value={formData.swing_speed_range}
              onValueChange={(value) => setFormData({ ...formData, swing_speed_range: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select swing speed" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under_70">Under 70 mph</SelectItem>
                <SelectItem value="70-80">70–80 mph</SelectItem>
                <SelectItem value="80-90">80–90 mph</SelectItem>
                <SelectItem value="90-100">90–100 mph</SelectItem>
                <SelectItem value="100-110">100–110 mph</SelectItem>
                <SelectItem value="110_plus">110+ mph</SelectItem>
              </SelectContent>
            </Select>
            {formData.swing_speed_range && (
              <p className="text-sm text-accent mt-2">
                → {getFlexRecommendation(formData.swing_speed_range)}
              </p>
            )}
          </div>

          <div>
            <Label>Typical Ball Flight</Label>
            <RadioGroup
              value={formData.ball_flight}
              onValueChange={(value) => setFormData({ ...formData, ball_flight: value })}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="big_slice" id="big_slice" />
                <Label htmlFor="big_slice" className="font-normal cursor-pointer">Big Slice</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="soft_fade" id="soft_fade" />
                <Label htmlFor="soft_fade" className="font-normal cursor-pointer">Soft Fade</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="straight" id="straight" />
                <Label htmlFor="straight" className="font-normal cursor-pointer">Straight</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="soft_draw" id="soft_draw" />
                <Label htmlFor="soft_draw" className="font-normal cursor-pointer">Soft Draw</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="big_hook" id="big_hook" />
                <Label htmlFor="big_hook" className="font-normal cursor-pointer">Big Hook</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Typical Miss Direction</Label>
            <RadioGroup
              value={formData.miss_direction}
              onValueChange={(value) => setFormData({ ...formData, miss_direction: value })}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="left" id="miss_left" />
                <Label htmlFor="miss_left" className="font-normal cursor-pointer">Left</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="right" id="miss_right" />
                <Label htmlFor="miss_right" className="font-normal cursor-pointer">Right</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="both" id="miss_both" />
                <Label htmlFor="miss_both" className="font-normal cursor-pointer">Both</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="consistent" id="miss_consistent" />
                <Label htmlFor="miss_consistent" className="font-normal cursor-pointer">Consistent</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Attack Angle</Label>
            <RadioGroup
              value={formData.attack_angle}
              onValueChange={(value) => setFormData({ ...formData, attack_angle: value })}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="steep" id="steep" />
                <Label htmlFor="steep" className="font-normal cursor-pointer">
                  Steep <span className="text-muted-foreground">— "I chop down at the ball"</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="neutral" id="neutral" />
                <Label htmlFor="neutral" className="font-normal cursor-pointer">Neutral</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="shallow" id="shallow" />
                <Label htmlFor="shallow" className="font-normal cursor-pointer">
                  Shallow <span className="text-muted-foreground">— "I sweep through impact"</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Club Path Tendency</Label>
            <RadioGroup
              value={formData.club_path}
              onValueChange={(value) => setFormData({ ...formData, club_path: value })}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inside_out" id="inside_out" />
                <Label htmlFor="inside_out" className="font-normal cursor-pointer">
                  Inside-Out <span className="text-muted-foreground">(draws)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="square" id="square" />
                <Label htmlFor="square" className="font-normal cursor-pointer">Square</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="outside_in" id="outside_in" />
                <Label htmlFor="outside_in" className="font-normal cursor-pointer">
                  Outside-In <span className="text-muted-foreground">(slices/fades)</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="driver_distance">Average Driver Distance</Label>
            <Select
              value={formData.driver_distance}
              onValueChange={(value) => setFormData({ ...formData, driver_distance: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under_150">Under 150 yards</SelectItem>
                <SelectItem value="150-175">150–175 yards</SelectItem>
                <SelectItem value="175-200">175–200 yards</SelectItem>
                <SelectItem value="200-225">200–225 yards</SelectItem>
                <SelectItem value="225-250">225–250 yards</SelectItem>
                <SelectItem value="250_plus">250+ yards</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="iron_7_distance">Average 7-Iron Distance (optional, in yards)</Label>
            <Input
              id="iron_7_distance"
              type="number"
              min="50"
              max="250"
              value={formData.iron_7_distance}
              onChange={(e) => setFormData({ ...formData, iron_7_distance: e.target.value })}
              placeholder="150"
            />
          </div>

          <div>
            <Label>Preferred Ball Flight Height</Label>
            <RadioGroup
              value={formData.preferred_ball_height}
              onValueChange={(value) => setFormData({ ...formData, preferred_ball_height: value })}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low" className="font-normal cursor-pointer">Low</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium_height" />
                <Label htmlFor="medium_height" className="font-normal cursor-pointer">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high" className="font-normal cursor-pointer">High</Label>
              </div>
            </RadioGroup>
          </div>

          <Button type="submit" disabled={saving} className="w-full md:w-auto bg-gold text-gold-foreground hover:bg-gold/90">
            {saving ? "Saving..." : "Save Swing Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// COMPONENT: Preferences Section
function PreferencesSection({
  profile,
  saving,
  onSave,
}: {
  profile: Partial<UserProfile>;
  saving: boolean;
  onSave: (data: Partial<UserProfile>) => void;
}) {
  const [formData, setFormData] = useState({
    primary_goals: profile.primary_goals || [],
    club_budget: profile.club_budget || "",
    preferred_brands: profile.preferred_brands || [],
    club_priorities: profile.club_priorities || [],
    physical_considerations: profile.physical_considerations || [],
  });

  useEffect(() => {
    setFormData({
      primary_goals: profile.primary_goals || [],
      club_budget: profile.club_budget || "",
      preferred_brands: profile.preferred_brands || [],
      club_priorities: profile.club_priorities || [],
      physical_considerations: profile.physical_considerations || [],
    });
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Partial<UserProfile>);
  };

  const toggleArrayValue = (field: "primary_goals" | "preferred_brands" | "club_priorities" | "physical_considerations", value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value],
    }));
  };

  const goalOptions = [
    "More Distance",
    "Fix My Slice",
    "Better Accuracy",
    "More Consistency",
    "Short Game",
    "Lower Scores",
    "Full Bag Overhaul",
  ];

  const brandOptions = [
    "TaylorMade",
    "Callaway",
    "Titleist",
    "Ping",
    "Cobra",
    "Cleveland",
    "Srixon",
    "Mizuno",
    "No Preference",
  ];

  const priorityOptions = ["Driver", "Fairway Woods", "Hybrids", "Irons", "Wedges", "Putter"];

  const considerationOptions = [
    "Back Issues",
    "Wrist or Hand Issues",
    "Limited Flexibility",
    "Arthritis",
    "None",
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences & Goals</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="mb-3 block">Primary Goals (select all that apply)</Label>
            <div className="flex flex-wrap gap-2">
              {goalOptions.map((goal) => (
                <Badge
                  key={goal}
                  variant={formData.primary_goals.includes(goal) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    formData.primary_goals.includes(goal) ? "bg-accent text-white" : ""
                  }`}
                  onClick={() => toggleArrayValue("primary_goals", goal)}
                >
                  {goal}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="club_budget">Club Budget</Label>
            <RadioGroup
              value={formData.club_budget}
              onValueChange={(value) => setFormData({ ...formData, club_budget: value })}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="under_300" id="under_300" />
                <Label htmlFor="under_300" className="font-normal cursor-pointer">Under $300</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="300-600" id="300-600" />
                <Label htmlFor="300-600" className="font-normal cursor-pointer">$300–$600</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="600-1000" id="600-1000" />
                <Label htmlFor="600-1000" className="font-normal cursor-pointer">$600–$1,000</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1000-1500" id="1000-1500" />
                <Label htmlFor="1000-1500" className="font-normal cursor-pointer">$1,000–$1,500</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="1500_plus" id="1500_plus" />
                <Label htmlFor="1500_plus" className="font-normal cursor-pointer">$1,500+</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no_budget" id="no_budget" />
                <Label htmlFor="no_budget" className="font-normal cursor-pointer">No Budget Yet</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label className="mb-3 block">Preferred Brands (select all that apply)</Label>
            <div className="flex flex-wrap gap-2">
              {brandOptions.map((brand) => (
                <Badge
                  key={brand}
                  variant={formData.preferred_brands.includes(brand) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    formData.preferred_brands.includes(brand) ? "bg-accent text-white" : ""
                  }`}
                  onClick={() => toggleArrayValue("preferred_brands", brand)}
                >
                  {brand}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Club Priority (select categories needing attention)</Label>
            <div className="flex flex-wrap gap-2">
              {priorityOptions.map((priority) => (
                <Badge
                  key={priority}
                  variant={formData.club_priorities.includes(priority) ? "default" : "outline"}
                  className={`cursor-pointer ${
                    formData.club_priorities.includes(priority) ? "bg-accent text-white" : ""
                  }`}
                  onClick={() => toggleArrayValue("club_priorities", priority)}
                >
                  {priority}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Physical Considerations</Label>
            <div className="space-y-3">
              {considerationOptions.map((consideration) => (
                <div key={consideration} className="flex items-center space-x-2">
                  <Checkbox
                    id={consideration}
                    checked={formData.physical_considerations.includes(consideration)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        toggleArrayValue("physical_considerations", consideration);
                      } else {
                        toggleArrayValue("physical_considerations", consideration);
                      }
                    }}
                  />
                  <Label htmlFor={consideration} className="font-normal cursor-pointer">
                    {consideration}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={saving} className="w-full md:w-auto bg-gold text-gold-foreground hover:bg-gold/90">
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// COMPONENT: Fitting History Section
function FittingHistorySection({ sessions }: { sessions: FittingSession[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fitting History</CardTitle>
        <p className="text-sm text-muted-foreground">My Reports</p>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-semibold text-lg mb-2 text-foreground">No fittings yet.</h3>
            <p className="text-muted-foreground mb-6">Start your first AI fitting to get personalized recommendations</p>
            <Button asChild className="bg-accent text-white hover:bg-accent/90">
              <Link href="/fitting/new">
                <TrendingUp className="h-4 w-4 mr-2" />
                Start My First Fitting →
              </Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>
                      {session.completed_at
                        ? new Date(session.completed_at).toLocaleDateString()
                        : new Date(session.created_at!).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={session.status === "completed" ? "default" : "secondary"} className="bg-accent text-white">
                        {session.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button asChild variant="outline" size="sm" className="border-gold text-gold hover:bg-gold/10">
                        <Link href={`/fitting/${session.id}/report`}>
                          <Download className="h-3 w-3 mr-1" />
                          Download PDF
                        </Link>
                      </Button>
                      <Button asChild size="sm" className="bg-accent text-white hover:bg-accent/90">
                        <Link href="/fitting/new">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Re-Fit →
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}