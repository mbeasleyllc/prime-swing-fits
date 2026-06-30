import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  User,
  Settings,
  FileText,
  LogOut,
  Bell,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Fitting Sessions", href: "/dashboard", icon: FileText },
  { name: "Swing Analytics", href: "/swing-analytics", icon: TrendingUp, badge: true },
  { name: "Compare Equipment", href: "/clubs/compare", icon: TrendingUp },
  { name: "Settings", href: "/profile/settings", icon: Settings },
];

export function AppSidebar() {
  const router = useRouter();
  const { user } = useAuth();
  const [hasNewBadge, setHasNewBadge] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkNewBadges = async () => {
      const { data: lastViewed } = await supabase
        .from("users")
        .select("last_badge_view")
        .eq("id", user.id)
        .single();

      const { data: latestBadge } = await supabase
        .from("achievement_badges")
        .select("earned_date")
        .eq("user_id", user.id)
        .order("earned_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestBadge && lastViewed) {
        const lastViewTime = lastViewed.last_badge_view ? new Date(lastViewed.last_badge_view) : new Date(0);
        const latestBadgeTime = new Date(latestBadge.earned_date);
        setHasNewBadge(latestBadgeTime > lastViewTime);
      } else if (latestBadge) {
        setHasNewBadge(true);
      }
    };

    checkNewBadges();
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleNavClick = async (href: string) => {
    if (href === "/swing-analytics" && hasNewBadge && user) {
      await supabase
        .from("users")
        .update({ last_badge_view: new Date().toISOString() })
        .eq("id", user.id);
      setHasNewBadge(false);
    }
  };

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || "U";

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar flex flex-col shadow-lg">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold rounded-lg flex items-center justify-center shadow-md">
            <span className="text-xl font-bold text-gold-foreground">PS</span>
          </div>
          <div>
            <h1 className="text-sidebar-foreground font-bold text-lg">Prime Swing</h1>
            <p className="text-sidebar-foreground/60 text-xs">Fits</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = router.pathname === item.href || router.pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          const showBadge = item.badge && item.href === "/swing-analytics" && hasNewBadge;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => handleNavClick(item.href)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative ${
                isActive
                  ? "bg-gold text-gold-foreground shadow-md font-semibold"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
              {showBadge && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-gold rounded-full shadow-md" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="w-10 h-10 shadow-sm">
            <AvatarFallback className="bg-gold text-gold-foreground font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.email?.split("@")[0]}
            </p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
}