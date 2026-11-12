import React, { useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, TrendingUp, Crown, Target, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const PRICING_TIERS = [
  {
    name: "Free Trial",
    slug: "free_trial",
    price: 0,
    period: "one-time",
    description: "Try our club fitting with one category",
    icon: Target,
    badge: null,
    categories: 1,
    categoryLabel: "1 Club Category",
    categoryDetail: "Driver only",
    features: [
      "1 club category fitting (Driver)",
      "Basic swing profile analysis",
      "Equipment recommendations",
      "PDF report generation",
      "Email support",
    ],
    limitations: [
      "Limited to driver only",
      "No additional categories",
      "Basic recommendations"
    ],
    cta: "Start Free Trial",
    ctaLink: "/auth/register",
    popular: false,
    color: "muted"
  },
  {
    name: "Single Club",
    slug: "single_club",
    price: 29,
    period: "one-time",
    description: "Perfect for fitting one specific club",
    icon: Zap,
    badge: "Best Value",
    categories: 1,
    categoryLabel: "1 Club Category",
    categoryDetail: "Your choice: Driver, Irons, Putter, or any category",
    features: [
      "Choose 1 club category",
      "Complete fitting questionnaire",
      "Advanced swing analysis",
      "Multiple equipment recommendations",
      "Detailed PDF report",
      "Product matching & comparison",
      "Email support",
      "Lifetime access to results"
    ],
    limitations: [],
    cta: "Get Single Club",
    ctaLink: "/auth/register",
    popular: true,
    color: "accent"
  },
  {
    name: "Premium",
    slug: "premium",
    price: 79,
    period: "one-time",
    description: "Comprehensive fitting for most of your bag",
    icon: TrendingUp,
    badge: null,
    categories: 5,
    categoryLabel: "5 Club Categories",
    categoryDetail: "Example: Driver + Fairway Woods + Hybrids + Irons + Putter",
    features: [
      "Choose up to 5 categories",
      "Complete bag strategy",
      "Advanced swing DNA analysis",
      "Category-specific recommendations",
      "Comprehensive PDF report",
      "Product matching across all categories",
      "Loft gap analysis",
      "Priority email support",
      "Lifetime access to results"
    ],
    limitations: [],
    cta: "Get Premium",
    ctaLink: "/auth/register",
    popular: false,
    color: "primary"
  },
  {
    name: "Executive",
    slug: "executive",
    price: 149,
    period: "one-time",
    description: "Complete full bag fitting with all categories",
    icon: Crown,
    badge: "Full Bag",
    categories: 7,
    categoryLabel: "All 7 Categories",
    categoryDetail: "Driver • Fairway Woods • Hybrids • Irons • Wedges • Putter • Golf Balls",
    features: [
      "Complete full bag fitting",
      "All 7 club categories",
      "Advanced swing DNA profiling",
      "Comprehensive loft gap analysis",
      "Ball flight optimization",
      "Golf ball matching",
      "Detailed specifications for every club",
      "Premium PDF report",
      "Product recommendations across all categories",
      "Priority support",
      "Lifetime access to results",
      "Future updates included"
    ],
    limitations: [],
    cta: "Get Executive",
    ctaLink: "/auth/register",
    popular: false,
    color: "gold"
  }
];

const CATEGORY_BREAKDOWN = [
  { name: "Driver", description: "Optimize distance and accuracy off the tee" },
  { name: "Fairway Woods", description: "3W, 5W, 7W specifications for versatility" },
  { name: "Hybrids", description: "Long iron replacements for easier launches" },
  { name: "Irons", description: "Complete iron set fitting (4-PW or 5-PW)" },
  { name: "Wedges", description: "Gap, sand, and lob wedge optimization" },
  { name: "Putter", description: "Stroke-matched putter specifications" },
  { name: "Golf Balls", description: "Ball selection matched to your swing" }
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"one-time">("one-time");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-accent/10 text-accent hover:bg-accent/20">
            Category-Based Fitting
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
            Choose Your Fitting Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            Select the categories you want to fit. Pay once, access forever.
          </p>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From a single club to your complete bag — fit exactly what you need
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {PRICING_TIERS.map((tier) => {
            const Icon = tier.icon;
            const isPopular = tier.popular;
            
            return (
              <Card 
                key={tier.slug}
                className={cn(
                  "relative flex flex-col transition-all duration-300 hover:shadow-xl",
                  isPopular && "border-accent shadow-lg scale-105 md:scale-110 z-10",
                  !isPopular && "hover:border-accent/50"
                )}
              >
                {tier.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-accent text-accent-foreground px-4 py-1 text-sm font-semibold whitespace-nowrap">
                      {tier.badge}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      tier.color === "accent" && "bg-accent/10 text-accent",
                      tier.color === "primary" && "bg-primary/10 text-primary",
                      tier.color === "gold" && "bg-gold/10 text-gold",
                      tier.color === "muted" && "bg-muted text-muted-foreground"
                    )}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  </div>
                  <CardDescription className="text-base">
                    {tier.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex-1 pb-4">
                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-4xl font-bold">
                        ${tier.price}
                      </span>
                      {tier.price > 0 && (
                        <span className="text-muted-foreground">
                          {tier.period}
                        </span>
                      )}
                    </div>
                    
                    {/* Categories Badge */}
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold mb-2",
                      tier.color === "accent" && "bg-accent/10 text-accent",
                      tier.color === "primary" && "bg-primary/10 text-primary",
                      tier.color === "gold" && "bg-gold/10 text-gold",
                      tier.color === "muted" && "bg-muted text-muted-foreground"
                    )}>
                      <Sparkles className="w-4 h-4" />
                      {tier.categoryLabel}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-1">
                      {tier.categoryDetail}
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-4">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <Check className={cn(
                          "w-5 h-5 flex-shrink-0 mt-0.5",
                          tier.color === "accent" && "text-accent",
                          tier.color === "primary" && "text-primary",
                          tier.color === "gold" && "text-gold",
                          tier.color === "muted" && "text-muted-foreground"
                        )} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button 
                    asChild
                    className={cn(
                      "w-full",
                      isPopular && "bg-accent hover:bg-accent/90 text-accent-foreground"
                    )}
                    size="lg"
                  >
                    <Link href={tier.ctaLink}>
                      {tier.cta}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Category Breakdown Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">What's Included in Each Category?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every category includes a comprehensive questionnaire, advanced analysis, and detailed recommendations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {CATEGORY_BREAKDOWN.map((category, idx) => (
              <Card key={idx} className="border-accent/20 hover:border-accent/50 transition-colors">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple 4-step process to get your personalized club fitting
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              {
                step: "1",
                title: "Choose Categories",
                description: "Select which clubs you want to fit — from 1 to all 7 categories"
              },
              {
                step: "2",
                title: "Answer Questions",
                description: "Complete questionnaires for your selected categories (10-15 min)"
              },
              {
                step: "3",
                title: "Get Recommendations",
                description: "Receive personalized specifications and product matches"
              },
              {
                step: "4",
                title: "Download & Shop",
                description: "Download your PDF report and find your perfect clubs"
              }
            ].map((item) => (
              <Card key={item.step} className="text-center">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xl font-bold mx-auto mb-3">
                    {item.step}
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I add more categories later?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! You can start with a single category and add more anytime. Each additional category can be purchased individually or upgrade to a higher tier.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's the difference between plans?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  The only difference is the number of club categories you can fit. Free Trial gives you driver only, Single Club lets you choose 1 category, Premium covers 5 categories, and Executive includes all 7 categories for a complete bag fitting.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is this a subscription?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No! All plans are one-time payments. You pay once and get lifetime access to your fitting results. No recurring charges.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">How accurate are the recommendations?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Our algorithm uses proven fitting principles based on your measurements, swing characteristics, and goals. Confidence scores of 83-90% mean our recommendations match what a professional fitter would provide in 8-9 out of 10 cases.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What if I'm not satisfied?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We stand behind our recommendations. If you're not satisfied with your fitting results, contact our support team and we'll work to make it right.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-br from-accent/10 via-transparent to-accent/5 border-accent/30">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Find Your Perfect Clubs?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start with a free trial or choose the plan that fits your needs. Get fitted in minutes.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild className="bg-accent hover:bg-accent/90">
                <Link href="/auth/register">
                  Start Free Trial
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/how-it-works">
                  Learn More
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}