# CarGuard — Auto Service Watchdog & Estimate Auditor

**CarGuard** is an open, independent consumer-advocacy platform designed to protect car owners from predatory dealership upsells, manufactured maintenance packages, and inflated service invoices. It audits car repair estimates against genuine original equipment manufacturer (OEM) manuals, benchmarks fair market repair rates across 8 global currencies, and generates legally backed dispute letters.

---

## The Problem

Car service is an intensely lucrative revenue driver for automotive dealerships. While vehicle sales often operate on razor-thin margins, service departments generate up to 50% of dealership gross profit. Manufacturers and franchised agencies frequently operate hand-in-hand:
- Agencies invent artificial "Service Packages" (e.g. 15,000-mile or 30,000-mile "Gold / Premier Bundles") packed with unneeded chemical flushes.
- Service advisors weaponize warranty anxiety, falsely claiming that declining optional dealer flushes voids the factory warranty.
- Cryptic job card jargon and acronyms obscure high-margin charges from the car owner.

---

## How CarGuard Verifies Service Items: The 5-Layer Verification Engine

CarGuard cross-references every quoted line item using an authoritative multi-tiered inspection pipeline:

### Layer 1: Official Factory Maintenance Schedule Matching (OEM Intervals)
Every vehicle manufacturer publishes an official maintenance schedule in the Owner’s Warranty & Maintenance Guide. CarGuard maps your vehicle's make, model, year, and current odometer milestone:
- **Exact Interval Verification**: At 30,000 miles (48,000 km), Toyota and Honda manuals mandate engine oil, oil filter, engine air filter, cabin air filter, and brake inspection.
- **Premature Detection**: If an agency quotes **coolant replacement** (which Toyota Super Long Life Coolant only requires at 100,000 miles / 160,000 km) or **iridium spark plugs** (rated for 120,000 miles), the engine flags them as **`Premature Milestone`** and displays the exact manual page citation.

### Layer 2: Manufacturer Technical Bulletins & Blacklisted Flushes
Chemical flushes are the single most lucrative profit center for dealership service departments—chemicals cost under $12 a bottle and are billed at $180–$260 in pure profit. CarGuard checks against manufacturer technical directives:
- **Explicit OEM Bans**: E.g., **Honda Service Bulletin 04-032** explicitly warns: *"American Honda does NOT recommend or approve any engine oil, transmission, brake, or power steering flush chemicals or flush machines."*
- **Phantom Systems**: Detects charges for fluids on systems that don't exist (e.g., billing a "power steering fluid flush" on modern electric power steering racks, or differential service on front-wheel-drive vehicles).
- Items in this category are flagged with high-contrast red alerts as **`Predatory Upsell`**.

### Layer 3: AI Multimodal & Semantic Jargon Normalization (Gemini 3.8 Flash)
Dealerships write repair orders with cryptic acronyms to confuse car owners (`BRK FLSH`, `IND SVC PACK`, `CRANK DEC`, `ENV HAZ FEE`, `PREM CARE A`).
- When you upload a bill photo or paste text, **Gemini 3.8 Flash** deciphers these codes and maps them to standard automotive mechanical operations.
- The model classifies each item into one of five mutually exclusive categories:
  1. **`Factory Mandated`**: Verifiable in the official owner's manual for this interval.
  2. **`Predatory Upsell`**: Solvents, additives, or flush machine treatments discouraged by the factory.
  3. **`Premature Milestone`**: Legitimate service, but pushed tens of thousands of miles early.
  4. **`Inflated Labor / Parts`**: Genuine service marked up 3x–6x over market rates.
  5. **`Non-Essential Add-on`**: Pure-margin accessories (nitrogen tire fill, silencer coatings, cabin fogging).

### Layer 4: Factory Flat-Rate Labor Hours & Regional Parts Benchmarking
For necessary maintenance operations, CarGuard calculates what the service should actually cost:
$$\text{Fair Price} = \text{OEM Component Retail} + (\text{Factory Standard Repair Time in Hours} \times \text{Regional Independent Labor Rate})$$
- *Example*: A cabin air filter has a factory flat-rate time of **0.2 hours** (~12 minutes) and an OEM filter part cost of **$16–$22**. If the agency quote lists $135.00, CarGuard flags it as **`Inflated Labor / Parts`** and calculates the exact price delta.

### Layer 5: Statutory Warranty Law Verification
Dealership service advisors often imply or state that declining dealer packages will "void your factory warranty." CarGuard cross-references this claim against statutory consumer laws:
- **United States**: *Magnuson-Moss Warranty Act (15 U.S.C. § 2302(c))* — makes tie-in sales illegal and protects warranty rights when refusing dealer packages.
- **European Union**: *Block Exemption Regulation 461/2010* — preserves statutory warranty rights regardless of who performs maintenance.
- **United Kingdom**: *Consumer Rights Act 2015 & Motor Ombudsman Code*.
- **India**: *Competition Commission of India (CCI) Automotive Directives & Consumer Protection Act 2019*.
- **Australia**: *Australian Consumer Law (ACL) Statutory Consumer Guarantees*.

The system automatically includes the specific legal clause in the generated dispute letter, giving owners the confidence and proof to decline unneeded charges on the spot.

---

## Core Capabilities & Feature Overview

1. **Multi-Mode Estimate Ingestion**:
   - **Photo OCR / Camera Scan**: Upload photos of printed repair orders or handwritten job sheets.
   - **Text & PDF Paste**: Paste email quotes or digitized line items.
   - **Scam Presets**: 1-click realistic multi-currency dealership bills (Toyota, VW, Hyundai, BMW).
   - **Manual Line-Item Builder**: Custom item entry with live category tagging.

2. **Interactive Line-Item Pruning**:
   - Strike out predatory flushes and overpriced items with 1 click.
   - Dynamic recalculation of Approved Work Order total and cumulative money saved.

3. **Global Multi-Currency Engine**:
   - Real-time conversion across **USD ($)**, **EUR (€)**, **GBP (£)**, **INR (₹)**, **AUD (A$)**, **CAD (C$)**, **JPY (¥)**, and **AED (AED)**.
   - Odometer distance toggle between **Miles** and **Kilometers**.
   - Regionalized labor rate benchmarks for each currency market.

4. **Dispute & Negotiation Studio**:
   - **Verbal Scripts**: Concise bullet points for phone calls or counter discussions.
   - **Email / SMS Counter-Offer**: Ready-to-send responses to service advisor text messages.
   - **Printable Formal Legal Notice**: Formally structured conditional work authorizations citing governing consumer warranty statutes.

5. **Fair Price Benchmark Directory**:
   - Searchable pricing matrix covering 12 common automotive services comparing dealership averages, certified independent shop prices, and DIY OEM parts costs.

6. **Savings Vault & Vehicle Garage**:
   - Household vehicle management.
   - History of audited repair orders with lifetime money saved counter.
   - 1-click JSON data export.
   - 100% private: stored in local browser storage without requiring third-party login or cloud tracking.

---

## Technical Stack & Architecture

- **Backend**: Node.js & Express (`server.ts`) with Vite dev middleware
- **AI / Multimodal OCR**: `@google/genai` TypeScript SDK using `gemini-3.8-flash` with structured JSON schema output and deterministic fallback heuristics
- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4 with dark mode variant (`@custom-variant dark (&:where(.dark, .dark *));`)
- **Typography**: Plus Jakarta Sans (Display), DM Sans (Body), JetBrains Mono (Tabular numerals)
- **Icons**: Lucide React

---

## Running Locally

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your environment variables in `.env` (optional for local heuristic testing; required for live Gemini multimodal OCR):
   ```bash
   GEMINI_API_KEY="your-gemini-api-key"
   ```
4. Start the application:
   ```bash
   npm run dev
   ```
5. Open your browser at `http://localhost:3000`.

---

## License & Disclaimer

*Disclaimer: CarGuard is an independent automotive consumer advocacy platform. Information is compiled from official manufacturer publications, SAE/ASE standards, and public consumer protection statutes. Always consult your vehicle's specific owner manual and local laws.*
