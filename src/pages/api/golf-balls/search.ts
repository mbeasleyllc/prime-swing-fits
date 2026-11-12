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
    const { swing_speed, compression } = req.query;

    let query = supabase
      .from("products")
      .select("*")
      .eq("category", "golf_ball");

    if (swing_speed && typeof swing_speed === "string") {
      query = query.contains("specifications", { optimal_speed: swing_speed });
    }

    if (compression && typeof compression === "string") {
      query = query.contains("specifications", { compression });
    }

    const { data, error } = await query.limit(20);

    if (error) {
      console.error("Database error:", error);
      return res.status(500).json({ error: "Database query failed" });
    }

    return res.status(200).json({ balls: data || [] });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}