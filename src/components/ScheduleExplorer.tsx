import React, { useState } from 'react';
import { BookOpen, CheckCircle, Ban, AlertTriangle, ShieldCheck, ArrowRight, Info } from 'lucide-react';
import { MANUFACTURER_SCHEDULES } from '../data/factorySchedules';
import { DistanceUnit } from '../types';

interface ScheduleExplorerProps {
  distanceUnit: DistanceUnit;
  onAuditWithMilestone: (make: string, mileage: number) => void;
}

export const ScheduleExplorer: React.FC<ScheduleExplorerProps> = ({
  distanceUnit,
  onAuditWithMilestone,
}) => {
  const [selectedMake, setSelectedMake] = useState<string>('Toyota');
  const [selectedIntervalIndex, setSelectedIntervalIndex] = useState<number>(1); // 30k milestone default

  const currentSchedule = MANUFACTURER_SCHEDULES[selectedMake] || MANUFACTURER_SCHEDULES.Toyota;
  const activeInterval = currentSchedule.intervals[selectedIntervalIndex] || currentSchedule.intervals[0];

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-semibold">
            OEM Factory Knowledge Base
          </span>
        </div>
        <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
          Official Manufacturer Maintenance Schedules
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Dealerships regularly invent arbitrary maintenance packages to generate service bay revenue. Compare official factory engineering requirements directly against common agency scam flushes for your vehicle.
        </p>

        {/* Brand Selector Bar */}
        <div className="mt-5 flex flex-wrap gap-2">
          {Object.keys(MANUFACTURER_SCHEDULES).map((make) => (
            <button
              key={make}
              onClick={() => {
                setSelectedMake(make);
                setSelectedIntervalIndex(0);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                selectedMake === make
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
              }`}
            >
              {make}
            </button>
          ))}
        </div>
      </div>

      {/* Warranty Rights Callout for Selected Brand */}
      <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <strong className="text-slate-900 dark:text-white font-semibold">
              {selectedMake} Official Warranty Rule:
            </strong>{' '}
            <span className="text-slate-600 dark:text-slate-300">
              {currentSchedule.warrantyRuleSummary}
            </span>
          </div>
        </div>

        <button
          onClick={() => onAuditWithMilestone(selectedMake, activeInterval.intervalValue)}
          className="px-3.5 py-1.5 text-xs font-bold rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <span>Audit Quote at {activeInterval.intervalValue.toLocaleString()} {activeInterval.unit}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mileage Interval Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Select Odometer Milestone:
          </span>
          <div className="flex items-center gap-1.5">
            {currentSchedule.intervals.map((interval, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIntervalIndex(idx)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md font-mono tabular-nums transition-colors cursor-pointer ${
                  selectedIntervalIndex === idx
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {interval.intervalValue.toLocaleString()} {interval.unit}
              </button>
            ))}
          </div>
        </div>

        {/* Side-by-Side: Genuine vs Dealer Rip-off */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Green Column: Factory Mandatory Services */}
          <div className="p-5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-emerald-200 dark:border-emerald-800/60">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                  Required by Factory Manual ({activeInterval.intervalValue.toLocaleString()} {activeInterval.unit})
                </h3>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Essential for warranty compliance and mechanical life
                </span>
              </div>
            </div>

            <ul className="space-y-3 text-xs">
              {activeInterval.mandatoryServices.map((service, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-800 dark:text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed font-medium">{service}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Red Column: Blacklisted & Invented Dealer Scams */}
          <div className="p-5 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-rose-200 dark:border-rose-800/60">
              <Ban className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <div>
                <h3 className="text-sm font-bold text-rose-950 dark:text-rose-200">
                  Common Agency Traps & Blacklisted Flushes
                </h3>
                <span className="text-[11px] text-rose-700 dark:text-rose-400">
                  Discouraged or banned by OEM engineering bulletins
                </span>
              </div>
            </div>

            <ul className="space-y-3 text-xs">
              {activeInterval.strictlyBannedServices.map((banned, idx) => (
                <li key={idx} className="flex items-start gap-2 text-rose-900 dark:text-rose-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                  <span className="leading-relaxed font-medium">{banned}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Official Manual Snippet Citation */}
        <div className="mt-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
          <Info className="w-4 h-4 text-slate-500 dark:text-slate-400 mt-0.5 shrink-0" />
          <div className="text-xs">
            <span className="font-semibold text-slate-900 dark:text-white uppercase tracking-wider block mb-0.5">
              Official OEM Manual Citation:
            </span>
            <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px] italic leading-relaxed">
              "{activeInterval.officialManualSnippet}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
