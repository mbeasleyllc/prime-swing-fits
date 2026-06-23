import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  X, 
  TrendingUp, 
  Weight, 
  Ruler, 
  GitCompare,
  Share2,
  Download,
  Plus,
  AlertCircle,
  CheckCircle2,
  Trophy,
  Package,
  Zap,
  Target,
  Heart,
  ShoppingCart,
  ExternalLink,
  Lightbulb,
  ChevronDown
} from "lucide-react";
import { searchProducts } from "@/services/productService";
import { CLUB_DATABASE } from "@/data/clubDatabase";
import type { Database } from "@/integrations/supabase/database.types";
import { useToast } from "@/hooks/use-toast";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface ComparisonSlot {
  id: string;
  product: Product | null;
}

interface ExtendedProduct extends Product {
  loft_degrees?: number;
  lie_angle_degrees?: number;
  shaft_material?: string;
  shaft_weight_grams?: number;
  kick_point?: string;
  torque_degrees?: number;
  forgiveness_rating?: number;
  distance_rating?: number;
  accuracy_rating?: number;
  feel_rating?: number;
  best_for?: string;
  handicap_range?: string;
  swing_speed_range?: string;
  buy_url?: string;
}

const CATEGORIES = ["All", "Driver", "Fairway Wood", "Hybrid", "Irons", "Wedge", "Putter"];
const BRANDS = [
  "All Brands",
  "TaylorMade",
  "Callaway",
  "Titleist",
  "Ping",
  "Cobra",
  "Cleveland",
  "Srixon",
  "Odyssey",
  "Scotty Cameron",
  "Wilson"
];

const FEATURED_CLUBS_IDS = [
  "driver-tm-qi10",
  "driver-callaway-quantum",
  "irons-callaway-paradym",
  "irons-ping-g430",
  "wedge-cleveland-rtx6-56",
  "putter-odyssey-white-hot"
];

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

export default function ClubComparison() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedBrand, setSelectedBrand] = useState("All Brands");
  const [comparisonSlots, setComparisonSlots] = useState<ComparisonSlot[]>([
    { id: "slot-1", product: null },
    { id: "slot-2", product: null },
    { id: "slot-3", product: null },
  ]);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const { toast } = useToast();

  const featuredClubs = CLUB_DATABASE.filter(club => FEATURED_CLUBS_IDS.includes(club.id));

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          let results = await searchProducts(searchQuery);
          
          if (selectedCategory !== "All") {
            results = results.filter(p => p.category === selectedCategory);
          }
          
          if (selectedBrand !== "All Brands") {
            results = results.filter(p => p.brand === selectedBrand);
          }
          
          setSearchResults(results);
        } catch (error) {
          toast({
            title: "Search Error",
            description: "Failed to search products",
            variant: "destructive",
          });
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedCategory, selectedBrand, toast]);

  const addProductToSlot = (product: Product, slotId: string) => {
    setComparisonSlots(slots =>
      slots.map(slot =>
        slot.id === slotId ? { ...slot, product } : slot
      )
    );
    setActiveSlot(null);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeProductFromSlot = (slotId: string) => {
    setComparisonSlots(slots =>
      slots.map(slot =>
        slot.id === slotId ? { ...slot, product: null } : slot
      )
    );
  };

  const addComparisonSlot = () => {
    if (comparisonSlots.length >= 4) {
      toast({
        title: "Maximum Reached",
        description: "You can compare up to 4 clubs at once",
        variant: "destructive",
      });
      return;
    }
    setComparisonSlots([
      ...comparisonSlots,
      { id: `slot-${comparisonSlots.length + 1}`, product: null },
    ]);
  };

  const shareComparison = () => {
    const productIds = comparisonSlots
      .filter(slot => slot.product)
      .map(slot => slot.product!.id)
      .join(",");
    
    const url = `${window.location.origin}/clubs/compare?products=${productIds}`;
    navigator.clipboard.writeText(url);
    
    toast({
      title: "Link Copied",
      description: "Comparison link copied to clipboard",
    });
  };

  const exportComparison = () => {
    const data = comparisonSlots
      .filter(slot => slot.product)
      .map(slot => slot.product);
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "club-comparison.json";
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exported",
      description: "Comparison data downloaded",
    });
  };

  const selectedProducts = comparisonSlots.filter(slot => slot.product).map(slot => slot.product!) as ExtendedProduct[];
  const specs = getExpandedComparisonSpecs(selectedProducts);
  const filledSlotsCount = comparisonSlots.filter(slot => slot.product).length;

  const getCategoryCount = (category: string) => {
    if (category === "All") return CLUB_DATABASE.length;
    return CLUB_DATABASE.filter(club => club.category === category).length;
  };

  const filteredFeaturedClubs = selectedBrand !== "All Brands" 
    ? featuredClubs.filter(club => club.brand === selectedBrand)
    : featuredClubs;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="py-16 bg-gradient-to-br from-primary via-primary to-accent text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=2070&auto=format&fit=crop"
            alt="Golf clubs"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="bg-gold/20 p-4 rounded-full backdrop-blur-sm">
                <GitCompare className="h-12 w-12 text-gold" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              Compare Clubs. Make the Right Call.
            </h1>
            <p className="text-xl text-white/90 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              Side-by-side specs, performance ratings, and fitting insights for 30+ clubs across all categories.
            </p>
            <div className="flex flex-wrap justify-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
              <Badge className="bg-white/10 backdrop-blur-sm text-white border-white/20 px-4 py-2 text-sm">
                <Package className="h-4 w-4 mr-2" />
                30+ Clubs
              </Badge>
              <Badge className="bg-white/10 backdrop-blur-sm text-white border-white/20 px-4 py-2 text-sm">
                <Trophy className="h-4 w-4 mr-2" />
                6 Categories
              </Badge>
              <Badge className="bg-white/10 backdrop-blur-sm text-white border-white/20 px-4 py-2 text-sm">
                <Zap className="h-4 w-4 mr-2" />
                Instant Spec Compare
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <AnimatedSection>
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/3 order-2 lg:order-1">
                  <Card className="lg:sticky lg:top-4">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-accent" />
                        Search Clubs
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-wrap gap-2 border-b pb-4">
                        {CATEGORIES.map((category) => (
                          <Button
                            key={category}
                            variant={selectedCategory === category ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedCategory(category)}
                            className={selectedCategory === category ? "bg-accent text-white hover:bg-accent/90" : ""}
                          >
                            {category}
                            {category !== "All" && (
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {getCategoryCount(category)}
                              </Badge>
                            )}
                          </Button>
                        ))}
                      </div>

                      <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          {BRANDS.map((brand) => (
                            <SelectItem key={brand} value={brand}>
                              {brand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="relative">
                        <Input
                          placeholder="Search by brand or model..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pr-10"
                        />
                        {isSearching && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>

                      {searchQuery.length > 0 && searchQuery.length < 2 && (
                        <p className="text-sm text-muted-foreground">
                          Type at least 2 characters to search
                        </p>
                      )}

                      {searchQuery.length === 0 && (
                        <div className="space-y-4">
                          <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-gold" />
                            Featured Clubs
                          </h3>
                          <div className="grid grid-cols-2 gap-3">
                            {filteredFeaturedClubs.map((product) => (
                              <Card 
                                key={product.id}
                                className="cursor-pointer hover:shadow-lg transition-all border hover:border-accent/50"
                                onClick={() => {
                                  if (!activeSlot) {
                                    const emptySlot = comparisonSlots.find(s => !s.product);
                                    if (emptySlot) {
                                      addProductToSlot(product, emptySlot.id);
                                    } else {
                                      toast({
                                        title: "All Slots Full",
                                        description: "Remove a club to add this one",
                                        variant: "destructive",
                                      });
                                    }
                                    return;
                                  }
                                  addProductToSlot(product, activeSlot);
                                }}
                              >
                                <CardContent className="p-3">
                                  <div className="space-y-2">
                                    <h4 className="font-semibold text-xs truncate text-foreground">
                                      {product.brand}
                                    </h4>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {product.model_name}
                                    </p>
                                    {product.price_usd && (
                                      <p className="text-sm font-bold text-gold">
                                        ${product.price_usd}
                                      </p>
                                    )}
                                    <Button size="sm" className="w-full bg-gold text-gold-foreground hover:bg-gold/90 h-7 text-xs">
                                      <Plus className="h-3 w-3 mr-1" />
                                      Add
                                    </Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}

                      {searchResults.length > 0 && (
                        <div className="space-y-2 max-h-[600px] overflow-y-auto">
                          {searchResults.map((product) => (
                            <Card 
                              key={product.id}
                              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-accent/50"
                              onClick={() => {
                                if (!activeSlot) {
                                  const emptySlot = comparisonSlots.find(s => !s.product);
                                  if (emptySlot) {
                                    addProductToSlot(product, emptySlot.id);
                                  } else {
                                    toast({
                                      title: "All Slots Full",
                                      description: "Remove a club first",
                                      variant: "destructive",
                                    });
                                  }
                                  return;
                                }
                                addProductToSlot(product, activeSlot);
                              }}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  {product.image_url && (
                                    <img 
                                      src={product.image_url} 
                                      alt={product.model_name ?? "Club"}
                                      className="w-16 h-16 object-cover rounded"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold truncate text-foreground">
                                      {product.brand}
                                    </h4>
                                    <p className="text-sm text-muted-foreground truncate">
                                      {product.model_name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <Badge variant="outline" className="text-xs">
                                        {product.category}
                                      </Badge>
                                      {product.price_usd && (
                                        <span className="text-sm font-semibold text-gold">
                                          ${product.price_usd}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}

                      {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                        <div className="text-center py-8 text-muted-foreground">
                          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No clubs found</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="lg:w-2/3 order-1 lg:order-2">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Comparison</h2>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addComparisonSlot}
                        disabled={comparisonSlots.length >= 4}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Slot
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={shareComparison}
                        disabled={selectedProducts.length === 0}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportComparison}
                        disabled={selectedProducts.length === 0}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>

                  {filledSlotsCount < 2 && (
                    <Card className="mb-6 border-accent/50 bg-accent/5">
                      <CardContent className="py-3 px-4">
                        <div className="flex items-start gap-3">
                          <Lightbulb className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                          <div className="text-sm">
                            <p className="text-foreground font-medium">
                              Select 2–4 clubs to unlock the full spec comparison.
                            </p>
                            <p className="text-muted-foreground mt-1">
                              Compare same-category clubs for the best insights.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 md:overflow-x-auto md:flex md:flex-nowrap lg:grid">
                    {comparisonSlots.map((slot, index) => (
                      <AnimatedSection key={slot.id} delay={index * 100}>
                        <Card 
                          className={`h-full cursor-pointer transition-all min-w-[250px] md:min-w-0 ${
                            activeSlot === slot.id 
                              ? "border-2 border-accent shadow-lg ring-2 ring-accent/20" 
                              : "border-2 border-dashed hover:border-accent/50"
                          }`}
                          onClick={() => !slot.product && setActiveSlot(slot.id)}
                        >
                          <CardContent className="p-6">
                            {slot.product ? (
                              <div className="space-y-4">
                                <div className="relative">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute -top-2 -right-2 h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground z-10"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeProductFromSlot(slot.id);
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                  {slot.product.image_url && (
                                    <img 
                                      src={slot.product.image_url} 
                                      alt={slot.product.model_name ?? "Club"}
                                      className="w-full h-32 object-cover rounded"
                                    />
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-bold text-lg text-foreground truncate">
                                    {slot.product.brand}
                                  </h3>
                                  <p className="text-sm text-muted-foreground truncate">
                                    {slot.product.model_name}
                                  </p>
                                  <Badge variant="outline" className="mt-2">
                                    {slot.product.category}
                                  </Badge>
                                  {slot.product.price_usd && (
                                    <p className="text-xl font-bold text-gold mt-2">
                                      ${slot.product.price_usd}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="h-full flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Plus className="h-12 w-12 mb-2 opacity-50" />
                                <p className="text-sm">Click to add club</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </AnimatedSection>
                    ))}
                  </div>

                  {selectedProducts.length > 0 && (
                    <FittingMatchIndicator products={selectedProducts} />
                  )}

                  {selectedProducts.length > 1 && (
                    <>
                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle>Specifications Comparison</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px]">
                              <thead>
                                <tr className="border-b">
                                  <th className="py-3 px-4 text-left font-semibold text-foreground sticky left-0 bg-background">
                                    Specification
                                  </th>
                                  {selectedProducts.map((product, index) => (
                                    <th key={index} className="py-3 px-4 text-left font-semibold text-foreground min-w-[150px]">
                                      <div className="truncate">{product.brand}</div>
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {specs.map((spec, index) => (
                                  <tr key={index} className="border-b hover:bg-muted/50">
                                    <td className="py-3 px-4 font-medium text-muted-foreground sticky left-0 bg-background">
                                      <div className="flex items-center gap-2">
                                        {spec.icon}
                                        {spec.label}
                                      </div>
                                    </td>
                                    {spec.values.map((value, i) => (
                                      <td key={i} className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                          <span className={spec.isDifferent(i) ? "text-foreground font-semibold" : "text-muted-foreground"}>
                                            {value}
                                          </span>
                                          {spec.highlight === "best" && spec.isBest && spec.isBest(i) && (
                                            <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0" />
                                          )}
                                        </div>
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                                <tr className="border-b bg-muted/30">
                                  <td className="py-3 px-4 font-semibold text-foreground sticky left-0 bg-muted/30">
                                    Buy Now
                                  </td>
                                  {selectedProducts.map((product, i) => (
                                    <td key={i} className="py-3 px-4">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-gold text-gold hover:bg-gold hover:text-gold-foreground"
                                        asChild
                                      >
                                        <a
                                          href={product.buy_url || `https://www.google.com/search?q=${encodeURIComponent(`${product.brand} ${product.model_name} buy`)}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          Shop <ExternalLink className="h-3 w-3 ml-1" />
                                        </a>
                                      </Button>
                                    </td>
                                  ))}
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Performance Summary</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {selectedProducts.map((product, index) => (
                              <PerformanceCard key={index} product={product} allProducts={selectedProducts} />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {selectedProducts.length === 1 && (
                    <Card className="border-dashed">
                      <CardContent className="py-12">
                        <div className="text-center text-muted-foreground">
                          <GitCompare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-semibold mb-2">Add More Clubs</h3>
                          <p>Add at least one more club to see the comparison</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedProducts.length === 0 && (
                    <Card className="border-dashed">
                      <CardContent className="py-16">
                        <div className="text-center text-muted-foreground">
                          <GitCompare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-semibold mb-2">No Clubs Selected</h3>
                          <p>Add clubs to comparison slots to see detailed specifications</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FittingMatchIndicator({ products }: { products: ExtendedProduct[] }) {
  const [profile, setProfile] = useState<{ swingSpeed: number; handicap: number; flex: string } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("psfSwingProfile");
      if (stored) {
        setProfile(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load swing profile", error);
    }
  }, []);

  const getMatchStatus = (product: ExtendedProduct) => {
    if (!profile) return null;

    const swingMatch = product.swing_speed_range 
      ? checkSwingSpeedMatch(product.swing_speed_range, profile.swingSpeed)
      : null;
    
    const handicapMatch = product.handicap_range
      ? checkHandicapMatch(product.handicap_range, profile.handicap)
      : null;

    if (swingMatch === true && handicapMatch === true) {
      return { status: "good", label: "Good Fit", color: "text-accent" };
    } else if (swingMatch === false || handicapMatch === false) {
      return { status: "poor", label: "Poor Fit", color: "text-destructive" };
    } else {
      return { status: "check", label: "Check Fit", color: "text-yellow-600" };
    }
  };

  if (!profile) {
    return (
      <Card className="mb-6 border-accent/50 bg-accent/5">
        <CardContent className="py-4 px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-5 w-5 text-accent" />
              <p className="text-sm font-medium">
                Take the fitting quiz to see which clubs match your swing
              </p>
            </div>
            <Button size="sm" asChild className="bg-accent text-accent-foreground hover:bg-accent/90 flex-shrink-0">
              <Link href="/fitting/new">Start Fitting</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Fitting Match</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map((product, index) => {
            const match = getMatchStatus(product);
            if (!match) return null;

            return (
              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-sm truncate">{product.brand}</p>
                  <p className="text-xs text-muted-foreground truncate">{product.model_name}</p>
                </div>
                <div className={`flex items-center gap-1 ${match.color} font-semibold text-sm whitespace-nowrap`}>
                  {match.status === "good" && <CheckCircle2 className="h-4 w-4" />}
                  {match.status === "check" && <AlertCircle className="h-4 w-4" />}
                  {match.status === "poor" && <X className="h-4 w-4" />}
                  {match.label}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function checkSwingSpeedMatch(range: string, speed: number): boolean {
  const match = range.match(/(\d+)-(\d+)mph/);
  if (!match) return true;
  const [_, min, max] = match;
  return speed >= parseInt(min) && speed <= parseInt(max);
}

function checkHandicapMatch(range: string, handicap: number): boolean {
  const match = range.match(/(\d+)-(\d+)/);
  if (!match) return true;
  const [_, min, max] = match;
  return handicap >= parseInt(min) && handicap <= parseInt(max);
}

function PerformanceCard({ product, allProducts }: { product: ExtendedProduct; allProducts: ExtendedProduct[] }) {
  const distance = getMetricValue(product, "distance_rating");
  const accuracy = getMetricValue(product, "accuracy_rating");
  const feel = getMetricValue(product, "feel_rating");
  const forgiveness = getMetricValue(product, "forgiveness_rating");

  const badges = [];
  
  const prices = allProducts.map(p => p.price_usd).filter(Boolean) as number[];
  if (prices.length > 1 && product.price_usd === Math.min(...prices)) {
    badges.push({ label: "Best Value", color: "bg-gold" });
  }

  const forgivenessScores = allProducts.map(p => getMetricValue(p, "forgiveness_rating")).filter(Boolean) as number[];
  if (forgivenessScores.length > 1 && forgiveness === Math.max(...forgivenessScores)) {
    badges.push({ label: "Most Forgiving", color: "bg-teal-500" });
  }

  const feelScores = allProducts.map(p => getMetricValue(p, "feel_rating")).filter(Boolean) as number[];
  if (feelScores.length > 1 && feel === Math.max(...feelScores)) {
    badges.push({ label: "Best Feel", color: "bg-amber-500" });
  }

  return (
    <Card className="border-l-4 border-l-accent">
      <CardContent className="pt-6 space-y-4">
        <div>
          <h4 className="font-bold truncate">{product.brand}</h4>
          <p className="text-sm text-muted-foreground truncate">{product.model_name}</p>
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {badges.map((badge, i) => (
                <Badge key={i} className={`${badge.color} text-white text-xs`}>
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {distance !== null && (
          <PerformanceBar label="Distance" value={distance} color="bg-blue-500" />
        )}
        {accuracy !== null && (
          <PerformanceBar label="Accuracy" value={accuracy} color="bg-accent" />
        )}
        {feel !== null && (
          <PerformanceBar label="Feel" value={feel} color="bg-amber-500" />
        )}
        {forgiveness !== null && (
          <PerformanceBar label="Forgiveness" value={forgiveness} color="bg-teal-500" />
        )}
      </CardContent>
    </Card>
  );
}

function PerformanceBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-semibold">{value}/10</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2.5">
        <div
          className={`${color} h-2.5 rounded-full transition-all duration-500`}
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  );
}

function getMetricValue(product: ExtendedProduct, key: keyof ExtendedProduct): number | null {
  const value = product[key];
  if (typeof value === "number") return value;
  
  if (product.recommended_for && Array.isArray(product.recommended_for)) {
    const ratings: Record<string, Record<string, number>> = {
      distance_rating: { "Distance": 9, "Best Value Distance": 9, "Maximum Forgiveness": 8, "Elite Distance Value": 9 },
      accuracy_rating: { "Precision": 9, "Accuracy": 9, "Tour": 10 },
      feel_rating: { "Feel": 10, "Tour": 10, "Premium": 9, "Blade": 10 },
      forgiveness_rating: { "Forgiveness": 10, "Maximum Forgiveness": 10, "Game Improvement": 9 }
    };
    
    const mapping = ratings[key];
    if (mapping) {
      for (const [keyword, score] of Object.entries(mapping)) {
        if (product.recommended_for.some(r => r.includes(keyword))) {
          return score;
        }
      }
    }
  }

  const defaults: Record<string, number> = {
    distance_rating: 8,
    accuracy_rating: 8,
    feel_rating: 7,
    forgiveness_rating: 7
  };
  
  return defaults[key] ?? null;
}

function getExpandedComparisonSpecs(products: ExtendedProduct[]) {
  if (products.length === 0) return [];

  const allValues = (key: keyof ExtendedProduct) => products.map(p => p[key]);
  const hasVariation = (values: any[]) => {
    const nonNull = values.filter(v => v != null);
    return nonNull.length > 0 && new Set(nonNull).size > 1;
  };
  const hasData = (values: any[]) => values.some(v => v != null);
  const isDifferent = (values: any[]) => (index: number) => {
    const uniqueValues = new Set(values.filter(v => v != null));
    return uniqueValues.size > 1 && values[index] != null;
  };

  type SpecRow = {
    label: string;
    values: any[];
    icon: React.ReactNode;
    isDifferent: (index: number) => boolean;
    highlight?: "best" | "worst";
    isBest?: (index: number) => boolean;
  };

  const specs: SpecRow[] = [];

  const categoryValues = allValues("category");
  if (hasData(categoryValues)) {
    specs.push({
      label: "Category",
      values: categoryValues.map(v => v ?? "-"),
      icon: <TrendingUp className="h-4 w-4 text-accent" />,
      isDifferent: isDifferent(categoryValues),
    });
  }

  const bestForValues = products.map(p => 
    p.recommended_for && Array.isArray(p.recommended_for) && p.recommended_for.length > 0 
      ? p.recommended_for[0] 
      : null
  );
  if (hasData(bestForValues)) {
    specs.push({
      label: "Best For",
      values: bestForValues.map(v => v ?? "-"),
      icon: <Target className="h-4 w-4 text-gold" />,
      isDifferent: isDifferent(bestForValues),
    });
  }

  const handicapValues = products.map(p => 
    p.recommended_for && Array.isArray(p.recommended_for) 
      ? p.recommended_for.find(r => r.includes("handicap")) ?? null
      : null
  );
  if (hasData(handicapValues)) {
    specs.push({
      label: "Handicap Range",
      values: handicapValues.map(v => v ?? "-"),
      icon: <Trophy className="h-4 w-4 text-accent" />,
      isDifferent: isDifferent(handicapValues),
    });
  }

  const swingSpeedValues = products.map(p => 
    p.recommended_for && Array.isArray(p.recommended_for) 
      ? p.recommended_for.find(r => r.includes("mph")) ?? null
      : null
  );
  if (hasData(swingSpeedValues)) {
    specs.push({
      label: "Swing Speed Range",
      values: swingSpeedValues.map(v => v ?? "-"),
      icon: <Zap className="h-4 w-4 text-gold" />,
      isDifferent: isDifferent(swingSpeedValues),
    });
  }

  const flexValues = allValues("flex_category");
  if (hasData(flexValues)) {
    specs.push({
      label: "Shaft Flex",
      values: flexValues.map(v => v ?? "-"),
      icon: <TrendingUp className="h-4 w-4 text-accent" />,
      isDifferent: isDifferent(flexValues),
    });
  }

  const weightValues = allValues("weight_grams");
  if (hasData(weightValues)) {
    const numericWeights = weightValues.map(w => typeof w === "number" ? w : null);
    const validWeights = numericWeights.filter(w => w !== null) as number[];
    const minWeight = validWeights.length > 0 ? Math.min(...validWeights) : null;
    specs.push({
      label: "Total Weight",
      values: weightValues.map(w => w ? `${w}g` : "-"),
      icon: <Weight className="h-4 w-4 text-gold" />,
      isDifferent: isDifferent(weightValues),
      highlight: minWeight !== null ? "best" : undefined,
      isBest: minWeight !== null ? (i) => numericWeights[i] === minWeight : undefined,
    });
  }

  const gripValues = allValues("grip_size");
  if (hasData(gripValues)) {
    specs.push({
      label: "Grip Size",
      values: gripValues.map(v => v ?? "-"),
      icon: <Ruler className="h-4 w-4 text-accent" />,
      isDifferent: isDifferent(gripValues),
    });
  }

  const forgivenessValues = products.map(p => getMetricValue(p, "forgiveness_rating"));
  if (hasData(forgivenessValues)) {
    const validScores = forgivenessValues.filter(v => v !== null) as number[];
    const maxForgiveness = validScores.length > 0 ? Math.max(...validScores) : null;
    specs.push({
      label: "Forgiveness Rating",
      values: forgivenessValues.map(v => v !== null ? `${v}/10` : "-"),
      icon: <Heart className="h-4 w-4 text-teal-500" />,
      isDifferent: isDifferent(forgivenessValues),
      highlight: maxForgiveness !== null ? "best" : undefined,
      isBest: maxForgiveness !== null ? (i) => forgivenessValues[i] === maxForgiveness : undefined,
    });
  }

  const priceValues = allValues("price_usd");
  if (hasData(priceValues)) {
    const numericPrices = priceValues.map(p => typeof p === "number" ? p : null);
    const validPrices = numericPrices.filter(p => p !== null) as number[];
    const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : null;
    specs.push({
      label: "Price",
      values: priceValues.map(p => p ? `$${p}` : "-"),
      icon: <span className="text-gold font-bold text-sm">$</span>,
      isDifferent: isDifferent(priceValues),
      highlight: minPrice !== null ? "best" : undefined,
      isBest: minPrice !== null ? (i) => numericPrices[i] === minPrice : undefined,
    });
  }

  return specs;
}