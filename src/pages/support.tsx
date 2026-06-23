import React, { useState } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  FileText, 
  LayoutDashboard, 
  MessageSquare, 
  Play,
  FileCheck,
  CreditCard,
  Settings,
  Shield,
  Send,
  Lock,
  FileQuestion,
  Link as LinkIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

export default function Support() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    orderNumber: "",
    subject: "General",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // Format email HTML for admin
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #0A0A0A 0%, #22C55E 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">New Support Request</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
            <div style="background: white; padding: 25px; border-radius: 8px; border-left: 4px solid #22C55E;">
              <h2 style="color: #0A0A0A; margin-top: 0; font-size: 20px;">Contact Information</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600; width: 140px;">Name:</td>
                  <td style="padding: 10px 0; color: #0A0A0A;">${formData.name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Email:</td>
                  <td style="padding: 10px 0; color: #0A0A0A;"><a href="mailto:${formData.email}" style="color: #22C55E; text-decoration: none;">${formData.email}</a></td>
                </tr>
                ${formData.orderNumber ? `
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Order Number:</td>
                  <td style="padding: 10px 0; color: #0A0A0A;">${formData.orderNumber}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 10px 0; color: #6b7280; font-weight: 600;">Subject:</td>
                  <td style="padding: 10px 0;"><span style="background: #D4AF37; color: #0A0A0A; padding: 4px 12px; border-radius: 4px; font-weight: 600; font-size: 14px;">${formData.subject}</span></td>
                </tr>
              </table>
            </div>

            <div style="background: white; padding: 25px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #D4AF37;">
              <h2 style="color: #0A0A0A; margin-top: 0; font-size: 20px;">Message</h2>
              <p style="color: #374151; line-height: 1.6; white-space: pre-wrap;">${formData.message}</p>
            </div>

            <div style="margin-top: 30px; padding: 20px; background: #eff6ff; border-radius: 8px; text-align: center;">
              <p style="color: #1e40af; margin: 0; font-size: 14px;">
                📧 Reply directly to <a href="mailto:${formData.email}" style="color: #22C55E; text-decoration: none; font-weight: 600;">${formData.email}</a>
              </p>
            </div>

            <div style="margin-top: 20px; text-align: center; color: #9ca3af; font-size: 12px;">
              <p style="margin: 5px 0;">Prime Swing Fits Support System</p>
              <p style="margin: 5px 0;">Northern Virginia, USA</p>
              <p style="margin: 5px 0;">Submitted: ${new Date().toLocaleString('en-US', { 
                dateStyle: 'full', 
                timeStyle: 'short',
                timeZone: 'America/New_York'
              })}</p>
            </div>
          </div>
        </div>
      `;

      // Call the send-email edge function
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: 'support@primeswingfits.com', // Admin email - update this to your actual admin email
          subject: `[Support] ${formData.subject} - ${formData.name}`,
          html: emailHtml
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      toast({
        title: "Message Sent",
        description: "We'll respond within 24 business hours.",
      });
      
      setFormData({ name: "", email: "", orderNumber: "", subject: "General", message: "" });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again or email support@primeswingfits.com directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickLinks = [
    {
      icon: FileText,
      title: "Start a Fitting",
      description: "New here? Begin your AI assessment in 10 minutes.",
      buttonText: "Take the Quiz",
      href: "/fitting/new"
    },
    {
      icon: LayoutDashboard,
      title: "My Report",
      description: "Download or re-access your fitting reports.",
      buttonText: "Go to Dashboard",
      href: "/dashboard"
    },
    {
      icon: MessageSquare,
      title: "Contact Us",
      description: "Reach our support team directly.",
      buttonText: "Send a Message",
      href: "#contact-form"
    }
  ];

  const legalDocs = [
    { icon: Shield, title: "Privacy Policy", href: "/privacy" },
    { icon: FileQuestion, title: "Terms of Service", href: "/terms" },
    { icon: LinkIcon, title: "Affiliate Disclosure", href: "/privacy#affiliate" },
    { icon: Settings, title: "AI Disclaimer", href: "/terms#ai-disclaimer" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
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
            <h1 className="text-5xl md:text-6xl font-bold mb-6">How Can We Help?</h1>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Find answers, access your report, or contact our team.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg bg-white/95 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Pill Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <Badge variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20 px-4 py-2 text-sm cursor-pointer">
                Getting Started
              </Badge>
              <Badge variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20 px-4 py-2 text-sm cursor-pointer">
                My Report
              </Badge>
              <Badge variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20 px-4 py-2 text-sm cursor-pointer">
                Billing
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Link Cards */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickLinks.map((link, index) => (
              <Card key={index} className="hover:shadow-lg transition-all border-t-4 border-t-accent">
                <CardContent className="pt-8 pb-6 text-center">
                  <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <link.icon className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="font-bold text-xl mb-2 text-foreground">{link.title}</h3>
                  <p className="text-muted-foreground mb-6">
                    {link.description}
                  </p>
                  <Button asChild className="w-full bg-gold text-gold-foreground hover:bg-gold/90">
                    <Link href={link.href}>
                      {link.buttonText}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tabbed FAQ Section */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-foreground">Frequently Asked Questions</h2>
              <p className="text-xl text-muted-foreground">
                Find quick answers to common questions
              </p>
            </div>

            <Tabs defaultValue="getting-started" className="w-full">
              <TabsList className="w-full justify-start flex-wrap h-auto p-1 bg-muted">
                <TabsTrigger value="getting-started" className="flex-1 min-w-[120px]">Getting Started</TabsTrigger>
                <TabsTrigger value="my-report" className="flex-1 min-w-[120px]">My Report</TabsTrigger>
                <TabsTrigger value="billing" className="flex-1 min-w-[120px]">Billing</TabsTrigger>
                <TabsTrigger value="technical" className="flex-1 min-w-[120px]">Technical</TabsTrigger>
                <TabsTrigger value="privacy" className="flex-1 min-w-[120px]">Privacy</TabsTrigger>
              </TabsList>

              <TabsContent value="getting-started" className="mt-8">
                <div className="space-y-6">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-bold text-lg mb-2 text-foreground">Do I need a launch monitor?</h3>
                      <p className="text-muted-foreground">
                        No. Our AI uses measurements and swing tendencies — no equipment needed.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-bold text-lg mb-2 text-foreground">How long does it take?</h3>
                      <p className="text-muted-foreground">
                        8–10 minutes.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-bold text-lg mb-2 text-foreground">What info do I need?</h3>
                      <p className="text-muted-foreground">
                        Height, wrist-to-floor measurement, approximate swing speed, typical ball flight.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-bold text-lg mb-2 text-foreground">Is it as accurate as in-person?</h3>
                      <p className="text-muted-foreground">
                        Static specs (length, lie, grip, flex) match industry standards. Dynamic specs are AI-modeled from your profile.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="my-report" className="mt-8">
                <div className="space-y-6">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-bold text-lg mb-2 text-foreground">When do I receive my report?</h3>
                      <p className="text-muted-foreground">
                        Instantly after payment confirmation. Check spam if not received.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-bold text-lg mb-2 text-foreground">Report didn't arrive?</h3>
                      <p className="text-muted-foreground">
                        Email support@primeswingfits.com with order number within 24 hours.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-bold text-lg mb-2 text-foreground">Can I re-download?</h3>
                      <p className="text-muted-foreground">
                        Yes — log into Dashboard under "My Reports."
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-bold text-lg mb-2 text-foreground">Are recommendations brand-biased?</h3>
                      <p className="text-muted-foreground">
                        No. We are brand-agnostic. Affiliate commissions are fully disclosed per FTC rules.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="billing" className="mt-8">
                <div className="space-y-6">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-bold text-lg mb-2 text-foreground">What payment methods do you accept?</h3>
                      <p className="text-muted-foreground">
                        All major credit/debit cards and Apple Pay via Stripe.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-bold text-lg mb-2 text-foreground">Can I get a refund?</h3>
                      <p className="text-muted-foreground">
                        Reports are non-refundable after delivery. Technical non-delivery within 24 hrs = full refund available.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-bold text-lg mb-2 text-foreground">What is Premium Plus?</h3>
                      <p className="text-muted-foreground">
                        All Premium features plus a Golf Daddy launch monitor shipped to your address.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-bold text-lg mb-2 text-foreground">Can I upgrade my tier?</h3>
                      <p className="text-muted-foreground">
                        Yes — contact support and we'll apply your prior payment as credit.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="technical" className="mt-8">
                <div className="space-y-6">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-bold text-lg mb-2 text-foreground">Quiz won't load?</h3>
                      <p className="text-muted-foreground">
                        Clear browser cache, disable ad blockers, try Chrome or Firefox.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-bold text-lg mb-2 text-foreground">Supported browsers?</h3>
                      <p className="text-muted-foreground">
                        Chrome, Firefox, Safari, Edge — latest 2 versions. Full mobile support.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-bold text-lg mb-2 text-foreground">Is my data secure?</h3>
                      <p className="text-muted-foreground">
                        Yes — SSL/TLS encryption. Payments via Stripe (PCI-DSS Level 1). See Privacy Policy.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="privacy" className="mt-8">
                <div className="space-y-6">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-bold text-lg mb-2 text-foreground">Do you sell my data?</h3>
                      <p className="text-muted-foreground">
                        Never.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-bold text-lg mb-2 text-foreground">How do I delete my account data?</h3>
                      <p className="text-muted-foreground">
                        Email privacy@primeswingfits.com — processed within 45 days per Virginia VCDPA.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-bold text-lg mb-2 text-foreground">Is my swing data used for AI training?</h3>
                      <p className="text-muted-foreground">
                        Only anonymized aggregated data. You are never personally identified.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact-form" className="py-16 bg-muted/30 scroll-mt-24">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 text-foreground">Contact Support</h2>
              <p className="text-xl text-muted-foreground">
                Can't find what you're looking for? Send us a message.
              </p>
            </div>

            <Card>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2 text-foreground">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                        className="h-12"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2 text-foreground">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="john@example.com"
                        className="h-12"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="orderNumber" className="block text-sm font-medium mb-2 text-foreground">
                      Order Number <span className="text-muted-foreground">(optional)</span>
                    </label>
                    <Input
                      id="orderNumber"
                      name="orderNumber"
                      type="text"
                      value={formData.orderNumber}
                      onChange={handleChange}
                      placeholder="#12345"
                      className="h-12"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2 text-foreground">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={formData.subject}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Report Issue">Report Issue</SelectItem>
                        <SelectItem value="Billing">Billing</SelectItem>
                        <SelectItem value="Technical">Technical</SelectItem>
                        <SelectItem value="Privacy">Privacy</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2 text-foreground">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      placeholder="Tell us how we can help..."
                      rows={6}
                      className="resize-none"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    disabled={isSubmitting}
                    className="w-full bg-gold text-gold-foreground hover:bg-gold/90 h-12"
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
                  <p className="mb-2">Typical response: within 24 business hours</p>
                  <a href="mailto:support@primeswingfits.com" className="text-accent hover:underline font-medium">
                    support@primeswingfits.com
                  </a>
                  <p className="mt-1">Northern Virginia, USA</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Legal Docs Grid */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-foreground">Legal & Policies</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {legalDocs.map((doc, index) => (
                <Card key={index} className="hover:shadow-lg transition-all border-l-4 border-l-accent">
                  <CardContent className="pt-6">
                    <Link href={doc.href} className="flex items-center gap-4">
                      <div className="bg-accent/10 p-4 rounded-xl">
                        <doc.icon className="h-6 w-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground">{doc.title}</h3>
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer Legal Notice */}
      <section className="py-8 bg-muted/30 border-t">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <p className="text-xs text-muted-foreground text-center leading-relaxed">
              Prime Swing Fits is operated from Northern Virginia, Virginia, USA. AI fitting reports are for informational purposes only and are not a substitute for professional golf club fitting. By using this site you agree to our{" "}
              <Link href="/terms" className="text-accent hover:underline">
                Terms of Service
              </Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-accent hover:underline">
                Privacy Policy
              </Link>
              . Affiliate links disclosed per FTC 16 C.F.R. Part 255.
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}