import React from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { ClipboardCheck, Target, FileText, TrendingUp, ArrowRight } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground tracking-tight">
            Get Fitted. Play Better.
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
            ProSwing gives you a professional static golf club fitting in minutes — no pro shop required.
          </p>
          <div className="pt-4">
            <Button size="lg" asChild className="text-lg px-8 py-6">
              <Link href={user ? "/fitting/new" : "/auth/register"}>
                Start My Free Fitting
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
                <ClipboardCheck className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Answer Questions</h3>
              <p className="text-muted-foreground">
                Complete our guided 6-step wizard covering your physical measurements, swing profile, and equipment preferences.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Get Recommendations</h3>
              <p className="text-muted-foreground">
                Receive personalized club fitting recommendations based on proven fitting science and algorithms.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">Play Better</h3>
              <p className="text-muted-foreground">
                Download your detailed report and take it to your preferred club fitter or pro shop to order your perfect clubs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Why ProSwing?
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-accent" />
                  Guided Wizard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Step-by-step questionnaire with clear instructions and helpful measurement guides to ensure accurate inputs.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" />
                  Personalized Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get specific recommendations for club length, lie angle, grip size, shaft flex, and club type tailored to your profile.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent" />
                  Downloadable Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Export your fitting report as a PDF to share with club fitters, coaches, or keep for your records.
                </CardDescription>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  Built on Fitting Science
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Our recommendations are based on established club fitting principles used by professional fitters worldwide.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl font-bold">Ready to find your perfect clubs?</h2>
          <p className="text-xl opacity-90">
            Join thousands of golfers who have improved their game with ProSwing fitting recommendations.
          </p>
          <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
            <Link href={user ? "/fitting/new" : "/auth/register"}>
              Start Free Fitting Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}