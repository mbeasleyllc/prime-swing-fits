import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/database.types";

type Product = Database["public"]["Tables"]["products"]["Row"];

export async function fetchProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("brand", { ascending: true })
    .order("model_name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function searchProducts(query: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .or(`brand.ilike.%${query}%,model_name.ilike.%${query}%`)
    .order("brand", { ascending: true })
    .order("model_name", { ascending: true })
    .limit(20);

  if (error) throw error;
  
  // Fallback to local database if Supabase returns no results
  if (!data || data.length === 0) {
    return searchClubsLocal(query);
  }
  
  return data;
}

export async function getProductsByCategory(category: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category", category)
    .order("brand", { ascending: true })
    .order("model_name", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// Product matching service for recommendations
export async function matchProductsForRecommendation(
  category: string,
  specifications: Record<string, any>
): Promise<any[]> {
  try {
    const response = await fetch(`/api/clubs/search?category=${category}`);
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error("Error matching products:", error);
    return [];
  }
}

export async function getClubsByCategory(category: string): Promise<any[]> {
  return matchProductsForRecommendation(category, {});
}

export async function searchClubsLocal(specs: Record<string, any>): Promise<any[]> {
  const category = specs.category || "";
  return matchProductsForRecommendation(category, specs);
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}