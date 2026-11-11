export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR' | 'AUD' | 'CAD' | 'JPY' | 'AED';

export type DistanceUnit = 'miles' | 'km';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  symbolPosition: 'prefix' | 'suffix';
  exchangeRateToUSD: number;
  typicalDealerLaborRate: number; // per hour
  typicalIndieLaborRate: number;  // per hour
  defaultDistanceUnit: DistanceUnit;
  locale: string;
}

export type ItemVerdict =
  | 'factory_required'    // Stated in official OEM owner manual for this mileage
  | 'predatory_upsell'    // Dealer-invented flush, additive, or phantom service
  | 'premature'           // Legitimate service, but recommended far earlier than manual
  | 'overpriced'          // Legitimate service marked up 2x-5x fair market rate
  | 'unnecessary_addon';  // Non-mechanical add-on (nitrogen, windshield insurance, etc.)

export type ItemSeverity = 'safe' | 'caution' | 'danger';

export interface LineItem {
  id: string;
  name: string;
  category: 'maintenance' | 'flush' | 'brakes' | 'filter' | 'fluids' | 'inspection' | 'addon' | 'fee';
  quotedPrice: number;
  fairMarketPrice: number;
  oemPartsCost: number;
  laborHours: number;
  verdict: ItemVerdict;
  severity: ItemSeverity;
  reasoning: string;
  factoryRuleReference: string;
  isDeclined: boolean; // toggled by user to prune quote
}

export interface ServiceEstimate {
  id: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  currentMileage: number;
  distanceUnit: DistanceUnit;
  currency: CurrencyCode;
  agencyDealerName: string;
  date: string;
  totalQuotedPrice: number;
  totalFairPrice: number;
  totalApprovedPrice: number;
  totalSaved: number;
  items: LineItem[];
  scamScorePercentage: number;
  summaryRecommendation: string;
  dealerTricksDetected: string[];
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  distanceUnit: DistanceUnit;
  vin?: string;
}

export interface OEMIntervalRule {
  intervalValue: number; // in miles or km
  unit: DistanceUnit;
  mandatoryServices: string[];
  strictlyBannedServices: string[];
  commonAgencyTraps: string[];
  officialManualSnippet: string;
}

export interface ManufacturerSchedule {
  make: string;
  models: string[];
  warrantyRuleSummary: string;
  legalStatuteNotice: string;
  intervals: OEMIntervalRule[];
}

export interface DisputeScript {
  talkingPoints: string[];
  counterOfferText: string;
  formalLetter: string;
  legalCitation: string;
}
