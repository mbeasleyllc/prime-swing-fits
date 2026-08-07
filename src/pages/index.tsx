import React, { useRef } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Trophy, FileText, TrendingUp, Zap, Award, Users, Clock, ArrowRight, Star } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { useParallax } from "@/hooks/useParallax";

function AnimatedSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { elementRef, isVisible } = useScrollAnimation();
  
  return (
    <div
      ref={elementRef}
      className="transition-all duration-700 ease-out"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const { user } = useAuth();
  const heroRef = useRef<HTMLElement>(null);
  
  const backgroundOffset = useParallax({ speed: 0.5, direction: "up" });
  const midgroundOffset = useParallax({ speed: 0.3, direction: "up" });
  const foregroundOffset = useParallax({ speed: 0.15, direction: "up" });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section ref={heroRef} className="relative h-screen overflow-hidden">
        <div 
          className="absolute inset-0 z-0"
          style={{ transform: `translateY(${backgroundOffset}px)` }}
        >
          <img 
            src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2400&auto=format&fit=crop"
            alt="Pristine golf course fairway"
            className="w-full h-[120%] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/85 to-accent/80" />
        </div>

        <div 
          className="absolute inset-0 z-10"
          style={{ transform: `translateY(${midgroundOffset}px)` }}
        >
          <div className="absolute inset-0 opacity-20">
            <img 
              src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=2400&auto=format&fit=crop"
              alt="Golf clubs detail"
              className="w-full h-full object-cover mix-blend-overlay"
            />
          </div>
        </div>

        <div 
          className="absolute bottom-0 left-0 right-0 h-32 z-20 bg-gradient-to-t from-primary/60 to-transparent"
          style={{ transform: `translateY(${foregroundOffset}px)` }}
        />

        <div className="container relative z-30 h-full flex items-center justify-center px-4">
          <div className="max-w-5xl mx-auto text-center text-white">
            <div className="flex justify-center mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
              <div className="relative">
                <div className="absolute inset-0 bg-gold/30 blur-2xl rounded-full" />
                <div className="relative bg-gold/10 p-4 md:p-8 rounded-full backdrop-blur-md border border-gold/30">
                  <Trophy className="h-12 w-12 md:h-20 md:w-20 text-gold drop-shadow-2xl" />
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
              <div className="inline-flex items-center gap-2 bg-gold/20 backdrop-blur-sm text-gold px-3 py-2 md:px-5 md:py-2.5 rounded-full mb-4 md:mb-6 border border-gold/30">
                <Star className="h-3 w-3 md:h-4 md:w-4 fill-gold" />
                <span className="text-xs md:text-sm font-semibold tracking-wide">Professional Club Fitting Technology</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 md:mb-6 tracking-tight leading-none">
                Perfect Your
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold/80 to-gold mt-2 md:mt-3">
                  Golf Game
                </span>
              </h1>
            </div>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl mb-8 md:mb-12 text-white/95 max-w-4xl mx-auto leading-relaxed font-light animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300 px-4">
              Get <span className="font-semibold text-gold">precision-engineered</span> club recommendations tailored to your swing. Professional fitting technology at your fingertips.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-500 px-4">
              <Button 
                size="lg" 
                asChild 
                className="w-full sm:w-auto text-base md:text-lg px-8 md:px-12 py-6 md:py-8 bg-gold text-gold-foreground hover:bg-gold/90 shadow-2xl hover:shadow-gold/40 hover:scale-105 transition-all duration-300 group"
              >
                <Link href={user ? "/fitting/new" : "/auth/register"} className="flex items-center gap-3 justify-center">
                  <span className="font-semibold">Start Your Fitting</span>
                  <ArrowRight className="h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline" 
                asChild 
                className="w-full sm:w-auto text-base md:text-lg px-8 md:px-12 py-6 md:py-8 bg-white/10 backdrop-blur-md border-white/30 text-white hover:bg-white/20 hover:border-white/50 shadow-xl transition-all duration-300"
              >
                <Link href="#how-it-works">Learn More</Link>
              </Button>
            </div>

            <div className="mt-12 md:mt-16 grid grid-cols-3 gap-4 md:gap-8 max-w-3xl mx-auto animate-in fade-in duration-1000 delay-700 px-4">
              <div className="text-center">
                <div className="text-2xl md:text-4xl font-bold text-gold mb-1 md:mb-2">6</div>
                <div className="text-xs md:text-sm text-white/80 uppercase tracking-wide">Step Process</div>
              </div>
              <div className="text-center border-x border-white/20">
                <div className="text-2xl md:text-4xl font-bold text-gold mb-1 md:mb-2">100%</div>
                <div className="text-xs md:text-sm text-white/80 uppercase tracking-wide">Personalized</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-4xl font-bold text-gold mb-1 md:mb-2">5 Min</div>
                <div className="text-xs md:text-sm text-white/80 uppercase tracking-wide">To Complete</div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 animate-bounce hidden md:block">
          <div className="w-8 h-12 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/60 rounded-full" />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-12 md:py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection>
              <div className="text-center mb-10 md:mb-16">
                <div className="inline-flex items-center gap-2 bg-success/10 text-success px-3 md:px-4 py-2 rounded-full mb-3 md:mb-4">
                  <Target className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="text-xs md:text-sm font-semibold">Premium Fitting Experience</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 text-foreground">
                  How It Works
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                  Three simple steps to unlock your perfect golf club setup
                </p>
              </div>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <AnimatedSection delay={0}>
                <Card className="text-center hover:shadow-2xl transition-all duration-300 border-2 hover:border-accent/50 group h-full">
                  <CardContent className="pt-10 pb-8">
                    <div className="bg-gradient-to-br from-success to-success/70 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
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
              </AnimatedSection>

              <AnimatedSection delay={150}>
                <Card className="text-center hover:shadow-2xl transition-all duration-300 border-2 hover:border-accent/50 group h-full">
                  <CardContent className="pt-10 pb-8">
                    <div className="bg-gradient-to-br from-success to-success/70 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
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
              </AnimatedSection>

              <AnimatedSection delay={300}>
                <Card className="text-center hover:shadow-2xl transition-all duration-300 border-2 hover:border-accent/50 group h-full">
                  <CardContent className="pt-10 pb-8">
                    <div className="bg-gradient-to-br from-success to-success/70 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform">
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
              </AnimatedSection>
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
            <AnimatedSection>
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
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatedSection delay={0}>
                <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-success h-full">
                  <CardContent className="pt-8">
                    <div className="flex items-start gap-4">
                      <div className="bg-success/10 p-4 rounded-xl flex-shrink-0">
                        <Award className="h-7 w-7 text-success" />
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
              </AnimatedSection>

              <AnimatedSection delay={150}>
                <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-gold h-full">
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
              </AnimatedSection>

              <AnimatedSection delay={300}>
                <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-accent h-full">
                  <CardContent className="pt-8">
                    <div className="flex items-start gap-4">
                      <div className="bg-accent/10 p-4 rounded-xl flex-shrink-0">
                        <TrendingUp className="h-7 w-7 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-3">Compare Equipment</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Side-by-side comparison of clubs and golf balls with detailed specs, performance ratings, and fitting match indicators.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>

              <AnimatedSection delay={450}>
                <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-gold h-full">
                  <CardContent className="pt-8">
                    <div className="flex items-start gap-4">
                      <div className="bg-gold/10 p-4 rounded-xl flex-shrink-0">
                        <FileText className="h-7 w-7 text-gold" />
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
              </AnimatedSection>

              <AnimatedSection delay={600}>
                <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-accent h-full">
                  <CardContent className="pt-8">
                    <div className="flex items-start gap-4">
                      <div className="bg-accent/10 p-4 rounded-xl flex-shrink-0">
                        <Award className="h-7 w-7 text-accent" />
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
              </AnimatedSection>

              <AnimatedSection delay={750}>
                <Card className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-gold h-full">
                  <CardContent className="pt-8">
                    <div className="flex items-start gap-4">
                      <div className="bg-gold/10 p-4 rounded-xl flex-shrink-0">
                        <Trophy className="h-7 w-7 text-gold" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-3">Golf Ball Matching</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          Get personalized golf ball recommendations from top 20 rated balls matched to your swing speed and skill level.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
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
          <AnimatedSection>
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
              <Button size="lg" asChild className="text-lg px-10 py-7 bg-gold text-gold-foreground hover:bg-gold/90 shadow-2xl hover:shadow-gold/20 hover:scale-105 transition-all">
                <Link href={user ? "/fitting/new" : "/auth/register"}>
                  Get Started Now — It's Free
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}