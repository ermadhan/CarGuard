import { ManufacturerSchedule } from '../types';

export const MANUFACTURER_SCHEDULES: Record<string, ManufacturerSchedule> = {
  Toyota: {
    make: 'Toyota',
    models: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma', 'Prius', 'Tundra'],
    warrantyRuleSummary: 'Toyota Warranty explicitly permits independent service without voiding coverage, provided OEM-grade fluids and receipts are kept.',
    legalStatuteNotice: 'Under the Magnuson-Moss Warranty Act (US) and EU Block Exemption (461/2010), dealers cannot void warranty for declining unlisted dealer packages or using non-dealer maintenance.',
    intervals: [
      {
        intervalValue: 10000,
        unit: 'miles',
        mandatoryServices: [
          'Engine oil and oil filter replacement (0W-16 / 0W-20 Synthetic)',
          'Tire rotation and pressure adjustment',
          'Multi-point visual safety inspection',
        ],
        strictlyBannedServices: [
          'Engine oil crankcase flush chemicals (Explicitly discouraged by Toyota Technical Instructions)',
          'Throttle body cleaning / induction service (Premature before 60k mi)',
          'Fuel injector chemical cleaning (Modern direct injection requires no routine additive flushes)',
          'Nitrogen tire fill surcharge ($50-$150 pure markup)',
        ],
        commonAgencyTraps: [
          'Dealership "15,000-Mile Gold Package" ($350-$600) packaging $75 oil change with visual checks and bogus flushes.',
          'Brake fluid flush at 15k miles (Toyota factory manual specifies inspection only, replace at 3 yrs or 30k miles only if moisture >3%).',
          'Cabin filter replacement quoted at $95-$140 (DIY cost is $15 and takes 2 minutes without tools).',
        ],
        officialManualSnippet: 'Toyota Warranty & Maintenance Guide: "Routine engine flushing is not recommended and may cause engine component damage."',
      },
      {
        intervalValue: 30000,
        unit: 'miles',
        mandatoryServices: [
          'Engine oil and filter change',
          'Tire rotation',
          'Cabin air filter replacement',
          'Engine air filter replacement',
          'Brake lines, pads, rotors inspection (flush only if moisture tested)',
        ],
        strictlyBannedServices: [
          'Coolant / Antifreeze flush (Toyota Super Long Life Coolant is rated for 100,000 miles / 160,000 km)',
          'Transmission fluid flush with chemicals (Factory fluid is WS lifetime, drain/fill only at 60k+ under severe use)',
          'Power steering flush (Electric power steering has no fluid!)',
        ],
        commonAgencyTraps: [
          '30,000-Mile "Major Dealer Service" quoting $800-$1,200 by bundling 5 unneeded fluid flushes.',
          'Charging $180 for "Battery Terminal Service" consisting of a $3 spray can application.',
        ],
        officialManualSnippet: 'Toyota Maintenance Manual: First coolant service is scheduled at 100,000 miles (160,000 km) or 10 years, whichever comes first.',
      },
      {
        intervalValue: 60000,
        unit: 'miles',
        mandatoryServices: [
          'Engine oil and filter change',
          'Tire rotation',
          'Cabin and engine air filters',
          'Brake fluid flush (DOT 3 / DOT 4)',
          'Drive belt inspection',
          'Exhaust system, fuel lines, suspension ball joints inspection',
        ],
        strictlyBannedServices: [
          'Spark plug replacement on iridium models (OEM Iridium plugs are rated for 120,000 miles)',
          'Solvent-based engine oil flush',
        ],
        commonAgencyTraps: [
          'Claiming iridium spark plugs need replacement at 60k miles to pad invoice by $350-$500.',
          'Differential fluid replacement on front-wheel drive models that do not have separate differentials.',
        ],
        officialManualSnippet: 'Toyota Manual: Iridium-tipped spark plugs must NOT be adjusted or cleaned and are scheduled for replacement at 120,000 miles.',
      },
    ],
  },
  Honda: {
    make: 'Honda',
    models: ['Civic', 'Accord', 'CR-V', 'Pilot', 'HR-V', 'Odyssey'],
    warrantyRuleSummary: 'Honda utilizes the Maintenance Minder computer system. Service codes (A/B, 1-6) govern real service needs, NOT arbitrary dealer mileage calendar cards.',
    legalStatuteNotice: 'Honda Service Bulletin 04-032 explicitly prohibits chemical flushes. Any dealer claiming flushes are "required for warranty" is violating official Honda technical directives.',
    intervals: [
      {
        intervalValue: 15000,
        unit: 'miles',
        mandatoryServices: [
          'Maintenance Minder Code A or B: Engine oil & filter replacement',
          'Tire rotation (Sub-item 1)',
          'Brake caliper slide inspection',
        ],
        strictlyBannedServices: [
          'Transmission flush with aftermarket solvent or flush machine (Honda Service Bulletin: USE DRAIN & FILL ONLY with genuine Honda ATF)',
          'Engine crankcase oil flush',
          'Power steering flush',
          'Fuel injector cleaning flush',
        ],
        commonAgencyTraps: [
          'Dealer inventing arbitrary 15,000-mile "Factory Recommended Service Packages" priced at $450-$700 that override the car\'s digital Maintenance Minder.',
          'Adding $180 "Fuel Induction Cleaning" claiming Honda direct injection will seize without it.',
        ],
        officialManualSnippet: 'Honda Service Bulletin 04-032: "American Honda does NOT recommend or approve any engine oil, transmission, brake, or power steering flush chemicals."',
      },
      {
        intervalValue: 30000,
        unit: 'miles',
        mandatoryServices: [
          'Engine oil and filter change',
          'Air cleaner element and dust/pollen filter (Sub-item 2)',
          'Transmission fluid drain and refill (Sub-item 3 if severe conditions, or at 45k normal)',
          'Brake fluid replacement (Every 3 years regardless of mileage)',
        ],
        strictlyBannedServices: [
          'Chemical radiator flush (Honda Long Life Antifreeze Type 2 lasts 120k miles or 10 years)',
          'Throttle plate scrubbing with aggressive solvents',
        ],
        commonAgencyTraps: [
          'Charging $220 for transmission machine flush that damages delicate linear solenoids.',
          'AC evaporator sanitizing foam charge ($160) for a standard 30k inspection.',
        ],
        officialManualSnippet: 'Honda Owner Manual: "Coolant replacement interval: 120,000 miles or 10 years for first replacement, then every 60,000 miles."',
      },
    ],
  },
  Volkswagen: {
    make: 'Volkswagen',
    models: ['Golf', 'Jetta', 'Tiguan', 'Passat', 'Taos', 'Atlas', 'ID.4'],
    warrantyRuleSummary: 'Volkswagen requires specific VW-standard synthetic oil (VW 508.00 / 504.00) and specific DSG transmission fluid services, but strictly regulates against dealer add-on flushes.',
    legalStatuteNotice: 'Under EU Block Exemption Regulation 461/2010 and US Magnuson-Moss, VW owners cannot be forced to service at franchised dealerships to maintain statutory factory warranties.',
    intervals: [
      {
        intervalValue: 30000,
        unit: 'km',
        mandatoryServices: [
          'Oil change service with VW-spec LongLife III FE synthetic oil',
          'Pollen/cabin filter replacement',
          'Brake pad thickness and rotor condition check',
          'Battery load test and diagnostic fault memory scan',
        ],
        strictlyBannedServices: [
          'Engine oil flush additives',
          'Fuel system cleaning additives (VW explicitly advises against non-approved fuel additives)',
          'Brake disc skim/machining when pads are above minimum threshold',
        ],
        commonAgencyTraps: [
          'Dealership charging €300+ for "Diagnostic Health Check" which is already included in standard service.',
          'Replacing spark plugs at 30,000 km (VW factory interval is 60,000 km / 40,000 miles).',
        ],
        officialManualSnippet: 'VW Service Schedule: "Only use genuine VW engine oil meeting standard specification. Do not add any supplementary lubricants to engine oil."',
      },
      {
        intervalValue: 60000,
        unit: 'km',
        mandatoryServices: [
          'Oil change service and inspection',
          'DSG dual-clutch transmission fluid and filter change (on equipped models)',
          'Spark plug replacement (petrol engines)',
          'Air filter element replacement',
          'Brake fluid replacement (every 2 years)',
        ],
        strictlyBannedServices: [
          'Power steering flush (Electro-mechanical steering)',
          'Engine carbon blast decarbonization without confirmed misfire fault codes',
        ],
        commonAgencyTraps: [
          'Charging €1,400+ by adding unneeded differential flushes, injector services, and wiper blade replacements at 4x retail.',
        ],
        officialManualSnippet: 'VW Technical Guide: Spark plug change interval on turbocharged TSI engines is 60,000 km (40,000 miles) or 4 years.',
      },
    ],
  },
  Hyundai: {
    make: 'Hyundai',
    models: ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Creta', 'Venue', 'Ioniq 5'],
    warrantyRuleSummary: 'Hyundai provides extensive warranty coverage (up to 10 years / 100k miles in US, 3-5 years globally) which dealership service departments routinely weaponize to coerce customer approvals.',
    legalStatuteNotice: 'Dealership advisors claiming "declining an engine flush voids your 10-year warranty" are engaging in deceptive trade practices prohibited by federal and international trade commissions.',
    intervals: [
      {
        intervalValue: 15000,
        unit: 'miles',
        mandatoryServices: [
          'Engine oil and filter replacement',
          'Tire rotation and balance check',
          'Climate control air filter replacement',
          'Brake hoses and lines inspection',
        ],
        strictlyBannedServices: [
          'Engine crankcase flush',
          'Fuel tank cleaning / additive bottles ($40 dealership markup)',
          'Throttle body decarbonization',
        ],
        commonAgencyTraps: [
          'Claiming severe driving schedule applies to everyone to cut maintenance intervals in half.',
          'Agency adding "Silencer coating", "Underbody anti-rust", and "AC duct disinfectant" inflating bills by 80%.',
        ],
        officialManualSnippet: 'Hyundai Owner Manual: "Never use supplemental oil additives. They are not recommended and may cause engine malfunction."',
      },
      {
        intervalValue: 30000,
        unit: 'miles',
        mandatoryServices: [
          'Engine oil and filter change',
          'Engine air cleaner filter replacement',
          'Climate control air filter replacement',
          'Brake fluid inspection (replace only if tested dark/moist)',
          'Exhaust pipe and mounting inspection',
        ],
        strictlyBannedServices: [
          'Coolant replacement (First factory coolant change is at 120,000 miles or 10 years)',
          'Automatic transmission fluid replacement (Sealed unit, check at 60k under severe driving only)',
        ],
        commonAgencyTraps: [
          'Charging $650 for a "30k Major Service Package" that contains $90 of required parts and 4 bogus fluid flushes.',
        ],
        officialManualSnippet: 'Hyundai Maintenance Schedule: Engine coolant replacement interval is 120,000 miles (193,000 km) or 10 years.',
      },
    ],
  },
  BMW: {
    make: 'BMW',
    models: ['3 Series', '5 Series', 'X3', 'X5', '4 Series', 'M340i'],
    warrantyRuleSummary: 'BMW vehicles employ Condition Based Servicing (CBS) sensors calculating wear dynamically. Dealerships routinely charge 3x-5x independent specialist rates.',
    legalStatuteNotice: 'Under European and North American Right to Repair legislation, certified independent European automotive specialists can reset CBS meters and stamp warranty books legally.',
    intervals: [
      {
        intervalValue: 20000,
        unit: 'km',
        mandatoryServices: [
          'Engine oil service with BMW Longlife-01 / LL-04 / LL-17 FE+ synthetic',
          'Microfilter / cabin air filter replacement',
          'Brake wear sensor and pad thickness check',
        ],
        strictlyBannedServices: [
          'Engine oil flush solvents',
          'Fuel rail ultrasonic flushing',
          'Dealer "VIP Key Reader Diagnostic Fee" (£120-£200 / $180-$250 for plugging in a key fob)',
        ],
        commonAgencyTraps: [
          'Quoting £320 for microfilter replacement that takes 8 minutes behind glovebox.',
          'Recommending complete brake rotor replacement when only pads have reached 3mm sensor trip point.',
        ],
        officialManualSnippet: 'BMW TIS Specification: "No oil additives of any kind are approved by BMW AG. Use only BMW Longlife certified oils."',
      },
    ],
  },
};
