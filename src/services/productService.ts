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

export async function searchProducts(query: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .or(`brand.ilike.%${query}%,model_name.ilike.%${query}%`)
    .order("brand", { ascending: true })
    .order("model_name", { ascending: true })
    .limit(20);

  if (error) throw error;
  return data ?? [];
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

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}