// Shipping rates for delivery from Morocco based on countries/regions
// Rates are for Express shipping (DHL, UPS, FedEx, Aramex) by default
// All prices in USD

export interface ShippingRate {
  country: string;
  expressBaseRate: number;  // Base express shipping rate in USD
  economyBaseRate: number;  // Base economy shipping rate in USD
  expressWeightRate: number; // Additional cost per kg for express
  economyWeightRate: number; // Additional cost per kg for economy
  expressDeliveryDays: string; // Estimated delivery time
  economyDeliveryDays: string; // Estimated delivery time
}

// Group countries by region
export const regions = {
  northAmerica: ['United States', 'Canada', 'Mexico'],
  europe: ['United Kingdom', 'France', 'Germany', 'Spain', 'Italy', 'Netherlands', 'Belgium', 'Portugal', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Switzerland', 'Ireland', 'Austria', 'Greece', 'Poland', 'Czech Republic', 'Hungary', 'Romania', 'Bulgaria', 'Croatia', 'Slovakia', 'Slovenia'],
  asia: ['China', 'Japan', 'South Korea', 'India', 'Singapore', 'Malaysia', 'Thailand', 'Indonesia', 'Philippines', 'Vietnam', 'Taiwan', 'Hong Kong', 'Pakistan', 'Bangladesh', 'Sri Lanka', 'Nepal'],
  africa: ['South Africa', 'Nigeria', 'Egypt', 'Kenya', 'Morocco', 'Algeria', 'Tunisia', 'Ghana', 'Senegal', 'Cameroon', 'Ethiopia', 'Tanzania', 'Uganda', 'Ivory Coast', 'Angola'],
  oceania: ['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea'],
  middleEast: ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Israel', 'Jordan', 'Lebanon', 'Iraq'],
  southAmerica: ['Brazil', 'Argentina', 'Chile', 'Colombia', 'Peru', 'Venezuela', 'Ecuador', 'Bolivia', 'Uruguay', 'Paraguay']
};

// Shipping rates per region
export const shippingRates: Record<string, ShippingRate> = {
  // North America
  'United States': {
    country: 'United States',
    expressBaseRate: 50,
    economyBaseRate: 30,
    expressWeightRate: 10,
    economyWeightRate: 5,
    expressDeliveryDays: '2-5 days',
    economyDeliveryDays: '10-30 days'
  },
  'Canada': {
    country: 'Canada',
    expressBaseRate: 45,
    economyBaseRate: 25,
    expressWeightRate: 9,
    economyWeightRate: 5,
    expressDeliveryDays: '2-5 days',
    economyDeliveryDays: '10-30 days'
  },
  'Mexico': {
    country: 'Mexico',
    expressBaseRate: 40,
    economyBaseRate: 25,
    expressWeightRate: 9,
    economyWeightRate: 5,
    expressDeliveryDays: '2-5 days',
    economyDeliveryDays: '10-30 days'
  },
  
  // Europe
  'United Kingdom': {
    country: 'United Kingdom',
    expressBaseRate: 35,
    economyBaseRate: 20,
    expressWeightRate: 7,
    economyWeightRate: 3,
    expressDeliveryDays: '1-3 days',
    economyDeliveryDays: '5-15 days'
  },
  'France': {
    country: 'France',
    expressBaseRate: 35,
    economyBaseRate: 20,
    expressWeightRate: 7,
    economyWeightRate: 3,
    expressDeliveryDays: '1-3 days',
    economyDeliveryDays: '5-15 days'
  },
  'Germany': {
    country: 'Germany',
    expressBaseRate: 35,
    economyBaseRate: 20,
    expressWeightRate: 7,
    economyWeightRate: 3,
    expressDeliveryDays: '1-3 days',
    economyDeliveryDays: '5-15 days'
  },
  'Spain': {
    country: 'Spain',
    expressBaseRate: 35,
    economyBaseRate: 20,
    expressWeightRate: 7,
    economyWeightRate: 3,
    expressDeliveryDays: '1-3 days',
    economyDeliveryDays: '5-15 days'
  },
  'Italy': {
    country: 'Italy',
    expressBaseRate: 35,
    economyBaseRate: 20,
    expressWeightRate: 7,
    economyWeightRate: 3,
    expressDeliveryDays: '1-3 days',
    economyDeliveryDays: '5-15 days'
  },
  
  // Many more European countries
  'Netherlands': {
    country: 'Netherlands',
    expressBaseRate: 35,
    economyBaseRate: 20,
    expressWeightRate: 7,
    economyWeightRate: 3,
    expressDeliveryDays: '1-3 days',
    economyDeliveryDays: '5-15 days'
  },
  'Belgium': {
    country: 'Belgium',
    expressBaseRate: 35,
    economyBaseRate: 20,
    expressWeightRate: 7,
    economyWeightRate: 3,
    expressDeliveryDays: '1-3 days',
    economyDeliveryDays: '5-15 days'
  },
  'Portugal': {
    country: 'Portugal',
    expressBaseRate: 35,
    economyBaseRate: 20,
    expressWeightRate: 7,
    economyWeightRate: 3,
    expressDeliveryDays: '1-3 days',
    economyDeliveryDays: '5-15 days'
  },
  'Sweden': {
    country: 'Sweden',
    expressBaseRate: 40,
    economyBaseRate: 25,
    expressWeightRate: 8,
    economyWeightRate: 4,
    expressDeliveryDays: '2-4 days',
    economyDeliveryDays: '6-18 days'
  },
  
  // Asia
  'China': {
    country: 'China',
    expressBaseRate: 60,
    economyBaseRate: 35,
    expressWeightRate: 12,
    economyWeightRate: 6,
    expressDeliveryDays: '2-7 days',
    economyDeliveryDays: '10-25 days'
  },
  'India': {
    country: 'India',
    expressBaseRate: 60,
    economyBaseRate: 35,
    expressWeightRate: 12,
    economyWeightRate: 6,
    expressDeliveryDays: '2-7 days',
    economyDeliveryDays: '10-25 days'
  },
  'Japan': {
    country: 'Japan',
    expressBaseRate: 65,
    economyBaseRate: 40,
    expressWeightRate: 13,
    economyWeightRate: 7,
    expressDeliveryDays: '2-7 days',
    economyDeliveryDays: '10-25 days'
  },
  
  // More Asian countries
  'South Korea': {
    country: 'South Korea',
    expressBaseRate: 60,
    economyBaseRate: 35,
    expressWeightRate: 12,
    economyWeightRate: 6,
    expressDeliveryDays: '2-7 days',
    economyDeliveryDays: '10-25 days'
  },
  'Singapore': {
    country: 'Singapore',
    expressBaseRate: 55,
    economyBaseRate: 30,
    expressWeightRate: 11,
    economyWeightRate: 6,
    expressDeliveryDays: '2-7 days',
    economyDeliveryDays: '10-25 days'
  },
  
  // Africa
  'South Africa': {
    country: 'South Africa',
    expressBaseRate: 50,
    economyBaseRate: 30,
    expressWeightRate: 10,
    economyWeightRate: 5,
    expressDeliveryDays: '2-7 days',
    economyDeliveryDays: '7-20 days'
  },
  'Nigeria': {
    country: 'Nigeria',
    expressBaseRate: 50,
    economyBaseRate: 30,
    expressWeightRate: 10,
    economyWeightRate: 5,
    expressDeliveryDays: '2-7 days',
    economyDeliveryDays: '7-20 days'
  },
  'Morocco': {
    country: 'Morocco',
    expressBaseRate: 10,
    economyBaseRate: 5,
    expressWeightRate: 1,
    economyWeightRate: 0.5,
    expressDeliveryDays: '1-2 days',
    economyDeliveryDays: '2-4 days'
  },
  
  // Oceania
  'Australia': {
    country: 'Australia',
    expressBaseRate: 70,
    economyBaseRate: 45,
    expressWeightRate: 15,
    economyWeightRate: 8,
    expressDeliveryDays: '3-7 days',
    economyDeliveryDays: '15-30 days'
  },
  'New Zealand': {
    country: 'New Zealand',
    expressBaseRate: 70,
    economyBaseRate: 45,
    expressWeightRate: 15,
    economyWeightRate: 8,
    expressDeliveryDays: '3-7 days',
    economyDeliveryDays: '15-30 days'
  },
  
  // South America
  'Brazil': {
    country: 'Brazil',
    expressBaseRate: 65,
    economyBaseRate: 40,
    expressWeightRate: 12,
    economyWeightRate: 7,
    expressDeliveryDays: '3-8 days',
    economyDeliveryDays: '15-35 days'
  },
  'Argentina': {
    country: 'Argentina',
    expressBaseRate: 65,
    economyBaseRate: 40,
    expressWeightRate: 12,
    economyWeightRate: 7,
    expressDeliveryDays: '3-8 days',
    economyDeliveryDays: '15-35 days'
  },
  
  // Middle East
  'UAE': {
    country: 'UAE',
    expressBaseRate: 55,
    economyBaseRate: 30,
    expressWeightRate: 11,
    economyWeightRate: 6,
    expressDeliveryDays: '2-5 days',
    economyDeliveryDays: '8-20 days'
  },
  'Saudi Arabia': {
    country: 'Saudi Arabia',
    expressBaseRate: 55,
    economyBaseRate: 30,
    expressWeightRate: 11,
    economyWeightRate: 6,
    expressDeliveryDays: '2-5 days',
    economyDeliveryDays: '8-20 days'
  }
};

// Default shipping rate for countries not explicitly listed
const defaultShippingRate: ShippingRate = {
  country: 'Other',
  expressBaseRate: 70,
  economyBaseRate: 40,
  expressWeightRate: 15,
  economyWeightRate: 8,
  expressDeliveryDays: '3-10 days',
  economyDeliveryDays: '15-45 days'
};

/**
 * Get shipping rate for a specific country
 * @param country The destination country
 * @returns The shipping rate object with express and economy options
 */
export function getShippingRate(country: string): ShippingRate {
  return shippingRates[country] || defaultShippingRate;
}

/**
 * Apply quantity discount to shipping cost
 * @param baseCost The base shipping cost
 * @param quantity The quantity of items
 * @returns The discounted shipping cost
 */
export function applyQuantityDiscount(baseCost: number, quantity: number): number {
  if (quantity <= 1) return baseCost;
  
  // Apply progressive discount based on quantity
  if (quantity <= 3) {
    return baseCost * 0.9; // 10% discount for 2-3 items
  } else if (quantity <= 5) {
    return baseCost * 0.85; // 15% discount for 4-5 items
  } else if (quantity <= 10) {
    return baseCost * 0.8; // 20% discount for 6-10 items
  } else {
    return baseCost * 0.7; // 30% discount for 11+ items
  }
}

/**
 * Calculate shipping cost based on country, shipping method, order weight, and quantity
 * @param country The destination country
 * @param method The shipping method ('express' or 'economy')
 * @param totalWeight The total weight of the order in kilograms
 * @param orderTotal The total order amount (for free shipping calculation)
 * @param itemQuantity The quantity of items (for quantity discounts)
 * @returns The shipping cost in USD
 */
export function calculateShippingCost(
  country: string, 
  method: 'express' | 'economy', 
  totalWeight: number,
  orderTotal: number,
  itemQuantity: number = 1
): number {
  // Free shipping in Morocco for orders over $50
  if (country === 'Morocco' && orderTotal >= 50) {
    return 0;
  }
  
  // Free domestic shipping for orders over $100 (Morocco only)
  if (country === 'Morocco' && orderTotal >= 100) {
    return 0;
  }
  
  // Free international shipping for orders over $300 (economy method only)
  if (method === 'economy' && orderTotal >= 300) {
    return 0;
  }
  
  const rate = getShippingRate(country);
  
  // Calculate base cost plus weight-based cost
  const baseRate = method === 'express' ? rate.expressBaseRate : rate.economyBaseRate;
  const weightRate = method === 'express' ? rate.expressWeightRate : rate.economyWeightRate;
  
  // Calculate total shipping cost based on base rate plus weight
  // Ensure minimum weight of 0.5kg
  const weight = Math.max(totalWeight, 0.5);
  let shippingCost = baseRate + (weightRate * weight);
  
  // Apply quantity discount
  shippingCost = applyQuantityDiscount(shippingCost, itemQuantity);
  
  return shippingCost;
}

/**
 * Get estimated delivery time for a shipping method
 * @param country The destination country
 * @param method The shipping method ('express' or 'economy')
 * @returns The estimated delivery time range as a string
 */
export function getDeliveryEstimate(country: string, method: 'express' | 'economy'): string {
  const rate = getShippingRate(country);
  return method === 'express' ? rate.expressDeliveryDays : rate.economyDeliveryDays;
}

/**
 * Get a consolidated list of all available countries
 * @returns Array of country names sorted alphabetically
 */
export function getAllCountries(): string[] {
  // Combine all regions and return unique values
  const allCountries = Object.values(regions).flat();
  // Remove duplicates and sort alphabetically
  return Array.from(new Set(allCountries)).sort();
} 