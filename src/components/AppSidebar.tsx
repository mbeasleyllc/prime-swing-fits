import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Home,
  User,
  FileText,
  Calendar,
  Target,
  TrendingUp,
  LogOut,
  Settings,
  Shield,
  Users,
  Activity,
  Tag,
  BarChart3,
  Crown,
  LayoutDashboard,
  Swords,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AppSidebar() {
  const router = useRouter();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
      loadUserProfile();
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user!.id)
        .single();

      if (!error && data?.role === "admin") {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const loadUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("first_name, last_name, avatar_url")
        .eq("id", user!.id)
        .maybeSingle();

      if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const getInitials = () => {
    if (userProfile?.first_name && userProfile?.last_name) {
      return `${userProfile.first_name[0]}${userProfile.last_name[0]}`;
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  const mainNavItems = [
    { title: "Dashboard", icon: Home, url: "/dashboard" },
    { title: "Profile", icon: User, url: "/profile" },
    { title: "New Fitting", icon: FileText, url: "/fitting/new" },
    { title: "Fitting History", icon: Calendar, url: "/profile?tab=history" },
    { title: "Swing Analytics", icon: TrendingUp, url: "/swing-analytics" },
    { title: "Goals & Badges", icon: Target, url: "/profile?tab=goals" },
  ];

  const adminNavItems = [
    { title: "Admin Dashboard", icon: Shield, url: "/admin" },
    { title: "User Management", icon: Users, url: "/admin/users" },
    { title: "Fitting Sessions", icon: Activity, url: "/admin/sessions" },
    { title: "Coupon Codes", icon: Tag, url: "/admin/coupons" },
  ];

  return (
    <Sidebar className="border-r border-border bg-primary text-primary-foreground">
      <SidebarHeader className="border-b border-border/50 px-4 py-4">
        <Link href="/" className="flex items-center justify-center hover:opacity-80 transition-opacity">
          <Image 
            src="/PSF-Logo_HeaderLogo_WHT-3.png?v=1785772207"
            alt="Prime Swing Fits" 
            width={180}
            height={40}
            className="h-10 w-auto"
            unoptimized
          />
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white/70 text-xs uppercase tracking-wider mb-2">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={router.pathname === "/dashboard"}
                  className="text-white hover:bg-white/10 data-[active=true]:bg-gold data-[active=true]:text-gold-foreground"
                >
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={router.pathname === "/profile"}
                  className="text-white hover:bg-white/10 data-[active=true]:bg-gold data-[active=true]:text-gold-foreground"
                >
                  <Link href="/profile">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={router.pathname.startsWith("/fitting")}
                  className="text-white hover:bg-white/10 data-[active=true]:bg-gold data-[active=true]:text-gold-foreground"
                >
                  <Link href="/fitting/new">
                    <Target className="h-4 w-4" />
                    <span>New Fitting</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={router.pathname.startsWith("/swing-analytics")}
                  className="text-white hover:bg-white/10 data-[active=true]:bg-gold data-[active=true]:text-gold-foreground"
                >
                  <Link href="/swing-analytics">
                    <Activity className="h-4 w-4" />
                    <span>Swing Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild 
                  isActive={router.pathname.startsWith("/clubs")}
                  className="text-white hover:bg-white/10 data-[active=true]:bg-gold data-[active=true]:text-gold-foreground"
                >
                  <Link href="/clubs">
                    <Swords className="h-4 w-4" />
                    <span>Club Database</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="text-gold text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
              <Shield className="h-3 w-3" />
              Admin Panel
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={router.pathname === "/admin"}
                    className="text-white hover:bg-white/10 data-[active=true]:bg-gold data-[active=true]:text-gold-foreground"
                  >
                    <Link href="/admin">
                      <Shield className="h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={router.pathname === "/admin/users"}
                    className="text-white hover:bg-white/10 data-[active=true]:bg-gold data-[active=true]:text-gold-foreground"
                  >
                    <Link href="/admin/users">
                      <Users className="h-4 w-4" />
                      <span>User Management</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={router.pathname === "/admin/sessions"}
                    className="text-white hover:bg-white/10 data-[active=true]:bg-gold data-[active=true]:text-gold-foreground"
                  >
                    <Link href="/admin/sessions">
                      <Activity className="h-4 w-4" />
                      <span>Fitting Sessions</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={router.pathname === "/admin/coupons"}
                    className="text-white hover:bg-white/10 data-[active=true]:bg-gold data-[active=true]:text-gold-foreground"
                  >
                    <Link href="/admin/coupons">
                      <Tag className="h-4 w-4" />
                      <span>Coupon Codes</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10 border-2 border-gold">
            <AvatarImage src={userProfile?.avatar_url || undefined} />
            <AvatarFallback className="bg-gold text-gold-foreground font-semibold">
              {userProfile?.first_name?.[0]}{userProfile?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {userProfile?.first_name} {userProfile?.last_name}
            </p>
            <p className="text-xs text-white/70 truncate">{user?.email}</p>
          </div>
        </div>
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start border-white/20 text-white hover:bg-white/10 hover:text-white" 
            asChild
          >
            <Link href="/profile/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start border-white/20 text-white hover:bg-white/10 hover:text-white" 
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}