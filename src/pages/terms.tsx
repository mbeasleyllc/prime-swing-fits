import React from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Mail } from "lucide-react";

export default function Terms() {
  const sections = [
    { id: "acceptance", title: "1. Acceptance" },
    { id: "services", title: "2. Services Description" },
    { id: "ai-disclaimer", title: "3. AI Disclaimer" },
    { id: "affiliate", title: "4. Affiliate Disclosure" },
    { id: "payment", title: "5. Payment & Refunds" },
    { id: "intellectual-property", title: "6. Intellectual Property" },
    { id: "user-data", title: "7. User Data License" },
    { id: "prohibited", title: "8. Prohibited Conduct" },
    { id: "warranties", title: "9. Disclaimer of Warranties" },
    { id: "liability", title: "10. Limitation of Liability" },
    { id: "indemnification", title: "11. Indemnification" },
    { id: "governing-law", title: "12. Governing Law & Disputes" },
    { id: "modifications", title: "13. Modifications & Termination" },
    { id: "severability", title: "14. Severability & Entire Agreement" },
    { id: "contact", title: "15. Contact" },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="py-20 bg-gradient-to-br from-primary via-primary to-accent">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center text-white">
            <Badge className="bg-gold text-gold-foreground mb-6 text-sm px-4 py-2">
              Last Updated: June 2025
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-white/90">
              Please read these terms carefully before using our services
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="max-w-7xl mx-auto flex gap-8">
            {/* Sticky Sidebar Navigation - Desktop Only */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24">
                <Card className="border-l-4 border-l-accent">
                  <CardContent className="p-6">
                    <h3 className="font-bold mb-4 text-foreground">Quick Navigation</h3>
                    <ScrollArea className="h-[600px]">
                      <nav className="space-y-2">
                        {sections.map((section) => (
                          <button
                            key={section.id}
                            onClick={() => scrollToSection(section.id)}
                            className="block w-full text-left text-sm py-2 px-3 rounded hover:bg-accent/10 hover:text-accent transition-colors text-muted-foreground"
                          >
                            {section.title}
                          </button>
                        ))}
                      </nav>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 max-w-4xl">
              {/* Red Alert Box */}
              <div className="mb-8 bg-red-50 border-4 border-red-500 p-6 rounded-lg">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-8 w-8 text-red-500 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-red-900 font-bold text-lg">
                      PLEASE READ CAREFULLY. BY USING PRIME SWING FITS YOU AGREE TO BE LEGALLY BOUND BY THESE TERMS.
                    </p>
                  </div>
                </div>
              </div>

              <Card>
                <CardContent className="p-8 md:p-12">
                  <div className="prose prose-lg max-w-none">
                    {/* Header */}
                    <div className="mb-12 pb-8 border-b-2 border-accent/20">
                      <h1 className="text-3xl font-bold mb-2 text-foreground">PRIME SWING FITS — TERMS OF SERVICE</h1>
                      <p className="text-muted-foreground">
                        Northern Virginia, USA | Effective: June 2025
                      </p>
                    </div>

                    {/* Section 1 */}
                    <section id="acceptance" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        1. Acceptance
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        These Terms are a legally binding agreement between you and Prime Swing Fits, a business operating in Northern Virginia, VA, USA. Accessing primeswingfits.com or purchasing any Service constitutes full acceptance of these Terms. If you do not agree, do not use this Site.
                      </p>
                    </section>

                    {/* Section 2 */}
                    <section id="services" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        2. Services Description
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        We provide AI-generated golf club fitting Reports delivered digitally. Four tiers: Single Club ($20), Full Bag ($59), Premium ($99), Premium Plus ($220). Reports are informational digital products, not professional fitting services.
                      </p>
                    </section>

                    {/* Section 3 */}
                    <section id="ai-disclaimer" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        3. AI Disclaimer — Read Carefully
                      </h2>
                      <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
                        <p className="text-foreground font-bold leading-relaxed uppercase">
                          REPORTS ARE GENERATED BY AN ARTIFICIAL INTELLIGENCE SYSTEM AND ARE PROVIDED FOR INFORMATIONAL PURPOSES ONLY. THEY ARE NOT A SUBSTITUTE FOR IN-PERSON PROFESSIONAL CLUB FITTING BY A PGA-CERTIFIED FITTER. WE MAKE NO GUARANTEE THAT RECOMMENDATIONS WILL IMPROVE YOUR GAME, REDUCE YOUR HANDICAP, OR BE SUITABLE FOR YOUR PHYSICAL CONDITION. YOU ASSUME FULL RESPONSIBILITY FOR ALL EQUIPMENT PURCHASING DECISIONS MADE BASED ON OUR REPORTS.
                        </p>
                      </div>
                    </section>

                    {/* Section 4 */}
                    <section id="affiliate" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        4. Affiliate Disclosure
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        We earn affiliate commissions from Amazon, Golf Galaxy, PGA Tour Superstore, and 2nd Swing Golf. Commissions do not affect our recommendations. Disclosure per FTC 16 C.F.R. Part 255.
                      </p>
                    </section>

                    {/* Section 5 */}
                    <section id="payment" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        5. Payment & Refunds
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        Payments processed by Stripe in USD. All sales are final — Reports are non-refundable after digital delivery. Exception: technical failure preventing report delivery within 24 hours of purchase entitles you to a full refund. Submit requests to support@primeswingfits.com within 72 hours with your order number.
                      </p>
                    </section>

                    {/* Section 6 */}
                    <section id="intellectual-property" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        6. Intellectual Property
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        All Site content, AI algorithms, report templates, club database, and software are owned by Prime Swing Fits and protected under U.S. copyright law (17 U.S.C. § 101 et seq.) and Virginia Code § 59.1-207.1. No copying, reproducing, distributing, or reverse-engineering without written permission.
                      </p>
                    </section>

                    {/* Section 7 */}
                    <section id="user-data" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        7. User Data License
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        By submitting fitting data you grant Prime Swing Fits a non-exclusive, royalty-free license to use aggregated and anonymized data to improve AI models. You will never be personally identified in any such use.
                      </p>
                    </section>

                    {/* Section 8 */}
                    <section id="prohibited" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        8. Prohibited Conduct
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        You may not: (a) use the Site for any unlawful purpose; (b) reverse-engineer our AI algorithms; (c) scrape club database data; (d) submit false assessment information; (e) resell or redistribute Reports; (f) introduce malware or disrupt Site function; (g) impersonate any person or entity.
                      </p>
                    </section>

                    {/* Section 9 */}
                    <section id="warranties" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        9. Disclaimer of Warranties
                      </h2>
                      <p className="text-muted-foreground leading-relaxed uppercase font-semibold">
                        THE SITE AND ALL SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, OR NON-INFRINGEMENT. WE DO NOT WARRANT THE SITE WILL BE UNINTERRUPTED OR ERROR-FREE.
                      </p>
                    </section>

                    {/* Section 10 */}
                    <section id="liability" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        10. Limitation of Liability
                      </h2>
                      <p className="text-muted-foreground leading-relaxed uppercase font-semibold">
                        WE ARE NOT LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES. OUR TOTAL LIABILITY FOR ANY CLAIM SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SPECIFIC REPORT GIVING RISE TO THAT CLAIM.
                      </p>
                    </section>

                    {/* Section 11 */}
                    <section id="indemnification" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        11. Indemnification
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        You agree to defend, indemnify, and hold harmless Prime Swing Fits, its owners, employees, and agents from claims, damages, losses, and expenses (including attorney fees) arising from your use of the Site or violation of these Terms.
                      </p>
                    </section>

                    {/* Section 12 */}
                    <section id="governing-law" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        12. Governing Law & Disputes
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        Governed exclusively by the laws of the Commonwealth of Virginia without regard to conflict-of-law principles. Disputes resolved in state or federal courts in Fairfax County, Virginia. You waive objection to personal jurisdiction there. Disputes under $5,000 must first attempt binding arbitration under AAA Consumer Arbitration Rules before any litigation.
                      </p>
                    </section>

                    {/* Section 13 */}
                    <section id="modifications" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        13. Modifications & Termination
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        We may update these Terms at any time with a new effective date. Continued use = acceptance. Material changes communicated by email to registered users. We may suspend or terminate access for violations at our sole discretion without liability.
                      </p>
                    </section>

                    {/* Section 14 */}
                    <section id="severability" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        14. Severability & Entire Agreement
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        If any provision is unenforceable, remaining provisions stay in full force. These Terms plus our Privacy Policy constitute the entire agreement between you and Prime Swing Fits.
                      </p>
                    </section>

                    {/* Section 15 */}
                    <section id="contact" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        15. Contact
                      </h2>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Mail className="h-5 w-5 text-accent" />
                        <div>
                          <a href="mailto:support@primeswingfits.com" className="text-accent hover:underline font-medium text-lg">
                            support@primeswingfits.com
                          </a>
                          <p className="text-sm">Prime Swing Fits, Northern Virginia, VA, USA</p>
                        </div>
                      </div>
                    </section>

                    {/* Gold Callout Box */}
                    <div className="mt-12 bg-gold/10 border-l-4 border-gold p-6 rounded-r-lg">
                      <p className="text-foreground leading-relaxed">
                        These Terms were last reviewed by legal counsel June 2025. We recommend consulting a licensed Virginia attorney for any legal concerns.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}