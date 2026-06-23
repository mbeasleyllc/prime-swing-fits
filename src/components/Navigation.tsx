import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Trophy, LayoutDashboard, Shield, LogOut } from "lucide-react";

export function Navigation() {
  const { user, isLoading, signOut } = useAuth();

  return (
    <nav className="border-b border-border bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:text-accent transition-colors group">
            <div className="bg-accent/10 p-2 rounded-lg group-hover:bg-accent/20 transition-colors">
              <Trophy className="h-6 w-6 text-accent" />
            </div>
            <span>Prime Swing Fits</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/pricing" className="text-muted-foreground hover:text-accent transition-colors font-medium">
              Pricing
            </Link>

            {isLoading ? (
              <div className="w-20 h-9 bg-muted animate-pulse rounded" />
            ) : user ? (
              <>
                <Button variant="ghost" asChild className="hover:text-accent">
                  <Link href="/dashboard">
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                {user.user_metadata?.role === "admin" && (
                  <Button variant="ghost" asChild className="hover:text-gold">
                    <Link href="/admin">
                      <Shield className="w-4 h-4 mr-2" />
                      Admin
                    </Link>
                  </Button>
                )}
                <Button variant="outline" onClick={signOut} className="hover:border-accent hover:text-accent">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="hover:text-accent">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-md">
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