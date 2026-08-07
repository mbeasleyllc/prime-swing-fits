import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-primary text-white mt-auto">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity">
              <Image 
                src="/PSF-Logo_HeaderLogo_WHT-3.png?v=1785911682"
                alt="Prime Swing Fits" 
                width={660}
                height={149}
                className="h-24 md:h-[9.3rem] w-auto"
                unoptimized
              />
            </Link>
            <p className="text-sm text-white/70 max-w-xs">
              Professional golf club fitting guidance at your fingertips.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3 md:mb-4 text-base">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/fitting/new" className="text-sm text-white/70 hover:text-accent transition-colors block py-1">
                  Start Fitting
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-white/70 hover:text-accent transition-colors block py-1">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-white/70 hover:text-accent transition-colors block py-1">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3 md:mb-4 text-base">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-white/70 hover:text-accent transition-colors block py-1">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-white/70 hover:text-accent transition-colors block py-1">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-sm text-white/70 hover:text-accent transition-colors block py-1">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3 md:mb-4 text-base">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-white/70 hover:text-accent transition-colors block py-1">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-white/70 hover:text-accent transition-colors block py-1">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-white/20 text-center text-sm text-white/60">
          <span className="text-gold">©</span> {currentYear} Prime Swing Fits. All rights reserved.
        </div>
      </div>
    </footer>
  );
}