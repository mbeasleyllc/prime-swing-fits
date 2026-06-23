import React from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote, Trophy } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Michael Chen",
      handicap: "12 handicap",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
      rating: 5,
      text: "Prime Swing Fits completely transformed my game. The fitting recommendations were spot-on, and I've gained 15 yards off the tee with better accuracy. The detailed report made it easy to get custom-fitted clubs at my local pro shop.",
      achievement: "Gained 15 yards, improved accuracy"
    },
    {
      name: "Sarah Williams",
      handicap: "8 handicap",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
      rating: 5,
      text: "As a competitive amateur, I was skeptical about online fitting. But the algorithm captured nuances I didn't even realize about my swing. My new clubs feel like an extension of my body. Highly recommended!",
      achievement: "Dropped 4 strokes in 3 months"
    },
    {
      name: "James Rodriguez",
      handicap: "20 handicap",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop",
      rating: 5,
      text: "I'm a beginner and didn't know where to start with club fitting. Prime Swing Fits made the process so easy and educational. The step-by-step wizard explained everything clearly, and now I have clubs that actually fit my swing.",
      achievement: "Perfect first set of clubs"
    },
    {
      name: "Robert Taylor",
      handicap: "5 handicap",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop",
      rating: 5,
      text: "I've been playing for 30 years and have had multiple professional fittings. This online tool matched the quality of in-person sessions at a fraction of the cost. The shaft flex recommendation was particularly insightful.",
      achievement: "Validated years of experience"
    },
    {
      name: "Emily Thompson",
      handicap: "15 handicap",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
      rating: 5,
      text: "The detailed explanations for each recommendation helped me understand why certain specs matter. I learned so much about club fitting in just 10 minutes. My iron play has improved dramatically since switching to the recommended lie angle.",
      achievement: "Better iron consistency"
    },
    {
      name: "David Martinez",
      handicap: "18 handicap",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop",
      rating: 5,
      text: "Living in a rural area, I don't have easy access to professional club fitters. Prime Swing Fits gave me professional-grade recommendations without leaving my home. The PDF report was incredibly thorough and easy to share with my local golf shop.",
      achievement: "Access to pro fitting from home"
    }
  ];

  const stats = [
    { value: "10,000+", label: "Successful Fittings" },
    { value: "4.9", label: "Average Rating" },
    { value: "95%", label: "Would Recommend" },
    { value: "12 yds", label: "Avg. Distance Gain" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative overflow-hidden py-20 bg-gradient-to-br from-primary via-primary to-accent">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2070&auto=format&fit=crop"
            alt="Golf course"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="flex justify-center mb-6">
              <div className="bg-gold/20 p-6 rounded-full backdrop-blur-sm">
                <Trophy className="h-16 w-16 text-gold" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Success Stories</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Real golfers sharing how Prime Swing Fits helped them improve their game with perfectly fitted equipment.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-accent mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-2 rounded-full mb-4">
                <Star className="h-4 w-4 fill-gold" />
                <span className="text-sm font-semibold">What Our Users Say</span>
              </div>
              <h2 className="text-4xl font-bold mb-4 text-foreground">Trusted by Golfers Worldwide</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="hover:shadow-xl transition-all duration-300 border-t-4 border-t-accent">
                  <CardContent className="pt-8">
                    <div className="flex items-start gap-4 mb-6">
                      <img 
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                        <p className="text-sm text-muted-foreground">{testimonial.handicap}</p>
                        <div className="flex gap-1 mt-2">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                          ))}
                        </div>
                      </div>
                      <Quote className="h-8 w-8 text-accent/20" />
                    </div>
                    
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {testimonial.text}
                    </p>

                    <div className="bg-accent/5 border-l-4 border-l-accent px-4 py-3 rounded">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-accent" />
                        <span className="text-sm font-semibold text-accent">{testimonial.achievement}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-primary via-primary to-accent text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=2070&auto=format&fit=crop"
            alt="Golf clubs"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Join Them?</h2>
            <p className="text-xl mb-10 text-white/90 max-w-2xl mx-auto">
              Start your fitting journey today and discover equipment that's perfectly matched to your game.
            </p>
            <a 
              href="/fitting/new"
              className="inline-flex items-center gap-2 bg-gold text-gold-foreground px-10 py-4 rounded-lg font-semibold hover:bg-gold/90 transition-all shadow-2xl text-lg"
            >
              Get Your Free Fitting
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}