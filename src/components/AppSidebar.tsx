import { useEffect, useState } from "react";
import Link from "next/link";
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
    { title: "Logs & Reports", icon: BarChart3, url: "/admin/logs" },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-foreground">Prime Swing Fits</h2>
            <p className="text-xs text-muted-foreground">Pro Fitting System</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={router.pathname === item.url}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <>
            <Separator className="my-2" />
            <SidebarGroup>
              <SidebarGroupLabel className="flex items-center gap-2 text-gold">
                <Shield className="h-4 w-4" />
                Admin Panel
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={router.pathname === item.url}
                      >
                        <Link href={item.url}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        <Separator className="my-2" />

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={router.pathname === "/profile/settings"}>
                  <Link href="/profile/settings">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={userProfile?.avatar_url} />
              <AvatarFallback className="bg-accent text-white">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">
                {userProfile?.first_name && userProfile?.last_name
                  ? `${userProfile.first_name} ${userProfile.last_name}`
                  : user?.email?.split("@")[0]}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}