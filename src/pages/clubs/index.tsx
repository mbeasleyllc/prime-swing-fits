import { useState, useEffect } from "react";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, Grid3x3, List } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/database.types";

type Product = Database["public"]["Tables"]["products"]["Row"];

const CATEGORIES = ["Driver", "Fairway Wood", "Hybrid", "Irons", "Wedge", "Putter"];
const FLEX_OPTIONS = ["L", "A", "R", "S", "X"];

export default function ClubsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [selectedFlex, setSelectedFlex] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchQuery, selectedCategory, selectedBrand, selectedFlex, priceRange]);

  async function loadProducts() {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("brand", { ascending: true })
        .order("model_name", { ascending: true });

      if (error) throw error;

      const productData = data ?? [];
      setProducts(productData);

      const uniqueBrands = Array.from(new Set(productData.map(p => p.brand).filter(Boolean))) as string[];
      setBrands(uniqueBrands.sort());
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.brand?.toLowerCase().includes(query) ||
        p.model_name?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (selectedBrand !== "all") {
      filtered = filtered.filter(p => p.brand === selectedBrand);
    }

    if (selectedFlex !== "all") {
      filtered = filtered.filter(p => p.flex_category === selectedFlex);
    }

    if (priceRange !== "all") {
      filtered = filtered.filter(p => {
        const price = p.price_usd ?? 0;
        switch (priceRange) {
          case "under-200": return price < 200;
          case "200-400": return price >= 200 && price < 400;
          case "400-600": return price >= 400 && price < 600;
          case "over-600": return price >= 600;
          default: return true;
        }
      });
    }

    setFilteredProducts(filtered);
  }

  function clearFilters() {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedBrand("all");
    setSelectedFlex("all");
    setPriceRange("all");
  }

  const hasActiveFilters = searchQuery || selectedCategory !== "all" || selectedBrand !== "all" || selectedFlex !== "all" || priceRange !== "all";

  return (
    <>
      <SEO 
        title="Golf Club Catalog | Browse Premium Golf Equipment"
        description="Browse our comprehensive catalog of premium golf clubs from top brands. Find drivers, irons, wedges, putters and more."
      />
      <Navigation />
      
      <main className="min-h-screen bg-background pt-20">
        <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Club Catalog</h1>
              <p className="text-lg text-muted-foreground">
                Discover premium golf clubs from the world's leading manufacturers
              </p>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="mb-8 space-y-6">
              <div className="relative max-w-2xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search clubs, brands, or models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {brands.map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedFlex} onValueChange={setSelectedFlex}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Flex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Flex</SelectItem>
                    {FLEX_OPTIONS.map(flex => (
                      <SelectItem key={flex} value={flex}>{flex}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={priceRange} onValueChange={setPriceRange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="under-200">Under $200</SelectItem>
                    <SelectItem value="200-400">$200 - $400</SelectItem>
                    <SelectItem value="400-600">$400 - $600</SelectItem>
                    <SelectItem value="over-600">Over $600</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2 ml-auto">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-accent" : ""}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-accent" : ""}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {filteredProducts.length} {filteredProducts.length === 1 ? "club" : "clubs"} found
                  </span>
                </div>
              )}
            </div>

            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4" />
                      <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No clubs found matching your filters.</p>
                <Button variant="outline" onClick={clearFilters} className="mt-4">
                  Clear Filters
                </Button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map(product => (
                  <Link key={product.id} href={`/clubs/${product.id}`}>
                    <Card className="h-full hover:border-accent transition-all group">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="group-hover:text-accent transition-colors">
                              {product.brand}
                            </CardTitle>
                            <CardDescription>{product.model_name}</CardDescription>
                          </div>
                          {product.category && (
                            <Badge variant="secondary">{product.category}</Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
                          {product.image_url && (
                            <img
                              src={product.image_url}
                              alt={`${product.brand} ${product.model_name}`}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
                        </div>
                        <div className="mt-4 space-y-2">
                          {product.flex_category && (
                            <div className="text-sm text-muted-foreground">
                              Flex: <span className="font-medium text-foreground">{product.flex_category}</span>
                            </div>
                          )}
                          {product.recommended_for && product.recommended_for.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {product.recommended_for.slice(0, 2).map((rec, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {rec}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-accent">
                          ${product.price_usd?.toFixed(2)}
                        </span>
                        <Button size="sm">View Details</Button>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map(product => (
                  <Link key={product.id} href={`/clubs/${product.id}`}>
                    <Card className="hover:border-accent transition-all group">
                      <CardContent className="p-6">
                        <div className="flex gap-6">
                          <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                            {product.image_url && (
                              <img
                                src={product.image_url}
                                alt={`${product.brand} ${product.model_name}`}
                                className="object-cover w-full h-full"
                              />
                            )}
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-xl font-bold group-hover:text-accent transition-colors">
                                  {product.brand} {product.model_name}
                                </h3>
                                <p className="text-muted-foreground">{product.category}</p>
                              </div>
                              <span className="text-2xl font-bold text-accent">
                                ${product.price_usd?.toFixed(2)}
                              </span>
                            </div>
                            {product.recommended_for && product.recommended_for.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {product.recommended_for.map((rec, i) => (
                                  <Badge key={i} variant="outline">
                                    {rec}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              {product.flex_category && (
                                <span>Flex: {product.flex_category}</span>
                              )}
                              {product.weight_grams && (
                                <span>Weight: {product.weight_grams}g</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
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