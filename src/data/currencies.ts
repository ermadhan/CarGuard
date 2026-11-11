import { CurrencyCode, CurrencyConfig, DistanceUnit } from '../types';

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    symbolPosition: 'prefix',
    exchangeRateToUSD: 1.0,
    typicalDealerLaborRate: 195,
    typicalIndieLaborRate: 110,
    defaultDistanceUnit: 'miles',
    locale: 'en-US',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    symbolPosition: 'suffix',
    exchangeRateToUSD: 0.92,
    typicalDealerLaborRate: 145,
    typicalIndieLaborRate: 85,
    defaultDistanceUnit: 'km',
    locale: 'de-DE',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound',
    symbolPosition: 'prefix',
    exchangeRateToUSD: 0.79,
    typicalDealerLaborRate: 155,
    typicalIndieLaborRate: 90,
    defaultDistanceUnit: 'miles',
    locale: 'en-GB',
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
    symbolPosition: 'prefix',
    exchangeRateToUSD: 86.5,
    typicalDealerLaborRate: 2200,
    typicalIndieLaborRate: 950,
    defaultDistanceUnit: 'km',
    locale: 'en-IN',
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar',
    symbolPosition: 'prefix',
    exchangeRateToUSD: 1.52,
    typicalDealerLaborRate: 210,
    typicalIndieLaborRate: 125,
    defaultDistanceUnit: 'km',
    locale: 'en-AU',
  },
  CAD: {
    code: 'CAD',
    symbol: 'C$',
    name: 'Canadian Dollar',
    symbolPosition: 'prefix',
    exchangeRateToUSD: 1.38,
    typicalDealerLaborRate: 185,
    typicalIndieLaborRate: 115,
    defaultDistanceUnit: 'km',
    locale: 'en-CA',
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: 'Japanese Yen',
    symbolPosition: 'prefix',
    exchangeRateToUSD: 154.0,
    typicalDealerLaborRate: 16000,
    typicalIndieLaborRate: 8500,
    defaultDistanceUnit: 'km',
    locale: 'ja-JP',
  },
  AED: {
    code: 'AED',
    symbol: 'AED ',
    name: 'UAE Dirham',
    symbolPosition: 'prefix',
    exchangeRateToUSD: 3.67,
    typicalDealerLaborRate: 480,
    typicalIndieLaborRate: 220,
    defaultDistanceUnit: 'km',
    locale: 'en-AE',
  },
};

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  const config = CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.USD;
  const isZeroDecimal = currency === 'JPY';

  const formattedNum = new Intl.NumberFormat(config.locale, {
    minimumFractionDigits: isZeroDecimal ? 0 : 2,
    maximumFractionDigits: isZeroDecimal ? 0 : 2,
  }).format(amount);

  if (config.symbolPosition === 'suffix') {
    return `${formattedNum} ${config.symbol}`;
  }
  return `${config.symbol}${formattedNum}`;
}

export function convertAmount(amountUSD: number, targetCurrency: CurrencyCode): number {
  const config = CURRENCY_CONFIGS[targetCurrency] || CURRENCY_CONFIGS.USD;
  const converted = amountUSD * config.exchangeRateToUSD;
  return targetCurrency === 'JPY' ? Math.round(converted) : Math.round(converted * 100) / 100;
}

export function detectCurrencyFromText(text: string): CurrencyCode {
  if (text.includes('₹') || /inr|rupee|rs\./i.test(text)) return 'INR';
  if (text.includes('£') || /gbp|pound/i.test(text)) return 'GBP';
  if (text.includes('€') || /eur|euro/i.test(text)) return 'EUR';
  if (text.includes('¥') || /jpy|yen/i.test(text)) return 'JPY';
  if (/aed|dirham/i.test(text)) return 'AED';
  if (/a\$|aud/i.test(text)) return 'AUD';
  if (/c\$|cad/i.test(text)) return 'CAD';
  return 'USD';
}

export function convertDistance(value: number, from: DistanceUnit, to: DistanceUnit): number {
  if (from === to) return value;
  if (from === 'miles' && to === 'km') return Math.round(value * 1.60934);
  return Math.round(value / 1.60934);
}

export function convertBetweenCurrencies(amount: number, fromCurrency: CurrencyCode, toCurrency: CurrencyCode): number {
  if (fromCurrency === toCurrency) return amount;
  const fromConfig = CURRENCY_CONFIGS[fromCurrency] || CURRENCY_CONFIGS.USD;
  const toConfig = CURRENCY_CONFIGS[toCurrency] || CURRENCY_CONFIGS.USD;

  // Convert to USD base first
  const amountUSD = amount / fromConfig.exchangeRateToUSD;
  // Convert to target currency
  const targetAmount = amountUSD * toConfig.exchangeRateToUSD;

  return toCurrency === 'JPY' ? Math.round(targetAmount) : Math.round(targetAmount * 100) / 100;
}

export function convertEstimateCurrency<T extends { currency: CurrencyCode; items: any[]; totalQuotedPrice: number; totalFairPrice: number; totalApprovedPrice: number; totalSaved: number }>(
  estimate: T,
  targetCurrency: CurrencyCode
): T {
  if (!estimate || estimate.currency === targetCurrency) return estimate;
  const fromCurrency: CurrencyCode = estimate.currency || 'USD';

  const convertedItems = (estimate.items || []).map((item: any) => ({
    ...item,
    quotedPrice: convertBetweenCurrencies(item.quotedPrice, fromCurrency, targetCurrency),
    fairMarketPrice: convertBetweenCurrencies(item.fairMarketPrice, fromCurrency, targetCurrency),
    oemPartsCost: convertBetweenCurrencies(item.oemPartsCost || 0, fromCurrency, targetCurrency),
  }));

  const totalQuoted = convertedItems.reduce((acc: number, i: any) => acc + i.quotedPrice, 0);
  const totalFair = convertedItems.reduce((acc: number, i: any) => acc + i.fairMarketPrice, 0);
  const totalApproved = convertedItems.filter((i: any) => !i.isDeclined).reduce((acc: number, i: any) => acc + i.quotedPrice, 0);
  const totalSaved = convertedItems.filter((i: any) => i.isDeclined).reduce((acc: number, i: any) => acc + i.quotedPrice, 0);

  return {
    ...estimate,
    currency: targetCurrency,
    items: convertedItems,
    totalQuotedPrice: targetCurrency === 'JPY' ? Math.round(totalQuoted) : Math.round(totalQuoted * 100) / 100,
    totalFairPrice: targetCurrency === 'JPY' ? Math.round(totalFair) : Math.round(totalFair * 100) / 100,
    totalApprovedPrice: targetCurrency === 'JPY' ? Math.round(totalApproved) : Math.round(totalApproved * 100) / 100,
    totalSaved: targetCurrency === 'JPY' ? Math.round(totalSaved) : Math.round(totalSaved * 100) / 100,
  };
}

