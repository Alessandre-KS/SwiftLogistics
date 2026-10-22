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
        name: "Alessandre Kyle Sanidad",
        phone: "0917-***-1146",
        city: "Lipa City, Batangas",
        package: "Mechanical Keyboard & Keycaps",
        cod: "₱1,250.00",
        status: "Out for Delivery (Rider Carlo)"
    },
    {
        trackingNo: "TRK-1002",
        name: "Bea Bianca Castillo",
        phone: "0918-***-2284",
        city: "Tanauan City, Batangas",
        package: "Cosmetics & Skincare Set",
        cod: "₱850.00",
        status: "Out for Delivery (Rider Carlo)"
    },
    {
        trackingNo: "TRK-1003",
        name: "Christian Paul Mendoza",
        phone: "0920-***-3391",
        city: "Sto. Tomas, Batangas",
        package: "Computer RAM & SSD Drive",
        cod: "₱3,400.00",
        status: "Arrived at Hub #04"
    },
    {
        trackingNo: "TRK-1004",
        name: "Dianne Mae Hernandez",
        phone: "0919-***-4452",
        city: "Batangas City, Batangas",
        package: "Formal Blazer & Apparel",
        cod: "₱1,100.00",
        status: "Delivered & Signed"
    },
    {
        trackingNo: "TRK-1005",
        name: "Eduardo Miguel Ramos",
        phone: "0922-***-5517",
        city: "Malvar, Batangas",
        package: "Auto Parts & Motorcycle Oil",
        cod: "₱1,750.00",
        status: "Out for Delivery (Rider Carlo)"
    },
    {
        trackingNo: "TRK-1006",
        name: "Fatima Rose De Castro",
        phone: "0915-***-6638",
        city: "San Jose, Batangas",
        package: "Organic Coffee Beans & Press",
        cod: "₱620.00",
        status: "Arrived at Hub #04"
    },
    {
        trackingNo: "TRK-1007",
        name: "Gabriel Vincent Ilagan",
        phone: "0917-***-7749",
        city: "Lipa City, Batangas",
        package: "Wireless Gaming Mouse",
        cod: "₱1,490.00",
        status: "Out for Delivery (Rider Carlo)"
    },
    {
        trackingNo: "TRK-1008",
        name: "Hannah Camille Reyes",
        phone: "0928-***-8850",
        city: "Tanauan City, Batangas",
        package: "Architectural Drafting Tools",
        cod: "₱2,100.00",
        status: "Delivered & Signed"
    },
    {
        trackingNo: "TRK-1009",
        name: "Ian Joseph Dimaculangan",
        phone: "0939-***-9961",
        city: "Batangas City, Batangas",
        package: "Leather Work Shoes (Size 10)",
        cod: "₱1,890.00",
        status: "Arrived at Hub #04"
    },
    {
        trackingNo: "TRK-1010",
        name: "Jasmine Nicole Alcantara",
        phone: "0916-***-1072",
        city: "Sto. Tomas, Batangas",
        package: "Hydroponic Seeds & Nutrients",
        cod: "₱450.00",
        status: "Out for Delivery (Rider Carlo)"
    },
    {
        trackingNo: "TRK-1011",
        name: "Kenneth James Bautista",
        phone: "0927-***-2183",
        city: "Malvar, Batangas",
        package: "Studio Microphone & Boom Arm",
        cod: "₱2,800.00",
        status: "Arrived at Hub #04"
    },
    {
        trackingNo: "TRK-1012",
        name: "Larissa Joy Macatangay",
        phone: "0917-***-3294",
        city: "Lipa City, Batangas",
        package: "Medical Reference Textbooks",
        cod: "₱0.00",
        status: "Delivered & Signed"
    },
    {
        trackingNo: "TRK-1013",
        name: "Mark Anthony Gutierrez",
        phone: "0921-***-4305",
        city: "San Jose, Batangas",
        package: "Solar Outdoor Flood Light",
        cod: "₱1,650.00",
        status: "Out for Delivery (Rider Carlo)"
    },
    {
        trackingNo: "TRK-1014",
        name: "Nathalie Grace Silva",
        phone: "0915-***-5416",
        city: "Tanauan City, Batangas",
        package: "Baking Ingredients & Silicone Molds",
        cod: "₱920.00",
        status: "Arrived at Hub #04"
    },
    {
        trackingNo: "TRK-1015",
        name: "Oliver Keith Marasigan",
        phone: "0929-***-6527",
        city: "Batangas City, Batangas",
        package: "Ergonomic Office Chair Components",
        cod: "₱4,200.00",
        status: "Out for Delivery (Rider Carlo)"
    },
    {
        trackingNo: "TRK-1016",
        name: "Patricia Mae Cueto",
        phone: "0917-***-7638",
        city: "Lipa City, Batangas",
        package: "Digital Graphic Drawing Tablet",
        cod: "₱3,150.00",
        status: "Arrived at Hub #04"
    },
    {
        trackingNo: "TRK-1017",
        name: "Quirino Rafael Mercado",
        phone: "0920-***-8749",
        city: "Sto. Tomas, Batangas",
        package: "Heavy Duty Carbide Drill Bits",
        cod: "₱780.00",
        status: "Delivered & Signed"
    },
    {
        trackingNo: "TRK-1018",
        name: "Roxanne Mae Del Mundo",
        phone: "0918-***-9850",
        city: "Malvar, Batangas",
        package: "Ceramic Tableware Set",
        cod: "₱1,450.00",
        status: "Out for Delivery (Rider Carlo)"
    },
    {
        trackingNo: "TRK-1019",
        name: "Samuel David Laurel",
        phone: "0922-***-0961",
        city: "Tanauan City, Batangas",
        package: "Action Camera & Waterproof Case",
        cod: "₱5,600.00",
        status: "Arrived at Hub #04"
    },
    {
        trackingNo: "TRK-1020",
        name: "Theresa Marie Malabanan",
        phone: "0916-***-1172",
        city: "San Jose, Batangas",
        package: "Children's Educational STEM Kit",
        cod: "₱890.00",
        status: "Out for Delivery (Rider Carlo)"
    },
    {
        trackingNo: "TRK-1021",
        name: "Ulysses John Villanueva",
        phone: "0928-***-2283",
        city: "Batangas City, Batangas",
        package: "OBD2 Vehicle Diagnostic Scanner",
        cod: "₱1,350.00",
        status: "Arrived at Hub #04"
    },
    {
        trackingNo: "TRK-1022",
        name: "Vanessa Lorraine Catapang",
        phone: "0919-***-3394",
        city: "Lipa City, Batangas",
        package: "Air Purifier HEPA Filter",
        cod: "₱1,120.00",
        status: "Delivered & Signed"
    },
    {
        trackingNo: "TRK-1023",
        name: "Wilfredo Carlos Recto",
        phone: "0917-***-4405",
        city: "Sto. Tomas, Batangas",
        package: "Outdoor Camping Tent & Bag",
        cod: "₱2,300.00",
        status: "Out for Delivery (Rider Carlo)"
    },
    {
        trackingNo: "TRK-1024",
        name: "Xander Luke Mandigma",
        phone: "0927-***-5516",
        city: "Malvar, Batangas",
        package: "Bluetooth ANC Studio Headphones",
        cod: "₱2,950.00",
        status: "Arrived at Hub #04"
    },
    {
        trackingNo: "TRK-1025",
        name: "Yvonne Marie Kalaw",
        phone: "0915-***-6627",
        city: "Lipa City, Batangas",
        package: "Barako Specialty Coffee Beans (1kg)",
        cod: "₱750.00",
        status: "Out for Delivery (Rider Carlo)"
    },
    {
        trackingNo: "TRK-1026",
        name: "Zachary Vance Dimaano",
        phone: "0929-***-7738",
        city: "Tanauan City, Batangas",
        package: "Precision Watchmaker Repair Kit",
        cod: "₱1,580.00",
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
    const newTracking = "TRK-" + Math.floor(1000 + Math.random() * 9000);
    const newRecord = {
        trackingNo: newTracking,
        name: parcelData.name,
        phone: parcelData.phone || "0917-***-" + Math.floor(1000 + Math.random() * 9000),
        city: parcelData.city || "Lipa City, Batangas",
        status: parcelData.status || "Out for Delivery (Rider Carlo)",
        package: parcelData.package || "General Merchandise Parcel",
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
async function signInStaff(email, password) {
    if (isFirebaseOnline && auth) {
        try {
            const userCred = await auth.signInWithEmailAndPassword(email, password);
            const user = {
                uid: userCred.user.uid,
                email: userCred.user.email,
                name: email.includes("carlo") ? "Carlo Reyes" : "Maria Santos",
                role: email.includes("carlo") ? "Delivery Courier Rider" : "Branch Dispatcher"
            };
            localStorage.setItem("swift_session_user", JSON.stringify(user));
            return { success: true, user: user };
        } catch (err) {
            console.warn("Firebase Auth error, checking local preset:", err.code);
            // Allow demo preset login for local defense testing
            if ((email.includes("maria") || email.includes("carlo")) && password) {
                const user = {
                    uid: email.includes("carlo") ? "usr_carlo" : "usr_maria",
                    email: email,
                    name: email.includes("carlo") ? "Carlo Reyes" : "Maria Santos",
                    role: email.includes("carlo") ? "Delivery Courier Rider" : "Branch Dispatcher"
                };
                localStorage.setItem("swift_session_user", JSON.stringify(user));
                return { success: true, user: user };
            }
            return { success: false, message: err.message };
        }
    }

    // Offline / Demo fallback
    if ((email.includes("maria") || email.includes("carlo")) && password) {
        const user = {
            uid: email.includes("carlo") ? "usr_carlo" : "usr_maria",
            email: email,
            name: email.includes("carlo") ? "Carlo Reyes" : "Maria Santos",
            role: email.includes("carlo") ? "Delivery Courier Rider" : "Branch Dispatcher"
        };
        localStorage.setItem("swift_session_user", JSON.stringify(user));
        return { success: true, user: user };
    }
    return { success: false, message: "Invalid credentials. Please enter your employee email." };
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
        if (elCity) elCity.innerText = found.city;
        if (elPkg) elPkg.innerText = found.package;
        if (elCod) elCod.innerText = `COD: ${found.cod}`;
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

        tr.innerHTML = `
            <td class="font-mono" style="font-weight:700; color:var(--color-primary-dark);">${p.trackingNo}</td>
            <td style="font-weight:600; color:var(--text-title);">${p.name}</td>
            <td class="font-mono" style="color:var(--text-muted);">${p.phone}</td>
            <td>${p.city}</td>
            <td style="color:var(--text-muted);">${p.package}</td>
            <td style="font-weight:700; color:#B45309;">${p.cod}</td>
            <td>
                <span style="font-size:11px; font-weight:700; padding:3px 8px; border-radius:20px; display:inline-block; ${badgeColor}">
                    ${p.status}
                </span>
            </td>
            <td style="text-align:right;">
                <button class="btn btn-sm btn-outline" style="padding:3px 8px; font-size:11.5px;" onclick="quickLookup('${p.trackingNo}')">Track</button>
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
    parcelsList.forEach(p => {
        const match = (p.cod || "").match(/₱\s*([\d,]+\.?\d*)/);
        if (match) totalCod += parseFloat(match[1].replace(/,/g, '')) || 0;
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
