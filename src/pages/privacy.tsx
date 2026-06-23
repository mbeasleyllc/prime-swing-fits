import React from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle, Mail } from "lucide-react";

export default function Privacy() {
  const sections = [
    { id: "introduction", title: "1. Introduction" },
    { id: "data-collect", title: "2. Data We Collect" },
    { id: "data-use", title: "3. How We Use Your Data" },
    { id: "affiliate", title: "4. Affiliate Disclosure" },
    { id: "ai-disclosure", title: "5. AI Content Disclosure" },
    { id: "data-sharing", title: "6. Data Sharing" },
    { id: "cookies", title: "7. Cookies" },
    { id: "virginia-rights", title: "8. Virginia Resident Rights" },
    { id: "california-rights", title: "9. California Residents" },
    { id: "children", title: "10. Children's Privacy" },
    { id: "security", title: "11. Data Security" },
    { id: "retention", title: "12. Data Retention" },
    { id: "international", title: "13. International Users" },
    { id: "third-party", title: "14. Third-Party Links" },
    { id: "changes", title: "15. Policy Changes" },
    { id: "contact", title: "16. Contact" },
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
            <h1 className="text-5xl md:text-6xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-white/90">
              Your data rights and our commitments
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
              <Card>
                <CardContent className="p-8 md:p-12">
                  <div className="prose prose-lg max-w-none">
                    {/* Header */}
                    <div className="mb-12 pb-8 border-b-2 border-accent/20">
                      <h1 className="text-3xl font-bold mb-2 text-foreground">PRIME SWING FITS — PRIVACY POLICY</h1>
                      <p className="text-muted-foreground">
                        Northern Virginia, USA | Effective: June 2025
                      </p>
                    </div>

                    {/* Section 1: Introduction */}
                    <section id="introduction" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        1. Introduction
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        Prime Swing Fits ("we," "us") operates from Northern Virginia, VA, USA. This Policy governs data collected at primeswingfits.com and all AI fitting services. Using this Site constitutes agreement to this Policy.
                      </p>
                    </section>

                    {/* Section 2: Data We Collect */}
                    <section id="data-collect" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        2. Data We Collect
                      </h2>
                      <div className="space-y-4 text-muted-foreground leading-relaxed">
                        <p>
                          <strong className="text-foreground">You provide:</strong> Name, email, Stripe payment info (we never store card numbers), height, wrist-to-floor, swing speed, ball flight tendencies, skill level, goals, budget, and current equipment.
                        </p>
                        <p>
                          <strong className="text-foreground">Auto-collected:</strong> IP address, browser/device info, pages visited, and session data via cookies.
                        </p>
                        <p>
                          <strong className="text-foreground">Third parties:</strong> Payment status from Stripe; usage data from Google Analytics.
                        </p>
                      </div>
                    </section>

                    {/* Section 3: How We Use Your Data */}
                    <section id="data-use" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        3. How We Use Your Data
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        To generate and deliver your AI fitting report; process payments; send transactional emails; improve AI models using aggregated anonymous data only; detect fraud; comply with applicable law. We do NOT sell your personal data.
                      </p>
                    </section>

                    {/* Section 4: Affiliate Disclosure */}
                    <section id="affiliate" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        4. Affiliate Disclosure — FTC 16 C.F.R. Part 255
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        We earn commissions from links to Amazon, Golf Galaxy, PGA Tour Superstore, and 2nd Swing Golf. Commissions never influence our recommendations. Disclosures appear near all affiliate links throughout the Site.
                      </p>
                    </section>

                    {/* Section 5: AI Content Disclosure */}
                    <section id="ai-disclosure" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        5. AI Content Disclosure — FTC 2026 Guidelines
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        Your fitting report is substantially generated by an AI system. We disclose AI involvement per FTC guidelines. Reports are for informational purposes only and are not a substitute for professional in-person club fitting.
                      </p>
                    </section>

                    {/* Section 6: Data Sharing */}
                    <section id="data-sharing" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        6. Data Sharing
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        We share data only with: Stripe (PCI-DSS Level 1 payment processing); Google Analytics; email delivery providers; law enforcement when legally required. We do not sell, rent, or otherwise share your personal data.
                      </p>
                    </section>

                    {/* Section 7: Cookies */}
                    <section id="cookies" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        7. Cookies
                      </h2>
                      <div className="space-y-4 text-muted-foreground leading-relaxed">
                        <p>
                          <strong className="text-foreground">Essential</strong> (checkout/login — cannot be disabled); <strong className="text-foreground">Analytics</strong> (Google Analytics — opt out: tools.google.com/dlpage/gaoptout); <strong className="text-foreground">Marketing</strong> (Meta Pixel, Google Ads — opt out: optout.aboutads.info). Disable non-essential cookies in your browser settings at any time.
                        </p>
                      </div>
                    </section>

                    {/* Section 8: Virginia Resident Rights */}
                    <section id="virginia-rights" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        8. Virginia Resident Rights — VCDPA
                      </h2>
                      <div className="space-y-4 text-muted-foreground leading-relaxed">
                        <p className="text-sm italic">(Va. Code § 59.1-575 et seq.)</p>
                        <p>
                          Virginia residents may: (a) Access data we hold; (b) Correct inaccuracies; (c) Delete personal data; (d) Receive a portable copy; (e) Opt out of targeted advertising, profiling for significant decisions, and data sales.
                        </p>
                        <p>
                          Submit requests to <a href="mailto:privacy@primeswingfits.com" className="text-accent hover:underline font-medium">privacy@primeswingfits.com</a>. We respond within 45 days, extendable 45 more days with notice. Appeal denials within 60 days. Unresolved appeals may be directed to the Virginia Attorney General at oag.state.va.us. Violations carry penalties up to $7,500 per incident enforced by the AG.
                        </p>
                      </div>
                    </section>

                    {/* Section 9: California Residents */}
                    <section id="california-rights" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        9. California Residents — CCPA/CPRA
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        Right to know, correct, delete, and opt out of sale of personal information. We do not sell data. Submit requests to <a href="mailto:privacy@primeswingfits.com" className="text-accent hover:underline font-medium">privacy@primeswingfits.com</a>.
                      </p>
                    </section>

                    {/* Section 10: Children's Privacy */}
                    <section id="children" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        10. Children's Privacy — COPPA
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        Services are directed to users age 13 and older. We do not knowingly collect data from children under 13. Contact <a href="mailto:privacy@primeswingfits.com" className="text-accent hover:underline font-medium">privacy@primeswingfits.com</a> immediately to request deletion of any such data.
                      </p>
                    </section>

                    {/* Section 11: Data Security */}
                    <section id="security" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        11. Data Security
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        SSL/TLS encryption, restricted access controls, and periodic security reviews are in place. Payments are handled exclusively by Stripe. No internet system is 100% secure; use of the Site is at your own risk.
                      </p>
                    </section>

                    {/* Section 12: Data Retention */}
                    <section id="retention" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        12. Data Retention
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        Fitting report data: 3 years to support re-fitting history. Payment records: 7 years per legal requirement. Earlier deletion available on request (see Section 8).
                      </p>
                    </section>

                    {/* Section 13: International Users */}
                    <section id="international" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        13. International Users
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        Site operated from Virginia, USA. Non-U.S. users consent to data transfer and processing in the United States, which may have different protections than your country.
                      </p>
                    </section>

                    {/* Section 14: Third-Party Links */}
                    <section id="third-party" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        14. Third-Party Links
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        Our reports contain links to third-party retailers. We are not responsible for their privacy practices. Review each retailer's privacy policy before purchasing.
                      </p>
                    </section>

                    {/* Section 15: Policy Changes */}
                    <section id="changes" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        15. Policy Changes
                      </h2>
                      <p className="text-muted-foreground leading-relaxed">
                        We may revise this Policy at any time. Updated version posted with new "Last Updated" date. Continued use after posting constitutes acceptance.
                      </p>
                    </section>

                    {/* Section 16: Contact */}
                    <section id="contact" className="mb-10 scroll-mt-24">
                      <h2 className="text-2xl font-bold mb-4 text-foreground flex items-center gap-2">
                        <span className="w-2 h-8 bg-accent rounded"></span>
                        16. Contact
                      </h2>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Mail className="h-5 w-5 text-accent" />
                        <div>
                          <a href="mailto:privacy@primeswingfits.com" className="text-accent hover:underline font-medium text-lg">
                            privacy@primeswingfits.com
                          </a>
                          <p className="text-sm">Prime Swing Fits, Northern Virginia, VA, USA</p>
                        </div>
                      </div>
                    </section>

                    {/* Green Callout Box */}
                    <div className="mt-12 bg-accent/10 border-l-4 border-accent p-6 rounded-r-lg">
                      <div className="flex items-start gap-4">
                        <AlertCircle className="h-6 w-6 text-accent flex-shrink-0 mt-1" />
                        <div>
                          <p className="text-foreground font-medium mb-2">
                            This policy was last reviewed June 2025.
                          </p>
                          <p className="text-muted-foreground">
                            For all data rights requests email{" "}
                            <a href="mailto:privacy@primeswingfits.com" className="text-accent hover:underline font-medium">
                              privacy@primeswingfits.com
                            </a>
                            {" "}— we respond within 45 days.
                          </p>
                        </div>
                      </div>
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