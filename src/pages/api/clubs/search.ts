import type { NextApiRequest, NextApiResponse } from "next";
import { supabase } from "@/integrations/supabase/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { category, shaft_flex, head_style } = req.query;

    let query = supabase
      .from("products")
      .select("*")
      .eq("status", "active");

    if (category) {
      query = query.eq("category", category);
    }

    if (shaft_flex) {
      query = query.contains("specifications", { shaft_flex });
    }

    if (head_style) {
      query = query.contains("specifications", { head_style });
    }

    const { data, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }

    return res.status(200).json({ products: data || [] });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}