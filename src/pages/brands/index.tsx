import { useState, useEffect } from "react";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/database.types";

type Product = Database["public"]["Tables"]["products"]["Row"];

interface BrandData {
  name: string;
  productCount: number;
  categories: string[];
  priceRange: { min: number; max: number };
  sampleProducts: Product[];
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<BrandData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrands();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      setFilteredBrands(brands.filter(b => b.name.toLowerCase().includes(query)));
    } else {
      setFilteredBrands(brands);
    }
  }, [searchQuery, brands]);

  async function loadBrands() {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("brand", { ascending: true });

      if (error) throw error;

      const productsByBrand = (data ?? []).reduce((acc, product) => {
        const brandName = product.brand || "Unknown";
        if (!acc[brandName]) {
          acc[brandName] = [];
        }
        acc[brandName].push(product);
        return acc;
      }, {} as Record<string, Product[]>);

      const brandDataArray = Object.entries(productsByBrand).map(([name, products]) => {
        const prices = products.map(p => p.price_usd ?? 0).filter(p => p > 0);
        const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean))) as string[];
        
        return {
          name,
          productCount: products.length,
          categories: categories.sort(),
          priceRange: {
            min: Math.min(...prices),
            max: Math.max(...prices)
          },
          sampleProducts: products.slice(0, 3)
        };
      });

      setBrands(brandDataArray);
      setFilteredBrands(brandDataArray);
    } catch (error) {
      console.error("Error loading brands:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <SEO 
        title="Golf Club Brands | Premium Manufacturers"
        description="Browse golf clubs by manufacturer. Explore premium brands like TaylorMade, Callaway, Titleist, Ping, and more."
      />
      <Navigation />
      
      <main className="min-h-screen bg-background pt-20">
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Browse by Brand</h1>
              <p className="text-lg text-muted-foreground">
                Explore premium golf equipment from the world's leading manufacturers
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-8 bg-muted rounded w-2/3" />
                      <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-32 bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredBrands.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No brands found.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredBrands.map(brand => (
                  <Card key={brand.name} className="hover:border-accent transition-all group">
                    <CardHeader>
                      <CardTitle className="text-2xl group-hover:text-accent transition-colors">
                        {brand.name}
                      </CardTitle>
                      <CardDescription>
                        {brand.productCount} {brand.productCount === 1 ? "club" : "clubs"} available
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Categories</h4>
                        <div className="flex flex-wrap gap-1">
                          {brand.categories.map(cat => (
                            <Badge key={cat} variant="secondary" className="text-xs">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-2">Price Range</h4>
                        <p className="text-muted-foreground">
                          ${brand.priceRange.min.toFixed(0)} - ${brand.priceRange.max.toFixed(0)}
                        </p>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="grid grid-cols-3 gap-2">
                          {brand.sampleProducts.map(product => (
                            <Link 
                              key={product.id} 
                              href={`/clubs/${product.id}`}
                              className="aspect-square rounded-md overflow-hidden bg-muted hover:ring-2 hover:ring-accent transition-all"
                            >
                              {product.image_url && (
                                <img
                                  src={product.image_url}
                                  alt={`${product.brand} ${product.model_name}`}
                                  className="object-cover w-full h-full"
                                />
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>

                      <Link 
                        href={`/clubs?brand=${encodeURIComponent(brand.name)}`}
                        className="block text-center text-sm font-medium text-accent hover:underline mt-4"
                      >
                        View All {brand.name} Clubs →
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}