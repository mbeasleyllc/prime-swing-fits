import type { NextApiRequest, NextApiResponse} from "next";
import { createClient } from "@/integrations/supabase/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { swing_speed, spin_preference, compression } = req.query;
    
    const supabase = createClient();
    
    let query = supabase
      .from("products")
      .select("*")
      .eq("category", "golf_balls")
      .eq("is_active", true);

    // Apply filters if provided
    // These would match against specifications JSON field
    
    const { data: balls, error } = await query.limit(20);

    if (error) {
      console.error("Error fetching golf balls:", error);
      return res.status(500).json({ error: "Failed to fetch golf balls" });
    }

    return res.status(200).json({ balls: balls || [] });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}