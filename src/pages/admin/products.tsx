import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Plus, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  category: string;
  brand: string;
  model_name: string;
  flex_category: string;
  weight_grams: number;
  grip_size: string;
  price_usd: number;
  affiliate_url: string;
  image_url: string;
}

export default function AdminProducts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: "",
    brand: "",
    model_name: "",
    flex_category: "",
    weight_grams: 0,
    grip_size: "",
    price_usd: 0,
    affiliate_url: "",
    image_url: "",
  });

  useEffect(() => {
    if (!user) return;
    loadProducts();
  }, [user]);

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("category");

    if (data) {
      setProducts(data);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProduct) {
      const { error } = await supabase
        .from("products")
        .update(formData)
        .eq("id", editingProduct.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update product",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Product Updated",
        description: "Product updated successfully",
      });
    } else {
      const { error } = await supabase.from("products").insert([formData]);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create product",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Product Created",
        description: "New product created successfully",
      });
    }

    setIsDialogOpen(false);
    setEditingProduct(null);
    setFormData({
      category: "",
      brand: "",
      model_name: "",
      flex_category: "",
      weight_grams: 0,
      grip_size: "",
      price_usd: 0,
      affiliate_url: "",
      image_url: "",
    });
    loadProducts();
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      category: product.category,
      brand: product.brand,
      model_name: product.model_name,
      flex_category: product.flex_category,
      weight_grams: product.weight_grams,
      grip_size: product.grip_size,
      price_usd: product.price_usd,
      affiliate_url: product.affiliate_url,
      image_url: product.image_url,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingProductId) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", deletingProductId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Product Deleted",
      description: "Product removed successfully",
    });

    setIsDeleteDialogOpen(false);
    setDeletingProductId(null);
    loadProducts();
  };

  const openDeleteDialog = (productId: string) => {
    setDeletingProductId(productId);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <ProtectedRoute adminOnly>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <Skeleton className="h-12 w-64 mb-8" />
            <Skeleton className="h-96" />
          </div>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute adminOnly>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Product Catalog</h1>
              <p className="text-muted-foreground">Manage recommended products</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/admin">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Link>
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => {
                    setEditingProduct(null);
                    setFormData({
                      category: "",
                      brand: "",
                      model_name: "",
                      flex_category: "",
                      weight_grams: 0,
                      grip_size: "",
                      price_usd: 0,
                      affiliate_url: "",
                      image_url: "",
                    });
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="brand">Brand</Label>
                        <Input
                          id="brand"
                          value={formData.brand}
                          onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model_name">Model Name</Label>
                      <Input
                        id="model_name"
                        value={formData.model_name}
                        onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="flex_category">Flex Category</Label>
                        <Input
                          id="flex_category"
                          value={formData.flex_category}
                          onChange={(e) => setFormData({ ...formData, flex_category: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight_grams">Weight (grams)</Label>
                        <Input
                          id="weight_grams"
                          type="number"
                          value={formData.weight_grams}
                          onChange={(e) => setFormData({ ...formData, weight_grams: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="grip_size">Grip Size</Label>
                        <Input
                          id="grip_size"
                          value={formData.grip_size}
                          onChange={(e) => setFormData({ ...formData, grip_size: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price_usd">Price (USD)</Label>
                        <Input
                          id="price_usd"
                          type="number"
                          step="0.01"
                          value={formData.price_usd}
                          onChange={(e) => setFormData({ ...formData, price_usd: parseFloat(e.target.value) })}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="affiliate_url">Affiliate URL</Label>
                      <Input
                        id="affiliate_url"
                        type="url"
                        value={formData.affiliate_url}
                        onChange={(e) => setFormData({ ...formData, affiliate_url: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image_url">Image URL</Label>
                      <Input
                        id="image_url"
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      />
                    </div>
                    <DialogFooter>
                      <Button type="submit">{editingProduct ? "Update Product" : "Create Product"}</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Flex</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No products in catalog yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="capitalize">{product.category}</TableCell>
                        <TableCell>{product.brand}</TableCell>
                        <TableCell>{product.model_name}</TableCell>
                        <TableCell>{product.flex_category || "N/A"}</TableCell>
                        <TableCell>${product.price_usd}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => openDeleteDialog(product.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Product</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this product? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Footer />
      </div>
    </ProtectedRoute>
  );
}