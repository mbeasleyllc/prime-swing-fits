import React from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Trophy, FileText, TrendingUp, Zap, Award, Users, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2070&auto=format&fit=crop"
            alt="Luxury golf course"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-accent/90" />
        </div>
        <div className="container relative z-10 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="flex justify-center mb-6">
              <div className="bg-gold/20 p-6 rounded-full backdrop-blur-sm">
                <Trophy className="h-16 w-16 text-gold" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              Perfect Your Game
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
              Professional golf club fitting at your fingertips. Get personalized recommendations in minutes.
            </p>
            <Button size="lg" asChild className="text-lg px-8 py-6 bg-gold text-gold-foreground hover:bg-gold/90 shadow-xl">
              <Link href={user ? "/fitting/new" : "/auth/register"}>
                Start Your Free Fitting
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4">
                <Target className="h-4 w-4" />
                <span className="text-sm font-semibold">Premium Fitting Experience</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                How It Works
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Three simple steps to unlock your perfect golf club setup
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center hover:shadow-2xl transition-all duration-300 border-2 hover:border-accent/50 group">
                <CardContent className="pt-10 pb-8">
                  <div className="bg-gradient-to-br from-accent to-accent/70 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <div className="bg-gold text-gold-foreground w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                    1
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">Answer Questions</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Complete our guided 6-step wizard about your playing profile, swing characteristics, and measurements.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-2xl transition-all duration-300 border-2 hover:border-accent/50 group">
                <CardContent className="pt-10 pb-8">
                  <div className="bg-gradient-to-br from-accent to-accent/70 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-10 w-10 text-white" />
                  </div>
                  <div className="bg-gold text-gold-foreground w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                    2
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">Get Recommendations</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Our expert algorithm analyzes your data and generates personalized club fitting recommendations.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-2xl transition-all duration-300 border-2 hover:border-accent/50 group">
                <CardContent className="pt-10 pb-8">
                  <div className="bg-gradient-to-br from-accent to-accent/70 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
                    <Trophy className="h-10 w-10 text-white" />
                  </div>
                  <div className="bg-gold text-gold-foreground w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                    3
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">Play Better</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Download your detailed fitting report and find the perfect clubs to elevate your game.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=2070&auto=format&fit=crop"
            alt="Golf clubs detail"
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="container relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-2 rounded-full mb-4">
                <Award className="h-4 w-4" />
                <span className="text-sm font-semibold">Premium Benefits</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
                Why Choose Prime Swing Fits?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Experience professional-grade fitting from anywhere
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-accent">
                <CardContent className="pt-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-accent/10 p-4 rounded-xl flex-shrink-0">
                      <Zap className="h-7 w-7 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Guided Wizard</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Step-by-step process with clear instructions and helpful tips at every stage of your fitting journey.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-gold">
                <CardContent className="pt-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-gold/10 p-4 rounded-xl flex-shrink-0">
                      <Target className="h-7 w-7 text-gold" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Personalized Results</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Recommendations tailored to your unique swing characteristics, playing style, and physical attributes.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-accent">
                <CardContent className="pt-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-accent/10 p-4 rounded-xl flex-shrink-0">
                      <FileText className="h-7 w-7 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Downloadable Report</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Get a professional PDF report you can take to any club fitter or pro shop for reference.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-gold">
                <CardContent className="pt-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-gold/10 p-4 rounded-xl flex-shrink-0">
                      <Award className="h-7 w-7 text-gold" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-3">Expert Science</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Based on proven club fitting principles used by professional fitters and tour players worldwide.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary via-primary to-accent text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1592919505780-303950717480?q=80&w=2070&auto=format&fit=crop"
            alt="Golf ball on tee"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-gold/20 p-4 rounded-full backdrop-blur-sm">
                <Clock className="h-12 w-12 text-gold" />
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Perfect Your Setup?
            </h2>
            <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
              Join thousands of golfers who have optimized their game with Prime Swing Fits. Start your personalized fitting journey today.
            </p>
            <Button size="lg" asChild className="text-lg px-10 py-7 bg-gold text-gold-foreground hover:bg-gold/90 shadow-2xl hover:shadow-gold/20 transition-all">
              <Link href={user ? "/fitting/new" : "/auth/register"}>
                Get Started Now — It's Free
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}