import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, Shield, LogOut, Menu, X, ChevronDown, Moon, Sun } from "lucide-react";

export function Navigation() {
  const { user, isLoading, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const navLinks = [
    { href: "/about", label: "About" },
    { href: "/how-it-works", label: "How It Works" },
    { href: "/pricing", label: "Pricing" },
    { href: "/faq", label: "FAQ" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className={`border-b border-border bg-card shadow-sm sticky top-0 z-50 ${theme === 'dark' ? 'starfield-bg' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary hover:opacity-80 transition-opacity group">
            <Image 
              src="/PSF-Logo_HeaderLogo_CLR-2.png" 
              alt="Prime Swing Fits" 
              width={180}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-gold hover:bg-gold/5 rounded-md transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth Buttons - Desktop */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hover:text-gold"
              aria-label="Toggle Evening Round Mode"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-gold" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            {isLoading ? (
              <div className="w-20 h-9 bg-muted animate-pulse rounded" />
            ) : user ? (
              <>
                <Button variant="ghost" asChild className="hover:text-gold">
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
                <Button variant="outline" onClick={signOut} className="bg-gold text-gold-foreground hover:bg-gold/90 border-gold">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild className="hover:text-gold">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-gold text-gold-foreground hover:bg-gold/90 shadow-md">
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            {!isLoading && !user && (
              <Button size="sm" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link href="/auth/register">Get Started</Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-muted-foreground hover:text-accent"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border py-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-gold hover:bg-gold/5 rounded-md transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="px-4 py-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-full justify-center"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Evening Round Mode
                  </>
                )}
              </Button>
            </div>

            <div className="border-t border-border pt-4 mt-4 space-y-2">
              {isLoading ? (
                <div className="h-10 bg-muted animate-pulse rounded mx-4" />
              ) : user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center px-4 py-2 text-base font-medium text-muted-foreground hover:text-gold hover:bg-gold/5 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                  {user.user_metadata?.role === "admin" && (
                    <Link
                      href="/admin"
                      className="flex items-center px-4 py-2 text-base font-medium text-gold hover:bg-gold/5 rounded-md transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Admin
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center w-full px-4 py-2 text-base font-medium bg-gold text-gold-foreground hover:bg-gold/90 rounded-md transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="block px-4 py-2 text-base font-medium text-muted-foreground hover:text-gold hover:bg-gold/5 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <div className="px-4">
                    <Button asChild className="w-full bg-gold text-gold-foreground hover:bg-gold/90">
                      <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                        Get Started
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}