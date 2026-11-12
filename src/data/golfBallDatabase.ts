/**
 * DEPRECATED: Golf ball data has been moved to the database (products table)
 * 
 * Use the productService instead:
 * 
 * import { searchGolfBalls } from "@/lib/productService";
 * 
 * const balls = await searchGolfBalls({ swing_speed: "95-105" });
 * 
 * This file is kept for backward compatibility but returns empty arrays.
 * All product data should be managed through the Supabase products table.
 */

export const GOLF_BALL_DATABASE: any[] = [];

export function searchGolfBallsBySwingSpeed(swingSpeed: string): any[] {
  console.warn("searchGolfBallsBySwingSpeed is deprecated. Use productService.searchGolfBalls() instead.");
  return [];
}

export function getRecommendedGolfBalls(criteria: Record<string, any>): any[] {
  console.warn("getRecommendedGolfBalls is deprecated. Use productService.searchGolfBalls() instead.");
  return [];
}

// Legacy exports for backward compatibility
export const tourBalls: any[] = [];
export const distanceBalls: any[] = [];
export const valueBalls: any[] = [];