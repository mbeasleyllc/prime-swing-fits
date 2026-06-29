/**
 * Swing Data Validation Utilities
 * Validates swing metrics against realistic ranges
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SwingMetricRanges {
  ball_speed: { min: number; max: number };
  club_speed: { min: number; max: number };
  carry_distance: { min: number; max: number };
  total_distance: { min: number; max: number };
  launch_angle: { min: number; max: number };
  spin_rate: { min: number; max: number };
  smash_factor: { min: number; max: number };
  attack_angle: { min: number; max: number };
  club_path: { min: number; max: number };
  face_angle: { min: number; max: number };
}

// Realistic ranges for validation
export const METRIC_RANGES: SwingMetricRanges = {
  ball_speed: { min: 50, max: 200 },        // mph
  club_speed: { min: 40, max: 150 },        // mph
  carry_distance: { min: 50, max: 400 },    // yards
  total_distance: { min: 50, max: 450 },    // yards
  launch_angle: { min: -10, max: 45 },      // degrees
  spin_rate: { min: 0, max: 12000 },        // rpm
  smash_factor: { min: 1.0, max: 1.6 },     // ratio
  attack_angle: { min: -15, max: 15 },      // degrees
  club_path: { min: -20, max: 20 },         // degrees
  face_angle: { min: -20, max: 20 },        // degrees
};

// Valid club types
export const VALID_CLUBS = [
  "Driver",
  "3 Wood",
  "5 Wood",
  "7 Wood",
  "3 Hybrid",
  "4 Hybrid",
  "5 Hybrid",
  "3 Iron",
  "4 Iron",
  "5 Iron",
  "6 Iron",
  "7 Iron",
  "8 Iron",
  "9 Iron",
  "PW",
  "GW",
  "SW",
  "LW",
  "Putter",
];

export const VALID_SHOT_TYPES = [
  "straight",
  "draw",
  "fade",
  "hook",
  "slice",
  "pull",
  "push",
];

export const VALID_DEVICE_TYPES = [
  "golf_daddy",
  "trackman",
  "flightscope",
  "garmin",
  "manual",
  "other",
];

/**
 * Validate a single swing metric value
 */
export function validateMetric(
  metricName: keyof SwingMetricRanges,
  value: number | null | undefined
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (value === null || value === undefined) {
    return { isValid: true, errors, warnings };
  }

  const range = METRIC_RANGES[metricName];
  if (!range) {
    warnings.push(`Unknown metric: ${metricName}`);
    return { isValid: true, errors, warnings };
  }

  if (value < range.min || value > range.max) {
    errors.push(
      `${metricName} value ${value} is outside valid range (${range.min}-${range.max})`
    );
    return { isValid: false, errors, warnings };
  }

  return { isValid: true, errors, warnings };
}

/**
 * Validate a complete swing metric record
 */
export function validateSwingMetric(metric: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate numeric metrics
  const numericMetrics: (keyof SwingMetricRanges)[] = [
    "ball_speed",
    "club_speed",
    "carry_distance",
    "total_distance",
    "launch_angle",
    "spin_rate",
    "smash_factor",
    "attack_angle",
    "club_path",
    "face_angle",
  ];

  numericMetrics.forEach((metricName) => {
    if (metric[metricName] !== null && metric[metricName] !== undefined) {
      const result = validateMetric(metricName, metric[metricName]);
      errors.push(...result.errors);
      warnings.push(...result.warnings);
    }
  });

  // Validate club type
  if (metric.club_used && !VALID_CLUBS.includes(metric.club_used)) {
    warnings.push(`Unknown club type: ${metric.club_used}`);
  }

  // Validate shot type
  if (metric.shot_type && !VALID_SHOT_TYPES.includes(metric.shot_type)) {
    errors.push(`Invalid shot type: ${metric.shot_type}`);
  }

  // Logical validations
  if (
    metric.ball_speed &&
    metric.club_speed &&
    metric.ball_speed < metric.club_speed * 0.8
  ) {
    warnings.push(
      `Ball speed seems low compared to club speed (smash factor < 0.8)`
    );
  }

  if (
    metric.carry_distance &&
    metric.total_distance &&
    metric.carry_distance > metric.total_distance
  ) {
    errors.push(`Carry distance cannot exceed total distance`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate a batch of swing metrics
 */
export function validateBatch(
  metrics: any[]
): {
  validCount: number;
  invalidCount: number;
  warningCount: number;
  results: Array<{ index: number; result: ValidationResult; data: any }>;
} {
  let validCount = 0;
  let invalidCount = 0;
  let warningCount = 0;

  const results = metrics.map((metric, index) => {
    const result = validateSwingMetric(metric);
    if (result.isValid) validCount++;
    else invalidCount++;
    if (result.warnings.length > 0) warningCount++;

    return { index, result, data: metric };
  });

  return { validCount, invalidCount, warningCount, results };
}