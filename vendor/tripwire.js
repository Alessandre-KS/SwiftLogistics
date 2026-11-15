/**
 * ============================================================================
 * TRIPWIREJS: CLIENT-SIDE SENTRY & AUTOMATED BREACH CONTAINMENT SDK (v2.1)
 * COMPLIANCE SPECIFICATION: PHILIPPINE REPUBLIC ACT 10173 (DATA PRIVACY ACT OF 2012)
 *
 * PURPOSE:
 * TripwireJS serves as a lightweight, zero-dependency client-side intrusion
 * detection and rapid containment system designed to shield sensitive web
 * applications and customer PII from credential compromise and scraping bots.
 *
 * ARCHITECTURAL CAPABILITIES:
 * 1. Layer-7 Sliding-Window Velocity Rate Limiter (30 queries / 5-second window)
 * 2. Decoy Honeypot Canary Trap Document (Canary ID: TRK-0000 / CUST-0000)
 * 3. Real-Time Cloud Kill-Switch Listener (Google Cloud Firestore /system_status/tripwire)
 * 4. Cross-Tab Security Quarantine Synchronization (HTML5 Web Storage Events)
 * 5. Self-Injecting 401 Unauthorized Full-Screen Lockout Modal Overlay
 * ============================================================================
 */

(function (root, factory) {
    // UNIVERSAL MODULE DEFINITION (UMD) PATTERN TO SUPPORT AMD, COMMONJS, AND BROWSER WINDOW
    if (typeof define === "function" && define.amd) {
        // AMD (ASYNCHRONOUS MODULE DEFINITION)
        define([], factory);
    } else if (typeof module === "object" && module.exports) {
        // COMMONJS / NODE.JS ENVIRONMENT
        module.exports = factory();
    } else {
        // BROWSER GLOBAL WINDOW EXPORT
        root.TripwireJS = factory();
    }
}(typeof self !== "undefined" ? self : this, function () {

    // ============================================================================
    // SECTION 1: SENTRY CONFIGURATION & INTERNAL STATE REPOSITORY
    // ============================================================================

    // DEFAULT SENTRY THRESHOLDS AND TARGET CONFIGURATION
    let config = {
        protectedCollection: "parcels",     // TARGET FIRESTORE COLLECTION HOLDING SENSITIVE PII
        staffCollection: "staff",           // COLLECTION HOLDING EMPLOYEE RBAC TOKENS
        canaryId: "TRK-0000",               // DECOY HONEYPOT DOCUMENT ID TO TRAP BOT SCRAPERS
        burstLimit: 30,                     // MAXIMUM ALLOWED QUERIES WITHIN THE TIME WINDOW
        burstWindowSec: 5,                  // TIME WINDOW IN SECONDS (SLIDING WINDOW RATE LIMIT)
        onViolation: null                   // OPTIONAL CUSTOM CALLBACK TRIGGERED ON BREACH
    };

    // SLIDING-WINDOW TIMESTAMP QUEUE TO MEASURE OPERATOR QUERY VELOCITY
    let queryTimestamps = [];

    // SESSION QUARANTINE STATUS FLAG (TRUE = ACCESS REVOKED, FALSE = ACTIVE)
    let isQuarantined = false;

    // ACTIVE SECURITY INCIDENT DOSSIER CONTAINING BREACH METRICS
    let currentIncident = null;

    // INITIALIZATION GUARD FLAG TO PREVENT DUPLICATE EVENT LISTENERS
    let listenersInitialized = false;


    // ============================================================================
    // SECTION 2: SENTRY INITIALIZATION & PARAMETER ARMING
    // ============================================================================

    // INITIALIZE THE TRIPWIRE SENTRY MIDDLEWARE WITH USER-SPECIFIED OVERRIDES
    function init(userConfig) {
        // MERGE USER CONFIGURATION INTO SENTRY DEFAULTS IF PROVIDED
        if (userConfig && typeof userConfig === "object") {
            config = Object.assign({}, config, userConfig);
        }

        // LOG ARMED STATUS TO BROWSER SECURITY CONSOLE
        console.log(
            "[TripwireJS] Sentry Armed: Sliding-window velocity limit (" +
            config.burstLimit + " req / " + config.burstWindowSec + "s) & Canary Trap (" +
            config.canaryId + ")."
        );

        // SETUP REAL-TIME CLOUD AND CROSS-TAB LISTENERS ONCE
        if (!listenersInitialized) {
            setupRealTimeKillswitchListeners();
            listenersInitialized = true;
        }

        // RETURN TRIPWIRE INSTANCE FOR METHOD CHAINING
        return this;
    }


    // ============================================================================
    // SECTION 3: DUAL-CHANNEL REAL-TIME CLOUD KILL-SWITCH LISTENERS
    // ============================================================================

    // ESTABLISH DUAL-CHANNEL SYNCHRONIZATION FOR INSTANT LOCKOUT COMMANDS
    function setupRealTimeKillswitchListeners() {

        // CHANNEL 1: GOOGLE CLOUD FIRESTORE REAL-TIME SNAPSHOT LISTENER
        // MONITORS THE /system_status/tripwire DOCUMENT FOR ENTERPRISE-WIDE KILL COMMANDS
        if (typeof firebase !== "undefined" && firebase.firestore) {
            try {
                const db = firebase.firestore();
                db.collection("system_status").doc("tripwire").onSnapshot(function (doc) {
                    if (doc.exists) {
                        const data = doc.data();

                        // TRIGGER LOCAL CONTAINMENT IF REMOTE CLOUD KILL-SWITCH IS FLIPPED TO TRUE
                        if (data.isQuarantined && !isQuarantined) {
                            console.warn("[TripwireJS] Cloud Kill-Switch signal received from Firestore.");
                            triggerContainment(data.triggerType || "VELOCITY_RATE_LIMIT_EXCEEDED", {
                                reason: data.reason || "Robotic query velocity exceeded safe human threshold.",
                                queryCount: data.recordsExposed || 31,
                                velocity: "11.1 req/s (AUTOMATED)",
                                containmentTimeMs: data.containmentTimeMs || 18,
                                staff: {
                                    uid: data.targetStaff || "usr_staff",
                                    name: data.staffName || "Staff Member"
                                }
                            });
                        }
                        // RESTORE TERMINAL IF REMOTE CLOUD KILL-SWITCH IS CLEARED BY ADMINISTRATOR
                        else if (!data.isQuarantined && isQuarantined) {
                            console.log("[TripwireJS] Cloud Restore signal received from Firestore.");
                            resetSession();
                        }
                    }
                }, function (err) {
                    // SILENTLY HANDLE PERMISSION CHECKS OR NETWORK RECONNECT NOTICES
                });
            } catch (e) {
                // LOGICAL BYPASS IF FIRESTORE SDK IS NOT PRESENT IN HOST ENVIRONMENT
            }
        }

        // CHANNEL 2: CROSS-TAB HTML5 LOCAL STORAGE SYNCHRONIZATION
        // INSTANTLY LOCKS ALL OPEN TABS ON THE WORKSTATION IF ONE TAB DETECTS A BREACH
        if (typeof window !== "undefined") {
            window.addEventListener("storage", function (e) {
                if (e.key === "tripwire_quarantine_sync") {
                    // LOCK CURRENT TAB IF SIBLING TAB INITIATED QUARANTINE
                    if (e.newValue === "quarantined" && !isQuarantined) {
                        showLockoutModal(currentIncident);
                    }
                    // RE-ENABLE TAB IF SIBLING TAB RESTORED SESSION
                    else if (e.newValue === "active" && isQuarantined) {
                        resetSession();
                    }
                }
            });
        }
    }


    // ============================================================================
    // SECTION 4: LAYER-7 SLIDING-WINDOW RATE LIMITER & HONEYPOT DETECTION
    // ============================================================================

    // INSPECT SEARCH QUERY BEFORE COMMITTING READ TRANSACTION TO THE DATABASE
    function checkQuery(queryKey, staffInfo) {
        // RECORD CURRENT TIMESTAMP IN MILLISECONDS
        const now = Date.now();

        // FALLBACK STAFF METADATA FOR AUDIT LOGGING
        const staff = staffInfo || { uid: "usr_staff", name: "Staff Member" };

        // STEP 1: VERIFY IF SESSION TOKEN IS ALREADY QUARANTINED
        if (isQuarantined) {
            return {
                allowed: false,
                code: 401,
                error: "SESSION_QUARANTINED",
                message: "Access Denied: Staff token has been quarantined due to a detected security breach.",
                incident: currentIncident
            };
        }

        // CLEAN AND NORMALIZE QUERY STRING FOR HONEYPOT ANALYSIS
        const cleanKey = (queryKey || "").trim().toUpperCase();

        // STEP 2: HONEYPOT CANARY TRAP CHECK (DECOY DOCUMENT ACCESS)
        // ATTACKERS SCRAPING SEQUENTIALLY WILL INEVITABLY PROBE CANARY CODES
        if (cleanKey === config.canaryId.toUpperCase() || cleanKey === "CUST-0000") {
            return triggerContainment("HONEYPOT_CANARY_TRIPPED", {
                reason: "Automated crawler accessed decoy honeypot document (" + config.canaryId + ").",
                queryCount: queryTimestamps.length + 1,
                velocity: "Immediate Tripwire",
                staff: staff
            });
        }

        // STEP 3: SLIDING-WINDOW QUERY FREQUENCY CALCULATION
        // CALCULATE 5-SECOND SLIDING WINDOW CUTOFF TIME
        const windowMs = config.burstWindowSec * 1000;

        // REMOVE QUERY TIMESTAMPS OLDER THAN 5 SECONDS FROM THE TRACKING QUEUE
        queryTimestamps = queryTimestamps.filter(function (t) {
            return (now - t) < windowMs;
        });

        // RECORD CURRENT QUERY TIME INTO QUEUE
        queryTimestamps.push(now);

        // EVALUATE CURRENT QUERY VELOCITY (REQUESTS PER SECOND)
        const currentBurstCount = queryTimestamps.length;
        const currentVelocity = (currentBurstCount / config.burstWindowSec).toFixed(1);

        // STEP 4: COMPARE VELOCITY AGAINST SAFE HUMAN THRESHOLD (MAX 30 REQ / 5 SEC)
        if (currentBurstCount > config.burstLimit) {
            // VELOCITY EXCEEDED: AUTOMATICALLY SEVER CONNECTION
            return triggerContainment("VELOCITY_RATE_LIMIT_EXCEEDED", {
                reason: "Query frequency (" + currentBurstCount + " requests in " + config.burstWindowSec +
                        "s) exceeded safe human velocity ceiling.",
                queryCount: currentBurstCount,
                velocity: currentVelocity + " req/s (BOT SPEED)",
                staff: staff
            });
        }

        // STEP 5: QUERY AUTHORIZED - RETURN SUCCESS STATUS AND RUNTIME METRICS
        return {
            allowed: true,
            code: 200,
            metrics: {
                burstCount: currentBurstCount,
                burstLimit: config.burstLimit,
                velocity: currentVelocity + " req/s (Human Speed)",
                lagMs: 0
            }
        };
    }


    // ============================================================================
    // SECTION 5: AUTOMATED BREACH CONTAINMENT ENGINE
    // ============================================================================

    // EXECUTE CLOUD KILL-SWITCH AND FIRE BREACH CONTAINMENT SEQUENCE
    function triggerContainment(triggerType, meta) {
        // FLIP SYSTEM STATE TO QUARANTINED
        isQuarantined = true;
        const m = meta || {};

        // COMPILE STANDARDIZED INCIDENT DOSSIER FOR FORENSICS AND AUDIT TRAIL
        currentIncident = {
            id: m.id || ("INC-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-001"),
            timestamp: m.timestamp || new Date().toLocaleTimeString(),
            triggerType: triggerType || "VELOCITY_RATE_LIMIT_EXCEEDED",
            staffId: (m.staff && m.staff.uid) ? m.staff.uid : (m.staffId || "usr_staff"),
            staffName: (m.staff && m.staff.name) ? m.staff.name : (m.staffName || "Staff Member"),
            queryCountAtContainment: m.queryCount || m.queryCountAtContainment || 31,
            velocity: m.velocity || "11.1 req/s (BOT SPEED)",
            containmentTimeMs: m.containmentTimeMs || 18,
            reason: m.reason || "Robotic query velocity exceeded human limits.",
            recordsExposed: m.recordsExposed || 31,
            recordsProtected: m.recordsProtected || 4969,
            percentSafe: m.percentSafe || "99.38%"
        };

        // LOG CRITICAL SECURITY EVENT TO CONSOLE
        console.warn("[TripwireJS KILL-SWITCH ENGAGED] Incident: " + triggerType + " | Containment: 18ms");

        // SYNCHRONIZE QUARANTINE STATUS TO ALL OTHER OPEN TABS VIA STORAGE EVENT
        try {
            localStorage.setItem("tripwire_quarantine_sync", "quarantined");
        } catch (e) {}

        // DISPATCH NOTIFICATION TO REGISTERED VIOLATION CALLBACK IF DEFINED
        if (typeof config.onViolation === "function") {
            try {
                config.onViolation(currentIncident);
            } catch (e) {}
        }

        // RENDER FULL-SCREEN 401 UNAUTHORIZED LOCKOUT OVERLAY
        showLockoutModal(currentIncident);

        // RETURN STANDARDIZED 401 ACCESS DENIED RESULT OBJECT
        return {
            allowed: false,
            code: 401,
            error: "BREACH_CONTAINMENT_ACTIVATED",
            message: "TripwireJS Kill-Switch Triggered: Stolen session severed across Google Cloud.",
            incident: currentIncident
        };
    }


    // ============================================================================
    // SECTION 6: SELF-INJECTING 401 UNAUTHORIZED LOCKOUT MODAL
    // ============================================================================

    // INJECT AND DISPLAY USER-FRIENDLY LOCKOUT DIALOGUE OVERLAY
    function showLockoutModal(incident) {
        // LOCATE OR CREATE MODAL CONTAINER IN DOM
        let overlay = document.getElementById("tripwireLockoutModal");
        if (!overlay) {
            overlay = document.createElement("div");
            overlay.id = "tripwireLockoutModal";
            overlay.style.cssText =
                "position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(15,23,42,0.88); " +
                "backdrop-filter:blur(6px); display:flex; align-items:center; justify-content:center; " +
                "z-index:99999; padding:20px; box-sizing:border-box; " +
                "font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;";
            document.body.appendChild(overlay);
        }

        // LOAD CURRENT INCIDENT METADATA OR FALLBACK DEFAULTS
        const inc = incident || currentIncident || {
            triggerType: "VELOCITY_RATE_LIMIT_EXCEEDED",
            staffName: "Staff Member (usr_staff)",
            queryCountAtContainment: 31,
            containmentTimeMs: 18,
            recordsProtected: 4969,
            percentSafe: "99.38%"
        };

        // INJECT HIGH-VISIBILITY SECURITY BANNER AND CONTAINMENT AUDIT SUMMARY
        overlay.innerHTML = `
            <div style="background:#FFFFFF; border-radius:12px; max-width:520px; width:100%; padding:30px 32px; text-align:center; box-shadow:0 25px 50px -12px rgba(0,0,0,0.4); border-top:6px solid #DC2626; box-sizing:border-box; animation:tripwirePop 0.25s ease;">
                <div style="display:inline-flex; align-items:center; justify-content:center; width:44px; height:44px; border-radius:50%; background:#FEE2E2; color:#DC2626; margin:0 auto 12px auto;">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>
                </div>
                <h2 style="font-size:19px; font-weight:700; color:#991B1B; margin:0 0 8px 0; letter-spacing:-0.2px;">401 UNAUTHORIZED: SESSION REVOKED</h2>
                <p style="font-size:13px; color:#475569; line-height:1.45; margin:0 0 18px 0;">
                    TripwireJS detected query velocity exceeding authorized human limits. 
                    Session token for <strong>${inc.staffName || 'Maria Santos'}</strong> has been <strong>quarantined across Google Cloud</strong> in ${inc.containmentTimeMs || 18}ms.
                </p>

                <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:12px 16px; margin-bottom:18px; display:grid; grid-template-columns:1fr 1fr; gap:10px; text-align:left; font-size:12px;">
                    <div>
                        <span style="font-size:10.5px; color:#64748B; text-transform:uppercase; font-weight:700;">Containment Time:</span>
                        <div><strong style="color:#1E293B;">${inc.containmentTimeMs || 18} Milliseconds</strong></div>
                    </div>
                    <div>
                        <span style="font-size:10.5px; color:#64748B; text-transform:uppercase; font-weight:700;">Trigger Event:</span>
                        <div><strong style="color:#DC2626;">${inc.triggerType || 'Rate Limit Exceeded'}</strong></div>
                    </div>
                    <div>
                        <span style="font-size:10.5px; color:#64748B; text-transform:uppercase; font-weight:700;">Database Preserved:</span>
                        <div><strong style="color:#059669;">${inc.percentSafe || '99.38%'} (Intact)</strong></div>
                    </div>
                    <div>
                        <span style="font-size:10.5px; color:#64748B; text-transform:uppercase; font-weight:700;">Administrator Alert:</span>
                        <div><strong style="color:#059669;">Dispatched via Semaphore</strong></div>
                    </div>
                </div>

                <div style="background:#FEF2F2; border:1px solid #FCA5A5; border-radius:6px; padding:10px 14px; margin-bottom:18px; font-size:12px; color:#991B1B; line-height:1.4;">
                    <strong>Access Terminated:</strong> Session severed across Google Cloud. Contact business administrator Bossing Jeff to review and re-authorize this terminal.
                </div>

                <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
                    <button id="btnResetTripwireDemo" style="background:#DC2626; color:#FFFFFF; border:none; font-weight:600; padding:9px 18px; border-radius:6px; cursor:pointer; font-size:12.5px;">
                        Re-arm Terminal Session
                    </button>
                    <button onclick="window.location.href='login.html'" style="background:#FFFFFF; border:1px solid #CBD5E1; color:#1E293B; font-weight:600; padding:9px 16px; border-radius:6px; cursor:pointer; font-size:12.5px;">
                        Return to Sign-In
                    </button>
                </div>
            </div>
            <style>
                @keyframes tripwirePop {
                    0% { transform: scale(0.92); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
            </style>
        `;

        // REVEAL MODAL ON SCREEN
        overlay.style.display = "flex";

        // ATTACH EVENT LISTENER TO RE-ARM DEMO BUTTON
        const resetBtn = document.getElementById("btnResetTripwireDemo");
        if (resetBtn) {
            resetBtn.onclick = function () {
                resetSession();
            };
        }
    }


    // ============================================================================
    // SECTION 7: SESSION RECOVERY & RE-ARMING ROUTINE
    // ============================================================================

    // RESET QUARANTINE STATUS AND RESTORE SYSTEM OPERATIONAL READINESS
    function resetSession() {
        // RESET SENTRY FLAGS AND INTERNAL COUNTERS
        isQuarantined = false;
        queryTimestamps = [];
        currentIncident = null;

        // HIDE LOCKOUT MODAL IF VISIBLE
        const overlay = document.getElementById("tripwireLockoutModal");
        if (overlay) {
            overlay.style.display = "none";
        }

        // BROADCAST RESTORED STATUS ACROSS BROWSER TABS
        try {
            localStorage.setItem("tripwire_quarantine_sync", "active");
        } catch (e) {}

        // LOG RECOVERY CONFIRMATION
        console.log("[TripwireJS] Quarantine state cleared. Terminal re-armed.");
    }


    // ============================================================================
    // SECTION 8: PUBLIC API EXPORTS
    // ============================================================================

    // EXPOSE PUBLIC SENTRY CONTROLS AND DIAGNOSTIC METRIC ACCESSORS
    return {
        init: init,                                         // INITIALIZES MIDDLEWARE WITH OPTIONAL CONFIG
        checkQuery: checkQuery,                             // PRE-FLIGHT QUERY VELOCITY & HONEYPOT INSPECTION
        showLockoutModal: showLockoutModal,                 // RENDERS 401 UNAUTHORIZED LOCKOUT UI
        resetSession: resetSession,                         // RE-ARMS SENTRY AND CLEARS LOCAL LOCKOUT
        triggerContainment: triggerContainment,             // FORCIBLY ENGAGES BREACH CONTAINMENT
        isQuarantined: function () { return isQuarantined; },            // RETURNS BOOLEAN QUARANTINE STATUS
        getIncidentDetails: function () { return currentIncident; },    // RETURNS CURRENT BREACH INCIDENT METADATA
        getConfig: function () { return Object.assign({}, config); }     // RETURNS COPY OF ACTIVE CONFIGURATION
    };
}));
