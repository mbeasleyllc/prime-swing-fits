export interface GolfBall {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  price_per_dozen: number;
  image_url: string | null;
  overall_rating: number;
  construction: string;
  compression: number;
  spin_rate: "Low" | "Medium-Low" | "Medium" | "Medium-High" | "High";
  driver_spin: number;
  iron_spin: number;
  wedge_spin: number;
  distance: number; // 1-10
  control: number; // 1-10
  spin: number; // 1-10
  feel: number; // 1-10
  durability: number; // 1-10
  greenside_control: number; // 1-10
  wind_performance: number; // 1-10
  layers: number;
  cover_material: "Urethane" | "Ionomer" | "Surlyn";
  dimple_count: number;
  swing_speed_range: string[];
  best_for: string[];
  recommended_for: string[];
}

export const GOLF_BALL_DATABASE: GolfBall[] = [
  {
    id: "ball-titleist-prov1",
    name: "Pro V1",
    manufacturer: "Titleist",
    category: "Golf Ball",
    price_per_dozen: 55,
    image_url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=400&auto=format&fit=crop",
    overall_rating: 4.9,
    construction: "3-Piece",
    compression: 90,
    spin_rate: "High",
    driver_spin: 2400,
    iron_spin: 6500,
    wedge_spin: 9500,
    distance: 9,
    control: 10,
    spin: 10,
    feel: 9,
    durability: 9,
    greenside_control: 10,
    wind_performance: 9,
    layers: 3,
    cover_material: "Urethane",
    dimple_count: 388,
    swing_speed_range: ["medium", "high"],
    best_for: ["Maximum greenside control", "Tour-level spin", "Premium feel"],
    recommended_for: ["Tour Performance", "All-Around Excellence", "0-20 handicap"],
  },
  {
    id: "ball-titleist-prov1x",
    name: "Pro V1x",
    manufacturer: "Titleist",
    category: "Golf Ball",
    price_per_dozen: 55,
    image_url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=400&auto=format&fit=crop",
    overall_rating: 4.9,
    construction: "4-Piece",
    compression: 100,
    spin_rate: "Medium-High",
    driver_spin: 2200,
    iron_spin: 6800,
    wedge_spin: 9800,
    distance: 10,
    control: 10,
    spin: 9,
    feel: 8,
    durability: 9,
    greenside_control: 10,
    wind_performance: 10,
    layers: 4,
    cover_material: "Urethane",
    dimple_count: 348,
    swing_speed_range: ["high"],
    best_for: ["Maximum distance", "Penetrating ball flight", "Fast swing speeds"],
    recommended_for: ["High Swing Speed", "Low Spin Distance", "0-15 handicap"],
  },
  {
    id: "ball-callaway-chrome-soft",
    name: "Chrome Soft",
    manufacturer: "Callaway",
    category: "Golf Ball",
    price_per_dozen: 50,
    image_url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=400&auto=format&fit=crop",
    overall_rating: 4.7,
    construction: "4-Piece",
    compression: 75,
    spin_rate: "Medium-High",
    driver_spin: 2300,
    iron_spin: 6400,
    wedge_spin: 9200,
    distance: 9,
    control: 9,
    spin: 9,
    feel: 10,
    durability: 8,
    greenside_control: 9,
    wind_performance: 8,
    layers: 4,
    cover_material: "Urethane",
    dimple_count: 332,
    swing_speed_range: ["low", "medium"],
    best_for: ["Soft compression", "Versatile performance", "Excellent feel"],
    recommended_for: ["Soft Feel Distance", "Mid-Handicap", "5-20 handicap"],
  },
  {
    id: "ball-taylormade-tp5",
    name: "TP5",
    manufacturer: "TaylorMade",
    category: "Golf Ball",
    price_per_dozen: 50,
    image_url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=400&auto=format&fit=crop",
    overall_rating: 4.8,
    construction: "5-Piece",
    compression: 85,
    spin_rate: "High",
    driver_spin: 2350,
    iron_spin: 6600,
    wedge_spin: 9600,
    distance: 9,
    control: 10,
    spin: 10,
    feel: 9,
    durability: 9,
    greenside_control: 10,
    wind_performance: 9,
    layers: 5,
    cover_material: "Urethane",
    dimple_count: 322,
    swing_speed_range: ["medium", "high"],
    best_for: ["5-layer performance", "Tour spin", "Premium control"],
    recommended_for: ["Complete Performance", "5-Layer Technology", "0-18 handicap"],
  },
  {
    id: "ball-taylormade-tp5x",
    name: "TP5x",
    manufacturer: "TaylorMade",
    category: "Golf Ball",
    price_per_dozen: 50,
    image_url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=400&auto=format&fit=crop",
    overall_rating: 4.8,
    construction: "5-Piece",
    compression: 97,
    spin_rate: "Medium-High",
    driver_spin: 2150,
    iron_spin: 6800,
    wedge_spin: 9800,
    distance: 10,
    control: 10,
    spin: 9,
    feel: 8,
    durability: 9,
    greenside_control: 10,
    wind_performance: 10,
    layers: 5,
    cover_material: "Urethane",
    dimple_count: 322,
    swing_speed_range: ["high"],
    best_for: ["Maximum carry distance", "Low driver spin", "Firm feel"],
    recommended_for: ["Maximum Distance", "Fast Swing Speed", "0-15 handicap"],
  },
  {
    id: "ball-srixon-z-star",
    name: "Z-Star",
    manufacturer: "Srixon",
    category: "Golf Ball",
    price_per_dozen: 45,
    image_url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=400&auto=format&fit=crop",
    overall_rating: 4.6,
    construction: "3-Piece",
    compression: 88,
    spin_rate: "High",
    driver_spin: 2400,
    iron_spin: 6700,
    wedge_spin: 9700,
    distance: 8,
    control: 10,
    spin: 10,
    feel: 9,
    durability: 8,
    greenside_control: 10,
    wind_performance: 9,
    layers: 3,
    cover_material: "Urethane",
    dimple_count: 338,
    swing_speed_range: ["medium"],
    best_for: ["Best value urethane", "High spin control", "Soft feel"],
    recommended_for: ["Tour Spin Value", "Best Value Premium", "3-18 handicap"],
  },
  {
    id: "ball-srixon-z-star-xv",
    name: "Z-Star XV",
    manufacturer: "Srixon",
    category: "Golf Ball",
    price_per_dozen: 45,
    image_url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=400&auto=format&fit=crop",
    overall_rating: 4.6,
    construction: "4-Piece",
    compression: 102,
    spin_rate: "Medium-High",
    driver_spin: 2100,
    iron_spin: 6900,
    wedge_spin: 9900,
    distance: 9,
    control: 10,
    spin: 9,
    feel: 8,
    durability: 9,
    greenside_control: 10,
    wind_performance: 10,
    layers: 4,
    cover_material: "Urethane",
    dimple_count: 338,
    swing_speed_range: ["high"],
    best_for: ["Long distance", "Value premium ball", "Penetrating flight"],
    recommended_for: ["Distance Value", "Fast Swing", "0-15 handicap"],
  },
  {
    id: "ball-bridgestone-tour-bx",
    name: "Tour B X",
    manufacturer: "Bridgestone",
    category: "Golf Ball",
    price_per_dozen: 48,
    image_url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=400&auto=format&fit=crop",
    overall_rating: 4.7,
    construction: "3-Piece",
    compression: 105,
    spin_rate: "Medium",
    driver_spin: 2000,
    iron_spin: 6500,
    wedge_spin: 9400,
    distance: 10,
    control: 9,
    spin: 8,
    feel: 7,
    durability: 9,
    greenside_control: 9,
    wind_performance: 10,
    layers: 3,
    cover_material: "Urethane",
    dimple_count: 330,
    swing_speed_range: ["high"],
    best_for: ["Maximum distance", "Low driver spin", "Tiger's choice"],
    recommended_for: ["Distance & Control Balance", "Fast Swing", "0-15 handicap"],
  },
  {
    id: "ball-bridgestone-tour-bxs",
    name: "Tour B XS",
    manufacturer: "Bridgestone",
    category: "Golf Ball",
    price_per_dozen: 48,
    image_url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=400&auto=format&fit=crop",
    overall_rating: 4.7,
    construction: "3-Piece",
    compression: 90,
    spin_rate: "High",
    driver_spin: 2300,
    iron_spin: 6600,
    wedge_spin: 9600,
    distance: 9,
    control: 10,
    spin: 10,
    feel: 9,
    durability: 8,
    greenside_control: 10,
    wind_performance: 9,
    layers: 3,
    cover_material: "Urethane",
    dimple_count: 330,
    swing_speed_range: ["medium"],
    best_for: ["Soft feel", "High greenside spin", "Tour control"],
    recommended_for: ["Tour Feel", "Moderate Swing", "3-18 handicap"],
  },
  {
    id: "ball-callaway-chrome-soft-x",
    name: "Chrome Soft X",
    manufacturer: "Callaway",
    category: "Golf Ball",
    price_per_dozen: 50,
    image_url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=400&auto=format&fit=crop",
    overall_rating: 4.7,
    construction: "4-Piece",
    compression: 90,
    spin_rate: "Medium-High",
    driver_spin: 2200,
    iron_spin: 6700,
    wedge_spin: 9500,
    distance: 10,
    control: 10,
    spin: 9,
    feel: 8,
    durability: 9,
    greenside_control: 10,
    wind_performance: 9,
    layers: 4,
    cover_material: "Urethane",
    dimple_count: 332,
    swing_speed_range: ["medium", "high"],
    best_for: ["Tour-level distance", "Workability", "Firmer compression"],
    recommended_for: ["Firm Feel Distance", "Better Players", "0-15 handicap"],
  },
  {
    id: "ball-titleist-avx",
    name: "AVX",
    manufacturer: "Titleist",
    category: "Golf Ball",
    price_per_dozen: 50,
    image_url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=400&auto=format&fit=crop",
    overall_rating: 4.5,
    construction: "3-Piece",
    compression: 80,
    spin_rate: "Medium-Low",
    driver_spin: 2100,
    iron_spin: 5800,
    wedge_spin: 8500,
    distance: 9,
    control: 8,
    spin: 7,
    feel: 9,
    durability: 9,
    greenside_control: 8,
    wind_performance: 10,
    layers: 3,
    cover_material: "Urethane",
    dimple_count: 348,
    swing_speed_range: ["low", "medium"],
    best_for: ["Low penetrating flight", "Soft feel", "Wind resistance"],
    recommended_for: ["Low Flight Premium", "Soft Feel Distance", "5-20 handicap"],
  },
  {
    id: "ball-mizuno-rbz-tour",
    name: "RB Tour",
    manufacturer: "Mizuno",
    category: "Golf Ball",
    price_per_dozen: 40,
    image_url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=400&auto=format&fit=crop",
    overall_rating: 4.4,
    construction: "3-Piece",
    compression: 85,
    spin_rate: "High",
    driver_spin: 2350,
    iron_spin: 6500,
    wedge_spin: 9300,
    distance: 8,
    control: 9,
    spin: 9,
    feel: 9,
    durability: 7,
    greenside_control: 9,
    wind_performance: 8,
    layers: 3,
    cover_material: "Urethane",
    dimple_count: 360,
    swing_speed_range: ["medium"],
    best_for: ["Budget urethane option", "Tour-like spin", "Soft feel"],
    recommended_for: ["Best Budget Tour Ball", "Value Urethane", "5-20 handicap"],
  },
  {
    id: "ball-vice-pro-plus",
    name: "Pro Plus",
    manufacturer: "Vice",
    category: "Golf Ball",
    price_per_dozen: 35,
    image_url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=400&auto=format&fit=crop",
    overall_rating: 4.5,
    construction: "4-Piece",
    compression: 95,
    spin_rate: "Medium-High",
    driver_spin: 2250,
    iron_spin: 6600,
    wedge_spin: 9400,
    distance: 9,
    control: 9,
    spin: 9,
    feel: 8,
    durability: 8,
    greenside_control: 9,
    wind_performance: 9,
    layers: 4,
    cover_material: "Urethane",
    dimple_count: 336,
    swing_speed_range: ["medium", "high"],
    best_for: ["Best value", "Tour performance", "Direct-to-consumer"],
    recommended_for: ["Best Value Premium", "Direct-to-Consumer", "3-18 handicap"],
  },
  {
    id: "ball-snell-mtb-x",
    name: "MTB-X",
    manufacturer: "Snell",
    category: "Golf Ball",
    price_per_dozen: 38,
    image_url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=400&auto=format&fit=crop",
    overall_rating: 4.6,
    construction: "3-Piece",
    compression: 90,
    spin_rate: "High",
    driver_spin: 2300,
    iron_spin: 6700,
    wedge_spin: 9600,
    distance: 9,
    control: 10,
    spin: 10,
    feel: 9,
    durability: 8,
    greenside_control: 10,
    wind_performance: 9,
    layers: 3,
    cover_material: "Urethane",
    dimple_count: 360,
    swing_speed_range: ["medium"],
    best_for: ["Value urethane", "Tour-level spin", "MyGolfSpy Hot List"],
    recommended_for: ["Value Tour Performance", "3-Piece Urethane", "3-18 handicap"],
  },
  {
    id: "ball-taylormade-tour-response",
    name: "Tour Response",
    manufacturer: "TaylorMade",
    category: "Golf Ball",
    price_per_dozen: 35,
    image_url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=400&auto=format&fit=crop",
    overall_rating: 4.4,
    construction: "3-Piece",
    compression: 70,
    spin_rate: "Medium-High",
    driver_spin: 2400,
    iron_spin: 6300,
    wedge_spin: 8800,
    distance: 8,
    control: 8,
    spin: 8,
    feel: 9,
    durability: 7,
    greenside_control: 8,
    wind_performance: 7,
    layers: 3,
    cover_material: "Urethane",
    dimple_count: 322,
    swing_speed_range: ["low", "medium"],
    best_for: ["Soft compression", "Mid-handicap", "Best value urethane"],
    recommended_for: ["Best Mid-Price Ball", "Soft Feel Value", "8-25 handicap"],
  },
  {
    id: "ball-callaway-supersoft",
    name: "Supersoft",
    manufacturer: "Callaway",
    category: "Golf Ball",
    price_per_dozen: 28,
    image_url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=400&auto=format&fit=crop",
    overall_rating: 4.2,
    construction: "2-Piece",
    compression: 38,
    spin_rate: "Low",
    driver_spin: 2000,
    iron_spin: 5200,
    wedge_spin: 7500,
    distance: 8,
    control: 6,
    spin: 5,
    feel: 10,
    durability: 6,
    greenside_control: 6,
    wind_performance: 7,
    layers: 2,
    cover_material: "Ionomer",
    dimple_count: 332,
    swing_speed_range: ["low"],
    best_for: ["Extremely soft feel", "Slow swing speeds", "Maximum forgiveness"],
    recommended_for: ["Softest Feel", "High Handicap Distance", "15-36 handicap"],
  },
  {
    id: "ball-titleist-tour-soft",
    name: "Tour Soft",
    manufacturer: "Titleist",
    category: "Golf Ball",
    price_per_dozen: 35,
    image_url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=400&auto=format&fit=crop",
    overall_rating: 4.3,
    construction: "2-Piece",
    compression: 65,
    spin_rate: "Medium",
    driver_spin: 2250,
    iron_spin: 5800,
    wedge_spin: 8200,
    distance: 8,
    control: 7,
    spin: 7,
    feel: 9,
    durability: 7,
    greenside_control: 7,
    wind_performance: 8,
    layers: 2,
    cover_material: "Ionomer",
    dimple_count: 346,
    swing_speed_range: ["low", "medium"],
    best_for: ["Titleist quality", "Value pricing", "Moderate swing speeds"],
    recommended_for: ["Titleist Value", "Soft Distance", "10-28 handicap"],
  },
  {
    id: "ball-srixon-soft-feel",
    name: "Soft Feel",
    manufacturer: "Srixon",
    category: "Golf Ball",
    price_per_dozen: 22,
    image_url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=400&auto=format&fit=crop",
    overall_rating: 4.1,
    construction: "2-Piece",
    compression: 60,
    spin_rate: "Low",
    driver_spin: 2100,
    iron_spin: 5400,
    wedge_spin: 7800,
    distance: 8,
    control: 6,
    spin: 6,
    feel: 9,
    durability: 7,
    greenside_control: 6,
    wind_performance: 7,
    layers: 2,
    cover_material: "Ionomer",
    dimple_count: 338,
    swing_speed_range: ["low"],
    best_for: ["Best value", "Soft feel", "Budget-friendly"],
    recommended_for: ["Best Budget Ball", "Value Distance", "15-36 handicap"],
  },
  {
    id: "ball-wilson-duo-soft",
    name: "Duo Soft+",
    manufacturer: "Wilson",
    category: "Golf Ball",
    price_per_dozen: 25,
    image_url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=400&auto=format&fit=crop",
    overall_rating: 4.0,
    construction: "2-Piece",
    compression: 35,
    spin_rate: "Low",
    driver_spin: 1950,
    iron_spin: 5100,
    wedge_spin: 7300,
    distance: 7,
    control: 5,
    spin: 5,
    feel: 10,
    durability: 6,
    greenside_control: 5,
    wind_performance: 6,
    layers: 2,
    cover_material: "Ionomer",
    dimple_count: 302,
    swing_speed_range: ["low"],
    best_for: ["Softest compression", "Senior golfers", "Budget option"],
    recommended_for: ["Ultra-Soft Budget", "High Launch", "18-36 handicap"],
  },
  {
    id: "ball-bridgestone-e12-contact",
    name: "e12 Contact",
    manufacturer: "Bridgestone",
    category: "Golf Ball",
    price_per_dozen: 30,
    image_url: "https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?q=80&w=400&auto=format&fit=crop",
    overall_rating: 4.3,
    construction: "3-Piece",
    compression: 50,
    spin_rate: "Low",
    driver_spin: 2050,
    iron_spin: 5300,
    wedge_spin: 7700,
    distance: 8,
    control: 6,
    spin: 6,
    feel: 8,
    durability: 8,
    greenside_control: 6,
    wind_performance: 8,
    layers: 3,
    cover_material: "Surlyn",
    dimple_count: 338,
    swing_speed_range: ["low", "medium"],
    best_for: ["Straighter flight", "Soft feel", "Low spin off driver"],
    recommended_for: ["Straight Flight", "Contact Force Technology", "12-30 handicap"],
  },
];

export function searchGolfBalls(query: string): GolfBall[] {
  const lowerQuery = query.toLowerCase();
  return GOLF_BALL_DATABASE.filter(ball =>
    ball.manufacturer?.toLowerCase().includes(lowerQuery) ||
    ball.name?.toLowerCase().includes(lowerQuery) ||
    ball.best_for.some(bf => bf.toLowerCase().includes(lowerQuery))
  );
}

export function filterBallsBySwingSpeed(swingSpeed: "low" | "medium" | "high"): GolfBall[] {
  return GOLF_BALL_DATABASE.filter(ball => 
    ball.swing_speed_range.includes(swingSpeed)
  );
}

export function filterBallsByHandicap(handicap: number): GolfBall[] {
  return GOLF_BALL_DATABASE.filter(ball => {
    return ball.recommended_for.some(rec => {
      const match = rec.match(/(\d+)-(\d+)\s*handicap/);
      if (!match) return false;
      const [_, min, max] = match;
      return handicap >= parseInt(min) && handicap <= parseInt(max);
    });
  });
}

export function getRecommendedBalls(profile: {
  swingSpeed?: "low" | "medium" | "high";
  skillLevel?: "beginner" | "intermediate" | "advanced";
  shotShape?: string;
  primaryGoal?: string;
  handicap?: number;
  weather?: string;
  budget?: "budget" | "mid" | "premium";
}): GolfBall[] {
  let balls = [...GOLF_BALL_DATABASE];

  // Filter by swing speed
  if (profile.swingSpeed) {
    balls = balls.filter(ball => ball.swing_speed_range.includes(profile.swingSpeed!));
  }

  // Filter by handicap
  if (profile.handicap !== undefined) {
    const handicapMatches = balls.filter(ball => {
      return ball.recommended_for.some(rec => {
        const match = rec.match(/(\d+)-(\d+)\s*handicap/);
        if (!match) return false;
        const [_, min, max] = match;
        return profile.handicap! >= parseInt(min) && profile.handicap! <= parseInt(max);
      });
    });
    if (handicapMatches.length > 0) {
      balls = handicapMatches;
    }
  }

  // Filter by budget
  if (profile.budget) {
    balls = balls.filter(ball => {
      if (profile.budget === "budget") return ball.price_per_dozen <= 30;
      if (profile.budget === "mid") return ball.price_per_dozen > 30 && ball.price_per_dozen <= 45;
      if (profile.budget === "premium") return ball.price_per_dozen > 45;
      return true;
    });
  }

  // Sort by primary goal
  if (profile.primaryGoal) {
    const goal = profile.primaryGoal.toLowerCase();
    if (goal.includes("distance")) {
      balls.sort((a, b) => b.distance - a.distance);
    } else if (goal.includes("accuracy") || goal.includes("control")) {
      balls.sort((a, b) => b.control - a.control);
    } else if (goal.includes("spin")) {
      balls.sort((a, b) => b.spin - a.spin);
    } else {
      // Default sort by overall rating
      balls.sort((a, b) => b.overall_rating - a.overall_rating);
    }
  } else {
    // Default sort by overall rating
    balls.sort((a, b) => b.overall_rating - a.overall_rating);
  }

  return balls.slice(0, 5);
}