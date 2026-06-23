import React from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { 
  User, Activity, Ruler, Target, Wind, CheckCircle2,
  ArrowRight, FileText, Trophy, Clock
} from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: <User className="h-10 w-10 text-white" />,
      title: "Player Profile",
      description: "Tell us about your golf experience, skill level, and playing frequency. This helps us understand your baseline.",
      details: [
        "Handicap or average score",
        "Years playing golf",
        "Rounds played per year",
        "Primary goals (distance, accuracy, consistency)"
      ]
    },
    {
      number: 2,
      icon: <Activity className="h-10 w-10 text-white" />,
      title: "Swing Characteristics",
      description: "Describe your swing speed, ball flight patterns, and shot shape preferences.",
      details: [
        "Driver swing speed estimate",
        "Typical ball flight (high, mid, low)",
        "Shot shape tendency (draw, fade, straight)",
        "Tempo and rhythm assessment"
      ]
    },
    {
      number: 3,
      icon: <Ruler className="h-10 w-10 text-white" />,
      title: "Physical Measurements",
      description: "Provide key body measurements that affect your club specifications.",
      details: [
        "Height and wrist-to-floor measurement",
        "Hand size for grip recommendations",
        "Arm length and posture assessment",
        "Flexibility and mobility considerations"
      ]
    },
    {
      number: 4,
      icon: <Target className="h-10 w-10 text-white" />,
      title: "Current Equipment",
      description: "Share details about your current clubs and what works or doesn't work for you.",
      details: [
        "Current club brands and models",
        "Shaft flex and weight preferences",
        "What you like about current setup",
        "Areas for improvement identified"
      ]
    },
    {
      number: 5,
      icon: <Wind className="h-10 w-10 text-white" />,
      title: "Preferences & Goals",
      description: "Define your priorities and what you want to achieve with new equipment.",
      details: [
        "Feel preferences (soft, firm, responsive)",
        "Workability vs. forgiveness priority",
        "Budget considerations",
        "Specific performance goals"
      ]
    },
    {
      number: 6,
      icon: <CheckCircle2 className="h-10 w-10 text-white" />,
      title: "Review & Submit",
      description: "Verify all information and submit for personalized recommendations.",
      details: [
        "Review all answers for accuracy",
        "Make any final adjustments",
        "Confirm measurements",
        "Generate recommendations"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative overflow-hidden py-20 bg-gradient-to-br from-primary via-primary to-accent">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=2070&auto=format&fit=crop"
            alt="Golf clubs"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="flex justify-center mb-6">
              <div className="bg-gold/20 p-6 rounded-full backdrop-blur-sm">
                <Target className="h-16 w-16 text-gold" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">How It Works</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Our comprehensive 6-step fitting process guides you through the same assessments a professional club fitter would perform. Complete in just 5-10 minutes.
            </p>
            <Button size="lg" asChild className="bg-gold text-gold-foreground hover:bg-gold/90 shadow-xl">
              <Link href="/fitting/new" className="flex items-center gap-2">
                Start Your Fitting
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-2 rounded-full mb-4">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-semibold">Step-by-Step Process</span>
              </div>
              <h2 className="text-4xl font-bold mb-4 text-foreground">The Fitting Journey</h2>
              <p className="text-xl text-muted-foreground">
                Six comprehensive steps designed to capture your complete golf profile
              </p>
            </div>

            <div className="space-y-12">
              {steps.map((step, index) => (
                <Card key={step.number} className="overflow-hidden hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-12">
                      <div className="lg:col-span-4 bg-gradient-to-br from-accent to-accent/70 p-8 text-white flex flex-col justify-center">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="bg-gold text-gold-foreground w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl">
                            {step.number}
                          </div>
                          <div className="bg-white/10 p-4 rounded-xl">
                            {step.icon}
                          </div>
                        </div>
                        <h3 className="text-3xl font-bold mb-2">{step.title}</h3>
                        <p className="text-white/90 leading-relaxed">{step.description}</p>
                      </div>
                      <div className="lg:col-span-8 p-8">
                        <h4 className="font-semibold text-lg mb-4 text-foreground">What We'll Ask:</h4>
                        <ul className="space-y-3">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-start gap-3">
                              <CheckCircle2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                              <span className="text-muted-foreground">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-2 rounded-full mb-4">
                <FileText className="h-4 w-4" />
                <span className="text-sm font-semibold">After Completion</span>
              </div>
              <h2 className="text-4xl font-bold mb-4 text-foreground">Your Personalized Results</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-l-4 border-l-accent">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-accent" />
                    Club Recommendations
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Specific club types, shaft flexes, lie angles, and grip sizes tailored to your measurements and swing characteristics.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-gold">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-gold" />
                    Detailed Report
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Download a professional PDF report with all recommendations, explanations, and specifications you can take anywhere.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-accent">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <Target className="h-5 w-5 text-accent" />
                    Justifications
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Understand why each recommendation was made based on your specific profile and measurements.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-gold">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-gold" />
                    Next Steps
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Clear guidance on how to use your fitting results when shopping for clubs or visiting a pro shop.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary via-primary to-accent text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2070&auto=format&fit=crop"
            alt="Golf course"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
              Complete your fitting in just 5-10 minutes and receive professional recommendations instantly.
            </p>
            <Button size="lg" asChild className="bg-gold text-gold-foreground hover:bg-gold/90 shadow-2xl text-lg px-10 py-7">
              <Link href="/fitting/new" className="flex items-center gap-2">
                Begin Your Fitting Journey
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}