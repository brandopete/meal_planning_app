/**
 * Unit conversion utilities for cooking measurements
 */

// Common conversions to grams (base unit for weight)
const WEIGHT_TO_GRAMS: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  kilogram: 1000,
  kilograms: 1000,
  oz: 28.3495,
  ounce: 28.3495,
  ounces: 28.3495,
  lb: 453.592,
  lbs: 453.592,
  pound: 453.592,
  pounds: 453.592,
};

// Common conversions to milliliters (base unit for volume)
const VOLUME_TO_ML: Record<string, number> = {
  ml: 1,
  milliliter: 1,
  milliliters: 1,
  l: 1000,
  liter: 1000,
  liters: 1000,
  tsp: 4.92892,
  teaspoon: 4.92892,
  teaspoons: 4.92892,
  tbsp: 14.7868,
  tablespoon: 14.7868,
  tablespoons: 14.7868,
  'fl oz': 29.5735,
  'fluid ounce': 29.5735,
  'fluid ounces': 29.5735,
  cup: 236.588,
  cups: 236.588,
  pint: 473.176,
  pints: 473.176,
  quart: 946.353,
  quarts: 946.353,
  gallon: 3785.41,
  gallons: 3785.41,
};

export function convertWeightToGrams(amount: number, unit: string): number | null {
  const normalizedUnit = unit.toLowerCase().trim();
  const conversionFactor = WEIGHT_TO_GRAMS[normalizedUnit];

  if (conversionFactor === undefined) {
    return null;
  }

  return amount * conversionFactor;
}

export function convertVolumeToMl(amount: number, unit: string): number | null {
  const normalizedUnit = unit.toLowerCase().trim();
  const conversionFactor = VOLUME_TO_ML[normalizedUnit];

  if (conversionFactor === undefined) {
    return null;
  }

  return amount * conversionFactor;
}

export function convertToGrams(amount: number, unit: string): number | null {
  // Try weight conversion first
  const weightGrams = convertWeightToGrams(amount, unit);
  if (weightGrams !== null) {
    return weightGrams;
  }

  // Some items can be estimated by volume->weight
  // (This is a simplification; real conversion would depend on ingredient density)
  const volumeMl = convertVolumeToMl(amount, unit);
  if (volumeMl !== null) {
    // Assume water density (1 ml = 1 g) as a rough estimate
    // In practice, different ingredients have different densities
    return volumeMl;
  }

  return null;
}

export function isWeightUnit(unit: string): boolean {
  const normalizedUnit = unit.toLowerCase().trim();
  return normalizedUnit in WEIGHT_TO_GRAMS;
}

export function isVolumeUnit(unit: string): boolean {
  const normalizedUnit = unit.toLowerCase().trim();
  return normalizedUnit in VOLUME_TO_ML;
}
