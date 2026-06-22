import React from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Star, Crown } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Entry",
      price: "$20",
      description: "Single Club",
      icon: Zap,
      features: [
        "Club Length / Grip Size (Static Specifications)",
        "Lie Angle",
        "Shaft Flex Baseline",
        "Set Composition & Gapping",
        "Recommendations on clubs and accessories to buy (budget-based)",
      ],
      cta: "Get Started",
      popular: false,
      color: "text-primary",
      bgColor: "bg-primary/5",
      borderColor: "border-primary/20",
    },
    {
      name: "Core",
      price: "$59",
      description: "Full Bag",
      icon: Check,
      features: [
        "Club Length / Grip Size (Static Specifications)",
        "Lie Angle",
        "Shaft Flex Baseline",
        "Set Composition & Gapping",
        "Recommendations on clubs and accessories to buy (budget-based)",
        "Complete bag analysis",
      ],
      cta: "Start Fitting",
      popular: true,
      color: "text-accent",
      bgColor: "bg-accent/5",
      borderColor: "border-accent",
    },
    {
      name: "Premium",
      price: "$99",
      description: "Full Bag Fitting",
      icon: Star,
      features: [
        "Everything in Core, plus:",
        "Swing data required",
        "Advanced shaft optimization",
        "Launch/spin/flight modeling",
        "Face angle analysis",
        "Detailed performance predictions",
      ],
      cta: "Go Premium",
      popular: false,
      color: "text-primary",
      bgColor: "bg-primary/5",
      borderColor: "border-primary/20",
    },
    {
      name: "Premium Plus",
      price: "$220",
      description: "Complete Pro Setup",
      icon: Crown,
      features: [
        "Everything in Premium, plus:",
        "Golf Daddy launch monitor included",
        "Professional-grade swing analytics",
        "Real-time ball flight data",
        "Detailed performance reports",
        "Priority support",
      ],
      cta: "Get Pro Setup",
      popular: false,
      color: "text-primary",
      bgColor: "bg-primary/5",
      borderColor: "border-primary/20",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <div className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Choose Your Perfect Plan
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground">
                From single club recommendations to complete bag analysis with professional equipment. Get the fitting level that matches your goals.
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {plans.map((plan, index) => {
                const IconComponent = plan.icon;
                return (
                  <Card
                    key={index}
                    className={`relative flex flex-col ${
                      plan.popular
                        ? "border-2 border-accent shadow-lg scale-105"
                        : `border ${plan.borderColor}`
                    } ${plan.bgColor} hover:shadow-xl transition-all duration-300`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-accent text-accent-foreground px-4 py-1 text-sm font-semibold">
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-4">
                      <div className={`w-12 h-12 mx-auto mb-4 rounded-full ${plan.bgColor} flex items-center justify-center`}>
                        <IconComponent className={`h-6 w-6 ${plan.color}`} />
                      </div>
                      <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                      <CardDescription className="text-sm">{plan.description}</CardDescription>
                      <div className="mt-4">
                        <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col">
                      <ul className="space-y-3 mb-8 flex-1">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-2">
                            <Check className={`h-5 w-5 mt-0.5 flex-shrink-0 ${plan.popular ? "text-accent" : "text-primary"}`} />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={`w-full ${plan.popular ? "bg-accent hover:bg-accent/90" : ""}`}
                        size="lg"
                        asChild
                      >
                        <Link href="/auth/register">
                          {plan.cta}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Additional Info */}
            <div className="mt-16 text-center">
              <p className="text-muted-foreground mb-4">
                All plans include access to our guided fitting wizard and personalized recommendations
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" size="lg" asChild>
                  <Link href="/auth/login">
                    Already have an account? Sign in
                  </Link>
                </Button>
                <Button variant="ghost" size="lg" asChild>
                  <Link href="/">
                    Learn more about our process
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What's included in the fitting process?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    All plans include our comprehensive 6-step guided wizard that collects your physical measurements, 
                    swing profile, playing conditions, and equipment preferences to generate personalized recommendations.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Do I need swing data for Premium plans?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Premium and Premium Plus tiers require swing data inputs for advanced modeling. Premium Plus includes 
                    the Golf Daddy launch monitor to capture this data professionally.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I upgrade my plan later?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yes! You can upgrade to a higher tier at any time. Your existing fitting data will be enhanced 
                    with the additional analysis features of your new plan.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What's the Golf Daddy launch monitor?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    The Golf Daddy is a portable launch monitor that measures ball speed, launch angle, spin rate, 
                    and flight path. It's included with Premium Plus and ships directly to you for use during your fitting.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Find Your Perfect Fit?
            </h2>
            <p className="text-lg mb-8 text-primary-foreground/90">
              Join thousands of golfers who have improved their game with Prime Swing Fits
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/register">
                Start Your Fitting Today
              </Link>
            </Button>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}