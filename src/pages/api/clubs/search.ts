import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/integrations/supabase/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { category, specifications } = req.query;
    
    const supabase = createClient();
    
    let query = supabase
      .from("products")
      .select("*")
      .eq("is_active", true);

    // Filter by category if provided
    if (category && typeof category === "string") {
      query = query.eq("category", category);
    }

    // If specifications provided, filter by matching specs
    // specifications should be a JSON string of key-value pairs
    if (specifications && typeof specifications === "string") {
      try {
        const specs = JSON.parse(specifications);
        // Add spec matching logic here based on your needs
        // For now, just return all products in category
      } catch (e) {
        console.error("Failed to parse specifications:", e);
      }
    }

    const { data: products, error } = await query.limit(50);

    if (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ error: "Failed to fetch products" });
    }

    return res.status(200).json({ products: products || [] });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}