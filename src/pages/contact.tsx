import React, { useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Integrate with email service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSubmitted(true);
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you within 24 hours.",
      });
      
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "Please try again or email us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative overflow-hidden py-12 md:py-20 bg-gradient-to-br from-primary via-primary to-accent">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1592919505780-303950717480?q=80&w=2070&auto=format&fit=crop"
            alt="Golf ball"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container relative z-10 px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="flex justify-center mb-4 md:mb-6">
              <div className="bg-gold/20 p-4 md:p-6 rounded-full backdrop-blur-sm">
                <Mail className="h-12 w-12 md:h-16 md:w-16 text-gold" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">Get In Touch</h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-3xl mx-auto">
              Have questions about our fitting process? Need help with your account? We're here to assist you.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-4 sm:p-6 md:p-8">
                  {submitted ? (
                    <div className="text-center py-8 md:py-12">
                      <div className="flex justify-center mb-4 md:mb-6">
                        <div className="bg-accent/10 p-4 md:p-6 rounded-full">
                          <CheckCircle2 className="h-12 w-12 md:h-16 md:w-16 text-accent" />
                        </div>
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 text-foreground">Message Sent!</h3>
                      <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8">
                        Thank you for reaching out. We'll respond to your inquiry within 24 hours.
                      </p>
                      <Button onClick={() => setSubmitted(false)} variant="outline" className="h-11">
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-6 md:mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">Send Us a Message</h2>
                        <p className="text-sm md:text-base text-muted-foreground">
                          Fill out the form below and we'll get back to you as soon as possible.
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                          <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-2 text-foreground">
                              Your Name
                            </label>
                            <Input
                              id="name"
                              name="name"
                              type="text"
                              value={formData.name}
                              onChange={handleChange}
                              required
                              placeholder="John Doe"
                              className="h-11 text-base"
                            />
                          </div>

                          <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">
                              Email Address
                            </label>
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                              placeholder="john@example.com"
                              className="h-11 text-base"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="subject" className="block text-sm font-medium mb-2 text-foreground">
                            Subject
                          </label>
                          <Input
                            id="subject"
                            name="subject"
                            type="text"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                            placeholder="How can we help?"
                            className="h-11 text-base"
                          />
                        </div>

                        <div>
                          <label htmlFor="message" className="block text-sm font-medium mb-2 text-foreground">
                            Message
                          </label>
                          <Textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            placeholder="Tell us more about your inquiry..."
                            rows={6}
                            className="resize-none text-base"
                          />
                        </div>

                        <Button 
                          type="submit" 
                          size="lg" 
                          disabled={isSubmitting}
                          className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-12 text-base"
                        >
                          {isSubmitting ? (
                            "Sending..."
                          ) : (
                            <>
                              <Send className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                              Send Message
                            </>
                          )}
                        </Button>
                      </form>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4 md:space-y-6">
              <Card className="border-l-4 border-l-accent">
                <CardContent className="pt-4 md:pt-6 px-4">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="bg-accent/10 p-3 md:p-4 rounded-xl flex-shrink-0">
                      <Mail className="h-5 w-5 md:h-6 md:w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base md:text-lg mb-2">Email Us</h3>
                      <a 
                        href="mailto:support@primeswingfits.app"
                        className="text-sm md:text-base text-muted-foreground hover:text-accent transition-colors break-all"
                      >
                        support@primeswingfits.app
                      </a>
                      <p className="text-xs md:text-sm text-muted-foreground mt-2">
                        We respond within 24 hours on business days.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-gold">
                <CardContent className="pt-4 md:pt-6 px-4">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="bg-gold/10 p-3 md:p-4 rounded-xl flex-shrink-0">
                      <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base md:text-lg mb-2">FAQ</h3>
                      <p className="text-sm md:text-base text-muted-foreground mb-3">
                        Find quick answers to common questions.
                      </p>
                      <Link 
                        href="/faq"
                        className="text-sm md:text-base text-accent hover:underline font-medium"
                      >
                        View FAQ →
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                <CardContent className="pt-4 md:pt-6 px-4">
                  <h3 className="font-semibold text-base md:text-lg mb-3">Office Hours</h3>
                  <div className="space-y-2 text-xs md:text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Monday - Friday</span>
                      <span className="font-medium text-right">9:00 AM - 6:00 PM EST</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Saturday</span>
                      <span className="font-medium text-right">10:00 AM - 4:00 PM EST</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-muted-foreground">Sunday</span>
                      <span className="font-medium">Closed</span>
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