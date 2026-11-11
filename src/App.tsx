import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AuditWorkbench } from './components/AuditWorkbench';
import { DisputeGenerator } from './components/DisputeGenerator';
import { ScheduleExplorer } from './components/ScheduleExplorer';
import { FairPriceBenchmark } from './components/FairPriceBenchmark';
import { SavingsVault } from './components/SavingsVault';
import { ServiceEstimate, Vehicle, CurrencyCode, DistanceUnit } from './types';
import { PRESET_SCENARIOS } from './data/presetScenarios';
import { CURRENCY_CONFIGS, convertEstimateCurrency } from './data/currencies';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('audit');

  // Persistence hooks for settings and data
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('carguard_currency');
    return (saved as CurrencyCode) || 'USD';
  });

  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>(() => {
    const saved = localStorage.getItem('carguard_distance_unit');
    return (saved as DistanceUnit) || 'miles';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('carguard_dark_mode');
    return saved === 'true';
  });

  const [currentEstimate, setCurrentEstimate] = useState<ServiceEstimate>(() => {
    const saved = localStorage.getItem('carguard_active_estimate');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return PRESET_SCENARIOS[0];
  });

  const [savedEstimates, setSavedEstimates] = useState<ServiceEstimate[]>(() => {
    const saved = localStorage.getItem('carguard_saved_estimates');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [PRESET_SCENARIOS[0]];
  });

  const [garage, setGarage] = useState<Vehicle[]>(() => {
    const saved = localStorage.getItem('carguard_garage');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [
      { id: 'v-1', make: 'Toyota', model: 'RAV4', year: 2023, mileage: 30000, distanceUnit: 'miles' },
      { id: 'v-2', make: 'Volkswagen', model: 'Golf', year: 2022, mileage: 60000, distanceUnit: 'km' },
    ];
  });

  // Sync dark mode class on <html>
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('carguard_dark_mode', String(isDarkMode));
  }, [isDarkMode]);

  // Sync currency and distance unit
  useEffect(() => {
    localStorage.setItem('carguard_currency', currency);
  }, [currency]);

  useEffect(() => {
    localStorage.setItem('carguard_distance_unit', distanceUnit);
  }, [distanceUnit]);

  // Sync active estimate
  useEffect(() => {
    if (currentEstimate) {
      localStorage.setItem('carguard_active_estimate', JSON.stringify(currentEstimate));
    }
  }, [currentEstimate]);

  // Sync saved estimates
  useEffect(() => {
    localStorage.setItem('carguard_saved_estimates', JSON.stringify(savedEstimates));
  }, [savedEstimates]);

  // Sync garage
  useEffect(() => {
    localStorage.setItem('carguard_garage', JSON.stringify(garage));
  }, [garage]);

  const handleCurrencyChange = (newCurr: CurrencyCode) => {
    setCurrency(newCurr);
    setDistanceUnit(CURRENCY_CONFIGS[newCurr].defaultDistanceUnit);
    if (currentEstimate) {
      setCurrentEstimate(convertEstimateCurrency(currentEstimate, newCurr));
    }
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = PRESET_SCENARIOS.find((p) => p.id === presetId);
    if (preset) {
      // Convert preset to current active currency so it matches screen currency
      const converted = convertEstimateCurrency(preset, currency);
      setCurrentEstimate(converted);
      setDistanceUnit(preset.distanceUnit);
      setActiveTab('audit');
      window.scrollTo({ top: 380, behavior: 'smooth' });
    }
  };

  const handleUpdateEstimate = (updated: ServiceEstimate) => {
    setCurrentEstimate(updated);
  };

  const handleSaveToVault = (est: ServiceEstimate) => {
    const exists = savedEstimates.some((e) => e.id === est.id);
    if (exists) {
      setSavedEstimates(savedEstimates.map((e) => (e.id === est.id ? est : e)));
    } else {
      setSavedEstimates([est, ...savedEstimates]);
    }
  };

  const handleLoadFromVault = (est: ServiceEstimate) => {
    setCurrentEstimate(est);
    setCurrency(est.currency);
    setDistanceUnit(est.distanceUnit);
    setActiveTab('audit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteEstimate = (id: string) => {
    setSavedEstimates(savedEstimates.filter((e) => e.id !== id));
  };

  const handleAddVehicle = (v: Vehicle) => {
    setGarage([...garage, v]);
  };

  const handleRemoveVehicle = (id: string) => {
    setGarage(garage.filter((v) => v.id !== id));
  };

  const handleAuditWithMilestone = (make: string, mileage: number) => {
    setCurrentEstimate({
      ...currentEstimate,
      id: `milestone-${Date.now()}`,
      vehicleMake: make,
      currentMileage: mileage,
      distanceUnit,
      currency,
      totalQuotedPrice: 850,
      totalFairPrice: 320,
      totalApprovedPrice: 850,
      totalSaved: 0,
    });
    setActiveTab('audit');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-amber-400 selection:text-slate-950">
      {/* Top Bar Contract Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={handleCurrencyChange}
        distanceUnit={distanceUnit}
        setDistanceUnit={setDistanceUnit}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        onAuditNew={() => {
          setActiveTab('audit');
          window.scrollTo({ top: 300, behavior: 'smooth' });
        }}
      />

      {/* Hero Watchdog Banner (always visible on primary tab) */}
      {activeTab === 'audit' && (
        <HeroSection
          onSelectPreset={handleSelectPreset}
          onStartAudit={() => {
            setActiveTab('audit');
            window.scrollTo({ top: 350, behavior: 'smooth' });
          }}
          currency={currency}
        />
      )}

      {/* Main Content Workspace Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {activeTab === 'audit' && (
          <AuditWorkbench
            currentEstimate={currentEstimate}
            onUpdateEstimate={handleUpdateEstimate}
            currency={currency}
            distanceUnit={distanceUnit}
            onGoToDispute={() => {
              setActiveTab('dispute');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSaveToVault={handleSaveToVault}
          />
        )}

        {activeTab === 'benchmark' && (
          <FairPriceBenchmark currency={currency} />
        )}

        {activeTab === 'schedules' && (
          <ScheduleExplorer
            distanceUnit={distanceUnit}
            onAuditWithMilestone={handleAuditWithMilestone}
          />
        )}

        {activeTab === 'dispute' && (
          <DisputeGenerator
            currentEstimate={currentEstimate}
            currency={currency}
          />
        )}

        {activeTab === 'vault' && (
          <SavingsVault
            savedEstimates={savedEstimates}
            garage={garage}
            onAddVehicle={handleAddVehicle}
            onRemoveVehicle={handleRemoveVehicle}
            onDeleteEstimate={handleDeleteEstimate}
            onLoadEstimate={handleLoadFromVault}
            currency={currency}
            distanceUnit={distanceUnit}
          />
        )}
      </main>

      {/* Quiet Consumer Watchdog Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <span className="font-bold text-slate-800 dark:text-slate-200">CarGuard</span> — Independent Automotive Consumer Watchdog
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Dedicated to protecting car owners from dealership profit collusion, unneeded chemical flushes, and warranty intimidation.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <span>Magnuson-Moss 15 U.S.C. § 2302</span>
            <span>·</span>
            <span>EU Block Exemption 461/2010</span>
            <span>·</span>
            <span>UK CRA 2015</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
