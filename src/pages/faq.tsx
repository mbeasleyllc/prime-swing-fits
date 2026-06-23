import React, { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card } from "@/components/ui/card";
import { HelpCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How does the fitting process work?",
          a: "Our 6-step guided wizard walks you through player profile, swing characteristics, physical measurements, current equipment, preferences, and goals. The entire process takes 5-10 minutes and generates personalized club recommendations based on your unique profile."
        },
        {
          q: "Do I need to create an account?",
          a: "Yes, creating a free account allows you to save your fitting sessions, access past recommendations, download reports, and track your progress. Sign up takes less than a minute."
        },
        {
          q: "Is the fitting really free?",
          a: "Yes! Our basic fitting service is completely free. You'll receive personalized club recommendations and can download your fitting report at no cost."
        },
        {
          q: "How accurate are the recommendations?",
          a: "Our recommendations are based on proven club fitting science and validated methodologies used by professional fitters. While an in-person fitting with launch monitor data provides the most precision, our algorithm captures the key factors that determine optimal club specifications for most golfers."
        }
      ]
    },
    {
      category: "Measurements & Data",
      questions: [
        {
          q: "What measurements do I need?",
          a: "You'll need your height, wrist-to-floor measurement (from wrist crease to floor while standing with arms relaxed), and hand size. We provide detailed instructions on how to take these measurements accurately at home."
        },
        {
          q: "How do I measure my swing speed?",
          a: "If you don't have exact swing speed data, that's okay! We provide range estimates based on your typical drive distance and age. You can also use smartphone apps or visit a golf shop with a launch monitor for precise measurements."
        },
        {
          q: "What if I don't know my current club specs?",
          a: "No problem! You can skip questions about current equipment or provide general information like brand and model. The fitting will still work, though providing accurate current club data helps us understand what's working well for you."
        },
        {
          q: "Can I update my information later?",
          a: "Absolutely! Your profile and measurements can be updated anytime from your dashboard. You can also redo fittings as your game improves or your needs change."
        }
      ]
    },
    {
      category: "Recommendations & Results",
      questions: [
        {
          q: "What kind of recommendations will I receive?",
          a: "You'll get specific recommendations for club length, lie angle, shaft flex and weight, grip size, and club type. The report includes detailed explanations for each recommendation based on your measurements and swing characteristics."
        },
        {
          q: "Can I download my fitting report?",
          a: "Yes! Once your fitting is complete, you can download a professional PDF report containing all your recommendations and specifications. Take this to any club fitter or pro shop."
        },
        {
          q: "How do I use the recommendations when shopping?",
          a: "Your report provides specific specifications you can share with club fitters or use when shopping online. Many manufacturers offer custom fitting options that match our recommendations. You can also use the specs to compare different club models."
        },
        {
          q: "Will the recommendations work with any brand?",
          a: "Yes! Our recommendations are based on universal fitting principles that apply across all major golf club manufacturers. The shaft flex, lie angle, and other specs we provide are industry-standard measurements."
        }
      ]
    },
    {
      category: "Account & Privacy",
      questions: [
        {
          q: "Is my data private and secure?",
          a: "Yes, we take data privacy seriously. Your personal information and fitting data are encrypted and stored securely. We never share your data with third parties without your explicit consent. See our Privacy Policy for full details."
        },
        {
          q: "Can I delete my account?",
          a: "Yes, you can delete your account at any time from your profile settings. This will permanently remove all your data from our systems."
        },
        {
          q: "How do I reset my password?",
          a: "Click 'Forgot Password' on the login page. We'll send you a secure link to reset your password via email."
        }
      ]
    },
    {
      category: "Technical Support",
      questions: [
        {
          q: "What if the fitting wizard doesn't load?",
          a: "Try refreshing your browser or clearing your cache. Make sure you're using an up-to-date browser (Chrome, Firefox, Safari, or Edge). If problems persist, contact our support team."
        },
        {
          q: "Can I use this on my phone or tablet?",
          a: "Yes! Prime Swing Fits is fully responsive and works on all devices. The fitting wizard is optimized for tablets but works great on phones and desktops too."
        },
        {
          q: "My report won't download. What should I do?",
          a: "Make sure pop-ups are enabled for our site. Try a different browser if the issue persists. You can also access past reports from your dashboard at any time."
        },
        {
          q: "How do I contact support?",
          a: "Email us at support@primeswingfits.app or use our contact form. We typically respond within 24 hours on business days."
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      item =>
        item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative overflow-hidden py-20 bg-gradient-to-br from-primary via-primary to-accent">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=2070&auto=format&fit=crop"
            alt="Golf equipment"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="flex justify-center mb-6">
              <div className="bg-gold/20 p-6 rounded-full backdrop-blur-sm">
                <HelpCircle className="h-16 w-16 text-gold" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Frequently Asked Questions</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Find answers to common questions about Prime Swing Fits and our golf club fitting process.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <Card className="p-6 mb-12">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 text-lg"
                />
              </div>
            </Card>

            {filteredFaqs.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground text-lg">
                  No questions match your search. Try different keywords or{" "}
                  <button onClick={() => setSearchQuery("")} className="text-accent hover:underline">
                    clear your search
                  </button>
                  .
                </p>
              </Card>
            ) : (
              <div className="space-y-12">
                {filteredFaqs.map((category, categoryIndex) => (
                  <div key={categoryIndex}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-1 w-12 bg-accent rounded-full" />
                      <h2 className="text-2xl font-bold text-foreground">{category.category}</h2>
                    </div>

                    <Accordion type="single" collapsible className="space-y-4">
                      {category.questions.map((item, index) => (
                        <AccordionItem
                          key={index}
                          value={`item-${categoryIndex}-${index}`}
                          className="border border-border rounded-lg px-6 data-[state=open]:border-accent data-[state=open]:bg-accent/5"
                        >
                          <AccordionTrigger className="text-left hover:no-underline py-5">
                            <span className="font-semibold text-foreground pr-4">{item.q}</span>
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                            {item.a}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Still Have Questions?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Can't find what you're looking for? Get in touch with our support team.
            </p>
            <a 
              href="mailto:support@primeswingfits.app"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-4 rounded-lg font-semibold hover:bg-accent/90 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}