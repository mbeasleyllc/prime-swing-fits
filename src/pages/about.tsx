import React from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Target, Users, Award, TrendingUp, CheckCircle2 } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative overflow-hidden py-12 md:py-20 bg-gradient-to-br from-primary via-primary to-accent">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=2070&auto=format&fit=crop"
            alt="Golf course"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container relative z-10 px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="flex justify-center mb-4 md:mb-6">
              <div className="bg-gold/20 p-4 md:p-6 rounded-full backdrop-blur-sm">
                <Trophy className="h-12 w-12 md:h-16 md:w-16 text-gold" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">About Prime Swing Fits</h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              Bringing professional golf club fitting technology to golfers everywhere. Our mission is to help every player find their perfect equipment match.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-foreground">Our Story</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 md:mb-6">
                Prime Swing Fits was born from a simple observation: professional golf club fitting should be accessible to every golfer, not just tour players and low handicappers. Traditional fitting sessions can cost hundreds of dollars and require appointments at specialized facilities.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4 md:mb-6">
                We developed a comprehensive, data-driven fitting algorithm that incorporates decades of club fitting knowledge and thousands of player profiles. Our guided wizard walks you through the same measurements and assessments a professional fitter would perform, then generates personalized recommendations tailored to your unique swing characteristics.
              </p>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Whether you're a beginner looking for your first set or an experienced player seeking optimization, Prime Swing Fits provides professional-grade recommendations you can trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10 md:mb-16">
              <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-3 md:px-4 py-2 rounded-full mb-3 md:mb-4">
                <Target className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-xs md:text-sm font-semibold">Our Values</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-foreground">What Drives Us</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <Card className="text-center hover:shadow-xl transition-all duration-300 border-2 hover:border-accent/50">
                <CardContent className="pt-8 md:pt-10 pb-6 md:pb-8 px-4">
                  <div className="bg-gradient-to-br from-accent to-accent/70 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                    <Users className="h-8 w-8 md:h-10 md:w-10 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Accessibility</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Professional fitting guidance should be available to every golfer, regardless of skill level or location.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-xl transition-all duration-300 border-2 hover:border-gold/50">
                <CardContent className="pt-8 md:pt-10 pb-6 md:pb-8 px-4">
                  <div className="bg-gradient-to-br from-gold to-gold/70 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                    <Award className="h-8 w-8 md:h-10 md:w-10 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Quality</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    Our recommendations are based on proven club fitting science and validated by professional fitters.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover:shadow-xl transition-all duration-300 border-2 hover:border-accent/50">
                <CardContent className="pt-8 md:pt-10 pb-6 md:pb-8 px-4">
                  <div className="bg-gradient-to-br from-accent to-accent/70 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                    <TrendingUp className="h-8 w-8 md:h-10 md:w-10 text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold mb-3 md:mb-4">Innovation</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    We continuously improve our algorithm and user experience based on the latest fitting research.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8 md:mb-12">
              <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-3 md:px-4 py-2 rounded-full mb-3 md:mb-4">
                <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-xs md:text-sm font-semibold">Our Expertise</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 text-foreground">Why Trust Prime Swing Fits?</h2>
            </div>

            <div className="space-y-4 md:space-y-6">
              <Card className="border-l-4 border-l-accent">
                <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">Proven Methodology</h3>
                      <p className="text-sm md:text-base text-muted-foreground">
                        Our fitting process follows industry-standard protocols used by certified club fitters worldwide.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-gold">
                <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-gold flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">Comprehensive Data</h3>
                      <p className="text-sm md:text-base text-muted-foreground">
                        We analyze swing speed, ball flight, physical measurements, and playing characteristics to generate precise recommendations.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-accent">
                <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-accent flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">Continuous Improvement</h3>
                      <p className="text-sm md:text-base text-muted-foreground">
                        Our algorithm is regularly updated with new equipment data and the latest fitting research.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-gold">
                <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
                  <div className="flex items-start gap-3 md:gap-4">
                    <CheckCircle2 className="h-5 w-5 md:h-6 md:w-6 text-gold flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">Professional Reports</h3>
                      <p className="text-sm md:text-base text-muted-foreground">
                        Download detailed PDF reports you can take to any pro shop or club fitter for reference.
                      </p>
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