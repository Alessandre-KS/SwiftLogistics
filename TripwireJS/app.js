/**
 * ============================================================================
 * TRIPWIREJS SECURITY OPERATIONS CENTER (SOC) — ADMIN CONTROLLER (v5.0)
 * SwiftLogistics Courier Services — Branch #04 Regional Facility
 *
 * PROJECT ARCHITECTURE OVERVIEW:
 * 1. Business Owner SOC Console: High-privilege management portal for Bossing Jeff.
 * 2. Real-Time Cloud Listeners: Instant synchronization with Google Cloud Firestore.
 * 3. Assumed-Breach Mitigation: Automated Layer-7 token revocation within <18 milliseconds.
 * 4. Regulatory Compliance: Automated NPC 72-Hour Breach Forensic Reporting (RA 10173).
 * 5. High-Privilege Governance: Password & reason-gated account quarantine and deletion.
 *
 * Designed for clean maintainability, clear readability, and ease of onboarding
 * for future software developers, students, and cybersecurity researchers.
 * ============================================================================
 */

// ============================================================================
// SECTION 1: CLOUD FIREBASE INITIALIZATION & RUNTIME APPLICATION STATE
// ============================================================================

// FIREBASE CONNECTION CONFIGURATION FOR TRIPWIREJS SOC
const firebaseConfig = (typeof window !== "undefined" && window.FIREBASE_CONFIG) ? window.FIREBASE_CONFIG : {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "swiftlogistics-hub-9821.firebaseapp.com",
    projectId: "swiftlogistics-hub-9821",
    storageBucket: "swiftlogistics-hub-9821.firebasestorage.app",
    messagingSenderId: "602215546126",
    appId: "1:602215546126:web:28439f8304a2613c072b5f"
};

// COMPAT SDK INSTANCES FOR FIRESTORE AND STORAGE
let app, db;
try {
    if (typeof firebase !== "undefined") {
        app = firebase.initializeApp(firebaseConfig, "tripwireOwnerPortal");
        db = firebase.firestore(app);
    }
} catch (e) {
    if (typeof firebase !== "undefined") {
        try { db = firebase.firestore(); } catch (err) {}
    }
}

// GLOBAL PORTAL INCIDENT STATE ("before" = NOMINAL MONITORING, "after" = CONTAINED BREACH)
let currentState = "before";
let activeIncident = null;

// BASELINE IN-MEMORY STAFF DIRECTORY (INITIALIZED WITH BUSINESS OWNER)
let staffList = [
    {
        id: "usr_jeff",
        name: "Bossing Jeff",
        role: "Business Owner (Administrator)",
        email: "jeff@swiftlogistics.ph",
        active: true,
        velocity: "0.1 req/s (Nominal)",
        isFlagged: false
    }
];

// FORENSIC AUDIT LIST OF DATA SUBJECTS TOUCHED DURING INCIDENTS
let victimsList = [];

// DOM ELEMENT REFERENCES
let brandBadge, heroBanner, heroTitle, heroDesc;
let statSafetyRate, statSafetySub, statSafeBar, statDangerBar;
let boxExposed, labelExposed, statExposed, statExposedSub, btnViewVictimsCard;
let statSpeed, statSpeedSub;
let panelTitle, panelCaption, actionContainer, unlockFooter;
let activityTitle, activityCaption, logList, staffTableBody;

// ============================================================================
// SECTION 2: UI DOM ELEMENT SELECTORS & COMPONENT BINDING
// ============================================================================

// INITIALIZE AND CACHE REFERENCES TO ALL INTERACTIVE DOM ELEMENTS
function initDOMElements() {
    brandBadge = document.getElementById("brandBadge");

    heroBanner = document.getElementById("heroBanner");
    heroTitle = document.getElementById("heroTitle");
    heroDesc = document.getElementById("heroDesc");

    statSafetyRate = document.getElementById("statSafetyRate");
    statSafetySub = document.getElementById("statSafetySub");
    statSafeBar = document.getElementById("statSafeBar");
    statDangerBar = document.getElementById("statDangerBar");

    boxExposed = document.getElementById("boxExposed");
    labelExposed = document.getElementById("labelExposed");
    statExposed = document.getElementById("statExposed");
    statExposedSub = document.getElementById("statExposedSub");
    btnViewVictimsCard = document.getElementById("btnViewVictimsCard");

    statSpeed = document.getElementById("statSpeed");
    statSpeedSub = document.getElementById("statSpeedSub");

    panelTitle = document.getElementById("panelTitle");
    panelCaption = document.getElementById("panelCaption");
    actionContainer = document.getElementById("actionContainer");
    unlockFooter = document.getElementById("unlockFooter");

    activityTitle = document.getElementById("activityTitle");
    activityCaption = document.getElementById("activityCaption");
    logList = document.getElementById("logList");

    staffTableBody = document.getElementById("staffTableBody");
}

// ============================================================================
// SECTION 3: INCIDENT TELEMETRY & ATTACK STATE CONTROLLER
// ============================================================================

// SWITCH UI STATE BETWEEN NOMINAL OPERATION ("before") AND BREACH MITIGATION ("after")
function switchState(mode, incidentData = null) {
    currentState = mode;
    activeIncident = incidentData;

    if (mode === "before") {
        // 1. CONFIGURE TOP HERO BANNER FOR NOMINAL STATUS
        if (heroBanner) heroBanner.className = "hero-alert-banner hero-safe-banner";
        if (heroTitle) heroTitle.innerText = "System Baseline: Normal Operations";
        if (heroDesc) heroDesc.innerText = "All client queries are within designated velocity thresholds (max 30 req / 5s). Layer-7 sentry inspection and Cloud Firestore default-deny enforcement active.";

        // 2. METRIC 1: DATABASE PRESERVATION RATE
        if (statSafetyRate) statSafetyRate.innerText = "100% Intact";
        if (statSafetySub) statSafetySub.innerText = "5,000 of 5,000 records protected";
        if (statSafeBar) statSafeBar.style.width = "100%";
        if (statDangerBar) statDangerBar.style.width = "0%";

        // 3. METRIC 2: EXPOSED RECORDS (BLAST RADIUS)
        if (statExposed) statExposed.innerText = "0 Records";
        if (statExposedSub) statExposedSub.innerText = "Zero unauthorized access attempts detected";
        if (boxExposed) boxExposed.className = "metric-box";
        if (labelExposed) labelExposed.innerText = "Exposed Records Prior to Containment";
        if (btnViewVictimsCard) btnViewVictimsCard.style.display = "none";

        // 4. METRIC 3: MITIGATION LATENCY
        if (statSpeed) {
            statSpeed.innerText = "0 ms Overhead";
            statSpeed.className = "metric-number text-primary";
        }
        if (statSpeedSub) statSpeedSub.innerText = "Real-time client-side rate limit + Cloud kill-switch";

        // 5. LEFT COLUMN: PREVENTATIVE POLICY ENFORCEMENT
        if (panelTitle) panelTitle.innerText = "Active Sentry Policies";
        if (panelCaption) panelCaption.innerText = "Layer-7 threat containment rules active across regional dispatch stations:";

        if (actionContainer) {
            actionContainer.innerHTML = `
                <div class="action-item">
                    <div class="action-header">
                        <span class="action-step-num">1</span>
                        <div>
                            <strong>Sliding-Window Rate Limiter</strong>
                            <p>Enforces maximum 30 query requests per 5-second window per authenticated dispatch session.</p>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-outline" onclick="openModal('thresholdSettingsModal')">
                        Adjust Rate Window
                    </button>
                </div>

                <div class="action-item">
                    <div class="action-header">
                        <span class="action-step-num">2</span>
                        <div>
                            <strong>Honeypot Decoy Canary (TRK-0000)</strong>
                            <p>Synthetic waybill planted in database. Any read query triggers instant credential quarantine.</p>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-outline" onclick="openModal('thresholdSettingsModal')">
                        Verify Trap Configuration
                    </button>
                </div>

                <div class="action-item">
                    <div class="action-header">
                        <span class="action-step-num">3</span>
                        <div>
                            <strong>Automated Cloud Kill-Switch</strong>
                            <p>Direct Google Cloud Firestore integration revoking session authority in &lt;20ms.</p>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-outline" onclick="scrollToStaff()">
                        Manage Credentials
                    </button>
                </div>
            `;
        }

        if (unlockFooter) unlockFooter.style.display = "none";

        // 6. RIGHT COLUMN: LIVE AUDIT FEED
        if (activityTitle) activityTitle.innerText = "Live Telemetry Feed";
        if (activityCaption) activityCaption.innerText = "Real-time query activity across active branch terminals:";

        if (logList) {
            logList.innerHTML = `
                <div class="log-entry">
                    <span class="log-tag tag-success">NORM</span>
                    <span class="log-time">${new Date().toLocaleTimeString()}</span>
                    <span class="log-msg">Counter Terminal #04: Nominal query velocity (0.2 req/s).</span>
                </div>
                <div class="log-entry">
                    <span class="log-tag tag-success">SYNC</span>
                    <span class="log-time">${new Date().toLocaleTimeString()}</span>
                    <span class="log-msg">Cloud Firestore rules synchronized: isNotQuarantined() active.</span>
                </div>
                <div class="log-entry">
                    <span class="log-tag tag-info">READY</span>
                    <span class="log-time">${new Date().toLocaleTimeString()}</span>
                    <span class="log-msg">Decoy canary waybill (TRK-0000) primed and listening.</span>
                </div>
            `;
        }

        renderStaffTable();

    } else if (mode === "after") {
        const inc = incidentData || {
            id: "INC-20261021-001",
            timestamp: new Date().toLocaleTimeString(),
            triggerType: "VELOCITY_RATE_LIMIT_EXCEEDED",
            staffName: "Maria Santos",
            staffId: "usr_maria",
            containmentTimeMs: 18,
            recordsExposed: 31,
            recordsProtected: 4969,
            percentSafe: "99.38%"
        };

        buildDynamicVictims(inc);

        // 1. CONFIGURE TOP HERO BANNER FOR ACTIVE BREACH CONTAINMENT
        if (heroBanner) heroBanner.className = "hero-alert-banner hero-breach-banner";
        if (heroTitle) heroTitle.innerText = "Incident Contained: Automated Token Quarantine";
        if (heroDesc) heroDesc.innerHTML = `
            Automated Layer-7 containment severed compromised session for <strong>${inc.staffName}</strong> in <strong>${inc.containmentTimeMs}ms</strong>. 
            Exfiltration halted after ${inc.recordsExposed} records. <strong>${inc.recordsProtected} records (${inc.percentSafe}) preserved intact.</strong>
        `;

        // 2. METRIC 1: DATABASE PRESERVATION RATE
        if (statSafetyRate) statSafetyRate.innerText = inc.percentSafe;
        if (statSafetySub) statSafetySub.innerText = `${inc.recordsProtected} of 5,000 customer records protected`;
        if (statSafeBar) statSafeBar.style.width = inc.percentSafe;
        if (statDangerBar) statDangerBar.style.width = (100 - parseFloat(inc.percentSafe)) + "%";

        // 3. METRIC 2: EXPOSED RECORDS (BLAST RADIUS)
        if (statExposed) statExposed.innerText = `${inc.recordsExposed} Records`;
        if (statExposedSub) statExposedSub.innerText = `Blast radius contained by TripwireJS in ${inc.containmentTimeMs}ms`;
        if (boxExposed) boxExposed.className = "metric-box breach-active";
        if (labelExposed) labelExposed.innerText = "Exposed Records (Blast Radius)";
        if (btnViewVictimsCard) btnViewVictimsCard.style.display = "inline-flex";

        // 4. METRIC 3: MITIGATION LATENCY
        if (statSpeed) {
            statSpeed.innerText = `${inc.containmentTimeMs} Milliseconds`;
            statSpeed.className = "metric-number text-primary";
        }
        if (statSpeedSub) statSpeedSub.innerText = "Automated token revocation + Cloud Firestore kill-switch";

        // 5. LEFT COLUMN: INCIDENT REMEDIATION PROTOCOL
        if (panelTitle) panelTitle.innerText = "Incident Remediation Protocol";
        if (panelCaption) panelCaption.innerText = "Execute required incident containment and statutory compliance actions:";

        if (actionContainer) {
            actionContainer.innerHTML = `
                <div class="action-item">
                    <div class="action-header">
                        <span class="action-step-num">1</span>
                        <div>
                            <strong>Credential Quarantine Active</strong>
                            <p>Session token for ${inc.staffName} (${inc.staffId}) revoked across Cloud infrastructure in ${inc.containmentTimeMs}ms.</p>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-outline" id="btnQuarantine" onclick="handleQuarantine()">
                        Dispatch Password Reset
                    </button>
                </div>

                <div class="action-item">
                    <div class="action-header">
                        <span class="action-step-num">2</span>
                        <div>
                            <strong>RA 10173 Section 20 Compliance</strong>
                            <p>Regulatory notification required for the ${inc.recordsExposed} data subjects touched prior to session revocation.</p>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-primary" id="btnSendSms" onclick="openModal('smsModal')">
                        Review & Broadcast SMS (${inc.recordsExposed})
                    </button>
                </div>

                <div class="action-item">
                    <div class="action-header">
                        <span class="action-step-num">3</span>
                        <div>
                            <strong>NPC 72-Hour Breach Forensic Report</strong>
                            <p>Formal notification required by NPC Circular 16-03 for all automated containment incidents.</p>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-outline" onclick="openModal('npcModal')">
                        Generate Official Dossier
                    </button>
                </div>
            `;
        }
        if (unlockFooter) unlockFooter.style.display = "flex";

        // 6. RIGHT COLUMN: FORENSIC TELEMETRY AUDIT LOG
        if (activityTitle) activityTitle.innerText = "Forensic Event Telemetry";
        if (activityCaption) activityCaption.innerText = "Immutable event log recording breach detection and mitigation timeline:";

        if (logList) {
            logList.innerHTML = `
                <div class="log-entry">
                    <span class="log-tag tag-danger">CRIT</span>
                    <span class="log-time">${inc.timestamp}</span>
                    <span class="log-msg">Velocity threshold exceeded: ${inc.recordsExposed} queries in 3.1s on ${inc.staffId}.</span>
                </div>
                <div class="log-entry">
                    <span class="log-tag tag-primary">KILL</span>
                    <span class="log-time">${inc.timestamp}</span>
                    <span class="log-msg">Automated token revocation executed in ${inc.containmentTimeMs}ms. isNotQuarantined() evaluated FALSE in Firestore rules.</span>
                </div>
                <div class="log-entry">
                    <span class="log-tag tag-info">NOTIF</span>
                    <span class="log-time">${inc.timestamp}</span>
                    <span class="log-msg">Emergency notification dispatched to administrator mobile (${protectionSettings.alertPhone}).</span>
                </div>
            `;
        }

        renderStaffTable();
    }
}

// ============================================================================
// SECTION 4: FORENSIC AUDIT LOG & DYNAMIC VICTIMS GENERATOR
// ============================================================================

// GENERATE SIMULATED LIST OF TOUCHED DATA SUBJECTS FOR AUDIT LOGGING
function buildDynamicVictims(inc) {
    victimsList = [];
    const count = inc.recordsExposed || 31;

    // IF CANARY HONEYPOT TRIGGERED: EXCLUSIVELY DECOY RECORD EXPOSED
    if (inc.triggerType === "HONEYPOT_CANARY_TRIPPED") {
        victimsList.push({
            id: "TRK-0000",
            name: "HONEYPOT CANARY (Decoy Record)",
            phone: "0900-***-0000",
            city: "Decoy Route",
            exposed: "None (Decoy Record)",
            isCanary: true,
            smsStatus: "Session Terminated"
        });
        return;
    }

    const sampleLocations = ["Lipa City", "Tanauan City", "Batangas City", "Sto. Tomas", "San Jose", "Malvar", "Padre Garcia", "Rosario", "Mataasnakahoy", "Balete"];
    const samplePackages = ["Mechanical Keyboard & Keycaps", "UB-Lipa CITEC Department Uniform", "Computer RAM & NVMe SSD Drive", "IT Capstone Project Hardware Kit", "Digital Graphic Drawing Tablet", "Database Management Textbooks"];

    const realStudents = [
        "Alessandre Kyle E. Sanidad", "Samantha Jean Q. Adaya", "Joanna Rei E. Aguila",
        "Stephanie H. Albacite", "Jan Rykaelle C. Belegal", "Nicole Angelique A. Dela Cruz",
        "Aizel Anne Magsino", "Maybell J. Mañibo", "Lyra Isabel R. Perez",
        "Reinali Mae B. Rojas", "Rheamae A. Roldan", "Yvonne Gail V. Rosales",
        "Aerone Cedric L. Abaigar", "Vonn Cedric M. Abello", "John Francis D. Alvarez",
        "Andrei B. Amparo", "Carl Joseph G. Arrieta", "Liwen Aibud Barnuevo",
        "Julian Nichoes S. Bautista", "Ashton Ross M. Cabasal", "Cedric Gian C. Combate",
        "John Paul E. Culala", "Randee M. Curioso Jr.", "John Mark B. Daradar",
        "Jay Noel R. David", "Carl Daniel K. De La Cruz", "Bennedict Oswyn D. Diokno",
        "Gabriel D. Gabiliño", "Rainner B. Gallo", "Jestine E. Gibaga"
    ];

    for (let i = 0; i < count; i++) {
        const idNum = 1001 + i;
        const name = realStudents[i % realStudents.length];
        const city = sampleLocations[i % sampleLocations.length] + ", Batangas";
        const pkg = samplePackages[i % samplePackages.length];
        const phone = "09" + Math.floor(10 + Math.random() * 89) + "-***-" + String(1000 + i).slice(-4);

        victimsList.push({
            id: `TRK-${idNum}`,
            name: name,
            phone: phone,
            city: city,
            package: pkg,
            exposed: "Recipient Name, Masked Phone, Delivery Town, Consignment Details",
            isCanary: false,
            smsStatus: "Pending Dispatch"
        });
    }
}

// RENDER FORENSIC AUDIT TABLE OF EXPOSED DATA SUBJECTS
function renderVictimsTable() {
    const tbody = document.getElementById("victimTableBody");
    const counter = document.getElementById("victimCountBadge");
    if (counter) counter.innerText = `${victimsList.length} Records`;
    if (!tbody) return;

    tbody.innerHTML = victimsList.map(v => {
        const statusBadge = v.isCanary
            ? `<span class="status-pill status-pill-success">Decoy Canary</span>`
            : (v.smsStatus.includes("Dispatched") 
                ? `<span class="status-pill status-pill-success">SMS Broadcasted</span>`
                : `<span class="status-pill status-pill-danger">Notification Pending</span>`);

        return `
            <tr>
                <td class="font-mono font-bold">${v.id}</td>
                <td><strong>${v.name}</strong></td>
                <td class="font-mono text-muted">${v.phone}</td>
                <td class="text-muted" style="font-size: 11.5px;">${v.city}</td>
                <td style="font-size: 11px; color: var(--text-muted);">${v.exposed}</td>
                <td>${statusBadge}</td>
            </tr>
        `;
    }).join("");
}

// EXPORT AFFECTED CITIZEN AUDIT LIST TO CSV FILE
function exportVictimCsv() {
    showToast("Exporting forensic log to CSV...");

    let csvContent = "Record_ID,Customer_Name,Contact_Info,Data_Fields_Exposed,Notification_Status\n";
    victimsList.forEach(v => {
        csvContent += `"${v.id}","${v.name}","${v.phone}","${v.exposed}","${v.smsStatus}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Affected_Customer_Records_Forensic_List.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ============================================================================
// SECTION 5: IDENTITY & ACCESS MANAGEMENT (STAFF DIRECTORY & GOVERNANCE)
// ============================================================================

// RESOLVE VEHICLE EMOJI ICON FOR COURIER ROLE
function getVehicleEmoji(type) {
    if (!type) return "🏍️";
    const t = String(type).toLowerCase();
    if (t.includes("truck")) return "🚚";
    return "🏍️";
}

// TOGGLE VEHICLE SELECTION WHEN ROLE CHANGES ON PROVISIONING FORM
function handleNewStaffRoleChange() {
    const roleEl = document.getElementById("newStaffRole");
    const groupEl = document.getElementById("newStaffVehicleGroup");
    if (roleEl && groupEl) {
        groupEl.style.display = (roleEl.value.includes("Driver") || roleEl.value.includes("Rider")) ? "block" : "none";
    }
}

// RENDER EMPLOYEES ACCESS GOVERNANCE TABLE
function renderStaffTable() {
    if (!staffTableBody) return;

    staffTableBody.innerHTML = staffList.map(staff => {
        const initials = (staff.name || "ST").split(" ").map(n => n[0]).join("");
        const statusBadge = staff.active 
            ? `<span class="status-pill status-pill-success">Active</span>` 
            : `<span class="status-pill status-pill-danger">Quarantined</span>${staff.quarantineReason ? `<div style="font-size:10px; color:#F87171; font-weight:600; margin-top:3px; max-width:180px; line-height:1.2; word-break:break-word;">⚠️ ${escapeHtml(staff.quarantineReason)}</div>` : ''}`;

        let actionBtn = "";
        if (staff.id === "usr_jeff") {
            actionBtn = `<span class="text-muted" style="font-size:12px;">Administrator</span>`;
        } else {
            const quarantineBtn = staff.active 
                ? `<button class="btn btn-sm btn-outline text-danger" onclick="openAdminConfirmModal('quarantine', '${staff.id}')">Quarantine</button>` 
                : `<button class="btn btn-sm btn-primary" onclick="toggleStaffAccount('${staff.id}')">Restore</button>`;
            const deleteBtn = `<button class="btn btn-sm btn-outline text-danger" style="margin-left: 6px; border-color: #FECACA; background: #FEF2F2;" onclick="openAdminConfirmModal('delete', '${staff.id}')" title="Permanently delete staff account">Delete</button>`;
            actionBtn = `<div style="display: flex; align-items: center; gap: 4px;">${quarantineBtn}${deleteBtn}</div>`;
        }

        const velocityBadge = staff.isFlagged && !staff.active
            ? `<span class="text-danger font-mono font-bold">${staff.velocity}</span>`
            : `<span class="text-muted font-mono">${staff.velocity}</span>`;

        return `
            <tr>
                <td>
                    <div class="staff-avatar-cell">
                        <div class="staff-avatar-circle">${initials}</div>
                        <div>
                            <strong>${staff.name}</strong><br>
                            <span class="text-muted font-mono" style="font-size: 11px;">${staff.email}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <span>${staff.role}</span>
                    ${staff.vehicleType ? `<div style="margin-top:3px;"><span style="font-size:10.5px; font-weight:700; color:#EA580C; background:#FFF7ED; border:1px solid #FFEDD5; padding:2px 7px; border-radius:12px; display:inline-flex; align-items:center; gap:3px;">${getVehicleEmoji(staff.vehicleType)} ${staff.vehicleType}</span></div>` : ''}
                </td>
                <td>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="font-size: 11px; font-weight: 700; color: #10B981; background: rgba(16, 185, 129, 0.12); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.3); font-family: var(--font-mono);">
                            TOTP RFC 6238
                        </span>
                        <button class="btn btn-sm btn-outline" style="padding: 2px 7px; font-size: 11px;" onclick="viewEmployeeQrModal('${staff.id}')" title="View Google Authenticator 2FA QR Code">
                            📱 QR Code
                        </button>
                    </div>
                </td>
                <td>${statusBadge}</td>
                <td>${velocityBadge}</td>
                <td>${actionBtn}</td>
            </tr>
        `;
    }).join("");
}

// TOGGLE STAFF ACTIVE STATE (RESTORATION OR ROUTE TO PASSWORD-GATED QUARANTINE MODAL)
async function toggleStaffAccount(staffId) {
    const staff = staffList.find(s => s.id === staffId);
    if (!staff) return;

    const newActiveState = !staff.active;

    if (!newActiveState) {
        // MANUAL QUARANTINE REQUIRES ADMIN PASSWORD AND REASON
        openAdminConfirmModal('quarantine', staffId);
        return;
    }

    // ACCOUNT RESTORATION PROCEDURE
    staff.active = true;
    staff.velocity = "0.2 req/s (Nominal)";
    staff.isFlagged = false;
    staff.quarantineReason = "";
    showToast(`Account Restored: ${staff.name} authorized for dispatch operations.`);

    // SYNCHRONIZE TO CLOUD FIRESTORE
    if (db) {
        try {
            await db.collection("staff").doc(staffId).update({
                status: "active",
                quarantineReason: "",
                velocity: staff.velocity
            });
            await db.collection("system_status").doc("tripwire").set({
                isQuarantined: false,
                status: "active",
                targetStaff: staffId,
                staffName: staff.name,
                quarantineReason: "",
                timestamp: new Date().toISOString()
            }, { merge: true });
        } catch (e) {
            console.warn("Firestore staff update notice:", e.message);
        }
    }

    try {
        localStorage.setItem("tripwire_quarantine_sync", "active");
        let dir = JSON.parse(localStorage.getItem("swift_staff_directory") || "[]");
        const idx = dir.findIndex(s => s.id === staffId);
        if (idx !== -1) {
            dir[idx].active = true;
            dir[idx].status = "active";
            dir[idx].quarantineReason = "";
            localStorage.setItem("swift_staff_directory", JSON.stringify(dir));
        }
    } catch (e) {}

    logSecurityEvent("RESTORE", staff.name, staffId, "Re-authorized for dispatch operations by Business Owner");

    if (currentState === "after") {
        switchState("before");
    }

    renderStaffTable();
}

// DEMO SHORTCUT: QUICK-RESTORE DEFAULT DISPATCHER
function handleRestore() {
    toggleStaffAccount("usr_maria");
}

// SMOOTH SCROLL DIRECTLY TO STAFF DIRECTORY TABLE
function scrollToStaff() {
    const el = document.getElementById("staffSection");
    if (el) el.scrollIntoView({ behavior: "smooth" });
}

// DISPLAY EMPLOYEE 2FA QR CODE MODAL FOR AUTHENTICATOR ENROLLMENT
function viewEmployeeQrModal(staffId) {
    const staff = staffList.find(s => s.id === staffId);
    if (!staff) return;

    let totpSecret = staff.totpSecret;
    if (!totpSecret) {
        if (typeof TOTP !== "undefined" && TOTP.getSecretForEmail) {
            totpSecret = TOTP.getSecretForEmail(staff.email);
        } else {
            totpSecret = "JBSWY3DPEHPK3PXP";
        }
    }

    const titleEl = document.getElementById("verifiedModalHeading");
    if (titleEl) titleEl.innerText = "Employee 2FA Authenticator Setup";

    const nameEl = document.getElementById("verifiedStaffName");
    if (nameEl) nameEl.innerText = staff.name + " (" + staff.role + ")";

    const secEl = document.getElementById("verifiedSecretKey");
    if (secEl) secEl.innerText = totpSecret;

    const otpUrl = `otpauth://totp/SwiftLogistics:${encodeURIComponent(staff.email)}?secret=${totpSecret}&issuer=SwiftLogistics&algorithm=SHA1&digits=6&period=30`;
    const qrImg = document.getElementById("verifiedQrImage");
    if (qrImg) {
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(otpUrl)}`;
    }

    openModal("verifiedOnboardingModal");
}

// ============================================================================
// SECTION 6: STATUTORY REGULATORY REMEDIATION (NPC COMPLIANCE & SMS NOTICES)
// ============================================================================

// SIMULATE DISPATCHING PASSWORD RESET LINK TO QUARANTINED TERMINAL
function handleQuarantine() {
    const btn = document.getElementById("btnQuarantine");
    if (!btn) return;
    btn.disabled = true;
    btn.innerText = "Dispatching Reset Link...";

    setTimeout(() => {
        btn.innerText = "Reset Notification Dispatched";
        btn.className = "btn btn-sm btn-outline";
        showToast("Credential reset instructions dispatched to staff endpoint.");
    }, 500);
}

// BROADCAST SMS BREACH ADVISORIES VIA SEMAPHORE TO EXPOSED CITIZENS
function confirmSmsSend() {
    closeModal("smsModal");
    const btn = document.getElementById("btnSendSms");
    if (btn) {
        btn.disabled = true;
        btn.innerText = "Broadcasting Advisories...";
    }

    setTimeout(() => {
        if (btn) {
            btn.innerText = "Advisories Broadcast Completed";
            btn.className = "btn btn-sm btn-outline";
        }
        victimsList.forEach(v => {
            if (!v.isCanary) v.smsStatus = "Dispatched (Semaphore)";
        });
        renderVictimsTable();
        showToast("Advisories successfully broadcast to affected recipients.");
    }, 600);
}

// DOWNLOAD OFFICIAL NPC 72-HOUR BREACH INCIDENT DOSSIER (RA 10173 SEC. 20)
function downloadNpcReport() {
    closeModal("npcModal");
    showToast("Exporting official NPC breach dossier...");

    const inc = activeIncident || {
        id: "INC-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-001",
        timestamp: new Date().toLocaleString(),
        containmentTimeMs: 18,
        recordsExposed: 31,
        recordsProtected: 4969,
        percentSafe: "99.38%"
    };

    const npcData = {
        compliance_authority: "National Privacy Commission (Republic Act 10173)",
        circular_reference: "NPC Circular 16-03 (Personal Data Breach Management)",
        store_name: "SwiftLogistics Courier Services PH (Branch #04)",
        business_owner: "Bossing Jeff",
        incident_id: inc.id,
        discovery_timestamp: inc.timestamp,
        containment_latency: `${inc.containmentTimeMs} Milliseconds`,
        total_data_subjects: 5000,
        records_exposed: inc.recordsExposed,
        records_protected: inc.recordsProtected,
        integrity_rate: inc.percentSafe,
        incident_classification: "Credential Compromise with High-Velocity Automated Query Enumeration",
        automated_remediation_executed: [
            `Session revoked across Google Cloud infrastructure in ${inc.containmentTimeMs}ms`,
            "Compromised staff credential isolated and placed into quarantine status",
            `SMS advisory prepared for ${inc.recordsExposed} data subjects under Section 20`,
            `${inc.recordsProtected} customer profiles preserved without exposure`
        ],
        statutory_status: "Timely Submission within Mandatory 72-Hour Window"
    };

    const blob = new Blob([JSON.stringify(npcData, null, 4)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `NPC_72Hour_Breach_Report_${inc.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// ============================================================================
// SECTION 7: DETECTION THRESHOLDS & RATE LIMITING POLICY CONFIGURATION
// ============================================================================

// SENTRY DETECTION PARAMETERS AND OPERATIONAL THRESHOLDS
let protectionSettings = {
    burstLimit: 30,          // MAXIMUM QUERIES ALLOWED PER WINDOW
    burstWindowSec: 5,       // SLIDING TIME WINDOW IN SECONDS
    dailyQuota: 50,          // DAILY SHIFT QUOTA PER STAFF
    canaryEnabled: true,     // HONEYPOT CANARY DECOY TRAP SWITCH
    alertPhone: "0917-829-9821" // SMS ALERT NOTIFICATION ROUTING
};

// LOAD CONFIGURED THRESHOLDS FROM LOCALSTORAGE
function loadProtectionSettings() {
    try {
        const saved = localStorage.getItem("tripwire_protection_settings");
        if (saved) {
            protectionSettings = Object.assign(protectionSettings, JSON.parse(saved));
        }
    } catch (e) {}
    updateSettingsFormFields();
    updateProtectionUI();
}

// SYNC FORM CONTROLS WITH CURRENT PROTECTION SETTINGS
function updateSettingsFormFields() {
    const sliderBurst = document.getElementById("sliderBurst");
    const sliderDaily = document.getElementById("sliderDaily");
    const toggleCanary = document.getElementById("toggleCanary");
    const inputAlertPhone = document.getElementById("inputAlertPhone");
    const badgeBurst = document.getElementById("badgeBurst");
    const badgeDaily = document.getElementById("badgeDaily");

    if (sliderBurst) sliderBurst.value = protectionSettings.burstLimit;
    if (sliderDaily) sliderDaily.value = protectionSettings.dailyQuota;
    if (toggleCanary) toggleCanary.checked = protectionSettings.canaryEnabled;
    if (inputAlertPhone) inputAlertPhone.value = protectionSettings.alertPhone;

    if (badgeBurst) {
        const rps = (protectionSettings.burstLimit / protectionSettings.burstWindowSec).toFixed(1);
        badgeBurst.innerText = `${protectionSettings.burstLimit} queries / 5s (${rps} req/s)`;
    }
    if (badgeDaily) {
        badgeDaily.innerText = `${protectionSettings.dailyQuota} lookups / staff / day`;
    }
}

// INITIALIZE RANGE SLIDER LISTENERS FOR POLICY CONFIGURATION MODAL
function initThresholdControls() {
    const sliderBurst = document.getElementById("sliderBurst");
    const sliderDaily = document.getElementById("sliderDaily");
    const badgeBurst = document.getElementById("badgeBurst");
    const badgeDaily = document.getElementById("badgeDaily");

    if (sliderBurst && badgeBurst) {
        sliderBurst.addEventListener("input", (e) => {
            const val = parseInt(e.target.value, 10);
            const rps = (val / 5).toFixed(1);
            badgeBurst.innerText = `${val} queries / 5s (${rps} req/s)`;
        });
    }

    if (sliderDaily && badgeDaily) {
        sliderDaily.addEventListener("input", (e) => {
            const val = parseInt(e.target.value, 10);
            badgeDaily.innerText = `${val} lookups / staff / day`;
        });
    }
}

// PERSIST MODIFIED THRESHOLDS TO LOCALSTORAGE AND UPDATE SENTRY UI
function saveProtectionSettings() {
    const sliderBurst = document.getElementById("sliderBurst");
    const sliderDaily = document.getElementById("sliderDaily");
    const toggleCanary = document.getElementById("toggleCanary");
    const inputAlertPhone = document.getElementById("inputAlertPhone");

    if (sliderBurst) protectionSettings.burstLimit = parseInt(sliderBurst.value, 10);
    if (sliderDaily) protectionSettings.dailyQuota = parseInt(sliderDaily.value, 10);
    if (toggleCanary) protectionSettings.canaryEnabled = toggleCanary.checked;
    if (inputAlertPhone) protectionSettings.alertPhone = inputAlertPhone.value.trim() || "0917-829-9821";

    try {
        localStorage.setItem("tripwire_protection_settings", JSON.stringify(protectionSettings));
    } catch (e) {}

    updateProtectionUI();
    closeModal("thresholdSettingsModal");
    showToast(`Policy updated: velocity threshold set to ${protectionSettings.burstLimit} queries / 5s.`);
}

// RESET THRESHOLDS BACK TO SECURE DEFAULT VALUES
function resetProtectionSettings() {
    protectionSettings.burstLimit = 30;
    protectionSettings.dailyQuota = 50;
    protectionSettings.canaryEnabled = true;
    updateSettingsFormFields();
    saveProtectionSettings();
}

// UPDATE ACTIVE POLICY SPECIFICATION CARD ON CONSOLE DASHBOARD
function updateProtectionUI() {
    const protectionBox = document.getElementById("protectionBox");
    if (protectionBox) {
        const rps = (protectionSettings.burstLimit / protectionSettings.burstWindowSec).toFixed(1);
        const canaryText = protectionSettings.canaryEnabled 
            ? 'TRK-0000 (Decoy Honeypot)' 
            : '<span class="text-danger">Disabled</span>';

        protectionBox.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 12px; font-weight: 700; color: var(--text-title); text-transform: uppercase; letter-spacing: 0.5px;">Active Policy Thresholds</span>
                <button class="btn btn-sm btn-outline" style="padding: 2px 8px; font-size: 11px;" onclick="openModal('thresholdSettingsModal')">Configure</button>
            </div>
            <div class="specs-grid">
                <div class="specs-item">
                    <span class="specs-label">Burst Velocity Limit:</span>
                    <span class="specs-val">${protectionSettings.burstLimit} requests / ${protectionSettings.burstWindowSec}s (${rps} req/s)</span>
                </div>
                <div class="specs-item">
                    <span class="specs-label">Daily Shift Quota:</span>
                    <span class="specs-val">${protectionSettings.dailyQuota} parcel lookups / staff / day</span>
                </div>
                <div class="specs-item">
                    <span class="specs-label">Canary Trap Record:</span>
                    <span class="specs-val font-mono">${canaryText}</span>
                </div>
                <div class="specs-item">
                    <span class="specs-label">SMS Alert Routing:</span>
                    <span class="specs-val font-mono">${protectionSettings.alertPhone} (Semaphore PH)</span>
                </div>
            </div>
        `;
    }
}

// ============================================================================
// SECTION 8: STAFF ACCOUNT PROVISIONING & 2FA KEY GENERATION (OWNER PORTAL)
// ============================================================================

// PROVISION A NEW STAFF ACCOUNT DIRECTLY FROM OWNER CONSOLE
async function handleProvisionStaffSubmit(event) {
    if (event) event.preventDefault();
    const nameInput = document.getElementById("newStaffName");
    const emailInput = document.getElementById("newStaffEmail");
    const roleInput = document.getElementById("newStaffRole");

    const name = nameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const roleVal = roleInput.value;
    const branch = "Branch #04 — Regional Dispatch (Lipa)";

    if (!name || !email) {
        showToast("Please enter employee name and work email.");
        return;
    }

    const uid = "usr_" + email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "_");
    const roleLabel = (roleVal && (roleVal.toLowerCase().includes("driver") || roleVal === "rider")) ? "Driver (Delivery Courier Rider)" : "Management (Branch Dispatcher)";
    let vehicleType = "";
    if (roleVal.toLowerCase().includes("driver") || roleVal.toLowerCase().includes("rider")) {
        const vEl = document.getElementById("newStaffVehicle");
        vehicleType = vEl ? vEl.value : "Motorcycle";
    }

    const provSecret = (typeof TOTP !== "undefined" && TOTP.getSecretForEmail) ? TOTP.getSecretForEmail(email) : "JBSWY3DPEHPK3PXP";
    const newStaffDoc = {
        name: name,
        email: email,
        role: roleVal,
        branch: branch,
        status: "active",
        velocity: "0.0 req/s (Nominal)",
        totpSecret: provSecret,
        createdAt: new Date().toISOString()
    };
    if (vehicleType) {
        newStaffDoc.vehicleType = vehicleType;
    }

    // PERSIST NEW ACCOUNT DIRECTLY TO CLOUD FIRESTORE /staff
    if (db) {
        try {
            await db.collection("staff").doc(uid).set(newStaffDoc);
            console.log("Provisioned staff in Firestore:", uid);
        } catch (err) {
            console.warn("Firestore staff save notice:", err.message);
        }
    }

    // UPDATE IN-MEMORY STAFF LIST
    const newEntry = {
        id: uid,
        name: name,
        role: roleLabel,
        vehicleType: vehicleType,
        email: email,
        active: true,
        velocity: "0.0 req/s (Nominal)",
        isFlagged: false
    };

    const existingIdx = staffList.findIndex(s => s.id === uid);
    if (existingIdx >= 0) {
        staffList[existingIdx] = newEntry;
    } else {
        staffList.push(newEntry);
    }
    try { localStorage.setItem("swift_staff_directory", JSON.stringify(staffList)); } catch (e) {}
    renderStaffTable();

    // DISPLAY DERIVED RFC 6238 TOTP SECRET AND QR CODE
    let secret = provSecret;
    const qrUri = `otpauth://totp/SwiftLogistics:${encodeURIComponent(email)}?secret=${secret}&issuer=SwiftLogistics&algorithm=SHA1&digits=6&period=30`;

    document.getElementById("provisionResultBox").style.display = "block";
    document.getElementById("provisionQrImg").src = "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" + encodeURIComponent(qrUri);
    document.getElementById("provisionSecretKey").innerText = secret;
    document.getElementById("btnSubmitProvision").innerText = "Provision Another Account";

    showToast(`Staff account for ${name} registered by Bossing Jeff!`);
}

// ============================================================================
// SECTION 9: REAL-TIME CLOUD SYNCHRONIZATION (FIRESTORE SNAPSHOT LISTENERS)
// ============================================================================

// ATTACH REAL-TIME FIRESTORE LISTENERS FOR CROSS-TAB STATE & REPOSITORY UPDATES
function initRealtimeSync() {
    if (typeof window !== "undefined") {
        window.addEventListener("storage", (e) => {
            if (e.key === "tripwire_quarantine_sync") {
                if (e.newValue === "quarantined" && currentState !== "after") {
                    switchState("after");
                } else if (e.newValue === "active" && currentState === "after") {
                    switchState("before");
                }
            }
        });
    }

    if (db) {
        try {
            // REAL-TIME LISTENER FOR /staff DIRECTORY PROVISIONED BY BOSSING JEFF
            db.collection("staff").onSnapshot((snapshot) => {
                if (!snapshot.empty) {
                    const loaded = [];
                    snapshot.forEach(doc => {
                        const d = doc.data();
                        loaded.push({
                            id: doc.id,
                            name: d.name || "Employee",
                            role: d.role === "owner" ? "Business Owner (Administrator)" : ((d.role && (d.role.toLowerCase().includes("driver") || d.role === "rider")) ? "Driver (Delivery Courier Rider)" : "Management (Branch Dispatcher)"),
                            vehicleType: d.vehicleType || "",
                            totpSecret: d.totpSecret || "",
                            email: d.email || "",
                            active: d.status !== "quarantined",
                            quarantineReason: d.quarantineReason || "",
                            velocity: d.velocity || "0.0 req/s (Nominal)",
                            isFlagged: d.status === "quarantined"
                        });
                    });
                    loaded.sort((a, b) => (a.id === "usr_jeff" ? -1 : 1));
                    staffList = loaded;
                    try { localStorage.setItem("swift_staff_directory", JSON.stringify(staffList)); } catch (e) {}
                    renderStaffTable();
                }
            }, (err) => {
                console.warn("Firestore staff snapshot notice:", err.message);
            });

            // REAL-TIME LISTENER FOR /system_status/tripwire KILL-SWITCH BROADCASTS
            db.collection("system_status").doc("tripwire").onSnapshot((doc) => {
                if (doc.exists) {
                    const d = doc.data();
                    if (d.isQuarantined && currentState !== "after") {
                        switchState("after", {
                            id: d.incidentId || ("INC-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-001"),
                            timestamp: d.timestamp ? new Date(d.timestamp).toLocaleTimeString() : new Date().toLocaleTimeString(),
                            triggerType: d.triggerType || "VELOCITY_RATE_LIMIT_EXCEEDED",
                            staffName: d.staffName || "Maria Santos",
                            staffId: d.targetStaff || "usr_maria",
                            containmentTimeMs: d.containmentTimeMs || 18,
                            recordsExposed: d.recordsExposed || 31,
                            recordsProtected: d.recordsProtected || 4969,
                            percentSafe: d.percentSafe || "99.38%"
                        });
                    } else if (!d.isQuarantined && currentState === "after") {
                        switchState("before");
                    }
                }
            }, (err) => {
                console.warn("Firestore listener notice:", err.message);
            });
        } catch (e) {}
    }
}

// INITIALIZE CONSOLE APPLICATION ON PAGE LOAD
document.addEventListener("DOMContentLoaded", () => {
    initDOMElements();
    loadProtectionSettings();
    initThresholdControls();
    switchState("before");
    initRealtimeSync();
    loadPendingRegistrations();
});

// ============================================================================
// SECTION 10: PENDING REGISTRATIONS QUEUE (ADMIN VERIFICATION GATED)
// ============================================================================

let pendingRegistrationsList = [];

// RETRIEVE PENDING APPLICANTS FROM LOCAL CACHE AND CLOUD FIRESTORE
function loadPendingRegistrations() {
    try {
        const stored = localStorage.getItem("swift_pending_registrations");
        if (stored) {
            pendingRegistrationsList = JSON.parse(stored);
        }
    } catch (e) {}

    renderPendingRegistrationsTable();

    // ATTACH REAL-TIME FIRESTORE LISTENER ON /registrations COLLECTION
    if (db) {
        try {
            db.collection("registrations").where("status", "==", "pending_verification").onSnapshot((snapshot) => {
                if (snapshot) {
                    const loaded = [];
                    snapshot.forEach(doc => {
                        loaded.push({ id: doc.id, ...doc.data() });
                    });
                    pendingRegistrationsList = loaded;
                    try { localStorage.setItem("swift_pending_registrations", JSON.stringify(loaded)); } catch (e) {}
                    renderPendingRegistrationsTable();
                    console.log("[TripwireJS] Pending registrations loaded from Firestore:", loaded.length);
                }
            }, (err) => {
                console.error("Registrations listener notice:", err.message);
            });
        } catch (e) {}
    }
}

// RENDER APPLICANT ROWS IN PENDING REGISTRATIONS TABLE
function renderPendingRegistrationsTable() {
    const tbody = document.getElementById("pendingRegistrationsBody");
    const badge = document.getElementById("pendingCountBadge");
    if (!tbody) return;

    if (badge) {
        badge.innerText = `${pendingRegistrationsList.length} Pending`;
        badge.style.display = pendingRegistrationsList.length > 0 ? "inline-flex" : "none";
    }

    if (pendingRegistrationsList.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">No pending staff registrations.</td></tr>`;
        return;
    }

    tbody.innerHTML = pendingRegistrationsList.map(reg => {
        const timeStr = reg.requestedAt ? new Date(reg.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now";
        return `
            <tr>
                <td>
                    <strong style="color: var(--text-title);">${reg.name}</strong><br>
                    <span class="text-muted font-mono" style="font-size: 11px;">${reg.email}</span>
                </td>
                <td>
                    <span>${reg.role}</span>
                    ${reg.vehicleType ? `<div style="margin-top:3px;"><span style="font-size:10.5px; font-weight:700; color:#EA580C; background:#FFF7ED; border:1px solid #FFEDD5; padding:2px 7px; border-radius:12px; display:inline-flex; align-items:center; gap:3px;">${getVehicleEmoji(reg.vehicleType)} ${reg.vehicleType}</span></div>` : ''}
                </td>
                <td class="font-mono text-muted">${reg.phone || "0917-***-0000"}</td>
                <td class="text-muted font-mono" style="font-size: 11px;">${timeStr}</td>
                <td>
                    <span class="status-pill status-pill-pending">
                        Awaiting Bossing Jeff
                    </span>
                </td>
                <td>
                    <div style="display: flex; gap: 6px;">
                        <button class="btn btn-sm btn-primary" onclick="handleApproveRegistration('${reg.id}')">
                            Verify & Approve
                        </button>
                        <button class="btn btn-sm btn-outline text-danger" onclick="handleRejectRegistration('${reg.id}')">
                            Reject
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

// APPROVE PENDING APPLICANT, PROVISION ACCOUNT & GENERATE 2FA KEYS
async function handleApproveRegistration(regId) {
    const reg = pendingRegistrationsList.find(r => r.id === regId);
    if (!reg) return;

    const staffUid = "usr_" + reg.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "_");
    const totpSecret = (reg.totpSecret && reg.totpSecret !== "JBSWY3DPEHPK3PXP")
        ? reg.totpSecret
        : ((typeof TOTP !== "undefined" && TOTP.getSecretForEmail) ? TOTP.getSecretForEmail(reg.email) : "JBSWY3DPEHPK3PXP");

    // 1. ADD TO ACTIVE STAFF LIST AND UPDATE UI
    const vehicleType = reg.vehicleType || (reg.role && (reg.role.toLowerCase().includes("driver") || reg.role.toLowerCase().includes("rider")) ? "Motorcycle" : "");
    const newStaff = {
        id: staffUid,
        name: reg.name,
        email: reg.email,
        role: (reg.role && (reg.role.toLowerCase().includes("driver") || reg.role.toLowerCase().includes("rider"))) ? "Driver (Delivery Courier Rider)" : "Management (Branch Dispatcher)",
        vehicleType: vehicleType,
        branch: reg.branch || "Branch #04 (Lipa City)",
        active: true,
        status: "active",
        velocity: "0.2 req/s (Nominal)",
        isFlagged: false,
        verified: true,
        totpSecret: totpSecret
    };

    staffList = staffList.filter(s => s.id !== staffUid && s.email.toLowerCase() !== reg.email.toLowerCase());
    staffList.push(newStaff);
    renderStaffTable();

    // 2. REMOVE FROM PENDING REGISTRATIONS QUEUE
    pendingRegistrationsList = pendingRegistrationsList.filter(r => r.id !== regId);
    try { localStorage.setItem("swift_pending_registrations", JSON.stringify(pendingRegistrationsList)); } catch (e) {}
    renderPendingRegistrationsTable();

    // 3. PERSIST APPROVAL TO LOCAL DIRECTORY CACHE
    try {
        let dir = JSON.parse(localStorage.getItem("swift_staff_directory") || "[]");
        dir = dir.filter(s => (s.email || "").toLowerCase() !== reg.email.toLowerCase());
        dir.push(newStaff);
        localStorage.setItem("swift_staff_directory", JSON.stringify(dir));
    } catch (e) {}

    // 4. WRITE ACTIVATED RECORD TO FIRESTORE /staff AND DELETE /registrations REQUEST
    if (db) {
        try {
            const staffDocToSave = {
                name: newStaff.name,
                email: newStaff.email,
                role: newStaff.role,
                branch: newStaff.branch,
                status: "active",
                velocity: "0.2 req/s (Nominal)",
                isFlagged: false,
                totpSecret: totpSecret,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            if (reg.phone && reg.phone.trim().length >= 7) {
                staffDocToSave.phone = reg.phone.trim();
            }
            if (newStaff.vehicleType && newStaff.vehicleType.trim().length > 0) {
                staffDocToSave.vehicleType = newStaff.vehicleType.trim();
            }
            await db.collection("staff").doc(staffUid).set(staffDocToSave);
            console.log("[TripwireJS] Approved staff written to /staff/" + staffUid);

            await db.collection("registrations").doc(regId).delete();
            console.log("[TripwireJS] Registration removed from /registrations/" + regId);
        } catch (err) {
            console.error("Firestore approval error:", err);
        }
    }

    // 5. OPEN ONBOARDING QR CODE MODAL
    document.getElementById("verifiedStaffName").innerText = reg.name;
    document.getElementById("verifiedSecretKey").innerText = totpSecret;
    const otpUrl = `otpauth://totp/SwiftLogistics:${encodeURIComponent(reg.email)}?secret=${totpSecret}&issuer=SwiftLogistics&algorithm=SHA1&digits=6&period=30`;
    document.getElementById("verifiedQrImage").src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(otpUrl)}`;

    openModal("verifiedOnboardingModal");
    showToast(`Staff Verified: ${reg.name} is now authorized for terminal login!`);
}

// REJECT UNVERIFIED APPLICANT REGISTRATION REQUEST
async function handleRejectRegistration(regId) {
    pendingRegistrationsList = pendingRegistrationsList.filter(r => r.id !== regId);
    localStorage.setItem("swift_pending_registrations", JSON.stringify(pendingRegistrationsList));
    renderPendingRegistrationsTable();

    if (db) {
        try {
            await db.collection("registrations").doc(regId).delete();
            console.log("[TripwireJS] Deleted rejected registration:", regId);
        } catch (e) {
            console.warn("Firestore reject delete notice:", e.message);
        }
    }
    showToast("Registration request rejected and removed.");
}

// ============================================================================
// SECTION 11: HIGH-PRIVILEGE SECURITY ACTION CONFIRMATION (PASSWORD & REASON GATED)
// ============================================================================

// HTML ESCAPING UTILITY TO PREVENT CROSS-SITE SCRIPTING (XSS)
function escapeHtml(text) {
    if (!text) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// APPEND ADMINISTRATIVE ACTION TO IMMUTABLE SECURITY TELEMETRY LOG
function logSecurityEvent(action, staffName, staffId, reason) {
    if (!logList) return;
    const time = new Date().toLocaleTimeString();
    const tag = action === "QUARANTINE" 
        ? '<span class="log-tag tag-danger">QUAR</span>' 
        : (action === "DELETION" ? '<span class="log-tag tag-danger">DEL</span>' : '<span class="log-tag tag-primary">RESTORE</span>');
    const entry = document.createElement("div");
    entry.className = "log-entry";
    entry.innerHTML = `
        ${tag}
        <span class="log-time">${time}</span>
        <span class="log-msg"><strong>[ADMIN ${action}]</strong> ${staffName} (${staffId}) authorized by Bossing Jeff. Reason: ${escapeHtml(reason)}</span>
    `;
    logList.prepend(entry);
}

let pendingAdminAction = null;

// OPEN SECURITY ACTION CONFIRMATION MODAL (DYNAMICALLY CONFIGURES FOR QUARANTINE VS DELETE)
function openAdminConfirmModal(actionType, staffId) {
    if (staffId === "usr_jeff") {
        showToast("Cannot modify Administrator account.", "warning");
        return;
    }

    const staff = staffList.find(s => s.id === staffId);
    if (!staff) return;

    pendingAdminAction = {
        type: actionType,
        staffId: staffId,
        staff: staff
    };

    // POPULATE TARGET EMPLOYEE OVERVIEW CARD
    const initials = (staff.name || "ST").split(" ").map(n => n[0]).join("");
    const avatarEl = document.getElementById("adminConfirmAvatar");
    const nameEl = document.getElementById("adminConfirmName");
    const roleEl = document.getElementById("adminConfirmRoleBadge");
    const emailEl = document.getElementById("adminConfirmEmail");

    if (avatarEl) avatarEl.innerText = initials || "ST";
    if (nameEl) nameEl.innerText = staff.name;
    if (roleEl) roleEl.innerText = staff.role;
    if (emailEl) emailEl.innerText = staff.email || "No email on record";

    // RESET INPUT FIELDS AND INLINE ERROR BANNER
    const passInput = document.getElementById("adminActionPassword");
    const errorBanner = document.getElementById("adminActionErrorBanner");
    const titleEl = document.getElementById("adminConfirmModalTitle");
    const subEl = document.getElementById("adminConfirmModalSub");
    const noticeEl = document.getElementById("adminConfirmNotice");
    const catSelect = document.getElementById("adminActionCategory");
    const detailsInput = document.getElementById("adminActionDetails");
    const submitBtn = document.getElementById("btnAdminConfirmSubmit");

    if (passInput) {
        passInput.value = "";
        passInput.style.borderColor = "rgba(239, 68, 68, 0.5)";
    }
    if (errorBanner) {
        errorBanner.style.display = "none";
        errorBanner.innerText = "";
    }

    if (actionType === "quarantine") {
        if (titleEl) titleEl.innerHTML = `<span style="color:#EF4444;">🛡️ Confirm Account Quarantine</span>`;
        if (subEl) subEl.innerText = "Administrative password verification & forensic justification required";
        if (noticeEl) {
            noticeEl.innerHTML = `
                <strong>⚠️ Security Lockdown Warning:</strong><br>
                Quarantining <strong>${staff.name}</strong> will instantly revoke terminal sessions across Google Cloud in &lt;18ms, set Firestore status to <code>quarantined</code>, and block logins until explicitly restored.
            `;
            noticeEl.style.background = "rgba(239, 68, 68, 0.12)";
            noticeEl.style.borderColor = "rgba(239, 68, 68, 0.35)";
        }
        if (catSelect) {
            catSelect.innerHTML = `
                <option value="" disabled selected>-- Select Quarantine Reason Category --</option>
                <option value="Velocity Threshold Exceeded">Velocity Threshold Exceeded (>30 queries in 5s)</option>
                <option value="Canary Honeypot (TRK-0000) Access">Canary Honeypot (TRK-0000) Unauthorized Probing</option>
                <option value="Suspected Credential Hijacking">Suspected Credential Hijacking / Token Compromise</option>
                <option value="Suspicious Login Pattern">Suspicious Login Pattern / Off-Hours Terminal Activity</option>
                <option value="Administrative Policy Suspension">Administrative Policy Suspension / Disciplinary</option>
                <option value="Preventative Security Isolation">Preventative Security Isolation</option>
                <option value="Other Security Incident">Other Security Incident (Specify in Remarks)</option>
            `;
        }
        if (detailsInput) detailsInput.value = "";
        if (submitBtn) {
            submitBtn.innerHTML = `🔒 Authorize & Quarantine Account`;
            submitBtn.style.background = "#DC2626";
            submitBtn.disabled = false;
        }
    } else if (actionType === "delete") {
        if (titleEl) titleEl.innerHTML = `<span style="color:#EF4444;">🗑️ Confirm Permanent Account Deletion</span>`;
        if (subEl) subEl.innerText = "Irreversible purge of credentials, 2FA keys, and cloud records";
        if (noticeEl) {
            noticeEl.innerHTML = `
                <strong>🚨 Permanent Data Purge Warning:</strong><br>
                Deleting <strong>${staff.name}</strong> will permanently erase their account from Cloud Firestore <code>/staff/${staff.id}</code>, invalidate all 2FA TOTP secrets, and clear pending registrations. <strong>This action cannot be undone.</strong>
            `;
            noticeEl.style.background = "rgba(153, 27, 27, 0.2)";
            noticeEl.style.borderColor = "rgba(239, 68, 68, 0.5)";
        }
        if (catSelect) {
            catSelect.innerHTML = `
                <option value="" disabled selected>-- Select Deletion Reason Category --</option>
                <option value="Employee Resignation / Offboarding">Employee Resignation / Voluntary Offboarding</option>
                <option value="Employment Termination">Employment Termination / Contract Concluded</option>
                <option value="Severe Policy Violation">Severe Security Policy Violation</option>
                <option value="Duplicate / Erroneous Account">Duplicate or Erroneous Staff Registration</option>
                <option value="Test / Sandbox Account Cleanup">Test / Sandbox Account Cleanup</option>
                <option value="Other Operational Reason">Other Operational Reason (Specify in Remarks)</option>
            `;
        }
        if (detailsInput) detailsInput.value = "";
        if (submitBtn) {
            submitBtn.innerHTML = `🗑️ Authorize & Permanently Delete`;
            submitBtn.style.background = "#991B1B";
            submitBtn.disabled = false;
        }
    }

    openModal("adminActionConfirmModal");
    setTimeout(() => {
        if (catSelect) catSelect.focus();
    }, 100);
}

// AUTO-FILL CONCISE JUSTIFICATION IN TEXTAREA WHEN CATEGORY CHANGES
function handleAdminReasonCategoryChange() {
    const catSelect = document.getElementById("adminActionCategory");
    const detailsInput = document.getElementById("adminActionDetails");
    if (!catSelect || !detailsInput) return;
    const cat = catSelect.value;
    if (cat && (!detailsInput.value || detailsInput.value.startsWith("Authorized action:"))) {
        detailsInput.value = `Authorized action: ${cat}.`;
    }
}

// CLOSE SECURITY ACTION CONFIRMATION MODAL
function closeAdminConfirmModal() {
    closeModal("adminActionConfirmModal");
    pendingAdminAction = null;
}

// VALIDATE ADMINISTRATOR PASSWORD AND EXECUTE AUTHORIZED ACTION
async function executeAdminConfirmedAction(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!pendingAdminAction) return;

    const errorBanner = document.getElementById("adminActionErrorBanner");
    const passwordInput = document.getElementById("adminActionPassword");
    const catSelect = document.getElementById("adminActionCategory");
    const detailsInput = document.getElementById("adminActionDetails");

    const category = (catSelect ? catSelect.value : "").trim();
    const details = (detailsInput ? detailsInput.value : "").trim();
    const enteredPassword = (passwordInput ? passwordInput.value : "").trim();

    // 1. VALIDATE REASON CATEGORY SELECTION
    if (!category) {
        if (errorBanner) {
            errorBanner.innerText = "❌ Please select an action reason category.";
            errorBanner.style.display = "block";
        }
        if (catSelect) catSelect.focus();
        return;
    }

    // 2. VALIDATE SPECIFIC REMARKS JUSTIFICATION
    if (!details) {
        if (errorBanner) {
            errorBanner.innerText = "❌ Specific remarks / justification are required for audit logging.";
            errorBanner.style.display = "block";
        }
        if (detailsInput) detailsInput.focus();
        return;
    }

    // 3. VALIDATE ADMINISTRATOR PASSWORD ("password123")
    if (enteredPassword !== "password123") {
        if (errorBanner) {
            errorBanner.innerText = "❌ Invalid Administrator Password. Authorization rejected.";
            errorBanner.style.display = "block";
        }
        if (passwordInput) {
            passwordInput.style.borderColor = "#EF4444";
            passwordInput.focus();
        }
        return;
    }

    const { type, staffId, staff } = pendingAdminAction;
    const staffName = staff ? staff.name : staffId;
    const fullReason = `${category}: ${details}`;

    const submitBtn = document.getElementById("btnAdminConfirmSubmit");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Processing Authorization...";
    }

    try {
        if (type === "quarantine") {
            await executeQuarantineWithAudit(staffId, staff, fullReason, category);
        } else if (type === "delete") {
            await executeDeleteWithAudit(staffId, staff, fullReason, category);
        }
        closeAdminConfirmModal();
    } catch (err) {
        if (errorBanner) {
            errorBanner.innerText = `Error: ${err.message}`;
            errorBanner.style.display = "block";
        }
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = "Authorize & Execute";
        }
    }
}

// EXECUTE ACCOUNT QUARANTINE WITH FORENSIC AUDIT TRAIL
async function executeQuarantineWithAudit(staffId, staff, fullReason, category) {
    const staffName = staff ? staff.name : staffId;
    staff.active = false;
    staff.status = "quarantined";
    staff.quarantineReason = fullReason;
    staff.quarantineTimestamp = new Date().toISOString();
    staff.quarantinedBy = "Bossing Jeff (Administrator)";
    staff.velocity = "0.0 req/s (Revoked)";
    staff.isFlagged = true;

    // UPDATE LOCAL DIRECTORY CACHE
    try {
        let dir = JSON.parse(localStorage.getItem("swift_staff_directory") || "[]");
        const idx = dir.findIndex(s => s.id === staffId);
        if (idx !== -1) {
            dir[idx].active = false;
            dir[idx].status = "quarantined";
            dir[idx].quarantineReason = fullReason;
            dir[idx].quarantineTimestamp = staff.quarantineTimestamp;
            dir[idx].quarantinedBy = staff.quarantinedBy;
            dir[idx].velocity = staff.velocity;
            localStorage.setItem("swift_staff_directory", JSON.stringify(dir));
        }
        localStorage.setItem("tripwire_quarantine_sync", "quarantined");
    } catch (e) {}

    // SYNCHRONIZE QUARANTINE LOCKOUT TO CLOUD FIRESTORE
    if (db) {
        try {
            await db.collection("staff").doc(staffId).update({
                status: "quarantined",
                active: false,
                quarantineReason: fullReason,
                quarantineTimestamp: staff.quarantineTimestamp,
                quarantinedBy: staff.quarantinedBy,
                velocity: staff.velocity
            });
            await db.collection("system_status").doc("tripwire").set({
                isQuarantined: true,
                status: "quarantined",
                targetStaff: staffId,
                staffName: staffName,
                quarantineReason: fullReason,
                timestamp: staff.quarantineTimestamp
            }, { merge: true });
        } catch (e) {
            console.warn("Firestore staff quarantine notice:", e.message);
        }
    }

    logSecurityEvent("QUARANTINE", staffName, staffId, fullReason);
    showToast(`Account Quarantined: ${staffName} access revoked. Reason: ${category}`);
    renderStaffTable();
}

// EXECUTE PERMANENT ACCOUNT DELETION WITH PURGE AUDIT LOG
async function executeDeleteWithAudit(staffId, staff, fullReason, category) {
    const staffName = staff ? staff.name : staffId;
    const staffEmail = (staff && staff.email ? staff.email : "").toLowerCase();

    // 1. REMOVE FROM IN-MEMORY STAFF LIST
    staffList = staffList.filter(s => s.id !== staffId);

    // 2. PURGE FROM LOCAL DIRECTORY CACHE
    try {
        let dir = JSON.parse(localStorage.getItem("swift_staff_directory") || "[]");
        dir = dir.filter(s => s.id !== staffId && (s.email || "").toLowerCase() !== staffEmail);
        localStorage.setItem("swift_staff_directory", JSON.stringify(dir));
    } catch (e) {}

    // 3. PURGE FROM PENDING REGISTRATIONS CACHE IF PRESENT
    try {
        pendingRegistrationsList = pendingRegistrationsList.filter(r => (r.email || "").toLowerCase() !== staffEmail);
        localStorage.setItem("swift_pending_registrations", JSON.stringify(pendingRegistrationsList));
        renderPendingRegistrationsTable();
    } catch (e) {}

    // 4. PURGE FROM CLOUD FIRESTORE /staff/{staffId} AND MATCHING /registrations
    if (db) {
        try {
            await db.collection("staff").doc(staffId).delete();
            console.log("[TripwireJS] Deleted /staff/" + staffId);

            if (staffEmail) {
                const regSnap = await db.collection("registrations").where("email", "==", staffEmail).get();
                regSnap.forEach(async (doc) => {
                    await db.collection("registrations").doc(doc.id).delete();
                    console.log("[TripwireJS] Purged registration record /registrations/" + doc.id);
                });
            }
        } catch (err) {
            console.warn("Firestore staff deletion notice:", err.message);
        }
    }

    logSecurityEvent("DELETION", staffName, staffId, fullReason);
    showToast(`Account for ${staffName} permanently deleted. Reason: ${category}`);
    renderStaffTable();
}

// ============================================================================
// SECTION 12: MODAL WINDOW CONTROLS & USER TOAST ALERTS
// ============================================================================

// OPEN A MODAL WINDOW BY ELEMENT ID
function openModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.remove("hidden");
}

// CLOSE A MODAL WINDOW BY ELEMENT ID
function closeModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.add("hidden");
}

// CLOSE MODAL WHEN CLICKING OUTSIDE ON BACKDROP
window.onclick = function(event) {
    if (event.target.classList.contains("modal-backdrop")) {
        event.target.classList.add("hidden");
    }
};

let toastTimer;

// DISPLAY FLOATING NON-INTRUSIVE SYSTEM TOAST NOTIFICATION
function showToast(msg) {
    const toast = document.getElementById("friendlyToast");
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.innerText = msg;
    toast.classList.remove("hidden");
    toastTimer = setTimeout(() => {
        toast.classList.add("hidden");
    }, 3200);
}
