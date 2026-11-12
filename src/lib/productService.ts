/**
 * Product service for fetching club and golf ball data
 * Replaces static imports from clubDatabase.ts and golfBallDatabase.ts
 */

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  specifications: Record<string, any>;
  image_url?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClubSearchParams {
  category?: string;
  specifications?: Record<string, any>;
  limit?: number;
}

export interface GolfBallSearchParams {
  swing_speed?: string;
  spin_preference?: string;
  compression?: number;
  limit?: number;
}

/**
 * Search for clubs matching criteria
 */
export async function searchClubs(params: ClubSearchParams = {}): Promise<Product[]> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.category) {
      queryParams.append("category", params.category);
    }
    
    if (params.specifications) {
      queryParams.append("specifications", JSON.stringify(params.specifications));
    }

    const response = await fetch(`/api/clubs/search?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch clubs: ${response.statusText}`);
    }

    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error("Error searching clubs:", error);
    return [];
  }
}

/**
 * Search for golf balls matching criteria
 */
export async function searchGolfBalls(params: GolfBallSearchParams = {}): Promise<Product[]> {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.swing_speed) {
      queryParams.append("swing_speed", params.swing_speed);
    }
    
    if (params.spin_preference) {
      queryParams.append("spin_preference", params.spin_preference);
    }
    
    if (params.compression) {
      queryParams.append("compression", params.compression.toString());
    }

    const response = await fetch(`/api/golf-balls/search?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch golf balls: ${response.statusText}`);
    }

    const data = await response.json();
    return data.balls || [];
  } catch (error) {
    console.error("Error searching golf balls:", error);
    return [];
  }
}

/**
 * Get a single product by ID
 */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    // This would need a dedicated API route
    // For now, search and filter
    const products = await searchClubs({});
    return products.find(p => p.id === id) || null;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}