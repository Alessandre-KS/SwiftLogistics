# SwiftLogistics Hub

> **Regional Courier Dispatch & Delivery Management System for Philippine MSMEs**  
> *Fortified with Built-In Zero-Trust RFC 6238 TOTP Multi-Factor Authentication & TripwireJS Automated Breach Containment Engine*  
> *Strict Compliance with Republic Act 10173 (Data Privacy Act of 2012) & National Privacy Commission (NPC) Circular 16-03*

---

## 1. Executive Summary & Problem Rationale

In the Philippines, Micro, Small, and Medium Enterprises (MSMEs) represent 99.5% of all registered businesses, serving as the economic backbone of regional supply chains and e-commerce logistics. Regional courier sorting facilities and branch dispatch desks handle thousands of daily parcels containing sensitive customer Personally Identifiable Information (PII)—including recipient names, physical home addresses, contact numbers, and Cash on Delivery (COD) amounts.

However, commercial logistics and Enterprise Resource Planning (ERP) platforms with enterprise-grade cybersecurity (such as CrowdStrike, AWS WAF, or Palo Alto Networks) are prohibitively expensive for local courier operators, often starting at $500–$2,000 per month. Consequently, regional courier branches operate with minimal digital defense, exposing them to credential phishing, session hijacking, and automated scraping.

Under **Republic Act 10173 (Data Privacy Act of 2012)** and **NPC Circular 16-03**, logistics providers are legally classified as Personal Information Controllers (PICs). Failure to protect consumer PII or report an active personal data breach within 72 hours results in administrative penalties of up to ₱5,000,000 and criminal imprisonment.

**SwiftLogistics Hub** solves this operational and legal crisis by delivering an enterprise-grade Courier Dispatch & Delivery Management Hub that integrates a **dual-layer zero-trust security engine** with **₱0.00 Total Cost of Ownership (TCO)**, operating completely within Google Cloud Platform's free tier.

---

## 2. System Architecture & Component Hierarchy

SwiftLogistics Hub operates as the flagship operational platform, backed by a dual-tier security subsystem:

```
                                  GOOGLE CLOUD FIRESTORE
                                (swiftlogistics-hub-9821)
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
         SWIFTLOGISTICS HUB                                     TRIPWIREJS
    Flagship Courier Dispatch System                      Owner Security Console (SOC)
 https://swiftlogistics-hub-9821.web.app           https://tripwirejs-capstone-9821.web.app
 ┌──────────────────────────────────────┐          ┌──────────────────────────────────────┐
 │ • Core Delivery Operations Terminal  │          │ • Administrative Threat Telemetry    │
 │ • Personal Information Controller    │          │ • Central Security Governance        │
 │ • Left-Sidebar Logistics Navigation  │          │ • Real-Time Burst Velocity Gauge     │
 │ • Barcode & Consignment Waybills     │          │ • Remote Kill-Switch & Account Reset │
 │ • Pre-Auth: RFC 6238 TOTP MFA Engine │          │ • NPC Section 20 Compliance Dossier  │
 │ • Post-Auth: TripwireJS Sentry SDK   │          │ • Zero-AI Tells (Dark SOC Aesthetic) │
 │ • Decoy Canary Trap (TRK-0000)       │          │ • Tamper-Proof Threat Audit Log      │
 └──────────────────────────────────────┘          └──────────────────────────────────────┘
```

### Component Overview
- **SwiftLogistics Hub ([`SwiftLogisticsHub/`](file:///w:/IAS%20CAPSTONE/SwiftLogisticsHub))**:
  - The primary operational courier application for branch clerks, dispatchers, and delivery riders.
  - Manages parcels, active shipments, consignment notes, delivery routes, and COD collections across Batangas province.
  - Implements **Pre-Authentication RFC 6238 TOTP Multi-Factor Authentication** to prevent unauthorized access from stolen passwords or headless API bots.
  - Embeds the **TripwireJS Sentry SDK** to detect and block post-authentication scraping in under 18 milliseconds.
- **TripwireJS Security Operations Console ([`TripwireJS/`](file:///w:/IAS%20CAPSTONE/TripwireJS))**:
  - The business owner (Aling Nena) administrative portal.
  - Monitors real-time query velocities, contains compromised employee accounts via Cloud Firestore Security Rules, and pre-fills NPC 72-Hour Breach Forensic reports.

---

## 3. Flagship Delivery Hub Features

### A. Regional Logistics Operations Desk
- **Branch #04 Intranet**: Tailored for regional dispatch hubs (Lipa City Sorting Facility, Batangas).
- **Consignment Waybill Manifest**: Real-time tabular tracking of customer consignments, delivery riders, Batangas municipalities, package descriptions, and COD balances.
- **Track & Trace Barcode Scanner**: Barcode-scanner styled input for rapid package lookups.
- **Dynamic 4-Stage Delivery Timeline**:
  1. *Manifested* (Received at Hub)
  2. *Sorting Center* (Passed regional sorting)
  3. *With Courier* (Out for delivery with assigned rider)
  4. *Delivered & Signed* (Recipient confirmed)
- **RA 10173 PII Masking**: Customer telephone numbers are strictly masked on all operational displays (e.g. `0917-***-1146`) to safeguard consignee data against visual theft.

### B. Pre-Authentication Defense: RFC 6238 TOTP Multi-Factor Authentication
To neutralize credential stuffing, phishing, and headless terminal API scripts, all staff counter sessions mandate Time-based One-Time Password (TOTP) verification:
- **RFC 6238 Standard**: Utilizes native Web Crypto HMAC-SHA1 with a 30-second timestep and 6-digit dynamic truncation.
- **Universal Authenticator Compatibility**: Synchronizes natively with **Google Authenticator**, **Microsoft Authenticator**, and **Authy** via standard `otpauth://` QR code enrollment.
- **Clock Drift Tolerance**: Evaluates token validity across a $\pm 30$-second window ($t_{-1}, t_0, t_{+1}$) to absorb real-world mobile device clock discrepancies.
- **Headless Script Immunity**: Even if an attacker steals Maria Santos's email and password (`maria.santos@swiftlogistics.ph` / `password123`), a headless Python script or `curl` loop cannot generate valid Firebase session credentials without the physical smartphone token.

### C. Post-Authentication Defense: TripwireJS Sentry Engine
If an authenticated device is hijacked in-session (via XSS or rogue operator misuse), TripwireJS monitors behavioral velocity and canary boundaries:
- **Layer-7 Pre-Flight Velocity Gate**: Enforces a sliding-window rate limit (30 queries / 5 seconds). Excess velocity triggers local execution termination in ~18ms before network packets are dispatched to Google Cloud, preserving free-tier read quotas.
- **Honeypot Decoy Canary Trap (`TRK-0000`)**: A synthetic waybill (`TRK-0000`) is planted inside the `/parcels` collection. Any automated query targeting it trips the sentry on Request #1.
- **0ms Edge Cloud Kill-Switch**: Compromised accounts have their `/staff/{uid}.status` flipped to `quarantined`. Cloud Firestore Security Rules evaluate `isNotQuarantined()`, severing database access across all Google Cloud nodes worldwide with zero server compute required.
- **"Rules Are Not Filters" Bulk Scraper Block**: Because `TRK-0000` is denied by rule, naive bulk collection queries (`collection.get()`) are rejected in full with `PERMISSION_DENIED`, returning zero customer records.

---

## 4. Live Deployments

| System | Role | Live URL |
| :--- | :--- | :--- |
| **SwiftLogistics Hub (Login & TOTP)** | Primary Courier Access Gateway | https://swiftlogistics-hub-9821.web.app/login.html |
| **SwiftLogistics Hub (Terminal Desk)** | Branch Courier Operations Intranet | https://swiftlogistics-hub-9821.web.app |
| **TripwireJS Security Console** | Owner Security Operations Center (SOC) | https://tripwirejs-capstone-9821.web.app |
| **GitHub Remote Repository** | Source Code & Version Control | https://github.com/Alessandre-KS/TripwireJS |

---

## 5. Academic Defense Demonstration Workflow

To demonstrate SwiftLogistics Hub during your capstone defense presentation, open both portals side-by-side:

```
┌──────────────────────────────────────────────┐  ┌──────────────────────────────────────────────┐
│ TAB 1: SWIFTLOGISTICS HUB                    │  │ TAB 2: TRIPWIREJS OWNER CONSOLE              │
│ https://swiftlogistics-hub-9821.web.app      │  │ https://tripwirejs-capstone-9821.web.app     │
└──────────────────────────────────────────────┘  └──────────────────────────────────────────────┘
```

1. **Demonstrate Courier Operations & Zero-Trust TOTP Login**:
   - Open Tab 1 and navigate to `/login.html`.
   - Select **Maria Santos (Dispatcher)** to autofill credentials.
   - Point out to the panel: *"Even with valid credentials, access is gated by our Pre-Authentication RFC 6238 TOTP engine."*
   - Click **Scan QR Code** and invite an examiner to scan it with their phone's **Google Authenticator**, or click **Quick-Fill** to show live code verification.
   - Access the main Dispatcher Desk and perform normal human parcel lookups (e.g. `TRK-1001`, `TRK-1002`) to demonstrate 0ms added overhead.
2. **Demonstrate Store Health**:
   - Open Tab 2 to show the owner's dashboard at `100% STORE HEALTH SAFE` with zero active anomalies.
3. **Simulate Scraper Attack**:
   - In Tab 1, run an automated scraper loop or search for the decoy canary `TRK-0000`.
4. **Observe Automated Containment**:
   - In Tab 1, at Query #31 (or Request #1 on the canary), the screen locks instantly with:  
     `🚫 401 UNAUTHORIZED: SESSION REVOKED BY TRIPWIREJS`  
     *Account quarantined across Google Cloud in 18ms.*
   - In Tab 2, Aling Nena's SOC console reflects the containment in real time: 31 records isolated, 4,969 preserved safe (99.38%), and the pre-filled NPC Circular 16-03 72-Hour Breach Report generated for export.
5. **Administrative Recovery**:
   - In Tab 2, click **Re-activate Maria Santos** to clear the quarantine flag and restore branch operations.

---

## 6. Repository Structure

```
├── .gitignore                                 # Git ignore configuration
├── README.md                                  # Flagship project documentation & threat model
├── TripwireJS_Capstone_Proposal_Deck.pptx     # Proposal presentation slide deck
├── TripwireJS_Proposal_Paper.docx             # Research paper manuscript
│
├── SwiftLogisticsHub/                         # [MAIN PRODUCT] Courier Operations Hub
│   ├── index.html                             # Dispatch terminal desk (Sidebar layout)
│   ├── login.html                             # Zero-trust TOTP MFA challenge login
│   ├── app.js                                 # Courier operations & Firestore integration
│   ├── totp.js                                # Native RFC 6238 Web Crypto TOTP engine
│   ├── style.css                              # Cargo freight design system
│   ├── firestore.rules                        # Production Layer-7 edge security rules
│   ├── firebase.json                          # Hosting headers & caching configuration
│   └── vendor/
│       └── tripwire.js                        # Embedded TripwireJS Sentry SDK
│
└── TripwireJS/                                # [SECURITY SUBSYSTEM] Owner SOC Console
    ├── index.html                             # Owner security console (Dark SOC layout)
    ├── app.js                                 # Forensic telemetry & audit logger
    ├── totp.js                                # TOTP policy monitor
    ├── style.css                              # Dark cyber console styling
    ├── tripwire.js                            # Standalone TripwireJS engine
    ├── firestore.rules                        # Threat log tamper-proof rules
    └── firebase.json                          # Hosting configuration
```

---

## 7. License & Academic Attribution

Developed for academic research and capstone defense at the University of Batangas - Lipa City (UB-Lipa CITEC) under the Bachelor of Science in Information Technology (BSIT) program.
All rights reserved under Republic Act 10173 and applicable intellectual property guidelines.
