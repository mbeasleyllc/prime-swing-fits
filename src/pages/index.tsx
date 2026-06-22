import React from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, CheckCircle, FileText, TrendingUp, Zap } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative bg-gradient-to-br from-primary via-primary to-accent py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="flex justify-center mb-6">
              <Target className="h-20 w-20" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Get Fitted. Play Better.
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Prime Swing Fits gives you a professional static golf club fitting in minutes — no pro shop required.
            </p>
            <Button size="lg" asChild className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90">
              <Link href={user ? "/fitting/new" : "/auth/register"}>
                Start My Free Fitting
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 pb-6">
                  <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">1. Answer Questions</h3>
                  <p className="text-muted-foreground">
                    Complete our 6-step guided wizard about your playing profile, swing, and physical measurements.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 pb-6">
                  <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">2. Get Recommendations</h3>
                  <p className="text-muted-foreground">
                    Our expert algorithm analyzes your data and generates personalized club fitting recommendations.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 pb-6">
                  <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">3. Play Better</h3>
                  <p className="text-muted-foreground">
                    Download your detailed fitting report and find the perfect clubs for your game.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
              Why Choose Prime Swing Fits?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-accent/10 p-3 rounded-lg flex-shrink-0">
                      <Zap className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Guided Wizard</h3>
                      <p className="text-muted-foreground">
                        Step-by-step process with clear instructions and helpful tips at every stage.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-accent/10 p-3 rounded-lg flex-shrink-0">
                      <Target className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Personalized Results</h3>
                      <p className="text-muted-foreground">
                        Recommendations tailored to your unique swing characteristics and playing style.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-accent/10 p-3 rounded-lg flex-shrink-0">
                      <FileText className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Downloadable Report</h3>
                      <p className="text-muted-foreground">
                        Get a professional PDF report you can take to any club fitter or pro shop.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="bg-accent/10 p-3 rounded-lg flex-shrink-0">
                      <CheckCircle className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Built on Fitting Science</h3>
                      <p className="text-muted-foreground">
                        Based on proven club fitting principles used by professional fitters worldwide.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-accent to-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to find your perfect clubs?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Start your personalized fitting journey today — completely free.
            </p>
            <Button size="lg" asChild className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90">
              <Link href={user ? "/fitting/new" : "/auth/register"}>
                Get Started Now
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}