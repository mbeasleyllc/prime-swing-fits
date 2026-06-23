import React from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, TrendingUp, Target, Award } from "lucide-react";

export default function Blog() {
  const featuredPost = {
    title: "The Complete Guide to Golf Club Fitting: Everything You Need to Know",
    excerpt: "Understanding the science behind club fitting can transform your game. Learn about the key measurements, specifications, and how they affect your performance on the course.",
    image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=1200&auto=format&fit=crop",
    category: "Fitting Guides",
    date: "2026-06-15",
    readTime: "12 min read",
    slug: "complete-guide-golf-club-fitting"
  };

  const posts = [
    {
      title: "How Shaft Flex Affects Your Distance and Accuracy",
      excerpt: "Choosing the right shaft flex is crucial for maximizing distance while maintaining control. Here's how to determine the perfect flex for your swing speed.",
      image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=600&auto=format&fit=crop",
      category: "Equipment",
      date: "2026-06-10",
      readTime: "7 min read",
      slug: "shaft-flex-guide"
    },
    {
      title: "Understanding Lie Angle: The Often Overlooked Specification",
      excerpt: "Lie angle can dramatically affect ball flight and shot accuracy. Learn how to measure your ideal lie angle and why it matters more than you think.",
      image: "https://images.unsplash.com/photo-1592919505780-303950717480?q=80&w=600&auto=format&fit=crop",
      category: "Fitting Tips",
      date: "2026-06-05",
      readTime: "6 min read",
      slug: "understanding-lie-angle"
    },
    {
      title: "5 Signs You Need New Golf Clubs",
      excerpt: "Is it time to upgrade your equipment? Here are the telltale signs that your current clubs are holding back your game and costing you strokes.",
      image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=600&auto=format&fit=crop",
      category: "Equipment",
      date: "2026-05-28",
      readTime: "5 min read",
      slug: "signs-need-new-clubs"
    },
    {
      title: "Grip Size Guide: Finding Your Perfect Match",
      excerpt: "The right grip size improves control and reduces tension in your hands. Discover how to measure your hand size and select the ideal grip diameter.",
      image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=600&auto=format&fit=crop",
      category: "Fitting Tips",
      date: "2026-05-22",
      readTime: "6 min read",
      slug: "grip-size-guide"
    },
    {
      title: "Driver vs. Irons: Why They Require Different Fitting Approaches",
      excerpt: "Woods and irons have distinct purposes and require unique fitting considerations. Learn the key differences in how these clubs should be fitted to your game.",
      image: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=600&auto=format&fit=crop",
      category: "Fitting Guides",
      date: "2026-05-18",
      readTime: "8 min read",
      slug: "driver-vs-irons-fitting"
    },
    {
      title: "The Impact of Club Length on Your Swing Mechanics",
      excerpt: "Club length affects posture, swing plane, and consistency. Understand how proper club length can improve your ball striking and reduce mishits.",
      image: "https://images.unsplash.com/photo-1535131749006-b7f58c99034b?q=80&w=600&auto=format&fit=crop",
      category: "Technique",
      date: "2026-05-12",
      readTime: "7 min read",
      slug: "club-length-impact"
    }
  ];

  const categories = [
    { name: "All Posts", count: 25, icon: <TrendingUp className="h-4 w-4" /> },
    { name: "Fitting Guides", count: 12, icon: <Target className="h-4 w-4" /> },
    { name: "Equipment", count: 8, icon: <Award className="h-4 w-4" /> },
    { name: "Fitting Tips", count: 5, icon: <Target className="h-4 w-4" /> }
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
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Golf Fitting Blog</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Expert insights, guides, and tips to help you understand golf club fitting and equipment selection.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <div className="mb-16">
                  <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-2 rounded-full mb-4">
                    <Award className="h-4 w-4" />
                    <span className="text-sm font-semibold">Featured Article</span>
                  </div>
                  
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-accent/20">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                      <div className="relative h-64 md:h-full">
                        <img 
                          src={featuredPost.image}
                          alt={featuredPost.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                            {featuredPost.category}
                          </span>
                        </div>
                      </div>
                      <CardContent className="p-8 flex flex-col justify-center">
                        <h2 className="text-3xl font-bold mb-4 text-foreground hover:text-accent transition-colors cursor-pointer">
                          {featuredPost.title}
                        </h2>
                        <p className="text-muted-foreground mb-6 leading-relaxed">
                          {featuredPost.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(featuredPost.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{featuredPost.readTime}</span>
                          </div>
                        </div>
                        <Button className="bg-accent text-accent-foreground hover:bg-accent/90 w-fit">
                          Read Article
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </CardContent>
                    </div>
                  </Card>
                </div>

                <div>
                  <h2 className="text-3xl font-bold mb-8 text-foreground">Latest Articles</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {posts.map((post, index) => (
                      <Card key={index} className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer">
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={post.image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-4 left-4">
                            <span className="bg-primary/90 text-white px-3 py-1 rounded-full text-xs font-semibold">
                              {post.category}
                            </span>
                          </div>
                        </div>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-accent transition-colors">
                            {post.title}
                          </h3>
                          <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{post.readTime}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-8">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-lg mb-4">Categories</h3>
                      <div className="space-y-2">
                        {categories.map((category, index) => (
                          <button
                            key={index}
                            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-accent/10 transition-colors text-left group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="text-accent">{category.icon}</div>
                              <span className="font-medium group-hover:text-accent transition-colors">
                                {category.name}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">{category.count}</span>
                          </button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-lg mb-3">Start Your Fitting</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Ready to find your perfect clubs? Complete our free fitting wizard in just 5 minutes.
                      </p>
                      <Button asChild className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                        <Link href="/fitting/new">
                          Get Started
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-semibold text-lg mb-3">Newsletter</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Get fitting tips and equipment insights delivered to your inbox.
                      </p>
                      <div className="space-y-2">
                        <input
                          type="email"
                          placeholder="Your email"
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                        />
                        <Button variant="outline" className="w-full hover:bg-accent hover:text-accent-foreground hover:border-accent">
                          Subscribe
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}