import React, { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  CheckCircle2
} from "lucide-react";
import { searchProducts } from "@/services/productService";
import type { Database } from "@/integrations/supabase/database.types";
import { useToast } from "@/hooks/use-toast";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface ComparisonSlot {
  id: string;
  product: Product | null;
}

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
  const [comparisonSlots, setComparisonSlots] = useState<ComparisonSlot[]>([
    { id: "slot-1", product: null },
    { id: "slot-2", product: null },
    { id: "slot-3", product: null },
  ]);
  const [activeSlot, setActiveSlot] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchProducts(searchQuery);
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
  }, [searchQuery, toast]);

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

  const selectedProducts = comparisonSlots.filter(slot => slot.product).map(slot => slot.product!);
  const specs = getComparisonSpecs(selectedProducts);

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
              Compare Golf Clubs
            </h1>
            <p className="text-xl text-white/90 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              Make informed decisions with side-by-side specification comparisons
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <AnimatedSection>
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/3">
                  <Card className="sticky top-4">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-accent" />
                        Search Clubs
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
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

                      {searchResults.length > 0 && (
                        <div className="space-y-2 max-h-[600px] overflow-y-auto">
                          {searchResults.map((product) => (
                            <Card 
                              key={product.id}
                              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-accent/50"
                              onClick={() => {
                                if (!activeSlot) {
                                  toast({
                                    title: "Select a Slot",
                                    description: "Click on an empty slot first",
                                    variant: "destructive",
                                  });
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

                <div className="lg:w-2/3">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-foreground">Comparison</h2>
                    <div className="flex gap-2">
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

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {comparisonSlots.map((slot, index) => (
                      <AnimatedSection key={slot.id} delay={index * 100}>
                        <Card 
                          className={`h-full cursor-pointer transition-all ${
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
                                    className="absolute -top-2 -right-2 h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
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

                  {selectedProducts.length > 1 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Specifications Comparison</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="py-3 px-4 text-left font-semibold text-foreground">
                                  Specification
                                </th>
                                {selectedProducts.map((product, index) => (
                                  <th key={index} className="py-3 px-4 text-left font-semibold text-foreground">
                                    {product.brand}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {specs.map((spec, index) => (
                                <tr key={index} className="border-b hover:bg-muted/50">
                                  <td className="py-3 px-4 font-medium text-muted-foreground">
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
                                        {spec.highlight === "best" && spec.isBest(i) && (
                                          <CheckCircle2 className="h-4 w-4 text-accent" />
                                        )}
                                      </div>
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
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

function getComparisonSpecs(products: Product[]) {
  if (products.length === 0) return [];

  const allValues = (key: keyof Product) => products.map(p => p[key]);
  const hasVariation = (values: any[]) => new Set(values.filter(v => v != null)).size > 1;
  const isDifferent = (values: any[]) => (index: number) => {
    const uniqueValues = new Set(values.filter(v => v != null));
    return uniqueValues.size > 1 && values[index] != null;
  };

  const specs: Array<{
    label: string;
    values: (string | number | null)[];
    icon: React.ReactNode;
    isDifferent: (index: number) => boolean;
    highlight?: "best" | "worst";
    isBest?: (index: number) => boolean;
  }> = [];

  const categoryValues = allValues("category");
  if (hasVariation(categoryValues)) {
    specs.push({
      label: "Category",
      values: categoryValues,
      icon: <TrendingUp className="h-4 w-4 text-accent" />,
      isDifferent: isDifferent(categoryValues),
    });
  }

  const flexValues = allValues("flex_category");
  if (hasVariation(flexValues)) {
    specs.push({
      label: "Shaft Flex",
      values: flexValues,
      icon: <TrendingUp className="h-4 w-4 text-accent" />,
      isDifferent: isDifferent(flexValues),
    });
  }

  const weightValues = allValues("weight_grams");
  if (hasVariation(weightValues)) {
    const numericWeights = weightValues.map(w => typeof w === "number" ? w : null);
    const minWeight = Math.min(...numericWeights.filter(w => w !== null) as number[]);
    specs.push({
      label: "Weight (grams)",
      values: weightValues.map(w => w ? `${w}g` : "-"),
      icon: <Weight className="h-4 w-4 text-gold" />,
      isDifferent: isDifferent(weightValues),
      highlight: "best",
      isBest: (i) => numericWeights[i] === minWeight,
    });
  }

  const gripValues = allValues("grip_size");
  if (hasVariation(gripValues)) {
    specs.push({
      label: "Grip Size",
      values: gripValues,
      icon: <Ruler className="h-4 w-4 text-accent" />,
      isDifferent: isDifferent(gripValues),
    });
  }

  const priceValues = allValues("price_usd");
  if (hasVariation(priceValues)) {
    const numericPrices = priceValues.map(p => typeof p === "number" ? p : null);
    const minPrice = Math.min(...numericPrices.filter(p => p !== null) as number[]);
    specs.push({
      label: "Price",
      values: priceValues.map(p => p ? `$${p}` : "-"),
      icon: <span className="text-gold font-bold text-sm">$</span>,
      isDifferent: isDifferent(priceValues),
      highlight: "best",
      isBest: (i) => numericPrices[i] === minPrice,
    });
  }

  return specs;
}