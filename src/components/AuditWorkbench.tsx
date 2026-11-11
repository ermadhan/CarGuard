import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Ban,
  Tag,
  DollarSign,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Printer,
  MessageSquare,
  BookmarkCheck,
  Sparkles,
  Info,
  Car,
} from 'lucide-react';
import { ServiceEstimate, LineItem, CurrencyCode, DistanceUnit, ItemVerdict } from '../types';
import { formatCurrency, convertAmount, convertDistance, convertBetweenCurrencies, convertEstimateCurrency } from '../data/currencies';
import { PRESET_SCENARIOS } from '../data/presetScenarios';

interface AuditWorkbenchProps {
  currentEstimate: ServiceEstimate | null;
  onUpdateEstimate: (est: ServiceEstimate) => void;
  currency: CurrencyCode;
  distanceUnit: DistanceUnit;
  onGoToDispute: () => void;
  onSaveToVault: (est: ServiceEstimate) => void;
}

export const AuditWorkbench: React.FC<AuditWorkbenchProps> = ({
  currentEstimate,
  onUpdateEstimate,
  currency,
  distanceUnit,
  onGoToDispute,
  onSaveToVault,
}) => {
  const [inputTab, setInputTab] = useState<'upload' | 'paste' | 'manual' | 'presets'>('upload');
  const [rawText, setRawText] = useState('');
  const [vehicleMake, setVehicleMake] = useState('Toyota');
  const [vehicleModel, setVehicleModel] = useState('RAV4');
  const [vehicleYear, setVehicleYear] = useState(2023);
  const [mileage, setMileage] = useState(30000);
  const [dealerName, setDealerName] = useState('Franchised Dealership Agency');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [vaultSavedMessage, setVaultSavedMessage] = useState(false);

  // Manual entry fields
  const [manualItemName, setManualItemName] = useState('');
  const [manualItemPrice, setManualItemPrice] = useState('');
  const [manualItemCategory, setManualItemCategory] = useState<'maintenance' | 'flush' | 'brakes' | 'filter' | 'addon'>('flush');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ensure activeEstimate is scaled to active currency dynamically
  const activeEstimate = convertEstimateCurrency(currentEstimate || PRESET_SCENARIOS[0], currency);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAuditScan = async (useImage = false) => {
    setIsScanning(true);
    setScanStep('Transcribing estimate document & extracting line items...');

    try {
      const payload: any = {
        vehicleMake,
        vehicleModel,
        vehicleYear,
        mileage: Number(mileage),
        distanceUnit,
        currency,
      };

      if (useImage && selectedImage) {
        payload.imageBase64 = selectedImage;
        payload.mimeType = 'image/jpeg';
      } else {
        payload.rawText = rawText || '30k Major Service, Engine Flush, Coolant Flush, Nitrogen Tires';
      }

      setScanStep('Auditing against official OEM maintenance manuals...');
      const response = await fetch('/api/audit/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setScanStep('Calculating fair market parts & labor rates...');
      const data = await response.json();

      if (data.success && data.estimate) {
        onUpdateEstimate(data.estimate);
      }
    } catch (err) {
      console.error('Audit scan error:', err);
      // Fallback to preset
      onUpdateEstimate(PRESET_SCENARIOS[0]);
    } finally {
      setIsScanning(false);
      setScanStep('');
    }
  };

  const toggleDeclineItem = (itemId: string) => {
    if (!activeEstimate) return;

    const updatedItems = activeEstimate.items.map((item) => {
      if (item.id === itemId) {
        return { ...item, isDeclined: !item.isDeclined };
      }
      return item;
    });

    // Recalculate totals
    const totalApproved = updatedItems
      .filter((i) => !i.isDeclined)
      .reduce((sum, i) => sum + i.quotedPrice, 0);

    const totalSaved = updatedItems
      .filter((i) => i.isDeclined)
      .reduce((sum, i) => sum + i.quotedPrice, 0);

    const updatedEstimate: ServiceEstimate = {
      ...activeEstimate,
      items: updatedItems,
      totalApprovedPrice: Math.round(totalApproved * 100) / 100,
      totalSaved: Math.round(totalSaved * 100) / 100,
    };

    onUpdateEstimate(updatedEstimate);
  };

  const toggleAccordion = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddManualItem = () => {
    if (!manualItemName || !manualItemPrice) return;
    const price = parseFloat(manualItemPrice) || 0;

    let verdict: ItemVerdict = 'factory_required';
    let severity: 'safe' | 'caution' | 'danger' = 'safe';
    let reasoning = 'User-entered line item.';
    let rule = 'Verify against vehicle service book.';

    if (manualItemCategory === 'flush') {
      verdict = 'predatory_upsell';
      severity = 'danger';
      reasoning = 'Most chemical flushes are dealership-invented profit generators discouraged by OEMs.';
      rule = 'OEM Service Bulletin: Chemical flushes not approved.';
    } else if (manualItemCategory === 'addon') {
      verdict = 'unnecessary_addon';
      severity = 'danger';
      reasoning = 'Non-mechanical accessory or treatment.';
      rule = 'Optional dealership retail upsell.';
    }

    const newItem: LineItem = {
      id: `manual-${Date.now()}`,
      name: manualItemName,
      category: manualItemCategory,
      quotedPrice: price,
      fairMarketPrice: Math.round(price * 0.45 * 100) / 100,
      oemPartsCost: Math.round(price * 0.25 * 100) / 100,
      laborHours: 0.5,
      verdict,
      severity,
      reasoning,
      factoryRuleReference: rule,
      isDeclined: false,
    };

    const updatedItems = [...activeEstimate.items, newItem];
    const totalQuoted = updatedItems.reduce((acc, i) => acc + i.quotedPrice, 0);
    const totalFair = updatedItems.reduce((acc, i) => acc + i.fairMarketPrice, 0);
    const totalApproved = updatedItems.filter((i) => !i.isDeclined).reduce((acc, i) => acc + i.quotedPrice, 0);
    const totalSaved = updatedItems.filter((i) => i.isDeclined).reduce((acc, i) => acc + i.quotedPrice, 0);

    onUpdateEstimate({
      ...activeEstimate,
      items: updatedItems,
      totalQuotedPrice: totalQuoted,
      totalFairPrice: totalFair,
      totalApprovedPrice: totalApproved,
      totalSaved: totalSaved,
    });

    setManualItemName('');
    setManualItemPrice('');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveVault = () => {
    onSaveToVault(activeEstimate);
    setVaultSavedMessage(true);
    setTimeout(() => setVaultSavedMessage(false), 3000);
  };

  // Verdict style mapper adhering to anti-slop guidelines (no round candy pills, clean structured badges)
  const renderVerdictBadge = (verdict: ItemVerdict) => {
    switch (verdict) {
      case 'factory_required':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Factory Mandated</span>
          </span>
        );
      case 'predatory_upsell':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
            <Ban className="w-3.5 h-3.5" />
            <span>Predatory Upsell</span>
          </span>
        );
      case 'premature':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
            <Clock className="w-3.5 h-3.5" />
            <span>Premature Milestone</span>
          </span>
        );
      case 'overpriced':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 px-2 py-0.5 rounded border border-orange-200 dark:border-orange-800">
            <Tag className="w-3.5 h-3.5" />
            <span>Inflated Labor / Parts</span>
          </span>
        );
      case 'unnecessary_addon':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Non-Essential Add-on</span>
          </span>
        );
    }
  };

  const declinedCount = activeEstimate.items.filter((i) => i.isDeclined).length;

  return (
    <div className="space-y-8">
      {/* SECTION 1: Estimate Ingestion Engine */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">
              Estimate Audit Laboratory
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Input your dealership job sheet or estimate to cross-reference against OEM engineering intervals.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setInputTab('upload')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                inputTab === 'upload'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Photo OCR</span>
            </button>
            <button
              onClick={() => setInputTab('paste')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                inputTab === 'paste'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paste Text</span>
            </button>
            <button
              onClick={() => setInputTab('presets')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                inputTab === 'presets'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Scam Presets</span>
            </button>
            <button
              onClick={() => setInputTab('manual')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                inputTab === 'manual'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Manual Entry</span>
            </button>
          </div>
        </div>

        {/* Vehicle Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 py-4 border-b border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Make</label>
            <input
              type="text"
              value={vehicleMake}
              onChange={(e) => setVehicleMake(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              placeholder="e.g. Toyota"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Model</label>
            <input
              type="text"
              value={vehicleModel}
              onChange={(e) => setVehicleModel(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              placeholder="e.g. RAV4"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Year</label>
            <input
              type="number"
              value={vehicleYear}
              onChange={(e) => setVehicleYear(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              placeholder="2023"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Mileage ({distanceUnit})
            </label>
            <input
              type="number"
              value={mileage}
              onChange={(e) => setMileage(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium tabular-nums"
              placeholder="30000"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Agency Name</label>
            <input
              type="text"
              value={dealerName}
              onChange={(e) => setDealerName(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              placeholder="Dealer Agency"
            />
          </div>
        </div>

        {/* TAB 1: Photo OCR Upload */}
        {inputTab === 'upload' && (
          <div className="pt-5">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageUpload}
                className="hidden"
              />
              {selectedImage ? (
                <div className="space-y-3">
                  <img
                    src={selectedImage}
                    alt="Estimate preview"
                    className="max-h-48 mx-auto rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 object-contain"
                  />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Estimate Photo Loaded. Ready to Audit. Click to change.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                    <Upload className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Drop invoice photo here, or snap with mobile camera
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Supports estimates, repair orders, invoices, and job cards in PNG, JPEG, or HEIC format.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Target Currency: <strong className="text-slate-800 dark:text-slate-200">{currency}</strong>
              </span>
              <button
                disabled={isScanning || !selectedImage}
                onClick={() => runAuditScan(true)}
                className={`px-5 py-2.5 text-xs font-bold rounded-lg text-white shadow-sm flex items-center gap-2 transition-colors ${
                  isScanning || !selectedImage
                    ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed'
                    : 'bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 cursor-pointer'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400 dark:text-amber-600" />
                <span>{isScanning ? scanStep || 'Scanning...' : 'Scan & Audit Estimate with AI'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Paste Text */}
        {inputTab === 'paste' && (
          <div className="pt-5 space-y-4">
            <textarea
              rows={5}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste service quote lines here. Example:
Oil and Filter Change - $95.00
Crankcase Chemical Flush - $185.00
Transmission Service - $240.00
Cabin Air Filter - $115.00
Brake Fluid Flush - $150.00
Nitrogen Fill - $65.00"
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            <div className="flex justify-end">
              <button
                disabled={isScanning || !rawText.trim()}
                onClick={() => runAuditScan(false)}
                className={`px-5 py-2.5 text-xs font-bold rounded-lg text-white shadow-sm flex items-center gap-2 transition-colors ${
                  isScanning || !rawText.trim()
                    ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed'
                    : 'bg-slate-900 dark:bg-slate-100 dark:text-slate-900 hover:bg-slate-800 cursor-pointer'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400 dark:text-amber-600" />
                <span>{isScanning ? scanStep || 'Auditing...' : 'Analyze Pasted Estimate'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: Scam Presets */}
        {inputTab === 'presets' && (
          <div className="pt-5">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              Load an authentic, multi-currency dealership job card to see how CarGuard separates factory maintenance from bogus add-ons:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {PRESET_SCENARIOS.map((p) => {
                const convertedQuoted = convertBetweenCurrencies(p.totalQuotedPrice, p.currency, currency);
                const convertedFair = convertBetweenCurrencies(p.totalFairPrice, p.currency, currency);
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      onUpdateEstimate(convertEstimateCurrency(p, currency));
                      setVehicleMake(p.vehicleMake);
                      setVehicleModel(p.vehicleModel);
                      setMileage(p.currentMileage);
                      setDealerName(p.agencyDealerName);
                    }}
                    className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                      activeEstimate.id === p.id
                        ? 'border-slate-900 dark:border-white bg-slate-50 dark:bg-slate-800/80 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-900 dark:text-white">
                        {p.vehicleMake} {p.vehicleModel} ({p.currentMileage.toLocaleString()} {p.distanceUnit})
                      </span>
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono">
                        {p.scamScorePercentage}% Markup
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {p.agencyDealerName}
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono tabular-nums mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-slate-500">Quoted: {formatCurrency(convertedQuoted, currency)}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        Factory Req: {formatCurrency(convertedFair, currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: Manual Item Entry */}
        {inputTab === 'manual' && (
          <div className="pt-5 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-6">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Service Item Name</label>
                <input
                  type="text"
                  value={manualItemName}
                  onChange={(e) => setManualItemName(e.target.value)}
                  placeholder="e.g. Engine Oil Flush Treatment"
                  className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Quoted Price ({currency})</label>
                <input
                  type="number"
                  value={manualItemPrice}
                  onChange={(e) => setManualItemPrice(e.target.value)}
                  placeholder="185.00"
                  className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono tabular-nums"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Category</label>
                <select
                  value={manualItemCategory}
                  onChange={(e: any) => setManualItemCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                >
                  <option value="maintenance">Scheduled Maintenance</option>
                  <option value="flush">Chemical Flush</option>
                  <option value="brakes">Brakes</option>
                  <option value="filter">Filter</option>
                  <option value="addon">Dealer Add-on</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleAddManualItem}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-md hover:bg-slate-800 transition-colors"
              >
                + Add Line Item to Audit
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: Active Audit Results Breakdown */}
      <div className="space-y-6">
        {/* Audit Header Banner & Scam Score Gauge */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Audit Report #{activeEstimate.id}
                </span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {activeEstimate.date}
                </span>
              </div>
              <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                {activeEstimate.vehicleMake} {activeEstimate.vehicleModel} — {activeEstimate.currentMileage.toLocaleString()} {activeEstimate.distanceUnit}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Quoted by: <strong className="text-slate-800 dark:text-slate-200">{activeEstimate.agencyDealerName}</strong>
              </p>
            </div>

            {/* Scam Meter Box */}
            <div className="lg:text-right flex flex-col items-start lg:items-end">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Markup & Upsell Score
                </span>
                <span className="text-xl font-mono font-extrabold text-rose-600 dark:text-rose-400 tabular-nums">
                  {activeEstimate.scamScorePercentage}%
                </span>
              </div>
              <div className="w-48 h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-600 transition-all duration-500"
                  style={{ width: `${Math.min(100, activeEstimate.scamScorePercentage)}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 mt-1">
                {activeEstimate.scamScorePercentage > 50
                  ? 'Heavy Predatory Upsell Detected'
                  : 'Moderate Dealer Margin'}
              </span>
            </div>
          </div>

          {/* Key Findings Summary Box */}
          <div className="py-4 border-b border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Watchdog Analysis Summary
            </h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
              {activeEstimate.summaryRecommendation}
            </p>
            {activeEstimate.dealerTricksDetected && activeEstimate.dealerTricksDetected.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {activeEstimate.dealerTricksDetected.map((trick, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 font-medium"
                  >
                    ⚠ {trick}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Financial Totals Comparison Strip */}
          <div className="pt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Original Agency Quote
              </span>
              <div className="text-xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                {formatCurrency(activeEstimate.totalQuotedPrice, activeEstimate.currency)}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">All dealer line items</span>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                Real Factory Required
              </span>
              <div className="text-xl font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                {formatCurrency(activeEstimate.totalFairPrice, activeEstimate.currency)}
              </div>
              <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80">Per official OEM schedule</span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Your Approved Total
              </span>
              <div className="text-xl font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                {formatCurrency(activeEstimate.totalApprovedPrice, activeEstimate.currency)}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {activeEstimate.items.filter((i) => !i.isDeclined).length} of {activeEstimate.items.length} items kept
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm">
              <span className="text-xs font-semibold text-emerald-400 dark:text-emerald-600 uppercase tracking-wider block mb-1">
                Instant Money Saved
              </span>
              <div className="text-2xl font-mono font-extrabold tabular-nums">
                {formatCurrency(activeEstimate.totalSaved, activeEstimate.currency)}
              </div>
              <span className="text-xs text-slate-300 dark:text-slate-600">
                {declinedCount > 0 ? `${declinedCount} items declined` : 'Click Decline below to trim'}
              </span>
            </div>
          </div>
        </div>

        {/* Itemized Line-Item Table & Decision Workbench */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-display font-bold text-slate-900 dark:text-white">
                Line-by-Line Service Audit ({activeEstimate.items.length} items)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Toggle <strong className="text-rose-600 dark:text-rose-400">Decline / Strike</strong> on unneeded items to watch your revised quote and savings update in real time.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  // Decline all predatory & premature items with one click
                  const updated = activeEstimate.items.map((i) => ({
                    ...i,
                    isDeclined: i.verdict !== 'factory_required',
                  }));
                  const approved = updated.filter((i) => !i.isDeclined).reduce((s, i) => s + i.quotedPrice, 0);
                  const saved = updated.filter((i) => i.isDeclined).reduce((s, i) => s + i.quotedPrice, 0);
                  onUpdateEstimate({
                    ...activeEstimate,
                    items: updated,
                    totalApprovedPrice: approved,
                    totalSaved: saved,
                  });
                }}
                className="px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 rounded border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                Strike All Unneeded Items (1-Click)
              </button>
            </div>
          </div>

          {/* Line Items List */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {activeEstimate.items.map((item) => {
              const isExpanded = !!expandedItems[item.id];
              const isDeclined = item.isDeclined;

              return (
                <div
                  key={item.id}
                  className={`p-5 transition-colors ${
                    isDeclined
                      ? 'bg-slate-50/70 dark:bg-slate-950/40 opacity-75'
                      : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Item Information & Verdict */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        {renderVerdictBadge(item.verdict)}
                        <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                          {item.category}
                        </span>
                      </div>

                      <h4
                        className={`text-base font-semibold ${
                          isDeclined
                            ? 'line-through text-slate-500 dark:text-slate-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {item.name}
                      </h4>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                        {item.reasoning}
                      </p>
                    </div>

                    {/* Pricing Column & Actions */}
                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-3 shrink-0">
                      <div className="text-right">
                        <div
                          className={`text-lg font-mono font-bold tabular-nums ${
                            isDeclined
                              ? 'line-through text-slate-400 dark:text-slate-600'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {formatCurrency(item.quotedPrice, activeEstimate.currency)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                          Fair rate: {formatCurrency(item.fairMarketPrice, activeEstimate.currency)}
                        </div>
                      </div>

                      {/* Toggle Decline Button */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleAccordion(item.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                          title="View Factory Manual Rule"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => toggleDeclineItem(item.id)}
                          className={`px-3 py-1.5 text-xs font-bold rounded transition-colors cursor-pointer ${
                            isDeclined
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300'
                              : item.verdict === 'factory_required'
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                              : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                          }`}
                        >
                          {isDeclined ? 'Restore Item' : 'Decline / Strike'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Accordion: Factory Engineering Rule & Parts Breakdown */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        <div className="font-semibold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                          <Info className="w-3.5 h-3.5 text-indigo-500" />
                          <span>Official Factory Reference:</span>
                        </div>
                        <p className="leading-relaxed font-mono text-[11px]">
                          {item.factoryRuleReference}
                        </p>
                      </div>

                      <div className="p-3 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        <div className="font-semibold text-slate-900 dark:text-white mb-1">
                          Cost Anatomy (Fair Benchmark):
                        </div>
                        <div className="grid grid-cols-2 gap-2 font-mono text-[11px] tabular-nums">
                          <div>OEM Parts Cost: {formatCurrency(item.oemPartsCost, activeEstimate.currency)}</div>
                          <div>Labor Time: {item.laborHours} hrs</div>
                          <div>Fair Labor Cost: {formatCurrency(item.fairMarketPrice - item.oemPartsCost, activeEstimate.currency)}</div>
                          <div>Dealer Markup: +{Math.max(0, Math.round(((item.quotedPrice - item.fairMarketPrice) / Math.max(1, item.fairMarketPrice)) * 100))}%</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Workbench Footer Action Bar */}
          <div className="p-5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Total Approved Estimate:{' '}
              <strong className="text-slate-900 dark:text-white font-mono text-sm tabular-nums">
                {formatCurrency(activeEstimate.totalApprovedPrice, activeEstimate.currency)}
              </strong>{' '}
              · Total Savings:{' '}
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm tabular-nums">
                {formatCurrency(activeEstimate.totalSaved, activeEstimate.currency)}
              </strong>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Revised Order</span>
              </button>

              <button
                onClick={handleSaveVault}
                className="px-3.5 py-2 text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{vaultSavedMessage ? 'Saved to Vault!' : 'Save to Vault'}</span>
              </button>

              <button
                onClick={onGoToDispute}
                className="px-4 py-2 text-xs font-bold rounded-md bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Dispute & Counter-Offer Studio</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
