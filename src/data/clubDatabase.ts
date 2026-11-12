/**
 * DEPRECATED: Club data has been moved to the database (products table)
 * 
 * Use the productService instead:
 * 
 * import { searchClubs } from "@/lib/productService";
 * 
 * const clubs = await searchClubs({ category: "driver" });
 * 
 * This file is kept for backward compatibility but returns empty arrays.
 * All product data should be managed through the Supabase products table.
 */

export const CLUB_DATABASE: any[] = [];

export function searchClubsBySpecifications(specifications: Record<string, any>): any[] {
  console.warn("searchClubsBySpecifications is deprecated. Use productService.searchClubs() instead.");
  return [];
}

export function getClubsByCategory(category: string): any[] {
  console.warn("getClubsByCategory is deprecated. Use productService.searchClubs({ category }) instead.");
  return [];
}

// Legacy exports for backward compatibility
export const drivers: any[] = [];
export const fairwayWoods: any[] = [];
export const hybrids: any[] = [];
export const irons: any[] = [];
export const wedges: any[] = [];
export const putters: any[] = [];