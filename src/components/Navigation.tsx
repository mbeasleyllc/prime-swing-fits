import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Target, LayoutDashboard, Shield, LogOut } from "lucide-react";

export function Navigation() {
  const { user, isLoading, signOut } = useAuth();

  return (
    <nav className="border-b border-border bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <Target className="h-6 w-6" />
            </div>
            <span className="font-heading font-bold text-xl text-foreground">Prime Swing Fits</span>
          </Link>

          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="w-20 h-9 bg-muted animate-pulse rounded" />
            ) : user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                {user.user_metadata?.role === "admin" && (
                  <Button variant="ghost" asChild>
                    <Link href="/admin">
                      <Shield className="w-4 h-4 mr-2" />
                      Admin
                    </Link>
                  </Button>
                )}
                <Button variant="outline" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}