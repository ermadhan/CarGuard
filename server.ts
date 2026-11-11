import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { PRESET_SCENARIOS } from './src/data/presetScenarios.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.use(express.json({ limit: '25mb' }));

// Initialize GoogleGenAI SDK with required aistudio-build header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Heuristic fallback for audit scanning when Gemini API key is missing or offline
 */
function runHeuristicAudit(rawText: string, vehicleMake = 'Toyota', vehicleModel = 'RAV4', mileage = 30000, currency = 'USD', distanceUnit = 'miles') {
  const lines = rawText.split('\n').filter(l => l.trim().length > 0);
  const items = [];
  let totalQuoted = 0;
  let totalFair = 0;

  const patterns = [
    { regex: /oil|filter/i, name: 'Engine Oil & Filter Service', cat: 'maintenance', verdict: 'factory_required', severity: 'safe', price: 95, fair: 75, reasoning: 'Factory scheduled maintenance.', rule: 'Owner Manual: Essential engine lubrication renewal.' },
    { regex: /tire|rotation/i, name: 'Tire Rotation & Safety Check', cat: 'maintenance', verdict: 'factory_required', severity: 'safe', price: 55, fair: 35, reasoning: 'Standard safety wear interval.', rule: 'Owner Manual: Rotate tires every 5,000-10,000 miles.' },
    { regex: /flush|crankcase|engine flush/i, name: 'Crankcase Oil Chemical Flush', cat: 'flush', verdict: 'predatory_upsell', severity: 'danger', price: 185, fair: 0, reasoning: 'Disapproved by OEM. Modern oils have detergent packages; solvent flushes can degrade internal seals.', rule: 'Manufacturer Technical Bulletin: Do not use supplemental flush chemicals.' },
    { regex: /coolant|radiator/i, name: 'Coolant / Antifreeze System Flush', cat: 'flush', verdict: 'premature', severity: 'danger', price: 220, fair: 0, reasoning: 'Factory long-life coolant is rated for 100k+ miles. Premature on current mileage.', rule: 'Owner Manual: Coolant first replacement due at 100,000 miles (160,000 km).' },
    { regex: /throttle|induction|fuel system/i, name: 'Fuel Injection & Throttle Body Service', cat: 'flush', verdict: 'predatory_upsell', severity: 'danger', price: 195, fair: 0, reasoning: 'Common agency upsell. Modern direct-injection systems do not need routine solvent flushes without diagnostic codes.', rule: 'OEM Service Guide: Clean throttle body only when troubleshooting documented idle faults.' },
    { regex: /cabin|pollen/i, name: 'Cabin Dust & Pollen Air Filter', cat: 'filter', verdict: 'overpriced', severity: 'caution', price: 115, fair: 30, reasoning: 'Legitimate service, but billed at 4x-5x retail for a 2-minute toolless swap.', rule: 'Owner Manual: Replace every 20,000-30,000 miles. DIY part cost is $15.' },
    { regex: /brake fluid/i, name: 'Brake Fluid Hydraulic Flush', cat: 'fluids', verdict: 'factory_required', severity: 'safe', price: 145, fair: 95, reasoning: 'Recommended every 3 years / 30,000 miles due to hygroscopic moisture absorption.', rule: 'Owner Manual: Replace brake fluid every 36 months.' },
    { regex: /nitrogen/i, name: 'Nitrogen Tire Inflation Surcharge', cat: 'addon', verdict: 'unnecessary_addon', severity: 'danger', price: 65, fair: 0, reasoning: 'Dealer margin trick. Compressed ambient air is already 78% nitrogen.', rule: 'Tire Industry Association: Regular air is completely suitable for street driving.' },
  ];

  // Try matching detected lines or populate representative items
  let idCounter = 1;
  for (const line of lines) {
    const matched = patterns.find(p => p.regex.test(line));
    const extractedNum = line.match(/(\d+([.,]\d{1,2})?)/);
    const cost = extractedNum ? parseFloat(extractedNum[1].replace(',', '.')) : 0;

    if (matched) {
      const qPrice = cost > 0 ? cost : matched.price;
      items.push({
        id: `heur-${idCounter++}`,
        name: matched.name,
        category: matched.cat as any,
        quotedPrice: qPrice,
        fairMarketPrice: matched.fair,
        oemPartsCost: Math.round(matched.fair * 0.4),
        laborHours: 0.5,
        verdict: matched.verdict as any,
        severity: matched.severity as any,
        reasoning: matched.reasoning,
        factoryRuleReference: matched.rule,
        isDeclined: false,
      });
      totalQuoted += qPrice;
      totalFair += matched.fair;
    }
  }

  // If no lines matched, return sample RAV4 audit items
  if (items.length === 0) {
    const preset = PRESET_SCENARIOS[0];
    return {
      ...preset,
      vehicleMake,
      vehicleModel,
      currentMileage: mileage,
      currency: currency as any,
      distanceUnit: distanceUnit as any,
    };
  }

  const scamScore = totalQuoted > 0 ? Math.min(95, Math.round(((totalQuoted - totalFair) / totalQuoted) * 100)) : 40;

  return {
    id: `audit-${Date.now()}`,
    vehicleMake,
    vehicleModel,
    vehicleYear: 2023,
    currentMileage: mileage,
    distanceUnit: distanceUnit as any,
    currency: currency as any,
    agencyDealerName: 'Scanned Dealership Service Center',
    date: new Date().toISOString().split('T')[0],
    totalQuotedPrice: Math.round(totalQuoted * 100) / 100,
    totalFairPrice: Math.round(totalFair * 100) / 100,
    totalApprovedPrice: Math.round(totalQuoted * 100) / 100,
    totalSaved: 0,
    items,
    scamScorePercentage: Math.max(10, scamScore),
    summaryRecommendation: `Audit detected that approximately ${scamScore}% of quoted costs stem from dealer-invented flushes and inflated labor markups.`,
    dealerTricksDetected: [
      'Chemical flushes discouraged by manufacturer warranty guides',
      'Overpriced simple filter installations',
      'Non-essential ancillary add-ons',
    ],
  };
}

/**
 * POST /api/audit/scan
 * Multimodal OCR and line-item extraction using Gemini 3.8 Flash
 */
app.post('/api/audit/scan', async (req: Request, res: Response) => {
  try {
    const {
      imageBase64,
      mimeType = 'image/jpeg',
      rawText,
      vehicleMake = 'Toyota',
      vehicleModel = 'RAV4',
      vehicleYear = 2023,
      mileage = 30000,
      distanceUnit = 'miles',
      currency = 'USD',
    } = req.body;

    // Check if API key is present
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is not set. Executing rule-based heuristic audit.');
      const result = runHeuristicAudit(rawText || '', vehicleMake, vehicleModel, Number(mileage), currency, distanceUnit);
      return res.json({ success: true, estimate: result, source: 'heuristic' });
    }

    const systemInstruction = `
You are the Chief Auditor at CarGuard, an elite automotive engineering and consumer watchdog agency.
Your mission is to protect car owners from dealership agency collusion, overpriced markups, and predatory upsells (bogus flushes, premature service, and pure-profit fees).

Analyze the provided dealership invoice/quote image or text:
1. Extract line items, their quoted price in the target currency (${currency}), OEM part benchmark cost, and fair market price.
2. Cross-reference against official manufacturer maintenance intervals for ${vehicleMake} ${vehicleModel} at ${mileage} ${distanceUnit}.
3. Assign a verdict for every line item:
   - "factory_required": Explicitly stated in the vehicle's official owner manual at this exact mileage/time interval.
   - "predatory_upsell": Chemical flushes (crankcase, transmission machine flush, throttle body, fuel injector cleaner) or services discouraged by OEM.
   - "premature": Legitimate service, but recommended far earlier than factory schedule (e.g. coolant before 100k miles, spark plugs at 30k).
   - "overpriced": Legitimate item (like cabin air filter or battery spray) marked up 3x-6x over fair market rates.
   - "unnecessary_addon": Nitrogen tire fill, underbody coat, paint sealants, diagnostic fees for basic intake.
4. Calculate fair independent shop benchmark price and total scam/markup percentage.
5. Highlight specific dealer tricks and cite the official owner manual / technical service bulletin rules.
`;

    let parts: any[] = [];
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType,
          data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
        },
      });
      parts.push({
        text: `Please audit this car service estimate photograph for a ${vehicleYear} ${vehicleMake} ${vehicleModel} with approximately ${mileage} ${distanceUnit}. Active currency: ${currency}. Output the structured audit breakdown according to the JSON schema.`,
      });
    } else {
      parts.push({
        text: `Please audit this car service estimate text for a ${vehicleYear} ${vehicleMake} ${vehicleModel} with approximately ${mileage} ${distanceUnit}. Active currency: ${currency}.\n\nEstimate Text:\n${rawText || 'Standard major service quote with oil change, engine flush, brake inspection, cabin filter, coolant flush, and nitrogen fill.'}`,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts },
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            agencyDealerName: { type: Type.STRING },
            vehicleMake: { type: Type.STRING },
            vehicleModel: { type: Type.STRING },
            vehicleYear: { type: Type.INTEGER },
            currentMileage: { type: Type.INTEGER },
            distanceUnit: { type: Type.STRING },
            currency: { type: Type.STRING },
            totalQuotedPrice: { type: Type.NUMBER },
            totalFairPrice: { type: Type.NUMBER },
            scamScorePercentage: { type: Type.INTEGER },
            summaryRecommendation: { type: Type.STRING },
            dealerTricksDetected: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  category: { type: Type.STRING },
                  quotedPrice: { type: Type.NUMBER },
                  fairMarketPrice: { type: Type.NUMBER },
                  oemPartsCost: { type: Type.NUMBER },
                  laborHours: { type: Type.NUMBER },
                  verdict: { type: Type.STRING },
                  severity: { type: Type.STRING },
                  reasoning: { type: Type.STRING },
                  factoryRuleReference: { type: Type.STRING },
                },
                required: ['id', 'name', 'category', 'quotedPrice', 'fairMarketPrice', 'verdict', 'severity', 'reasoning', 'factoryRuleReference'],
              },
            },
          },
          required: ['agencyDealerName', 'totalQuotedPrice', 'totalFairPrice', 'scamScorePercentage', 'summaryRecommendation', 'items'],
        },
      },
    });

    const parsedData = JSON.parse(response.text || '{}');

    // Enrich with client control fields
    const enrichedItems = (parsedData.items || []).map((it: any, index: number) => ({
      ...it,
      id: it.id || `item-${index + 1}`,
      isDeclined: false,
    }));

    const result = {
      id: `audit-${Date.now()}`,
      agencyDealerName: parsedData.agencyDealerName || 'Dealer Service Agency',
      vehicleMake: parsedData.vehicleMake || vehicleMake,
      vehicleModel: parsedData.vehicleModel || vehicleModel,
      vehicleYear: parsedData.vehicleYear || vehicleYear,
      currentMileage: parsedData.currentMileage || mileage,
      distanceUnit: (parsedData.distanceUnit || distanceUnit) as any,
      currency: (parsedData.currency || currency) as any,
      date: new Date().toISOString().split('T')[0],
      totalQuotedPrice: parsedData.totalQuotedPrice || enrichedItems.reduce((acc: number, i: any) => acc + (i.quotedPrice || 0), 0),
      totalFairPrice: parsedData.totalFairPrice || enrichedItems.reduce((acc: number, i: any) => acc + (i.fairMarketPrice || 0), 0),
      totalApprovedPrice: parsedData.totalQuotedPrice || enrichedItems.reduce((acc: number, i: any) => acc + (i.quotedPrice || 0), 0),
      totalSaved: 0,
      scamScorePercentage: parsedData.scamScorePercentage || 50,
      summaryRecommendation: parsedData.summaryRecommendation || 'Review flagged line items and prune unnecessary dealer add-ons.',
      dealerTricksDetected: parsedData.dealerTricksDetected || ['Unnecessary fluid flushes', 'Overpriced consumable items'],
      items: enrichedItems,
    };

    return res.json({ success: true, estimate: result, source: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('Error during AI audit scan, falling back to heuristic:', error);
    const { rawText, vehicleMake, vehicleModel, mileage, currency, distanceUnit } = req.body;
    const fallback = runHeuristicAudit(rawText || '', vehicleMake, vehicleModel, Number(mileage), currency, distanceUnit);
    return res.json({ success: true, estimate: fallback, source: 'heuristic-fallback', error: error?.message });
  }
});

/**
 * POST /api/audit/dispute
 * Generates tailored counter-offers and printable formal dispute letters
 */
app.post('/api/audit/dispute', async (req: Request, res: Response) => {
  try {
    const { estimate, declinedItemNames = [], currency = 'USD' } = req.body;

    const vehicle = `${estimate?.vehicleYear || 2023} ${estimate?.vehicleMake || 'Toyota'} ${estimate?.vehicleModel || 'RAV4'}`;
    const dealer = estimate?.agencyDealerName || 'Dealership Service Department';
    const mileageStr = `${estimate?.currentMileage?.toLocaleString() || '30,000'} ${estimate?.distanceUnit || 'miles'}`;

    if (!process.env.GEMINI_API_KEY) {
      // Heuristic dispute text generator
      const declinedList = (declinedItemNames.length > 0 ? declinedItemNames : ['Engine Crankcase Flush', 'Coolant Flush', 'Nitrogen Fill']).map((name: string) => `• ${name}`).join('\n');
      return res.json({
        success: true,
        talkingPoints: [
          `"I have reviewed the official ${estimate?.vehicleMake || 'manufacturer'} maintenance schedule for my ${vehicle} at ${mileageStr}."`,
          `"My vehicle's owner manual explicitly does not schedule or recommend chemical flushes, which can harm internal engine seals."`,
          `"Please remove the following items from the job card: ${declinedItemNames.slice(0, 3).join(', ')}."`,
          `"Under consumer protection law, my statutory warranty cannot be voided for declining optional dealer-invented packages."`,
          `"Please proceed ONLY with the factory-required items at the agreed fair rate."`,
        ],
        counterOfferText: `Dear ${dealer},\n\nI have reviewed your service estimate for my ${vehicle} (${mileageStr}). Based on the official manufacturer maintenance schedule, I approve ONLY the factory-mandated services.\n\nPlease strike the following items from the job card immediately:\n${declinedList}\n\nKindly proceed only with approved factory operations and confirm the revised total.`,
        formalLetter: `FORMAL ESTIMATE REVISION NOTICE\n\nDate: ${new Date().toLocaleDateString()}\nTo: Service Manager, ${dealer}\nRegarding: Service Job Card for ${vehicle} (Odometer: ${mileageStr})\n\nDear Service Management,\n\nI am writing to formally request an itemized revision of the service estimate provided for my vehicle. Following a thorough review against the official ${estimate?.vehicleMake || 'OEM'} Factory Maintenance and Warranty Guide, I have identified several non-scheduled items and unauthorized add-ons that I hereby decline:\n\n${declinedList}\n\nPlease be advised that under federal and international statutory warranty protections (including the Magnuson-Moss Warranty Act, 15 U.S.C. § 2302(c), and EU Block Exemption Regulation 461/2010), consumers have the unambiguous legal right to refuse non-scheduled dealer recommendations without compromising their factory warranty coverage.\n\nI authorize your facility to perform ONLY the essential factory-scheduled line items. No supplementary work, flushes, or shop fees may be undertaken without my prior written authorization.\n\nPlease furnish an updated, amended invoice reflecting these removals prior to initiating repairs.\n\nSincerely,\nAuthorized Vehicle Owner`,
        legalCitation: 'Magnuson-Moss Warranty Act (15 U.S.C. § 2302) & Regional Consumer Rights Statutes',
      });
    }

    const prompt = `
Generate an assertive, professional, and courteous dispute script for a car owner dealing with a dealership service advisor.
Vehicle: ${vehicle}
Odometer: ${mileageStr}
Dealership: ${dealer}
Active Currency: ${currency}
Items customer is declining (because they are scam flushes/upsells):
${(declinedItemNames || []).join(', ')}

Please return a JSON object with:
- talkingPoints: Array of 4-5 bullet points the user can say over the phone or at the counter.
- counterOfferText: Short email or text message counter-offer.
- formalLetter: Full formal printable notice to the Service Director citing official manual specs and consumer warranty statutes (Magnuson-Moss, EU Block Exemption, or local consumer protection).
- legalCitation: Primary statute referenced.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, ...parsed });
  } catch (err: any) {
    console.error('Error in dispute generation:', err);
    return res.status(500).json({ error: 'Failed to generate dispute text' });
  }
});

// Mount Vite middleware in development, or serve dist in production
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CarGuard server running at http://0.0.0.0:${PORT} [${isProduction ? 'production' : 'development'}]`);
  });
}

startServer();
