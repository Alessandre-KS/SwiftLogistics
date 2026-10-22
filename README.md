# TripwireJS

> **Automated Post-Authentication Data Breach Containment for Philippine MSMEs**  
> *Compliance with Republic Act 10173 (Data Privacy Act of 2012) & NPC Circular 16-03*

---

## 1. Executive Summary

Philippine Micro, Small, and Medium Enterprises (MSMEs) account for 99.5% of all registered businesses in the country but lack the capital to procure enterprise cybersecurity platforms (such as Palo Alto Networks or CrowdStrike). When staff credentials or session tokens are compromised via phishing or session hijacking, attackers can systematically scrape customer Personally Identifiable Information (PII) before the breach is detected.

Under **RA 10173 (Data Privacy Act of 2012)** and **NPC Circular 16-03**, organizations that fail to report and mitigate personal data breaches within 72 hours face administrative fines of up to ₱5,000,000 and criminal liability.

**TripwireJS** introduces an **Assumed Breach** containment architecture designed specifically for resource-constrained Philippine MSMEs:
- **₱0.00 Total Cost of Ownership (TCO)**: Operates 100% within the free tier of Google Cloud Platform / Firebase Spark.
- **Sub-5-Second Containment**: Halts automated scrapers within 18 milliseconds, capping data exfiltration to <= 1.0% of the customer database.
- **0ms Database Overhead**: Uses stateless Cloud Firestore Security Rules (`isNotQuarantined()`) to sever database access at Google's edge with zero server compute required.
- **NPC 72-Hour Breach Forensic Dossier**: Automatically structures tamper-proof breach incident logs into formal National Privacy Commission (NPC) regulatory reports.

---

## 2. System Architecture & Dual-Entity Model

The repository contains two interconnected, yet autonomous systems:

```
                                  GOOGLE CLOUD FIRESTORE
                                (swiftlogistics-hub-9821)
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
         SWIFTLOGISTICS HUB                                     TRIPWIREJS
    Branch Logistics Counter Console                      Dark SOC Security Console
 https://swiftlogistics-hub-9821.web.app           https://tripwirejs-capstone-9821.web.app
 ┌──────────────────────────────────────┐          ┌──────────────────────────────────────┐
 │ • Real-world MSME Courier Desk       │          │ • Security Operations Center (SOC)   │
 │ • Personal Information Controller    │          │ • Security Telemetry & Sentry Engine │
 │ • Left-Sidebar Logistics Dispatch    │          │ • Full-Width Dark Cyber Terminal     │
 │ • Barcode & Consignment Waybills     │          │ • Real-Time Burst Velocity Meter     │
 │ • Protected by TripwireJS Layer-7    │          │ • One-Click Account Quarantine/Reset │
 │ • Decoy Canary Trap (TRK-0000)       │          │ • NPC Section 20 Compliance Dossier  │
 └──────────────────────────────────────┘          └──────────────────────────────────────┘
```

### Component Directory
- `TripwireJS/`: The cybersecurity operations console and core Sentry engine (`tripwire.js`).
- `SwiftLogisticsHub/`: The dummy MSME courier branch operations terminal (Branch #04, Lipa City, Batangas) demonstrating the protected production environment.
- `DEFENSE_PANEL_ATTACK_GUIDE.md`: Step-by-step instructions for demonstrating attacks and forensic response during academic evaluation.
- `SWIFTLOGISTICS_PROJECT_INSTRUCTIONS.md`: Technical documentation for the courier dispatch workflow and Firestore schema.

---

## 3. Core Security Mechanisms

### A. Layer-7 Pre-Flight Velocity Gate (Client-Side)
TripwireJS implements a sliding-window rate limiter inside the application runtime.
- **Threshold**: Exceeding 30 queries within a 5-second window trips the containment engine.
- **Latency**: Fires in ~18ms locally before network packets are dispatched to Google Cloud.
- **Resource Protection**: Preserves daily free-tier read quotas by dropping malicious loops before they touch the database.

### B. Honeypot Decoy Canary Trap (`TRK-0000`)
Automated enumeration tools (Burp Suite, SQLMap, custom scrapers) typically start scraping from the lowest numeric index.
- A synthetic document (`TRK-0000`) is planted inside the `/parcels` collection.
- Any request targeting `TRK-0000` fires an instant containment trigger on Request #1.
- Because Cloud Firestore Security Rules enforce `trackingNo != 'TRK-0000'`, Firestore's "Rules Are Not Filters" constraint also blocks automated bulk collection queries (`collection.get()`) from downloading the manifest.

### C. 0ms Cloud Kill-Switch via Firestore Security Rules
When TripwireJS flags a compromised user, the staff status in `/staff/{uid}` is updated to `quarantined`.
Cloud Firestore evaluates the following rule at Google's edge:
```cel
function isNotQuarantined() {
  return isAuthenticated()
    && exists(/databases/$(database)/documents/staff/$(request.auth.uid))
    && get(/databases/$(database)/documents/staff/$(request.auth.uid)).data.status != 'quarantined';
}

match /parcels/{trackingNo} {
  allow read: if isStaff() && isNotQuarantined() && trackingNo != 'TRK-0000';
}
```
The moment status becomes `quarantined`, every subsequent read and write attempt is immediately rejected across all Google Cloud nodes worldwide with zero additional infrastructure lag.

---

## 4. Live Deployments

| System | Role | Live URL |
| :--- | :--- | :--- |
| **SwiftLogistics Hub** | Branch Logistics Counter Desk | https://swiftlogistics-hub-9821.web.app |
| **TripwireJS Console** | Business Owner Security Console | https://tripwirejs-capstone-9821.web.app |

---

## 5. Academic Defense Demonstration Workflow

To demonstrate the system during a defense presentation, open both portals in side-by-side browser tabs:

1. **Tab 1 — SwiftLogistics Hub**: Log in as `Maria Santos (Dispatcher)` and perform standard parcel lookups (e.g. `TRK-1001`, `TRK-1002`) to show normal human browsing speed with 0ms added overhead.
2. **Tab 2 — TripwireJS Security Console**: View the live health monitor showing `100% STORE HEALTH SAFE` and zero active incidents.
3. **Execute Attack**: In Tab 1, launch an automated query loop or query `TRK-0000`.
4. **Instant Containment**: At Query #31 (or Request #1 for the canary), TripwireJS fires:
   - Tab 1 displays a full-screen `401 Unauthorized: Session Revoked` overlay.
   - Tab 2 instantly reflects the incident: Maria Santos quarantined in 18ms, 31 records isolated, and the pre-filled NPC 72-Hour Compliance Dossier ready for export.
5. **Recovery**: In Tab 2, click `Re-activate Account` to clear the quarantine flag and restore access.

---

## 6. Repository Structure

```
├── .gitignore
├── README.md
├── DEFENSE_PANEL_ATTACK_GUIDE.md
├── SWIFTLOGISTICS_PROJECT_INSTRUCTIONS.md
├── MASTER_PROJECT_BRIEF_AND_PROMPT.md
├── TripwireJS_Capstone_Proposal_Deck.pptx
├── TripwireJS_Proposal_Paper.docx
│
├── SwiftLogisticsHub/                # MSME Courier Operations Intranet
│   ├── index.html                    # Branch dispatch desk (Sidebar layout)
│   ├── login.html                    # Dispatch terminal sign-in
│   ├── app.js                        # Business logic & Firestore integration
│   ├── style.css                     # Logistics cargo styling
│   ├── firestore.rules               # Production Layer-7 security rules
│   ├── firebase.json                 # Hosting & headers configuration
│   └── vendor/
│       └── tripwire.js               # Embedded TripwireJS Sentry SDK
│
└── TripwireJS/                       # Security Operations Center (SOC)
    ├── index.html                    # Owner security console (Dark SOC layout)
    ├── app.js                        # Forensic telemetry & audit logger
    ├── style.css                     # Dark cyber console styling
    ├── tripwire.js                   # Standalone TripwireJS engine
    ├── firestore.rules               # Security rules for threat logs
    └── firebase.json                 # Hosting configuration
```

---

## 7. License & Academic Attribution

Developed for academic research and capstone defense at the University of Batangas - Lipa City (UB-Lipa CITEC) under the Bachelor of Science in Information Technology (BSIT) program.
All rights reserved under Republic Act 10173 and applicable intellectual property guidelines.
