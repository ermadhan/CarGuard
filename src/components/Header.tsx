import React from 'react';
import { ShieldAlert, Globe, Gauge, FileText, Scale, BookOpen, PiggyBank, Moon, Sun } from 'lucide-react';
import { CurrencyCode, DistanceUnit } from '../types';
import { CURRENCY_CONFIGS } from '../data/currencies';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  distanceUnit: DistanceUnit;
  setDistanceUnit: (u: DistanceUnit) => void;
  isDarkMode: boolean;
  setIsDarkMode: (d: boolean) => void;
  onAuditNew: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  distanceUnit,
  setDistanceUnit,
  isDarkMode,
  setIsDarkMode,
  onAuditNew,
}) => {
  const currencyList: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'JPY', 'AED'];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => setActiveTab('audit')}>
            <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center text-white dark:text-slate-900 shadow-sm">
              <ShieldAlert className="w-5 h-5 text-amber-400 dark:text-amber-600" />
            </div>
            <div>
              <span className="text-xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white">
                CarGuard
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                Auto Service Watchdog
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links (single-line, clean typography) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setActiveTab('audit')}
              className={`whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'audit'
                  ? 'text-slate-900 dark:text-white font-semibold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4 opacity-70" />
              <span>Audit Estimate</span>
            </button>

            <button
              onClick={() => setActiveTab('benchmark')}
              className={`whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'benchmark'
                  ? 'text-slate-900 dark:text-white font-semibold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Scale className="w-4 h-4 opacity-70" />
              <span>Fair Benchmarks</span>
            </button>

            <button
              onClick={() => setActiveTab('schedules')}
              className={`whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'schedules'
                  ? 'text-slate-900 dark:text-white font-semibold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4 opacity-70" />
              <span>Manual Schedules</span>
            </button>

            <button
              onClick={() => setActiveTab('dispute')}
              className={`whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'dispute'
                  ? 'text-slate-900 dark:text-white font-semibold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <ShieldAlert className="w-4 h-4 opacity-70" />
              <span>Dispute Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('vault')}
              className={`whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'vault'
                  ? 'text-slate-900 dark:text-white font-semibold'
                  : 'hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <PiggyBank className="w-4 h-4 opacity-70" />
              <span>Savings Vault</span>
            </button>
          </nav>

          {/* Zone 3: Currency, Units & Primary CTA Action */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Currency Selector */}
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-md px-2 py-1.5 border border-slate-200 dark:border-slate-700">
              <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <select
                value={currency}
                onChange={(e) => {
                  const newCurr = e.target.value as CurrencyCode;
                  setCurrency(newCurr);
                  setDistanceUnit(CURRENCY_CONFIGS[newCurr].defaultDistanceUnit);
                }}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                title="Select Currency"
              >
                {currencyList.map((code) => (
                  <option key={code} value={code} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                    {code} ({CURRENCY_CONFIGS[code].symbol.trim()})
                  </option>
                ))}
              </select>
            </div>

            {/* Distance Unit Toggle */}
            <button
              onClick={() => setDistanceUnit(distanceUnit === 'miles' ? 'km' : 'miles')}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="Toggle Distance Unit (Miles / Kilometers)"
            >
              <Gauge className="w-3.5 h-3.5 opacity-70" />
              <span>{distanceUnit === 'miles' ? 'Miles' : 'Km'}</span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Light/Dark Theme"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onAuditNew}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-md hover:bg-slate-800 dark:hover:bg-white shadow-sm transition-colors whitespace-nowrap shrink-0"
            >
              Audit Estimate
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex lg:hidden overflow-x-auto gap-4 py-2 border-t border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 scrollbar-none">
          <button
            onClick={() => setActiveTab('audit')}
            className={`whitespace-nowrap ${activeTab === 'audit' ? 'text-slate-900 dark:text-white font-semibold' : ''}`}
          >
            Audit Estimate
          </button>
          <button
            onClick={() => setActiveTab('benchmark')}
            className={`whitespace-nowrap ${activeTab === 'benchmark' ? 'text-slate-900 dark:text-white font-semibold' : ''}`}
          >
            Fair Benchmarks
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`whitespace-nowrap ${activeTab === 'schedules' ? 'text-slate-900 dark:text-white font-semibold' : ''}`}
          >
            Manual Schedules
          </button>
          <button
            onClick={() => setActiveTab('dispute')}
            className={`whitespace-nowrap ${activeTab === 'dispute' ? 'text-slate-900 dark:text-white font-semibold' : ''}`}
          >
            Dispute Studio
          </button>
          <button
            onClick={() => setActiveTab('vault')}
            className={`whitespace-nowrap ${activeTab === 'vault' ? 'text-slate-900 dark:text-white font-semibold' : ''}`}
          >
            Savings Vault
          </button>
        </div>
      </div>
    </header>
  );
};
