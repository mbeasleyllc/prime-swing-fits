import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Share2, ExternalLink, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/database.types";

type Product = Database["public"]["Tables"]["products"]["Row"];

const CATEGORIES = ["Driver", "Fairway Wood", "Hybrid", "Irons", "Wedge", "Putter"];

export default function ClubDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCategory, setIsCategory] = useState(false);
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (id) {
      const categoryName = CATEGORIES.find(cat => cat.toLowerCase().replace(/\s+/g, "-") === id);
      if (categoryName) {
        setIsCategory(true);
        loadCategoryProducts(categoryName);
      } else {
        setIsCategory(false);
        loadProduct(id as string);
      }
    }
  }, [id]);

  async function loadProduct(productId: string) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (error) throw error;

      setProduct(data);

      if (data.category) {
        const { data: related } = await supabase
          .from("products")
          .select("*")
          .eq("category", data.category)
          .neq("id", productId)
          .limit(4);

        setRelatedProducts(related ?? []);
      }
    } catch (error) {
      console.error("Error loading product:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategoryProducts(category: string) {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", category)
        .order("brand", { ascending: true })
        .order("model_name", { ascending: true });

      if (error) throw error;

      setCategoryProducts(data ?? []);
    } catch (error) {
      console.error("Error loading category:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleShare() {
    if (navigator.share && product) {
      navigator.share({
        title: `${product.brand} ${product.model_name}`,
        url: window.location.href
      });
    }
  }

  function addToComparison() {
    if (!product) return;
    
    const stored = localStorage.getItem("comparison");
    const comparison = stored ? JSON.parse(stored) : [];
    
    if (!comparison.find((p: Product) => p.id === product.id)) {
      comparison.push(product);
      localStorage.setItem("comparison", JSON.stringify(comparison));
      router.push("/clubs/compare");
    }
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background pt-20">
          <div className="container mx-auto px-4 py-12">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-1/3" />
              <div className="h-64 bg-muted rounded" />
              <div className="h-32 bg-muted rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (isCategory) {
    const categoryName = CATEGORIES.find(cat => cat.toLowerCase().replace(/\s+/g, "-") === id);
    
    return (
      <>
        <SEO 
          title={`${categoryName} | Prime Swing Fits`}
          description={`Browse our selection of premium ${categoryName?.toLowerCase()}.`}
        />
        <Navigation />
        <main className="min-h-screen bg-background pt-20">
          <section className="py-12">
            <div className="container mx-auto px-4">
              <div className="mb-8">
                <Link href="/clubs">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Catalog
                  </Button>
                </Link>
              </div>

              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">{categoryName}</h1>
                <p className="text-muted-foreground">
                  {categoryProducts.length} {categoryProducts.length === 1 ? "club" : "clubs"} available
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categoryProducts.map(prod => (
                  <Link key={prod.id} href={`/clubs/${prod.id}`}>
                    <Card className="h-full hover:border-accent transition-all group">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="group-hover:text-accent transition-colors">
                              {prod.brand}
                            </CardTitle>
                            <CardDescription>{prod.model_name}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
                          {prod.image_url && (
                            <img
                              src={prod.image_url}
                              alt={`${prod.brand} ${prod.model_name}`}
                              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                            />
                          )}
                        </div>
                        <div className="mt-4 space-y-2">
                          {prod.flex_category && (
                            <div className="text-sm text-muted-foreground">
                              Flex: <span className="font-medium text-foreground">{prod.flex_category}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center">
                            <span className="text-2xl font-bold text-accent">
                              ${prod.price_usd?.toFixed(2)}
                            </span>
                            <Button size="sm">View Details</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navigation />
        <main className="min-h-screen bg-background pt-20">
          <div className="container mx-auto px-4 py-12 text-center">
            <h1 className="text-2xl font-bold mb-4">Club Not Found</h1>
            <Link href="/clubs">
              <Button>Browse Catalog</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO 
        title={`${product.brand} ${product.model_name} | Prime Swing Fits`}
        description={`Premium ${product.category?.toLowerCase()} from ${product.brand}. ${product.recommended_for?.[0] || ""}`}
        image={product.image_url || undefined}
      />
      <Navigation />
      
      <main className="min-h-screen bg-background pt-20">
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <Link href="/clubs">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Catalog
                </Button>
              </Link>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-4">
                <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={`${product.brand} ${product.model_name}`}
                      className="object-cover w-full h-full"
                    />
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleShare} className="flex-1">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button variant="outline" size="sm" onClick={addToComparison} className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Compare
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold">{product.brand}</h1>
                      <p className="text-xl text-muted-foreground mt-1">{product.model_name}</p>
                    </div>
                    {product.category && (
                      <Badge className="text-sm">{product.category}</Badge>
                    )}
                  </div>
                  <div className="text-4xl font-bold text-accent mt-4">
                    ${product.price_usd?.toFixed(2)}
                  </div>
                </div>

                <Tabs defaultValue="specs">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="specs">Specifications</TabsTrigger>
                    <TabsTrigger value="recommended">Recommended For</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="specs" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Technical Specs</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {product.category && (
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Category</span>
                            <span className="font-medium">{product.category}</span>
                          </div>
                        )}
                        {product.flex_category && (
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Flex</span>
                            <span className="font-medium">{product.flex_category}</span>
                          </div>
                        )}
                        {product.weight_grams && (
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Weight</span>
                            <span className="font-medium">{product.weight_grams}g</span>
                          </div>
                        )}
                        {product.grip_size && (
                          <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Grip Size</span>
                            <span className="font-medium">{product.grip_size}</span>
                          </div>
                        )}
                        <div className="flex justify-between py-2">
                          <span className="text-muted-foreground">Brand</span>
                          <span className="font-medium">{product.brand}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="recommended" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Ideal For</CardTitle>
                        <CardDescription>
                          This club is recommended for the following player profiles
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {product.recommended_for && product.recommended_for.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {product.recommended_for.map((rec, i) => (
                              <Badge key={i} variant="secondary" className="text-sm">
                                {rec}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">
                            Suitable for all skill levels
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {product.affiliate_url && (
                  <Button size="lg" className="w-full" asChild>
                    <a href={product.affiliate_url} target="_blank" rel="noopener noreferrer">
                      Buy Now
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {relatedProducts.length > 0 && (
              <section className="mt-16">
                <h2 className="text-2xl font-bold mb-6">Similar {product.category}</h2>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  {relatedProducts.map(related => (
                    <Link key={related.id} href={`/clubs/${related.id}`}>
                      <Card className="h-full hover:border-accent transition-all group">
                        <CardHeader>
                          <CardTitle className="text-base group-hover:text-accent transition-colors">
                            {related.brand}
                          </CardTitle>
                          <CardDescription className="text-sm">{related.model_name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="aspect-video relative overflow-hidden rounded-lg bg-muted">
                            {related.image_url && (
                              <img
                                src={related.image_url}
                                alt={`${related.brand} ${related.model_name}`}
                                className="object-cover w-full h-full"
                              />
                            )}
                          </div>
                          <div className="mt-4 flex justify-between items-center">
                            <span className="text-xl font-bold text-accent">
                              ${related.price_usd?.toFixed(2)}
                            </span>
                            <Button size="sm" variant="ghost">View</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

// Force server-side rendering (skip static generation at build time)
export async function getServerSideProps() {
  return {
    props: {},
  };
}