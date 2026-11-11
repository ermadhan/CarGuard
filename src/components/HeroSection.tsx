import React from 'react';
import { ShieldCheck, AlertOctagon, TrendingDown, ArrowRight, Zap } from 'lucide-react';
import { CurrencyCode } from '../types';
import { PRESET_SCENARIOS } from '../data/presetScenarios';
import { formatCurrency, convertBetweenCurrencies } from '../data/currencies';

interface HeroSectionProps {
  onSelectPreset: (presetId: string) => void;
  onStartAudit: () => void;
  currency: CurrencyCode;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onSelectPreset,
  onStartAudit,
  currency,
}) => {
  return (
    <div className="relative border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Column: Watchdog Manifesto & Action */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded border border-amber-200 dark:border-amber-900/60 mb-4">
                <AlertOctagon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Consumer Auto Advocacy & Bill Audit Engine</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-4">
                Expose the dealership service markup before you pay.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6 max-w-2xl">
                Car manufacturers and franchised agencies operate hand-in-hand to extract maximum revenue from owners. They invent artificial chemical flushes, bundle premature parts swaps, and threaten warranty cancellation. CarGuard cross-references your estimate directly with the factory engineering manual to eliminate illegitimate charges.
              </p>
            </div>

            {/* Quick Action & One-Click Preset Strip */}
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <button
                  onClick={onStartAudit}
                  className="px-5 py-3 text-sm font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-white shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Upload & Audit Estimate</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 px-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Free & 100% Private (No login required)</span>
                </div>
              </div>

              {/* Instant Preset Audit Buttons */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
                  Instant Realistic Scam Bill Demos:
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_SCENARIOS.slice(0, 3).map((p) => {
                    const convertedPrice = convertBetweenCurrencies(p.totalQuotedPrice, p.currency, currency);
                    return (
                      <button
                        key={p.id}
                        onClick={() => onSelectPreset(p.id)}
                        className="text-xs font-medium px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>{p.vehicleMake} {p.vehicleModel} ({formatCurrency(convertedPrice, currency)})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity Inspection Image with Scrim & Proof Callouts */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-slate-950 aspect-video lg:aspect-auto lg:h-full min-h-[300px]">
              <img
                src="/src/assets/images/car_service_audit_1794409633917.jpg"
                alt="Automotive mechanical workshop inspection bay with precision engine and brake tooling"
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-5 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                    Independent Verification Active
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-100 mb-1">
                  Factory Owner Manuals vs. Agency "Recommended Packages"
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Most modern car manuals explicitly advise against dealer oil and transmission flushes. CarGuard cites exact page and bulletin numbers so you can decline with authority.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Watchdog Proof Statistics Row */}
        <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Average Savings</span>
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
              42% – 68%
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Trimmed per audited dealer estimate
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <AlertOctagon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Top Phantom Surcharge</span>
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
              Fluid Flushes
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Crankcase, coolant & induction scams
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Warranty Defense</span>
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
              100% Protected
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Magnuson-Moss & EU Block Exemption
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Supported Currencies</span>
            </div>
            <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
              8 Global
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              USD, EUR, GBP, INR, AUD, CAD, JPY, AED
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
