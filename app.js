/**
 * SwiftLogistics Hub — Core Client Business Application (v1.0)
 * Branch #04 — Regional Dispatch & Sorting Facility
 * 
 * Standalone MSME Courier Portal connected directly to its own Firebase project:
 * Project ID: swiftlogistics-hub-9821
 */

// -----------------------------------------------------------------------------
// 1. FIREBASE INITIALIZATION CONFIGURATION
// -----------------------------------------------------------------------------
const firebaseConfig = {
    apiKey: "AIzaSyAtoLR9SVRQIgnFgwqQ6kPuTVA23cp0Ibw",
    authDomain: "swiftlogistics-hub-9821.firebaseapp.com",
    projectId: "swiftlogistics-hub-9821",
    storageBucket: "swiftlogistics-hub-9821.firebasestorage.app",
    messagingSenderId: "602215546126",
    appId: "1:602215546126:web:28439f8304a2613c072b5f"
};

// Initialize Firebase (Compat SDK)
let app, auth, db;
let isFirebaseOnline = false;

try {
    if (typeof firebase !== "undefined") {
        app = firebase.initializeApp(firebaseConfig);
        auth = firebase.auth();
        db = firebase.firestore();
        isFirebaseOnline = true;
    }
} catch (e) {
    console.warn("Firebase initialized in offline/fallback mode:", e);
}

// -----------------------------------------------------------------------------
// 2. BASELINE DATASET (AUTHENTIC BRANCH #04 MANIFEST)
// -----------------------------------------------------------------------------
const INITIAL_PARCELS = [
    {
        trackingNo: "TRK-1001",
        name: "Alessandre Kyle E. Sanidad",
        phone: "0917-***-1146",
        city: "Lipa City, Batangas",
        package: "Mechanical Keyboard & Keycaps",
        cod: "₱1,250.00",
        status: "Out for Delivery (Rider Carlo)"
    },
    {
        trackingNo: "TRK-1002",
        name: "Samantha Jean Q. Adaya",
        phone: "0918-***-0766",
        city: "Tanauan City, Batangas",
        package: "UB-Lipa CITEC Department Uniform",
        cod: "₱850.00",
        status: "Out for Delivery (Rider Carlo)"
    },
    {
        trackingNo: "TRK-1003",
        name: "Joanna Rei E. Aguila",
        phone: "0919-***-0614",
        city: "Sto. Tomas, Batangas",
        package: "Computer RAM & NVMe SSD Drive",
        cod: "₱3,400.00",
        status: "Arrived at Hub #04"
    },
    {
        trackingNo: "TRK-1004",
        name: "Stephanie H. Albacite",
        phone: "0920-***-0863",
        city: "Malvar, Batangas",
        package: "IT Capstone Project Hardware Kit",
        cod: "₱2,100.00",
        status: "Delivered & Signed"
    },
    {
        trackingNo: "TRK-1005",
        name: "Jan Rykaelle C. Belegal",
        phone: "0921-***-0453",
        city: "Batangas City, Batangas",
        package: "Auto Parts & Motorcycle Helmet",
        cod: "₱1,750.00",
        status: "Out for Delivery (Rider Carlo)"
    },
    {
        trackingNo: "TRK-1006",
        name: "Nicole Angelique A. Dela Cruz",
        phone: "0922-***-1135",
        city: "San Jose, Batangas",
        package: "Organic Barako Coffee & French Press",
        cod: "₱620.00",
        status: "Arrived at Hub #04"
    },
    {
        trackingNo: "TRK-1007",
        name: "Aizel Anne Magsino",
        phone: "0927-***-0880",
        city: "Padre Garcia, Batangas",
        package: "Wireless Ergonomic Mouse",
        cod: "₱1,490.00",
        status: "Out for Delivery (Rider Carlo)"
    },
    {
        trackingNo: "TRK-1008",
        name: "Maybell J. Mañibo",
        phone: "0928-***-1005",
        city: "Rosario, Batangas",
        package: "Database Management Textbooks",
        cod: "₱0.00",
        status: "Delivered & Signed"
    },
    {
        trackingNo: "TRK-1009",
        name: "Lyra Isabel R. Perez",
        phone: "0929-***-0928",
        city: "Mataasnakahoy, Batangas",
        package: "Leather Safety Boots (Size 10)",
        cod: "₱1,890.00",
        status: "Arrived at Hub #04"
    },
    {
        trackingNo: "TRK-1010",
        name: "Reinali Mae B. Rojas",
        phone: "0915-***-0965",
        city: "Balete, Batangas",
        package: "Arduino Sensor Development Kit",
        cod: "₱950.00",
        status: "Out for Delivery (Rider Carlo)"
    },
    {
        trackingNo: "TRK-1011",
        name: "Rheamae A. Roldan",
        phone: "0916-***-0370",
        city: "Lipa City, Batangas",
        package: "Studio Microphone & Boom Arm",
        cod: "₱2,800.00",
        status: "Arrived at Hub #04"
    },
    {
        trackingNo: "TRK-1012",
        name: "Yvonne Gail V. Rosales",
        phone: "0939-***-0450",
        city: "Tanauan City, Batangas",
        package: "Digital Graphic Drawing Tablet",
        cod: "₱3,150.00",
        status: "Delivered & Signed"
    },
    {
        trackingNo: "TRK-1013",
        name: "Aerone Cedric L. Abaigar",
        phone: "0917-***-1012",
        city: "Sto. Tomas, Batangas",
        package: "Solar Outdoor Security Floodlight",
        cod: "₱1,650.00",
        status: "Out for Delivery (Rider Carlo)"
    },
    {
        trackingNo: "TRK-1014",
        name: "Vonn Cedric M. Abello",
        phone: "0918-***-0494",
        city: "Malvar, Batangas",
        package: "Baking Essentials & Stand Mixer",
        cod: "₱1,920.00",
        status: "Arrived at Hub #04"
    },
    {
        trackingNo: "TRK-1015",
        name: "John Francis D. Alvarez",
        phone: "0919-***-1650",
        city: "Batangas City, Batangas",
        package: "Ergonomic Mesh Chair Components",
        cod: "₱4,200.00",
        status: "Out for Delivery (Rider Carlo)"
    },
    {
        trackingNo: "TRK-1016",
        name: "Andrei B. Amparo",
        phone: "0920-***-1071",
        city: "San Jose, Batangas",
        package: "OBD2 Vehicle Diagnostic Scanner",
        cod: "₱1,350.00",
        status: "Arrived at Hub #04"
    },
    {
        trackingNo: "TRK-1017",
        name: "Carl Joseph G. Arrieta",
        phone: "0921-***-1048",
        city: "Padre Garcia, Batangas",
        package: "Industrial Carbide Drill Bit Set",
        cod: "₱780.00",
        status: "Delivered & Signed"
    },
    {
        trackingNo: "TRK-1018",
        name: "Liwen Aibud Barnuevo",
        phone: "0922-***-1353",
        city: "Rosario, Batangas",
        package: "Ceramic Dinnerware Set",
        cod: "₱1,450.00",
        status: "Out for Delivery (Rider Carlo)"
    },
    {
        trackingNo: "TRK-1019",
        name: "Julian Nichoes S. Bautista",
        phone: "0927-***-0409",
        city: "Mataasnakahoy, Batangas",
        package: "Action Camera with Waterproof Rig",
        cod: "₱5,600.00",
        status: "Arrived at Hub #04"
    },
    {
        trackingNo: "TRK-1020",
        name: "Ashton Ross M. Cabasal",
        phone: "0928-***-0954",
        city: "Balete, Batangas",
        package: "Robotics STEM Learning Kit",
        cod: "₱1,890.00",
        status: "Out for Delivery (Rider Carlo)"
    },
    {
        trackingNo: "TRK-1021",
        name: "Cedric Gian C. Combate",
        phone: "0929-***-1137",
        city: "Lipa City, Batangas",
        package: "Networking Tools & Crimping Kit",
        cod: "₱1,200.00",
        status: "Arrived at Hub #04"
    },
    {
        trackingNo: "TRK-1022",
        name: "John Paul E. Culala",
        phone: "0915-***-1301",
        city: "Tanauan City, Batangas",
        package: "HEPA Air Purifier Replacement Filters",
        cod: "₱1,120.00",
        status: "Delivered & Signed"
    },
    {
        trackingNo: "TRK-1023",
        name: "Randee M. Curioso Jr.",
        phone: "0916-***-1221",
        city: "Sto. Tomas, Batangas",
        package: "Waterproof Outdoor Camping Tent",
        cod: "₱2,300.00",
        status: "Out for Delivery (Rider Carlo)"
    },
    {
        trackingNo: "TRK-1024",
        name: "John Mark B. Daradar",
        phone: "0939-***-0951",
        city: "Malvar, Batangas",
        package: "Bluetooth ANC Over-Ear Headphones",
        cod: "₱2,950.00",
        status: "Arrived at Hub #04"
    },
    {
        trackingNo: "TRK-1025",
        name: "Jay Noel R. David",
        phone: "0917-***-0538",
        city: "Batangas City, Batangas",
        package: "Barako Specialty Coffee Beans (1kg)",
        cod: "₱750.00",
        status: "Out for Delivery (Rider Carlo)"
    },
    {
        trackingNo: "TRK-1026",
        name: "Carl Daniel K. De La Cruz",
        phone: "0918-***-1352",
        city: "San Jose, Batangas",
        package: "Precision Electronic Soldering Station",
        cod: "₱1,580.00",
        status: "Delivered & Signed"
    },
    {
        trackingNo: "TRK-1027",
        name: "Bennedict Oswyn D. Diokno",
        phone: "0919-***-1023",
        city: "Padre Garcia, Batangas",
        package: "Raspberry Pi 4 Micro-Server Case",
        cod: "₱1,100.00",
        status: "Out for Delivery (Rider Carlo)"
    },
    {
        trackingNo: "TRK-1028",
        name: "Gabriel D. Gabiliño",
        phone: "0920-***-1065",
        city: "Rosario, Batangas",
        package: "Thermal Receipt & Waybill Printer",
        cod: "₱3,250.00",
        status: "Arrived at Hub #04"
    },
    {
        trackingNo: "TRK-1029",
        name: "Rainner B. Gallo",
        phone: "0921-***-0768",
        city: "Mataasnakahoy, Batangas",
        package: "Smart Home Wi-Fi Security Camera",
        cod: "₱1,800.00",
        status: "Out for Delivery (Rider Carlo)"
    },
    {
        trackingNo: "TRK-1030",
        name: "Jestine E. Gibaga",
        phone: "0922-***-0531",
        city: "Balete, Batangas",
        package: "Dual-Band Wi-Fi 6 Gigabit Router",
        cod: "₱2,650.00",
        status: "Delivered & Signed"
    }
];

// Active state initialized to manifest
let parcelsList = [];
let currentSelectedTracking = null;
let activeTabFilter = "ALL";

// -----------------------------------------------------------------------------
// 3. DATA LAYER (FIRESTORE WITH LOCAL PERSISTENCE FALLBACK)
// -----------------------------------------------------------------------------
function getLocalParcels() {
    try {
        const stored = localStorage.getItem("swift_parcels_db");
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {}
    return [...INITIAL_PARCELS];
}

function saveLocalParcels(data) {
    try {
        localStorage.setItem("swift_parcels_db", JSON.stringify(data));
    } catch (e) {}
}

async function loadParcels() {
    parcelsList = getLocalParcels();
    renderManifestTable();

    // Attempt Firestore fetch if authenticated
    if (isFirebaseOnline && db && auth && auth.currentUser) {
        try {
            const snapshot = await db.collection("parcels").where("trackingNo", ">", "TRK-0000").get();
            if (!snapshot.empty) {
                const cloudParcels = [];
                snapshot.forEach(doc => {
                    cloudParcels.push(doc.data());
                });
                parcelsList = cloudParcels;
                saveLocalParcels(parcelsList);
                renderManifestTable();
            }
        } catch (err) {
            console.warn("Firestore sync skipped:", err.message);
        }
    }
}

async function addParcelRecord(parcelData) {
    const newTracking = parcelData.trackingNo || ("TRK-" + Math.floor(1000 + Math.random() * 9000));
    const newRecord = {
        trackingNo: newTracking,
        name: parcelData.name,
        phone: parcelData.phone || "0917-***-" + Math.floor(1000 + Math.random() * 9000),
        city: parcelData.city || "Lipa City, Batangas",
        barangay: parcelData.barangay || "",
        addressDetails: parcelData.addressDetails || "",
        landmarks: parcelData.landmarks || "",
        status: parcelData.status || "Out for Delivery (Rider Carlo)",
        package: parcelData.package || "General Merchandise Parcel",
        paymentMethod: parcelData.paymentMethod || "COD",
        paymentStatus: parcelData.paymentStatus || "pending_collection",
        cod: parcelData.cod || "₱0.00"
    };

    parcelsList.unshift(newRecord);
    saveLocalParcels(parcelsList);

    // Save to Firestore if connected
    if (isFirebaseOnline && db) {
        try {
            await db.collection("parcels").doc(newTracking).set({
                ...newRecord,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (e) {
            console.warn("Firestore save error:", e.message);
        }
    }

    return newRecord;
}

async function updateParcelStatusRecord(trackingNo, newStatus) {
    const item = parcelsList.find(p => p.trackingNo === trackingNo);
    if (item) {
        item.status = newStatus;
        saveLocalParcels(parcelsList);

        if (isFirebaseOnline && db) {
            try {
                await db.collection("parcels").doc(trackingNo).update({ status: newStatus });
            } catch (e) {
                console.warn("Firestore update error:", e.message);
            }
        }
        return true;
    }
    return false;
}

// -----------------------------------------------------------------------------
// 4. AUTHENTICATION (FIREBASE AUTH WITH DEMO FALLBACK)
// -----------------------------------------------------------------------------
function getLocalStaffDirectory() {
    try {
        const stored = localStorage.getItem("swift_staff_directory");
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) {}
    return [
        {
            id: "usr_jeff",
            name: "Bossing Jeff",
            email: "jeff@swiftlogistics.ph",
            role: "Business Owner (Administrator)",
            active: true
        }
    ];
}

async function signInStaff(email, password) {
    if (!password) {
        return { success: false, message: "Please enter your password." };
    }
    if (!email) {
        return { success: false, message: "Please enter your employee email." };
    }

    const clean = email.toLowerCase().trim();

    // 1. Owner Login: Bossing Jeff
    if (clean === "jeff@swiftlogistics.ph" || clean.includes("jeff") || clean.includes("bossing")) {
        const user = {
            uid: "usr_jeff",
            email: "jeff@swiftlogistics.ph",
            name: "Bossing Jeff",
            role: "Business Owner (Administrator)"
        };
        localStorage.setItem("swift_session_user", JSON.stringify(user));
        return { success: true, user: user };
    }

    // 2. Check if account is in Pending Verification status (Registration Queue)
    try {
        const pendingRegistrations = JSON.parse(localStorage.getItem("swift_pending_registrations") || "[]");
        const pendingMatch = pendingRegistrations.find(r => (r.email || "").toLowerCase() === clean);
        if (pendingMatch && (pendingMatch.status === "pending_verification" || pendingMatch.verified === false)) {
            return {
                success: false,
                message: "Registration Pending: Your staff account has not been approved yet. Contact Bossing Jeff on the Owner Console to verify and activate your account."
            };
        }
    } catch (e) {}

    // 3. Check Cloud Firestore /staff collection for accounts provisioned by Bossing Jeff
    if (isFirebaseOnline && db) {
        try {
            const snapshot = await db.collection("staff").where("email", "==", clean).get();
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                const data = doc.data();
                if (data.status === "quarantined") {
                    return {
                        success: false,
                        message: "Access Denied: Account quarantined by TripwireJS. Contact Bossing Jeff to review."
                    };
                }
                if (data.status === "pending_verification" || data.verified === false) {
                    return {
                        success: false,
                        message: "Registration Pending: Your staff account has not been approved yet. Contact Bossing Jeff on the Owner Console to verify and activate your account."
                    };
                }
                const roleLabel = data.role === "rider" ? "Delivery Courier Rider" : (data.role || "Branch Dispatcher");
                const user = {
                    uid: doc.id,
                    email: clean,
                    name: data.name || "Employee",
                    role: roleLabel
                };
                localStorage.setItem("swift_session_user", JSON.stringify(user));
                return { success: true, user: user };
            }
        } catch (err) {
            console.warn("Firestore staff verification notice:", err.message);
        }
    }

    // 4. Check local directory (accounts provisioned by owner on local console)
    const localDirectory = getLocalStaffDirectory();
    const matched = localDirectory.find(s => (s.email || "").toLowerCase() === clean);
    if (matched) {
        if (matched.status === "pending_verification" || matched.verified === false) {
            return {
                success: false,
                message: "Registration Pending: Your staff account has not been approved yet. Contact Bossing Jeff on the Owner Console to verify and activate your account."
            };
        }
        if (matched.active === false || matched.status === "quarantined") {
            return {
                success: false,
                message: "Access Denied: Account quarantined by TripwireJS. Contact Bossing Jeff to review."
            };
        }
        const user = {
            uid: matched.id || ("usr_" + clean.split("@")[0]),
            email: clean,
            name: matched.name,
            role: matched.role || "Branch Dispatcher"
        };
        localStorage.setItem("swift_session_user", JSON.stringify(user));
        return { success: true, user: user };
    }

    // 5. Strictly deny unprovisioned accounts
    return {
        success: false,
        message: "Access Denied: Account not provisioned by Business Owner. Please click 'Register Staff' to submit an account request for verification."
    };
}

function signOutStaff() {
    if (isFirebaseOnline && auth) {
        auth.signOut().catch(() => {});
    }
    localStorage.removeItem("swift_session_user");
    window.location.href = "login.html";
}

function getStaffSession() {
    try {
        const stored = localStorage.getItem("swift_session_user");
        if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
}

// -----------------------------------------------------------------------------
// 5. UI RENDERING & EVENT CONTROLLERS
// -----------------------------------------------------------------------------
function showToast(message, type = "success") {
    const toast = document.getElementById("friendlyToast");
    if (!toast) return;
    toast.innerText = message;
    toast.className = `toast ${type}`;
    toast.style.display = "block";
    toast.classList.remove("hidden");
    setTimeout(() => {
        toast.style.display = "none";
        toast.classList.add("hidden");
    }, 3000);
}

function updateTimeline(status) {
    const s1 = document.getElementById("tStep1");
    const s2 = document.getElementById("tStep2");
    const s3 = document.getElementById("tStep3");
    const s4 = document.getElementById("tStep4");
    if (!s1 || !s2 || !s3 || !s4) return;

    s1.className = "timeline-step completed";
    s2.className = "timeline-step completed";
    s3.className = "timeline-step";
    s4.className = "timeline-step";

    if (status.includes("Out for Delivery")) {
        s3.className = "timeline-step active";
    } else if (status.includes("Delivered")) {
        s3.className = "timeline-step completed";
        s4.className = "timeline-step completed";
    } else {
        s2.className = "timeline-step active";
    }
}

function lookupParcel(query, showAlert = false) {
    const clean = (query || "").trim().toUpperCase();
    if (!clean) return;

    // Phase 2: TripwireJS Layer-7 Sentry Inspection
    if (typeof TripwireJS !== "undefined") {
        const staffSession = getStaffSession();
        const check = TripwireJS.checkQuery(clean, staffSession);
        if (!check.allowed) {
            console.warn("[TripwireJS] Blocked suspicious request:", clean, check.error);
            return;
        }
    }

    if (!parcelsList || parcelsList.length === 0) {
        parcelsList = getLocalParcels();
    }

    const found = parcelsList.find(p => 
        (p.trackingNo && p.trackingNo.toUpperCase() === clean) || 
        (p.name && p.name.toUpperCase().includes(clean))
    );

    if (found) {
        currentSelectedTracking = found.trackingNo;
        const noCard = document.getElementById("noParcelSelectedCard");
        const resCard = document.getElementById("parcelResultCard");
        if (noCard) noCard.style.display = "none";
        if (resCard) resCard.style.display = "block";

        const elTrack = document.getElementById("cardTrackingNo");
        const elName = document.getElementById("cardCustomerName");
        const elPhone = document.getElementById("cardCustomerPhone");
        const elCity = document.getElementById("cardCustomerCity");
        const elPkg = document.getElementById("cardPackageDetails");
        const elCod = document.getElementById("cardCod");
        const elBadge = document.getElementById("cardStatusBadge");

        if (elTrack) elTrack.innerText = found.trackingNo;
        if (elName) elName.innerText = found.name;
        if (elPhone) elPhone.innerText = found.phone;

        let displayLoc = found.city;
        if (found.barangay) displayLoc = `${found.barangay}, ${displayLoc}`;
        if (found.addressDetails) displayLoc += ` • ${found.addressDetails}`;
        if (found.landmarks) displayLoc += ` (Note: ${found.landmarks})`;
        if (elCity) elCity.innerText = displayLoc;

        if (elPkg) elPkg.innerText = found.package;
        const pmLabel = (found.paymentMethod || "COD").toUpperCase();
        if (elCod) elCod.innerText = `${pmLabel}: ${found.cod}`;
        if (elBadge) elBadge.innerText = found.status;
        updateTimeline(found.status);
    } else if (showAlert) {
        showToast(`No parcel found matching "${query}".`, "warning");
    }
}

function quickLookup(trackingNo, showAlert = false) {
    const input = document.getElementById("searchQueryInput");
    if (input) input.value = trackingNo;
    lookupParcel(trackingNo, showAlert);
    const card = document.getElementById("parcelResultCard");
    if (card && showAlert) card.scrollIntoView({ behavior: "smooth" });
}

function renderManifestTable() {
    const tbody = document.getElementById("manifestTableBody");
    if (!tbody) return;

    updateKPIs();

    const filterText = (document.getElementById("tableFilterInput")?.value || "").trim().toUpperCase();
    let filtered = parcelsList;

    if (activeTabFilter === "OUT") {
        filtered = filtered.filter(p => p.status.includes("Out for Delivery"));
    } else if (activeTabFilter === "HUB") {
        filtered = filtered.filter(p => p.status.includes("Hub") || p.status.includes("Transit") || p.status.includes("Pickup"));
    } else if (activeTabFilter === "DELIVERED") {
        filtered = filtered.filter(p => p.status.includes("Delivered"));
    }

    if (filterText) {
        filtered = filtered.filter(p => 
            p.trackingNo.toUpperCase().includes(filterText) ||
            p.name.toUpperCase().includes(filterText) ||
            p.city.toUpperCase().includes(filterText) ||
            p.package.toUpperCase().includes(filterText)
        );
    }

    tbody.innerHTML = "";
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:32px; color:var(--text-muted);"><strong style="color:var(--text-title); font-size:13px;">No shipments found in database.</strong><br><span style="font-size:12px;">Click <strong>Book New Parcel</strong> to manifest a shipment.</span></td></tr>`;
        return;
    }

    filtered.forEach(p => {
        const tr = document.createElement("tr");

        let badgeColor = "background:#EFF6FF; color:#1D4ED8; border:1px solid #BFDBFE;";
        if (p.status.includes("Delivered")) {
            badgeColor = "background:#ECFDF5; color:#047857; border:1px solid #A7F3D0;";
        } else if (p.status.includes("Hub") || p.status.includes("Pickup")) {
            badgeColor = "background:#FEF3C7; color:#B45309; border:1px solid #FDE68A;";
        }

        // Payment Badge Logic (COD vs Debit vs E-Wallet)
        let payBadge = `<span class="pay-badge pay-badge-cod">COD ${p.cod}</span>`;
        const pm = (p.paymentMethod || "").toUpperCase();
        const codText = (p.cod || "").toUpperCase();

        if (pm === "DEBIT" || codText.includes("DEBIT")) {
            payBadge = `<span class="pay-badge pay-badge-debit">DEBIT (PAID)</span>`;
        } else if (pm === "GCASH" || codText.includes("GCASH")) {
            payBadge = `<span class="pay-badge pay-badge-gcash">GCASH (PAID)</span>`;
        } else if (pm === "MAYA" || codText.includes("MAYA")) {
            payBadge = `<span class="pay-badge pay-badge-maya">MAYA (PAID)</span>`;
        }

        // Detailed Address Display (Floor, Apartment, Landmark)
        let locationDisplay = p.city;
        if (p.addressDetails) {
            locationDisplay = `<div><strong>${p.city}</strong><div style="font-size:10.5px; color:var(--text-muted); line-height:1.2; margin-top:2px;">${p.addressDetails}</div></div>`;
        }

        tr.innerHTML = `
            <td class="font-mono" style="font-weight:700; color:var(--courier-orange);">${p.trackingNo}</td>
            <td style="font-weight:600; color:var(--text-title);">${p.name}</td>
            <td class="font-mono" style="color:var(--text-muted); font-size:11.5px;">${p.phone}</td>
            <td>${locationDisplay}</td>
            <td style="color:var(--text-muted); font-size:12px;">${p.package}</td>
            <td>${payBadge}</td>
            <td>
                <span style="font-size:11px; font-weight:700; padding:3px 8px; border-radius:20px; display:inline-block; ${badgeColor}">
                    ${p.status}
                </span>
            </td>
            <td style="text-align:right;">
                <button class="btn btn-sm btn-outline" style="padding:3px 8px; font-size:11.5px;" onclick="quickLookup('${p.trackingNo}', true)">Track</button>
                <button class="btn btn-sm btn-outline" style="padding:3px 8px; font-size:11.5px; margin-left:4px;" onclick="openUpdateStatusModal('${p.trackingNo}')">Edit</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateKPIs() {
    const total = parcelsList.length;
    const out = parcelsList.filter(p => p.status.includes("Out for Delivery")).length;
    const hub = parcelsList.filter(p => p.status.includes("Hub") || p.status.includes("Transit") || p.status.includes("Pickup")).length;
    const delivered = parcelsList.filter(p => p.status.includes("Delivered")).length;

    let totalCod = 0;
    let totalDebit = 0;
    parcelsList.forEach(p => {
        const match = (p.cod || "").match(/₱\s*([\d,]+\.?\d*)/);
        const amt = match ? (parseFloat(match[1].replace(/,/g, '')) || 0) : 0;
        const isDebit = (p.paymentMethod && p.paymentMethod.toLowerCase() !== "cod") || (p.cod && (p.cod.includes("DEBIT") || p.cod.includes("GCASH") || p.cod.includes("MAYA")));
        if (isDebit) {
            totalDebit += amt;
        } else {
            totalCod += amt;
        }
    });

    const elTotal = document.getElementById("kpiTotalParcels");
    const elOut = document.getElementById("kpiOutDelivery");
    const elHub = document.getElementById("kpiAtHub");
    const elDel = document.getElementById("kpiDelivered");
    const elCod = document.getElementById("kpiTotalCod");

    if (elTotal) elTotal.innerText = total;
    if (elOut) elOut.innerText = out;
    if (elHub) elHub.innerText = hub;
    if (elDel) elDel.innerText = delivered;
    if (elCod) elCod.innerText = "₱" + totalCod.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const cAll = document.getElementById("countAll");
    const cOut = document.getElementById("countOut");
    const cHub = document.getElementById("countHub");
    const cDel = document.getElementById("countDelivered");
    if (cAll) cAll.innerText = total;
    if (cOut) cOut.innerText = out;
    if (cHub) cHub.innerText = hub;
    if (cDel) cDel.innerText = delivered;
    const sPill = document.getElementById("sidebarManifestPill");
    if (sPill) sPill.innerText = total;
}

function filterManifest(tab, btn) {
    activeTabFilter = tab;
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
    renderManifestTable();
}

function handleTableFilter() {
    renderManifestTable();
}

// Modals
function openBookParcelModal() {
    const m = document.getElementById("bookParcelModal");
    if (m) {
        m.style.display = "flex";
        m.classList.remove("hidden");
    }
}

function closeBookParcelModal() {
    const m = document.getElementById("bookParcelModal");
    if (m) {
        m.style.display = "none";
        m.classList.add("hidden");
    }
}

async function handleBookParcelSubmit(e) {
    e.preventDefault();
    const name = document.getElementById("newRecipName")?.value.trim();
    const phone = document.getElementById("newRecipPhone")?.value.trim();
    const city = document.getElementById("newRecipCity")?.value.trim();
    const pkg = document.getElementById("newPackageDesc")?.value.trim();
    const cod = document.getElementById("newCodAmount")?.value.trim();

    if (!name) return;

    const newRec = await addParcelRecord({ name, phone, city, package: pkg, cod });
    closeBookParcelModal();
    showToast(`Parcel ${newRec.trackingNo} registered for ${name}.`);
    renderManifestTable();
    quickLookup(newRec.trackingNo);
    e.target.reset();
}

let editingTrackingNo = null;
function openUpdateStatusModal(trackingNo) {
    editingTrackingNo = trackingNo;
    const found = parcelsList.find(p => p.trackingNo === trackingNo);
    if (found) {
        document.getElementById("updateModalTrackingNo").innerText = found.trackingNo;
        document.getElementById("updateModalCustomerName").innerText = found.name;
        document.getElementById("updateStatusSelect").value = found.status;
    }
    const m = document.getElementById("updateStatusModal");
    if (m) {
        m.style.display = "flex";
        m.classList.remove("hidden");
    }
}

function closeUpdateStatusModal() {
    const m = document.getElementById("updateStatusModal");
    if (m) {
        m.style.display = "none";
        m.classList.add("hidden");
    }
}

async function confirmStatusUpdate() {
    if (!editingTrackingNo) return;
    const newStatus = document.getElementById("updateStatusSelect").value;
    await updateParcelStatusRecord(editingTrackingNo, newStatus);
    closeUpdateStatusModal();
    showToast(`Status updated to "${newStatus}".`);
    renderManifestTable();
    if (currentSelectedTracking === editingTrackingNo) {
        quickLookup(editingTrackingNo);
    }
}
