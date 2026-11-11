import React, { useState } from 'react';
import { PiggyBank, Car, Trash2, ArrowUpRight, Download, Plus, ShieldCheck, Check } from 'lucide-react';
import { ServiceEstimate, Vehicle, CurrencyCode, DistanceUnit } from '../types';
import { formatCurrency } from '../data/currencies';

interface SavingsVaultProps {
  savedEstimates: ServiceEstimate[];
  garage: Vehicle[];
  onAddVehicle: (v: Vehicle) => void;
  onRemoveVehicle: (id: string) => void;
  onDeleteEstimate: (id: string) => void;
  onLoadEstimate: (est: ServiceEstimate) => void;
  currency: CurrencyCode;
  distanceUnit: DistanceUnit;
}

export const SavingsVault: React.FC<SavingsVaultProps> = ({
  savedEstimates,
  garage,
  onAddVehicle,
  onRemoveVehicle,
  onDeleteEstimate,
  onLoadEstimate,
  currency,
  distanceUnit,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('RAV4');
  const [year, setYear] = useState(2023);
  const [odometer, setOdometer] = useState(30000);

  // Cumulative savings calculated across all saved estimates
  const totalLifetimeSaved = savedEstimates.reduce((acc, est) => acc + (est.totalSaved || 0), 0);
  const totalAuditedBills = savedEstimates.length;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    onAddVehicle({
      id: `veh-${Date.now()}`,
      make,
      model,
      year: Number(year),
      mileage: Number(odometer),
      distanceUnit,
    });
    setShowAddModal(false);
  };

  const exportVaultJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ garage, savedEstimates }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `carguard-savings-vault-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8">
      {/* Overview Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 dark:text-emerald-600 mb-1">
            <PiggyBank className="w-4 h-4" />
            <span>Cumulative Money Saved</span>
          </div>
          <div className="text-3xl font-display font-extrabold font-mono tabular-nums">
            {formatCurrency(totalLifetimeSaved, currency)}
          </div>
          <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
            Prevented dealer markup kept in your pocket
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span>Audited Quotes</span>
          </div>
          <div className="text-3xl font-display font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
            {totalAuditedBills}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Estimate records stored locally
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <Car className="w-4 h-4 text-amber-500" />
            <span>Vehicles in Garage</span>
          </div>
          <div className="text-3xl font-display font-extrabold text-slate-900 dark:text-white font-mono tabular-nums">
            {garage.length}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitored against factory intervals
          </p>
        </div>
      </div>

      {/* Vehicle Garage Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
              My Vehicle Garage
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Add your household cars to track upcoming factory maintenance and prevent dealership traps.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Vehicle</span>
          </button>
        </div>

        {garage.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
            No vehicles added yet. Click "+ Add Vehicle" above to add your car.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
            {garage.map((veh) => (
              <div
                key={veh.id}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {veh.year} {veh.make} {veh.model}
                  </h4>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5 tabular-nums">
                    {veh.mileage.toLocaleString()} {veh.distanceUnit}
                  </div>
                </div>

                <button
                  onClick={() => onRemoveVehicle(veh.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Remove vehicle"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audited Estimates History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
              Audited Service History ({savedEstimates.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              All previously scanned repair orders and customer strike-through summaries.
            </p>
          </div>

          <button
            onClick={exportVaultJSON}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Vault Data</span>
          </button>
        </div>

        {savedEstimates.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
            No audits saved yet. Audit a repair quote in the Laboratory and click "Save to Vault".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Dealership</th>
                  <th className="py-3 px-4 text-right">Quoted Total</th>
                  <th className="py-3 px-4 text-right">Approved</th>
                  <th className="py-3 px-4 text-right">Saved</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono tabular-nums">
                {savedEstimates.map((est) => (
                  <tr key={est.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-sans">
                      {est.date}
                    </td>
                    <td className="py-3.5 px-4 font-sans font-semibold text-slate-900 dark:text-white">
                      {est.vehicleYear} {est.vehicleMake} {est.vehicleModel}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-slate-600 dark:text-slate-400">
                      {est.agencyDealerName}
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-500 dark:text-slate-400">
                      {formatCurrency(est.totalQuotedPrice, est.currency)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(est.totalApprovedPrice, est.currency)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatCurrency(est.totalSaved, est.currency)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onLoadEstimate(est)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>Open</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onDeleteEstimate(est.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Delete from history"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              Add Vehicle to Garage
            </h3>

            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Make</label>
                <input
                  type="text"
                  required
                  value={make}
                  onChange={(e) => setMake(e.target.value)}
                  placeholder="e.g. Toyota"
                  className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Model</label>
                <input
                  type="text"
                  required
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. RAV4"
                  className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Year</label>
                  <input
                    type="number"
                    required
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    placeholder="2023"
                    className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Odometer ({distanceUnit})
                  </label>
                  <input
                    type="number"
                    required
                    value={odometer}
                    onChange={(e) => setOdometer(Number(e.target.value))}
                    placeholder="30000"
                    className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
