// Unit conversion utilities for wizard

export interface HeightImperial {
  feet: number;
  inches: number;
}

export interface HeightMetric {
  cm: number;
}

/**
 * Convert feet and inches to centimeters
 */
export function feetInchesToCm(feet: number, inches: number): number {
  const totalInches = feet * 12 + inches;
  return Math.round(totalInches * 2.54 * 10) / 10;
}

/**
 * Convert centimeters to feet and inches
 */
export function cmToFeetInches(cm: number): HeightImperial {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

/**
 * Convert inches to centimeters
 */
export function inchesToCm(inches: number): number {
  return Math.round(inches * 2.54 * 10) / 10;
}

/**
 * Convert centimeters to inches
 */
export function cmToInches(cm: number): number {
  return Math.round((cm / 2.54) * 10) / 10;
}

/**
 * Convert yards to meters
 */
export function yardsToMeters(yards: number): number {
  return Math.round(yards * 0.9144);
}

/**
 * Convert meters to yards
 */
export function metersToYards(meters: number): number {
  return Math.round(meters / 0.9144);
}

/**
 * Format height display based on unit preference
 */
export function formatHeight(
  unit: "imperial" | "metric",
  feet?: number,
  inches?: number,
  cm?: number
): string {
  if (unit === "imperial" && feet !== undefined && inches !== undefined) {
    return `${feet}'${inches}"`;
  } else if (unit === "metric" && cm !== undefined) {
    return `${cm} cm`;
  }
  return "";
}

/**
 * Format distance display based on unit preference
 */
export function formatDistance(
  unit: "imperial" | "metric",
  yards: number
): string {
  if (unit === "metric") {
    return `${yardsToMeters(yards)} m`;
  }
  return `${yards} yds`;
}

/**
 * Format measurement display based on unit preference
 */
export function formatMeasurement(
  unit: "imperial" | "metric",
  inches: number
): string {
  if (unit === "metric") {
    return `${inchesToCm(inches)} cm`;
  }
  return `${inches}"`;
}