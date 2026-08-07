import React from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Star, Crown, TrendingUp, Trophy, Target, Database } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Entry",
      price: "$20",
      period: "one-time",
      description: "Single Club Fitting",
      icon: Zap,
      features: [
        "Single club recommendation",
        "Club length & grip size",
        "Lie angle analysis",
        "Shaft flex baseline",
        "Basic equipment comparison",
        "Golf ball recommendation",
        "Downloadable PDF report",
        "Profile management",
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
      period: "one-time",
      description: "Full Bag Fitting",
      icon: Check,
      features: [
        "Everything in Entry, plus:",
        "Complete 14-club bag analysis",
        "Set composition & gapping",
        "Club-to-club optimization",
        "Budget-based recommendations",
        "Advanced equipment comparison",
        "Golf ball matching",
        "Fitting history tracking",
        "Personalized dashboard",
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
      period: "one-time",
      description: "Advanced Full Bag",
      icon: Star,
      features: [
        "Everything in Core, plus:",
        "Swing data integration required",
        "Advanced shaft optimization",
        "Launch/spin/flight modeling",
        "Face angle analysis",
        "Performance predictions",
        "750+ club database access",
        "650+ ball database access",
        "Priority support",
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
      period: "one-time",
      description: "Complete Pro Setup",
      icon: Crown,
      features: [
        "Everything in Premium, plus:",
        "Golf Daddy launch monitor included",
        "Professional-grade analytics",
        "Real-time ball flight data",
        "Detailed performance reports",
        "Tour-level ball optimization",
        "6 months Swing Analytics FREE",
        "VIP priority support",
      ],
      cta: "Get Pro Setup",
      popular: false,
      color: "text-gold",
      bgColor: "bg-gold/5",
      borderColor: "border-gold/20",
    },
  ];

  const addOns = [
    {
      name: "Swing Analytics",
      price: "$9.99",
      period: "per month",
      description: "Track & Improve Your Game",
      icon: TrendingUp,
      features: [
        "Swing DNA radar visualization",
        "Progress charts & KPI tracking",
        "Session history management",
        "CSV import from launch monitors",
        "Manual shot entry",
        "30-day trend analysis",
        "Consistency score metrics",
        "Device integrations (TrackMan, FlightScope, Garmin)",
      ],
      color: "text-accent",
      borderColor: "border-accent",
    },
    {
      name: "Gamification",
      price: "FREE",
      period: "all tiers",
      description: "Stay Motivated & Engaged",
      icon: Trophy,
      features: [
        "Achievement badge system",
        "Goal setting & tracking",
        "Weekly performance summaries",
        "Milestone celebrations",
        "Progress streaks",
        "Personal records tracking",
        "Motivational insights",
        "Community leaderboards (coming soon)",
      ],
      color: "text-success",
      borderColor: "border-success",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <div className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-16 lg:py-24 bg-gradient-to-b from-primary/5 to-background">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="text-center max-w-3xl mx-auto mb-10 md:mb-16">
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 md:px-4 py-2 rounded-full mb-3 md:mb-4">
                <Target className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-xs md:text-sm font-semibold">Professional Club Fitting Technology</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 md:mb-6">
                Choose Your Perfect Plan
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-muted-foreground">
                From single club recommendations to complete bag analysis with professional equipment. Get the fitting level that matches your goals.
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mb-12 md:mb-16">
              {plans.map((plan, index) => {
                const IconComponent = plan.icon;
                return (
                  <Card
                    key={index}
                    className={`relative flex flex-col ${
                      plan.popular
                        ? "border-2 border-accent shadow-lg sm:scale-105"
                        : `border ${plan.borderColor}`
                    } ${plan.bgColor} hover:shadow-xl transition-all duration-300`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 md:-top-4 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-accent text-accent-foreground px-3 md:px-4 py-1 text-xs md:text-sm font-semibold">
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    <CardHeader className="text-center pb-3 md:pb-4 px-4">
                      <div className={`w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 rounded-full ${plan.bgColor} flex items-center justify-center`}>
                        <IconComponent className={`h-5 w-5 md:h-6 md:w-6 ${plan.color}`} />
                      </div>
                      <CardTitle className="text-xl md:text-2xl font-bold">{plan.name}</CardTitle>
                      <CardDescription className="text-xs md:text-sm">{plan.description}</CardDescription>
                      <div className="mt-3 md:mt-4">
                        <span className="text-3xl md:text-4xl font-bold text-foreground">{plan.price}</span>
                        <span className="text-xs md:text-sm text-muted-foreground ml-2">{plan.period}</span>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-1 flex flex-col px-4">
                      <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8 flex-1">
                        {plan.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-start gap-2">
                            <Check className={`h-4 w-4 md:h-5 md:w-5 mt-0.5 flex-shrink-0 ${plan.popular ? "text-accent" : "text-primary"}`} />
                            <span className="text-xs md:text-sm text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        className={`w-full ${plan.popular ? "bg-accent hover:bg-accent/90" : ""} h-10 md:h-11 text-sm md:text-base`}
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

            {/* Add-Ons Section */}
            <div className="mt-12 md:mt-16">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
                  Premium Add-Ons & Features
                </h2>
                <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                  Enhance your experience with advanced analytics and gamification
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 max-w-5xl mx-auto">
                {addOns.map((addon, index) => {
                  const IconComponent = addon.icon;
                  return (
                    <Card
                      key={index}
                      className={`border-2 ${addon.borderColor} hover:shadow-xl transition-all duration-300`}
                    >
                      <CardHeader className="text-center pb-3 md:pb-4 px-4">
                        <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-full bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center">
                          <IconComponent className={`h-6 w-6 md:h-8 md:w-8 ${addon.color}`} />
                        </div>
                        <CardTitle className="text-xl md:text-2xl font-bold">{addon.name}</CardTitle>
                        <CardDescription className="text-xs md:text-sm">{addon.description}</CardDescription>
                        <div className="mt-3 md:mt-4">
                          <span className="text-3xl md:text-4xl font-bold text-foreground">{addon.price}</span>
                          <span className="text-xs md:text-sm text-muted-foreground ml-2">{addon.period}</span>
                        </div>
                      </CardHeader>

                      <CardContent className="px-4">
                        <ul className="space-y-2 md:space-y-3">
                          {addon.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-start gap-2">
                              <Check className={`h-4 w-4 md:h-5 md:w-5 mt-0.5 flex-shrink-0 ${addon.color}`} />
                              <span className="text-xs md:text-sm text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>

                        {addon.name === "Swing Analytics" && (
                          <Button
                            className="w-full mt-4 md:mt-6 bg-accent hover:bg-accent/90 h-10 md:h-11 text-sm md:text-base"
                            size="lg"
                            asChild
                          >
                            <Link href="/swing-analytics">
                              Learn More
                            </Link>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Feature Comparison Table - Mobile Optimized */}
            <div className="mt-16 md:mt-20">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
                  What's Included
                </h2>
                <p className="text-base md:text-lg text-muted-foreground">
                  Compare features across all plans
                </p>
              </div>

              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left p-3 md:p-4 font-semibold text-sm md:text-base">Feature</th>
                        <th className="text-center p-3 md:p-4 font-semibold text-sm md:text-base">Entry</th>
                        <th className="text-center p-3 md:p-4 font-semibold bg-accent/10 text-sm md:text-base">Core</th>
                        <th className="text-center p-3 md:p-4 font-semibold text-sm md:text-base">Premium</th>
                        <th className="text-center p-3 md:p-4 font-semibold text-sm md:text-base">Premium Plus</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="p-3 md:p-4 font-medium text-sm md:text-base">Club Recommendations</td>
                        <td className="text-center p-3 md:p-4 text-sm md:text-base">1 Club</td>
                        <td className="text-center p-3 md:p-4 bg-accent/5 text-sm md:text-base">Full Bag</td>
                        <td className="text-center p-3 md:p-4 text-sm md:text-base">Full Bag</td>
                        <td className="text-center p-3 md:p-4 text-sm md:text-base">Full Bag</td>
                      </tr>
                      <tr>
                        <td className="p-3 md:p-4 font-medium text-sm md:text-base">Equipment Database Access</td>
                        <td className="text-center p-3 md:p-4"><Check className="h-4 w-4 md:h-5 md:w-5 text-success mx-auto" /></td>
                        <td className="text-center p-3 md:p-4 bg-accent/5"><Check className="h-4 w-4 md:h-5 md:w-5 text-success mx-auto" /></td>
                        <td className="text-center p-3 md:p-4"><Database className="h-4 w-4 md:h-5 md:w-5 text-accent mx-auto" /></td>
                        <td className="text-center p-3 md:p-4"><Database className="h-4 w-4 md:h-5 md:w-5 text-accent mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="p-3 md:p-4 font-medium text-sm md:text-base">Profile Management</td>
                        <td className="text-center p-3 md:p-4"><Check className="h-4 w-4 md:h-5 md:w-5 text-success mx-auto" /></td>
                        <td className="text-center p-3 md:p-4 bg-accent/5"><Check className="h-4 w-4 md:h-5 md:w-5 text-success mx-auto" /></td>
                        <td className="text-center p-3 md:p-4"><Check className="h-4 w-4 md:h-5 md:w-5 text-success mx-auto" /></td>
                        <td className="text-center p-3 md:p-4"><Check className="h-4 w-4 md:h-5 md:w-5 text-success mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="p-3 md:p-4 font-medium text-sm md:text-base">Gamification & Badges</td>
                        <td className="text-center p-3 md:p-4"><Trophy className="h-4 w-4 md:h-5 md:w-5 text-gold mx-auto" /></td>
                        <td className="text-center p-3 md:p-4 bg-accent/5"><Trophy className="h-4 w-4 md:h-5 md:w-5 text-gold mx-auto" /></td>
                        <td className="text-center p-3 md:p-4"><Trophy className="h-4 w-4 md:h-5 md:w-5 text-gold mx-auto" /></td>
                        <td className="text-center p-3 md:p-4"><Trophy className="h-4 w-4 md:h-5 md:w-5 text-gold mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="p-3 md:p-4 font-medium text-sm md:text-base">Advanced Shaft Optimization</td>
                        <td className="text-center p-3 md:p-4 text-muted-foreground text-sm md:text-base">—</td>
                        <td className="text-center p-3 md:p-4 bg-accent/5 text-muted-foreground text-sm md:text-base">—</td>
                        <td className="text-center p-3 md:p-4"><Check className="h-4 w-4 md:h-5 md:w-5 text-success mx-auto" /></td>
                        <td className="text-center p-3 md:p-4"><Check className="h-4 w-4 md:h-5 md:w-5 text-success mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="p-3 md:p-4 font-medium text-sm md:text-base">Launch Monitor Included</td>
                        <td className="text-center p-3 md:p-4 text-muted-foreground text-sm md:text-base">—</td>
                        <td className="text-center p-3 md:p-4 bg-accent/5 text-muted-foreground text-sm md:text-base">—</td>
                        <td className="text-center p-3 md:p-4 text-muted-foreground text-sm md:text-base">—</td>
                        <td className="text-center p-3 md:p-4"><Check className="h-4 w-4 md:h-5 md:w-5 text-success mx-auto" /></td>
                      </tr>
                      <tr>
                        <td className="p-3 md:p-4 font-medium text-sm md:text-base">Swing Analytics (6 months)</td>
                        <td className="text-center p-3 md:p-4 text-muted-foreground text-sm md:text-base">—</td>
                        <td className="text-center p-3 md:p-4 bg-accent/5 text-muted-foreground text-sm md:text-base">—</td>
                        <td className="text-center p-3 md:p-4 text-muted-foreground text-sm md:text-base">—</td>
                        <td className="text-center p-3 md:p-4"><Check className="h-4 w-4 md:h-5 md:w-5 text-success mx-auto" /></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Additional Info */}
            <div className="mt-12 md:mt-16 text-center">
              <p className="text-sm md:text-base text-muted-foreground mb-4">
                All plans include our guided fitting wizard, downloadable PDF reports, and personalized recommendations
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                <Button variant="outline" size="lg" asChild className="h-11 text-base">
                  <Link href="/auth/login">
                    Already have an account? Sign in
                  </Link>
                </Button>
                <Button variant="ghost" size="lg" asChild className="h-11 text-base">
                  <Link href="/how-it-works">
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
                  <CardTitle className="text-lg">What is Swing Analytics?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Swing Analytics is our premium add-on ($9.99/month) that tracks your swing data over time with 
                    professional visualizations, progress charts, and performance insights. Import data from launch monitors 
                    or enter manually. Premium Plus includes 6 months FREE.
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
                    the Golf Daddy launch monitor to capture this data professionally. Without a launch monitor, you can 
                    still get quality recommendations from Entry or Core plans.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What is the Gamification system?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our gamification features (FREE on all plans) help you stay motivated with achievement badges, 
                    goal tracking, weekly summaries, and progress streaks. Celebrate milestones and track personal records 
                    as you improve your game.
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
                    with the additional analysis features of your new plan. Swing Analytics can be added to any plan 
                    as a monthly subscription.
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
                    and flight path. It's included with Premium Plus ($220) and ships directly to you for use during 
                    your fitting and ongoing practice.
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