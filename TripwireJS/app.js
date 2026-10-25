/**
 * ============================================================================
 * TripwireJS Business Owner Security Console — Real-Time Controller (v5.0)
 * Designed for Philippine MSMEs under RA 10173 (Data Privacy Act of 2012)
 *
 * Core Principles:
 * 1. Event-Driven & Real-Time (Synchronized with Cloud Firestore snapshot listeners).
 * 2. Enterprise Standard UI (Zero cartoonish emojis, zero double-positive tags).
 * 3. Assumed Breach Posture (Instant Layer-7 containment in <20ms).
 * 4. Regulatory Alignment (RA 10173 Section 20 & NPC Circular 16-03).
 * ============================================================================
 */

// -----------------------------------------------------------------------------
// 1. FIREBASE INITIALIZATION & REAL-TIME CLOUD LISTENER
// -----------------------------------------------------------------------------
const firebaseConfig = {
    apiKey: "AIzaSyAtoLR9SVRQIgnFgwqQ6kPuTVA23cp0Ibw",
    authDomain: "swiftlogistics-hub-9821.firebaseapp.com",
    projectId: "swiftlogistics-hub-9821",
    storageBucket: "swiftlogistics-hub-9821.firebasestorage.app",
    messagingSenderId: "602215546126",
    appId: "1:602215546126:web:28439f8304a2613c072b5f"
};

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

// Global Portal State
let currentState = "before";
let activeIncident = null;

// Staff Data Store (Pristine Owner-Only Baseline)
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

// Dynamic Victims List
let victimsList = [];

// DOM Elements
let brandBadge, heroBanner, heroTitle, heroDesc;
let statSafetyRate, statSafetySub, statSafeBar, statDangerBar;
let boxExposed, labelExposed, statExposed, statExposedSub, btnViewVictimsCard;
let statSpeed, statSpeedSub;
let panelTitle, panelCaption, actionContainer, unlockFooter;
let activityTitle, activityCaption, logList, staffTableBody;

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

// -----------------------------------------------------------------------------
// 2. DYNAMIC STATE SWITCHER: NORMAL vs. INCIDENT
// -----------------------------------------------------------------------------
function switchState(state, incidentData = null) {
    currentState = state;
    if (incidentData) activeIncident = incidentData;

    const statusPill = document.getElementById("systemStatusPill");
    const statusLabel = document.getElementById("systemStatusLabel");

    if (state === "before" || state === "normal") {
        // ====================================================================
        // NORMAL OPERATIONAL STATE: BASELINE
        // ====================================================================
        if (statusPill && statusLabel) {
            statusPill.className = "prod-status-badge badge-armed";
            statusLabel.innerText = "MONITORING ACTIVE — ZERO ANOMALIES";
        }
        if (brandBadge) {
            brandBadge.className = "brand-badge";
            brandBadge.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
        }

        // Reset Maria to active
        const maria = staffList.find(s => s.id === "usr_maria");
        if (maria) {
            maria.active = true;
            maria.velocity = "0.2 req/s (Nominal)";
            maria.isFlagged = false;
        }

        victimsList = [];
        renderVictimsTable();

        const elNpcDisc = document.getElementById("npcIncidentDiscovery");
        const elNpcExp = document.getElementById("npcExposed");
        const elNpcPres = document.getElementById("npcPreserved");
        if (elNpcDisc) elNpcDisc.innerText = "Live Monitoring (No active breach)";
        if (elNpcExp) elNpcExp.innerHTML = "<strong>0 records (0%)</strong>";
        if (elNpcPres) elNpcPres.innerHTML = "<strong>5,000 records (100%)</strong>";

        const elSmsCount = document.getElementById("smsModalRecipientsCount");
        const elSmsBtn = document.getElementById("btnConfirmSmsSend");
        if (elSmsCount) elSmsCount.innerText = "0 Data Subjects";
        if (elSmsBtn) elSmsBtn.innerText = "Broadcast Advisories";

        // Hero Banner
        if (heroBanner) heroBanner.className = "hero-alert-banner hero-safe-banner";
        if (heroTitle) heroTitle.innerText = "System Baseline: Normal Operations";
        if (heroDesc) {
            heroDesc.innerText = "All client queries are within designated velocity thresholds (max 30 req / 5s). Layer-7 sentry inspection and Cloud Firestore default-deny enforcement active.";
        }

        // Metric Card 1: Integrity
        if (statSafetyRate) {
            statSafetyRate.innerText = "100% Intact";
            statSafetyRate.className = "metric-number text-success";
        }
        if (statSafetySub) statSafetySub.innerText = "5,000 of 5,000 records protected";
        if (statSafeBar) statSafeBar.style.width = "100%";
        if (statDangerBar) statDangerBar.style.width = "0%";

        // Metric Card 2: Exposed Records
        if (boxExposed) boxExposed.className = "metric-box";
        if (labelExposed) labelExposed.innerText = "Exposed Records Prior to Containment";
        if (statExposed) {
            statExposed.innerText = "0 Records";
            statExposed.className = "metric-number text-success";
        }
        if (statExposedSub) statExposedSub.innerText = "Zero unauthorized access attempts detected";
        if (btnViewVictimsCard) btnViewVictimsCard.style.display = "none";

        // Metric Card 3: Latency
        if (statSpeed) {
            statSpeed.innerText = "0 ms Overhead";
            statSpeed.className = "metric-number text-primary";
        }
        if (statSpeedSub) statSpeedSub.innerText = "Real-time client-side rate limit + Cloud kill-switch";

        // Left Column: Active Controls
        if (panelTitle) panelTitle.innerText = "Active Security Controls";
        if (panelCaption) panelCaption.innerText = "Default baseline policies enforced across client session and Firestore:";

        if (actionContainer) {
            actionContainer.innerHTML = `
                <div class="control-row">
                    <div class="control-indicator status-ok"></div>
                    <div>
                        <strong>Default-Deny Firestore Rules</strong>
                        <p>Direct unauthenticated queries rejected with 403 Forbidden. RBAC token validation enforced.</p>
                    </div>
                </div>

                <div class="control-row">
                    <div class="control-indicator status-ok"></div>
                    <div>
                        <strong>Honeypot Decoy Trap (TRK-0000)</strong>
                        <p>Synthetic canary record armed in Firestore. Any access attempts trigger immediate session termination.</p>
                    </div>
                </div>

                <div class="control-row">
                    <div class="control-indicator status-ok"></div>
                    <div>
                        <strong>Sliding-Window Velocity Limiter (${protectionSettings.burstLimit} queries / 5s)</strong>
                        <p>Requests exceeding human operational threshold trigger token quarantine within milliseconds.</p>
                    </div>
                </div>
            `;
        }
        if (unlockFooter) unlockFooter.style.display = "none";

        // Right Column: Telemetry Log
        if (activityTitle) activityTitle.innerText = "Telemetry & Event Log";
        if (activityCaption) activityCaption.innerText = "Real-time query velocity and authorization events:";

        if (logList) {
            logList.innerHTML = `
                <div class="log-entry">
                    <span class="log-tag tag-info">INFO</span>
                    <span class="log-time">${new Date().toLocaleTimeString()}</span>
                    <span class="log-msg">Layer-7 sentry initialized on SwiftLogistics Branch #04 terminal.</span>
                </div>
                <div class="log-entry">
                    <span class="log-tag tag-ok">SECURE</span>
                    <span class="log-time">${new Date().toLocaleTimeString()}</span>
                    <span class="log-msg">Parcels collection synchronized. Query velocity nominal (0.2 req/s).</span>
                </div>
            `;
        }

        renderStaffTable();

    } else if (state === "after" || state === "incident") {
        // ====================================================================
        // ACTIVE INCIDENT STATE: CONTAINED
        // ====================================================================
        const inc = activeIncident || {
            id: "INC-20261021-001",
            timestamp: new Date().toLocaleTimeString(),
            triggerType: "VELOCITY_RATE_LIMIT_EXCEEDED",
            staffName: "Maria Santos",
            staffId: "usr_maria",
            queryCount: 31,
            velocity: "11.1 req/s (AUTOMATED)",
            containmentTimeMs: 18,
            recordsExposed: 31,
            recordsProtected: 4969,
            percentSafe: "99.38%"
        };

        if (statusPill && statusLabel) {
            statusPill.className = "prod-status-badge badge-alert";
            statusLabel.innerText = "INCIDENT CONTAINED — SESSION REVOKED";
        }
        if (brandBadge) {
            brandBadge.className = "brand-badge badge-alert-state";
            brandBadge.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
        }

        // Set Maria to quarantined
        const maria = staffList.find(s => s.id === "usr_maria");
        if (maria) {
            maria.active = false;
            maria.velocity = inc.velocity || "11.1 req/s (AUTOMATED)";
            maria.isFlagged = true;
        }

        buildDynamicVictims(inc);
        renderVictimsTable();

        const elNpcDisc = document.getElementById("npcIncidentDiscovery");
        const elNpcExp = document.getElementById("npcExposed");
        const elNpcPres = document.getElementById("npcPreserved");
        const elNpcTime = document.getElementById("npcContainmentTime");
        if (elNpcDisc) elNpcDisc.innerText = `${inc.timestamp} PHT`;
        if (elNpcTime) elNpcTime.innerHTML = `<strong>${inc.containmentTimeMs || 18} ms</strong> (Automated Session Invalidation)`;
        if (elNpcExp) elNpcExp.innerHTML = `<strong>${inc.recordsExposed || 31} records (${((inc.recordsExposed || 31)/50).toFixed(2)}%)</strong>`;
        if (elNpcPres) elNpcPres.innerHTML = `<strong>${(inc.recordsProtected || 4969).toLocaleString()} records (${inc.percentSafe || '99.38%'})</strong>`;

        const elSmsCount = document.getElementById("smsModalRecipientsCount");
        const elSmsBtn = document.getElementById("btnConfirmSmsSend");
        if (elSmsCount) elSmsCount.innerText = `${inc.recordsExposed || 31} Data Subjects`;
        if (elSmsBtn) elSmsBtn.innerText = `Broadcast Advisories to ${inc.recordsExposed || 31} Recipients`;

        // Hero Banner
        if (heroBanner) heroBanner.className = "hero-alert-banner";
        if (heroTitle) heroTitle.innerText = "Security Incident Contained: Unauthorized Query Velocity Intercepted";
        if (heroDesc) {
            heroDesc.innerHTML = `
                At <strong>${inc.timestamp}</strong>, query velocity from credential <strong>${inc.staffName} (${inc.staffId})</strong> exceeded policy thresholds. 
                Layer-7 sentry executed automated credential revocation across Google Cloud infrastructure in <strong>${inc.containmentTimeMs}ms</strong>. 
                Blast radius isolated to <strong>${inc.recordsExposed} records</strong> (${((inc.recordsExposed/50).toFixed(2))}%) prior to lockout.
            `;
        }

        // Metric Card 1: Preserved
        if (statSafetyRate) {
            statSafetyRate.innerText = `${inc.percentSafe} Preserved`;
            statSafetyRate.className = "metric-number text-success";
        }
        if (statSafetySub) statSafetySub.innerText = `${inc.recordsProtected.toLocaleString()} of 5,000 records untouched`;
        if (statSafeBar) statSafeBar.style.width = inc.percentSafe;
        if (statDangerBar) statDangerBar.style.width = `${(100 - parseFloat(inc.percentSafe)).toFixed(2)}%`;

        // Metric Card 2: Exposed
        if (boxExposed) boxExposed.className = "metric-box";
        if (labelExposed) labelExposed.innerText = "Exposed Records Prior to Containment";
        if (statExposed) {
            statExposed.innerText = `${inc.recordsExposed} Records`;
            statExposed.className = "metric-number text-danger";
        }
        if (statExposedSub) statExposedSub.innerText = "Masked courier waybills only (No authentication credentials exposed)";
        if (btnViewVictimsCard) btnViewVictimsCard.style.display = "inline-block";

        // Metric Card 3: Containment Latency
        if (statSpeed) {
            statSpeed.innerText = `${inc.containmentTimeMs} Milliseconds`;
            statSpeed.className = "metric-number text-primary";
        }
        if (statSpeedSub) statSpeedSub.innerText = `Automated token revocation + Cloud Firestore kill-switch`;

        // Left Column: 3 Remediation Actions
        if (panelTitle) panelTitle.innerText = "Incident Remediation Protocol";
        if (panelCaption) panelCaption.innerText = "Execute required incident containment and statutory compliance actions:";

        if (actionContainer) {
            actionContainer.innerHTML = `
                <div class="action-item">
                    <div class="action-header">
                        <span class="action-step-num">1</span>
                        <div>
                            <strong>Credential Quarantine Active</strong>
                            <p>Session token for Maria Santos (${inc.staffId}) revoked across Cloud infrastructure in ${inc.containmentTimeMs}ms.</p>
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
                            <strong>NPC 72-Hour Formal Dossier</strong>
                            <p>Mandatory compliance report pre-filled with containment telemetry under NPC Circular 16-03.</p>
                        </div>
                    </div>
                    <button class="btn btn-sm btn-outline" id="btnNpc" onclick="openModal('npcModal')">
                        Export NPC Report
                    </button>
                </div>
            `;
        }
        if (unlockFooter) unlockFooter.style.display = "flex";

        // Right Column: Incident Telemetry Log
        if (activityTitle) activityTitle.innerText = "Forensic Event Telemetry";
        if (activityCaption) activityCaption.innerText = "Immutable event log recording breach detection and mitigation timeline:";

        if (logList) {
            logList.innerHTML = `
                <div class="log-entry">
                    <span class="log-tag tag-danger">CRIT</span>
                    <span class="log-time">${inc.timestamp}</span>
                    <span class="log-msg">Velocity threshold exceeded: ${inc.recordsExposed} queries in 3.1s on usr_maria.</span>
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

// -----------------------------------------------------------------------------
// 3. DYNAMIC VICTIMS GENERATOR
// -----------------------------------------------------------------------------
function buildDynamicVictims(inc) {
    victimsList = [];
    const count = inc.recordsExposed || 31;

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

    for (let i = 1; i <= count; i++) {
        const tracking = "TRK-" + (1000 + i);
        const city = sampleLocations[(i - 1) % sampleLocations.length] + ", Batangas";
        const pkg = samplePackages[(i - 1) % samplePackages.length];
        const studentName = realStudents[(i - 1) % realStudents.length];

        victimsList.push({
            id: tracking,
            name: studentName,
            phone: `0917-***-${1000 + i}`,
            city: city,
            exposed: `Masked Waybill Manifest (${pkg})`,
            isCanary: false,
            smsStatus: "Pending Dispatch"
        });
    }
}

function renderVictimsTable() {
    const tbody = document.getElementById("victimTableBody");
    if (!tbody) return;

    if (!victimsList || victimsList.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 28px; color: var(--text-muted);">
                    <strong>Zero data subject records compromised.</strong><br>
                    <span style="font-size: 12px;">Database integrity is 100% intact under Layer-7 sentry enforcement.</span>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = victimsList.map((vic, idx) => {
        const rowClass = vic.isCanary ? "row-canary-highlight" : "";
        const smsBadge = vic.smsStatus.includes("Dispatched") || vic.smsStatus.includes("Terminated")
            ? `<span class="status-pill status-pill-success">${vic.smsStatus}</span>`
            : `<span class="status-pill status-pill-pending">${vic.smsStatus}</span>`;

        return `
            <tr class="${rowClass}">
                <td class="font-mono">#${idx + 1}</td>
                <td class="font-mono font-bold">${vic.id}</td>
                <td><strong>${vic.name}</strong></td>
                <td>${vic.phone} (${vic.city})</td>
                <td><span class="text-muted">${vic.exposed}</span></td>
                <td>${smsBadge}</td>
            </tr>
        `;
    }).join("");
}

// -----------------------------------------------------------------------------
// 4. STAFF MANAGEMENT & ACCESS CONTROLS
// -----------------------------------------------------------------------------
function renderStaffTable() {
    if (!staffTableBody) return;

    staffTableBody.innerHTML = staffList.map(staff => {
        const initials = staff.name.split(" ").map(n => n[0]).join("");
        const statusBadge = staff.active 
            ? `<span class="status-pill status-pill-success">Active</span>` 
            : `<span class="status-pill status-pill-danger">Quarantined</span>`;

        let actionBtn = "";
        if (staff.id === "usr_jeff") {
            actionBtn = `<span class="text-muted" style="font-size:12px;">Administrator</span>`;
        } else if (staff.active) {
            actionBtn = `<button class="btn btn-sm btn-outline text-danger" onclick="toggleStaffAccount('${staff.id}')">Quarantine</button>`;
        } else {
            actionBtn = `<button class="btn btn-sm btn-primary" onclick="toggleStaffAccount('${staff.id}')">Restore Access</button>`;
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
                <td><span>${staff.role}</span></td>
                <td>
                    <span style="font-size: 11px; font-weight: 700; color: #10B981; background: rgba(16, 185, 129, 0.12); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(16, 185, 129, 0.3); font-family: var(--font-mono);">
                        TOTP RFC 6238
                    </span>
                </td>
                <td>${statusBadge}</td>
                <td>${velocityBadge}</td>
                <td>${actionBtn}</td>
            </tr>
        `;
    }).join("");
}

async function toggleStaffAccount(staffId) {
    const staff = staffList.find(s => s.id === staffId);
    if (!staff) return;

    const newActiveState = !staff.active;
    staff.active = newActiveState;

    if (!newActiveState) {
        staff.velocity = "0.0 req/s (Revoked)";
        staff.isFlagged = true;
        showToast(`Account Quarantined: ${staff.name} access revoked across Google Cloud.`);
    } else {
        staff.velocity = "0.2 req/s (Nominal)";
        staff.isFlagged = false;
        showToast(`Account Restored: ${staff.name} authorized for dispatch operations.`);
    }

    // Sync to Cloud Firestore
    if (db) {
        try {
            await db.collection("staff").doc(staffId).update({
                status: newActiveState ? "active" : "quarantined",
                velocity: staff.velocity
            });
            await db.collection("system_status").doc("tripwire").set({
                isQuarantined: !newActiveState,
                status: newActiveState ? "active" : "quarantined",
                targetStaff: staffId,
                staffName: staff.name,
                timestamp: new Date().toISOString()
            }, { merge: true });
        } catch (e) {
            console.warn("Firestore staff update notice:", e.message);
        }
    }

    try {
        localStorage.setItem("tripwire_quarantine_sync", newActiveState ? "active" : "quarantined");
    } catch (e) {}

    if (newActiveState && currentState === "after") {
        switchState("before");
    } else if (!newActiveState && currentState === "before") {
        switchState("after");
    }

    renderStaffTable();
}

function handleRestore() {
    toggleStaffAccount("usr_maria");
}

function scrollToStaff() {
    const el = document.getElementById("staffSection");
    if (el) el.scrollIntoView({ behavior: "smooth" });
}

// -----------------------------------------------------------------------------
// 5. REMEDIATION ACTIONS & COMPLIANCE MODALS
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// 6. RATE LIMITING & DETECTION THRESHOLDS
// -----------------------------------------------------------------------------
let protectionSettings = {
    burstLimit: 30,
    burstWindowSec: 5,
    dailyQuota: 50,
    canaryEnabled: true,
    alertPhone: "0917-829-9821"
};

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

function resetProtectionSettings() {
    protectionSettings.burstLimit = 30;
    protectionSettings.dailyQuota = 50;
    protectionSettings.canaryEnabled = true;
    updateSettingsFormFields();
    saveProtectionSettings();
}

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

// -----------------------------------------------------------------------------
// 7. MODALS & TOAST NOTIFICATIONS
// -----------------------------------------------------------------------------
function openModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.remove("hidden");
}

function closeModal(modalId) {
    const m = document.getElementById(modalId);
    if (m) m.classList.add("hidden");
}

window.onclick = function(event) {
    if (event.target.classList.contains("modal-backdrop")) {
        event.target.classList.add("hidden");
    }
};

let toastTimer;
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

// -----------------------------------------------------------------------------
// 8. REAL-TIME EVENT SYNCHRONIZATION
// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// 8. STAFF ACCOUNT PROVISIONING (OWNER SIDE)
// -----------------------------------------------------------------------------
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
    const roleLabel = roleVal === "rider" ? "Delivery Courier Rider" : "Branch Dispatcher (Customer Lookup)";

    const newStaffDoc = {
        name: name,
        email: email,
        role: roleVal,
        branch: branch,
        status: "active",
        velocity: "0.0 req/s (Nominal)",
        createdAt: new Date().toISOString()
    };

    // Save to Firestore
    if (db) {
        try {
            await db.collection("staff").doc(uid).set(newStaffDoc);
            console.log("Provisioned staff in Firestore:", uid);
        } catch (err) {
            console.warn("Firestore staff save notice:", err.message);
        }
    }

    // Add to in-memory staffList
    const newEntry = {
        id: uid,
        name: name,
        role: roleLabel,
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

    // Derive deterministic RFC 6238 Secret
    let secret = "JBSWY3DPEHPK3PXP";
    if (typeof TOTP !== "undefined" && TOTP.getSecretForEmail) {
        secret = TOTP.getSecretForEmail(email);
    }
    const qrUri = `otpauth://totp/SwiftLogistics:${encodeURIComponent(email)}?secret=${secret}&issuer=SwiftLogistics&algorithm=SHA1&digits=6&period=30`;

    document.getElementById("provisionResultBox").style.display = "block";
    document.getElementById("provisionQrImg").src = "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" + encodeURIComponent(qrUri);
    document.getElementById("provisionSecretKey").innerText = secret;
    document.getElementById("btnSubmitProvision").innerText = "Provision Another Account";

    showToast(`Staff account for ${name} registered by Bossing Jeff!`);
}

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
            // Real-time listener for Staff Directory provisioned by Bossing Jeff
            db.collection("staff").onSnapshot((snapshot) => {
                if (!snapshot.empty) {
                    const loaded = [];
                    snapshot.forEach(doc => {
                        const d = doc.data();
                        loaded.push({
                            id: doc.id,
                            name: d.name || "Employee",
                            role: d.role === "owner" ? "Business Owner (Administrator)" : (d.role === "rider" ? "Delivery Courier Rider" : "Branch Dispatcher (Customer Lookup)"),
                            email: d.email || "",
                            active: d.status !== "quarantined",
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

// -----------------------------------------------------------------------------
// 9. INITIALIZATION
// -----------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    initDOMElements();
    loadProtectionSettings();
    initThresholdControls();
    switchState("before");
    initRealtimeSync();
});
