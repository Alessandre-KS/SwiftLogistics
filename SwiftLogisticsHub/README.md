# SwiftLogistics Courier Hub (Branch #04 — Regional Dispatch & Sorting Facility)

This is the fully functioning client MSME courier management and counter dispatch website demonstrating how an everyday Philippine logistics business operates while protected by **TripwireJS** as an embedded Layer-7 security sentry.

## 📦 Normal Courier Operations (Fully Functioning):
1. **Branch Operational KPI Summary Bar**:
   * Live metrics for Active Shipments, Out for Delivery, At Hub / Sorting, Delivered & Signed, and Total COD Collected.
2. **Counter Track & Trace & Delivery Journey**:
   * Look up any package by Tracking Number (e.g. `TRK-8812`) or Customer Name.
   * Visual 4-step Delivery Journey timeline (`Manifested` ➔ `Sorting Center` ➔ `With Rider` ➔ `Delivered`).
   * Displays recipient details with RA 10173 privacy masking applied to contact phone numbers.
3. **Active Branch Shipments Manifest Table**:
   * Complete interactive data table featuring the 30 real UB-Lipa CITEC student data subjects.
   * Filter tabs (`All`, `🚚 Out for Delivery`, `🏢 At Hub`, `✅ Delivered`) and live table search input.
   * Row actions: `🔍 Track` (loads parcel journey) and `✏️ Edit` (opens status update modal).
4. **➕ Book New Parcel**:
   * Staff counter form to register a new shipment with Recipient Name, Phone, City, Description, and COD.
   * Automatically generates waybill tracking numbers (`TRK-XXXX`) and persists records.
5. **✏️ Update Delivery Status**:
   * Change shipment status in real time (`Out for Delivery`, `Delivered & Signed`, `Arrived at Hub`, etc.).

---

## 🛡️ Embedded TripwireJS Security Protection:
- **Normal Human Operations**: Zero lag (0 ms), human search frequency (0.1–0.5 req/s) operates seamlessly without interference.
- **⚡ Capstone Defense Attack Simulator Dock**:
  * Click **"⚡ Attack Simulator"** in the top navbar or scroll to the bottom dock.
  * **"⚡ Launch Bot Scraper"**: Simulates automated Python credential scraping at 11 req/s. Automatically contained at query #31 in 18 ms!
  * **"🪤 Trigger Decoy Canary Trap"**: Hits fake record `CUST-0000`, tripping the kill-switch on query #1.
  * **401 Unauthorized Full-Screen Lockout**: Demonstrates instant session termination across Google Cloud.
  * **"🛡️ Aling Nena's Owner Portal »"**: Direct link to the owner incident command center (`../TripwireJS/index.html`).

## 🚀 Starting the App (Login Flow):
1. Open **[`login.html`](file:///w:/IAS%20CAPSTONE/SwiftLogisticsHub/login.html)** in any web browser.
2. Sign in using:
   * **`👩‍💼 1-Click Login as Maria Santos (Dispatcher)`**: The primary staff account evaluated during the credential theft simulation.
   * Or **`👨‍💼 1-Click Login as Carlo Reyes (Courier Rider)`**.
   * Or type custom staff credentials (`maria.santos@swiftlogistics.ph` / `password123`).
3. Once authenticated, you are redirected into the active dispatch counter ([`index.html`](file:///w:/IAS%20CAPSTONE/SwiftLogisticsHub/index.html)).
4. Click **`🚪 Logout`** in the top navigation bar at any time to terminate your session and return to `login.html`.
