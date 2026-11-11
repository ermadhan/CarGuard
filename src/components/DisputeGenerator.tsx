import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Copy,
  Printer,
  Check,
  Scale,
  PhoneCall,
  Mail,
  FileCheck2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { ServiceEstimate, CurrencyCode } from '../types';
import { formatCurrency } from '../data/currencies';

interface DisputeGeneratorProps {
  currentEstimate: ServiceEstimate;
  currency: CurrencyCode;
}

export const DisputeGenerator: React.FC<DisputeGeneratorProps> = ({
  currentEstimate,
  currency,
}) => {
  const [selectedLaw, setSelectedLaw] = useState<'us' | 'uk' | 'eu' | 'in' | 'au'>('us');
  const [activeTab, setActiveTab] = useState<'phone' | 'email' | 'formal'>('phone');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const declinedItems = currentEstimate.items.filter((i) => i.isDeclined);
  const itemsToDispute = declinedItems.length > 0 ? declinedItems : currentEstimate.items.filter((i) => i.verdict !== 'factory_required');

  const vehicleName = `${currentEstimate.vehicleYear} ${currentEstimate.vehicleMake} ${currentEstimate.vehicleModel}`;
  const mileageStr = `${currentEstimate.currentMileage.toLocaleString()} ${currentEstimate.distanceUnit}`;
  const dealerName = currentEstimate.agencyDealerName || 'Dealership Service Department';

  const declinedListBullets = itemsToDispute.map((i) => `• ${i.name} (${formatCurrency(i.quotedPrice, currentEstimate.currency)})`).join('\n');
  const declinedListComma = itemsToDispute.map((i) => i.name).join(', ');

  const totalSaved = itemsToDispute.reduce((acc, i) => acc + i.quotedPrice, 0);

  // Legal framework definitions
  const legalFrameworks = {
    us: {
      name: 'United States — Magnuson-Moss Warranty Act',
      statute: '15 U.S.C. § 2302(c) (Tie-In Sales Prohibition)',
      summary: 'Dealers and manufacturers CANNOT void warranties or deny warranty claims for declining unlisted dealer packages or using independent maintenance, unless they provide the parts for free.',
    },
    uk: {
      name: 'United Kingdom — Consumer Rights Act 2015',
      statute: 'Consumer Rights Act 2015 & Motor Ombudsman Code of Practice',
      summary: 'Service providers are legally required to perform work with reasonable care and skill. Non-agreed charges, misleading urgency statements, and unauthorized add-ons are illegal under UK consumer law.',
    },
    eu: {
      name: 'European Union — Block Exemption Regulation',
      statute: 'EU Regulation 461/2010 (Automotive Block Exemption)',
      summary: 'Consumers are legally free to service their vehicles at any workshop or decline unnecessary franchise packages without jeopardizing the statutory manufacturer warranty.',
    },
    in: {
      name: 'India — Consumer Protection Act & CCI Rulings',
      statute: 'Consumer Protection Act 2019 & CCI Order in Case No. 03/2011',
      summary: 'Competition Commission of India ruled that car manufacturers cannot coerce owners into purchasing dealership bundled consumables or penalize warranty coverage for independent servicing.',
    },
    au: {
      name: 'Australia — Australian Consumer Law (ACL)',
      statute: 'Competition and Consumer Act 2010, Schedule 2 (Consumer Guarantees)',
      summary: 'Under ACL statutory guarantees, manufacturers cannot condition warranty claims on dealer-exclusive maintenance packages or unmandated fluid flushes.',
    },
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const phoneScript = `1. "Hello, I am calling regarding the estimate provided for my ${vehicleName} (Odometer: ${mileageStr})."
2. "I have thoroughly cross-referenced your quote with the official ${currentEstimate.vehicleMake} factory maintenance manual."
3. "My owner manual does not require or recommend the following items: ${declinedListComma}."
4. "Under consumer warranty law (${legalFrameworks[selectedLaw].statute}), declining these optional dealer add-ons has zero impact on my statutory factory warranty."
5. "I authorize you to proceed ONLY with the factory-mandated services for a total of ${formatCurrency(currentEstimate.totalApprovedPrice, currentEstimate.currency)}. Please do not perform any other operations without my written authorization."`;

  const emailScript = `Subject: Revised Service Authorization for ${vehicleName} [${mileageStr}]

Dear ${dealerName} Service Team,

Thank you for providing the initial estimate for my ${vehicleName}.

Following a review against the official ${currentEstimate.vehicleMake} Factory Maintenance Schedule, I am declining the following non-mandatory line items:
${declinedListBullets}

Please proceed strictly with the approved factory-scheduled operations totaling ${formatCurrency(currentEstimate.totalApprovedPrice, currentEstimate.currency)}.

Kindly reply confirming the updated job sheet before beginning work.

Sincerely,
Vehicle Owner`;

  const formalLetter = `FORMAL ESTIMATE MODIFICATION & CONDITIONAL WORK AUTHORIZATION

Date: ${new Date().toLocaleDateString()}
To: Service Director & Dealer Principal
Facility: ${dealerName}
Vehicle: ${vehicleName}
Odometer: ${mileageStr}

Dear Service Management,

I am writing to issue a formal conditional work authorization and request an immediate line-item adjustment for the service order referenced above.

After reviewing the estimate against the official ${currentEstimate.vehicleMake} Factory Maintenance and Warranty Guide, I have identified several operations that are neither scheduled by the original manufacturer nor required for mechanical longevity. Consequently, I hereby EXPLICITLY DECLINE and instruct your technicians NOT to perform the following items:

${declinedListBullets}
Total Declined Operations: ${formatCurrency(totalSaved, currentEstimate.currency)}

STATUTORY LEGAL NOTICE:
Please take note that under ${legalFrameworks[selectedLaw].name} (${legalFrameworks[selectedLaw].statute}), consumers possess the statutory right to refuse non-scheduled dealer add-on flushes and retail packages without forfeiting manufacturer warranty coverage. Claims that declining these services will "void the warranty" constitute deceptive trade practices under applicable consumer protection statutes.

CONDITIONAL AUTHORIZATION:
I authorize your service facility to perform ONLY the remaining factory-mandated line items at an agreed revised total of ${formatCurrency(currentEstimate.totalApprovedPrice, currentEstimate.currency)}. 

No supplementary diagnostics, chemical flushes, parts replacements, or ancillary shop fees may be initiated without prior written authorization from the undersigned. All replaced worn components must be bagged and retained for inspection upon vehicle collection.

Please provide an amended, signed work order reflecting these exclusions prior to commencing repairs.

Respectfully submitted,

_________________________________________
Authorized Vehicle Owner Signature`;

  return (
    <div className="space-y-6">
      {/* Title & Context Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold">
                Negotiation & Dispute Suite
              </span>
            </div>
            <h2 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
              Decline Dealership Upsells with Authority
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Dealership service advisors are trained to make optional flushes sound mandatory for your warranty. Use these battle-tested scripts and legally grounded notices citing official statutes.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-right">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 block">
              Items to Strike:
            </span>
            <span className="text-xl font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {formatCurrency(totalSaved, currentEstimate.currency)}
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
              ({itemsToDispute.length} line items)
            </span>
          </div>
        </div>

        {/* Legal Jurisdiction Selector */}
        <div className="mt-5">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-slate-500" />
            <span>Select Consumer Warranty Jurisdiction:</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(['us', 'uk', 'eu', 'in', 'au'] as const).map((region) => (
              <button
                key={region}
                onClick={() => setSelectedLaw(region)}
                className={`px-3 py-2 text-xs font-semibold rounded-lg border text-left transition-colors cursor-pointer ${
                  selectedLaw === region
                    ? 'border-slate-900 dark:border-white bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 text-slate-700 dark:text-slate-300'
                }`}
              >
                {region.toUpperCase()} ({region === 'us' ? 'USA' : region === 'uk' ? 'UK' : region === 'eu' ? 'EU' : region === 'in' ? 'India' : 'Australia'})
              </button>
            ))}
          </div>

          <div className="mt-3 p-3 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 text-xs">
            <strong className="text-slate-900 dark:text-white font-semibold">
              {legalFrameworks[selectedLaw].name}:
            </strong>{' '}
            <span className="text-slate-600 dark:text-slate-300">
              {legalFrameworks[selectedLaw].summary}
            </span>
          </div>
        </div>
      </div>

      {/* Script Format Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="flex border-b border-slate-100 dark:border-slate-800 p-2 gap-2 bg-slate-50 dark:bg-slate-950/40">
          <button
            onClick={() => setActiveTab('phone')}
            className={`px-4 py-2 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'phone'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Counter Talking Points (Verbal Script)</span>
          </button>

          <button
            onClick={() => setActiveTab('email')}
            className={`px-4 py-2 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'email'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email / Text Response</span>
          </button>

          <button
            onClick={() => setActiveTab('formal')}
            className={`px-4 py-2 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'formal'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Printable Legal Revision Notice</span>
          </button>
        </div>

        <div className="p-6">
          {/* TAB 1: Verbal Phone Script */}
          {activeTab === 'phone' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Read this when speaking to the service advisor over the phone or at the reception desk:
                </span>
                <button
                  onClick={() => copyToClipboard(phoneScript, 'phone')}
                  className="px-3 py-1.5 text-xs font-semibold rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedType === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'phone' ? 'Copied Script!' : 'Copy Script'}</span>
                </button>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {phoneScript}
              </div>
            </div>
          )}

          {/* TAB 2: Email Script */}
          {activeTab === 'email' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Send this in reply to the dealership estimate email or SMS:
                </span>
                <button
                  onClick={() => copyToClipboard(emailScript, 'email')}
                  className="px-3 py-1.5 text-xs font-semibold rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedType === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedType === 'email' ? 'Copied Email!' : 'Copy Email'}</span>
                </button>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {emailScript}
              </div>
            </div>
          )}

          {/* TAB 3: Formal Legal Letter */}
          {activeTab === 'formal' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Official written declaration to hand to the Service Director or attach to the repair order:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(formalLetter, 'formal')}
                    className="px-3 py-1.5 text-xs font-semibold rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedType === 'formal' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedType === 'formal' ? 'Copied Letter!' : 'Copy Text'}</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 text-xs font-semibold rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Notice</span>
                  </button>
                </div>
              </div>

              <div className="p-6 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap shadow-inner">
                {formalLetter}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
