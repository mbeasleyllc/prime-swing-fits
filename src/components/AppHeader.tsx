import React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AppHeader() {
  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-[#1a4d2e] border-b border-white/10 flex items-center justify-between px-6 z-10">
      {/* Logo (duplicate for visual consistency) */}
      <Link href="/dashboard" className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
          <span className="text-lg font-bold text-gold-foreground">PS</span>
        </div>
        <div>
          <h1 className="text-white font-bold">Prime Swing Fits</h1>
        </div>
      </Link>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-white hover:bg-white/10"
        >
          <Bell className="h-5 w-5" />
          <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent text-white text-xs">
            3
          </Badge>
        </Button>
      </div>
    </header>
  );
}