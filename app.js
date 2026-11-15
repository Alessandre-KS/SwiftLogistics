/**
 * ============================================================================
 * SWIFTLOGISTICS HUB — CORE LOGISTICS & DISPATCH CONTROLLER (v2.0)
 * Branch #04 Regional Dispatch & Sorting Facility (Lipa City, Batangas)
 *
 * PROJECT ARCHITECTURE OVERVIEW:
 * 1. Client Dispatch Desk: Front-end terminal for manifesting, dispatching, and tracking shipments.
 * 2. Google Cloud Firestore: Serverless NoSQL cloud persistence layer for parcels, couriers, and staff.
 * 3. Leaflet & OSRM Engine: Real road-geometry turn-by-turn routing and GPS fleet tracking.
 * 4. TripwireJS Layer-7 Sentry: Automated cyber-defense monitoring query velocity and canary honeypots.
 *
 * Designed for clean maintainability, clear readability, and ease of onboarding
 * for future software developers, students, and system administrators.
 * ============================================================================
 */

// ============================================================================
// SECTION 1: SYSTEM INITIALIZATION & CLOUD FIREBASE CONFIGURATION
// ============================================================================

// FIREBASE CONNECTION CREDENTIALS FOR SWIFTLOGISTICS HUB
const firebaseConfig = (typeof window !== "undefined" && window.FIREBASE_CONFIG) ? window.FIREBASE_CONFIG : {
    apiKey: "AIzaSyAtoLR9SVRQIgnFgwqQ6kPuTVA23cp0Ibw",
    authDomain: "swiftlogistics-hub-9821.firebaseapp.com",
    projectId: "swiftlogistics-hub-9821",
    storageBucket: "swiftlogistics-hub-9821.appspot.com",
    messagingSenderId: "530084042857",
    appId: "1:530084042857:web:8cf0d16df33418579d4a0f",
    measurementId: "G-65492H4Z5D"
};

// FIREBASE COMPAT SDK INSTANCES & CONNECTION STATUS
let app, auth, db;
let isFirebaseOnline = false;

// INITIALIZE FIREBASE WITH ERROR HANDLING AND OFFLINE FALLBACK
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

// ============================================================================
// SECTION 2: CENTRAL LOGISTICS HUB & GEOLOCATION SERVICES (OSM / LEAFLET / OSRM)
// ============================================================================
//
// PURPOSE OF THIS SECTION:
// This module provides the mathematical and geographical backbone for all Leaflet
// maps in SwiftLogistics Hub (Fleet Radar, Courier Route, and Consignment Pinning).
//
// CORE CONCEPTS EXPLAINED FOR CODERS & DEFENSE PANEL:
// 1. LEAFLET COORDINATE CONVENTION: Leaflet expects coordinates as [LATITUDE, LONGITUDE].
//    - Latitude (N/S): Batangas is ~13.7° to 14.1° North of the Equator.
//    - Longitude (E/W): Batangas is ~121.0° to 121.2° East of the Prime Meridian.
// 2. HAVERSINE FORMULA: Calculates straight-line distance across Earth's sphere (Radius = 6,371 km).
// 3. OSRM (OPEN SOURCE ROUTING MACHINE): Paired with Leaflet to calculate real
//    turn-by-turn road routes following actual Batangas highways (e.g. STAR Tollway,
//    Pres. J.P. Laurel Highway) instead of straight "crow-flies" lines.
// 4. GEOJSON VS LEAFLET FLIP: OSRM returns coordinates as [Longitude, Latitude]
//    (GeoJSON standard), which this script converts into [Latitude, Longitude] for Leaflet.
// ============================================================================

// CENTRAL DISPATCH HUB ANCHOR (UB LIPA CAMPUS, LEVISTE HIGHWAY)
const UB_LIPA_HUB = {
    name: "SwiftLogistics Hub #04 (UB Lipa)",                                  // FULL OFFICIAL FACILITY TITLE
    shortName: "UB Lipa Central Hub",                                          // CONCISE OPERATIONAL LABEL
    code: "HUB-04-LIP",                                                        // INTERNAL STATION DISPATCH CODE
    plusCode: "X595+MQ6",                                                      // OPEN LOCATION CODE (GOOGLE PLUS CODE)
    address: "Leviste Hwy, Lipa City, Batangas",                                // PHYSICAL ROADWAY LOCATION
    lat: 13.9692,                                                              // GEOGRAPHICAL LATITUDE (NORTH OF EQUATOR)
    lng: 121.1594                                                              // GEOGRAPHICAL LONGITUDE (EAST OF MERIDIAN)
};

// BATANGAS TOWNS AND LIPA BARANGAYS GPS PRESETS (PRE-CALIBRATED COORDINATES)
const BATANGAS_GEO_PRESETS = {
    "LIPA_HUB": { lat: 13.9692, lng: 121.1594, name: "UB Lipa Central Hub (Leviste Hwy)", barangay: "Brgy. Marawoy", city: "Lipa City, Batangas" },
    "MARAWOY": { lat: 13.9575, lng: 121.1633, name: "Brgy. Marawoy, Lipa City", barangay: "Brgy. Marawoy", city: "Lipa City, Batangas" },
    "TAMBO": { lat: 13.9430, lng: 121.1620, name: "Brgy. Tambo, Lipa City", barangay: "Brgy. Tambo", city: "Lipa City, Batangas" },
    "SABANG": { lat: 13.9392, lng: 121.1585, name: "Brgy. Sabang, Lipa City", barangay: "Brgy. Sabang", city: "Lipa City, Batangas" },
    "SICO": { lat: 13.9350, lng: 121.1480, name: "Brgy. Sico / Banaybanay, Lipa City", barangay: "Brgy. Sico", city: "Lipa City, Batangas" },
    "POBLACION": { lat: 13.9405, lng: 121.1625, name: "Poblacion (Cathedral), Lipa City", barangay: "Brgy. Poblacion", city: "Lipa City, Batangas" },
    "ANTIPOLO": { lat: 13.9510, lng: 121.1820, name: "Brgy. Antipolo del Norte, Lipa City", barangay: "Brgy. Antipolo del Norte", city: "Lipa City, Batangas" },
    "INOSLOBAN": { lat: 13.9740, lng: 121.1650, name: "Brgy. Inosloban, Lipa City", barangay: "Brgy. Inosloban", city: "Lipa City, Batangas" },
    "BALINTAWAK": { lat: 13.9480, lng: 121.1660, name: "Brgy. Balintawak, Lipa City", barangay: "Brgy. Balintawak", city: "Lipa City, Batangas" },
    "MALVAR": { lat: 14.0450, lng: 121.1570, name: "Malvar, Batangas", barangay: "Poblacion, Malvar", city: "Malvar, Batangas" },
    "TANAUAN": { lat: 14.0863, lng: 121.1500, name: "Tanauan City, Batangas", barangay: "Poblacion, Tanauan", city: "Tanauan City, Batangas" },
    "STO_TOMAS": { lat: 14.1080, lng: 121.1415, name: "Sto. Tomas, Batangas", barangay: "Poblacion, Sto. Tomas", city: "Sto. Tomas, Batangas" },
    "BALETE": { lat: 14.0200, lng: 121.0960, name: "Balete, Batangas", barangay: "Poblacion, Balete", city: "Balete, Batangas" },
    "MATAASNAKAHOY": { lat: 13.9700, lng: 121.1100, name: "Mataasnakahoy, Batangas", barangay: "Poblacion, Mataasnakahoy", city: "Mataasnakahoy, Batangas" },
    "SAN_JOSE": { lat: 13.8680, lng: 121.1070, name: "San Jose, Batangas", barangay: "Poblacion, San Jose", city: "San Jose, Batangas" },
    "PADRE_GARCIA": { lat: 13.8780, lng: 121.2130, name: "Padre Garcia, Batangas", barangay: "Poblacion, Padre Garcia", city: "Padre Garcia, Batangas" },
    "ROSARIO": { lat: 13.8470, lng: 121.2050, name: "Rosario, Batangas", barangay: "Poblacion, Rosario", city: "Rosario, Batangas" },
    "BATANGAS_CITY": { lat: 13.7565, lng: 121.0583, name: "Batangas City, Batangas", barangay: "Poblacion, Batangas City", city: "Batangas City, Batangas" }
};

// REVERSE GEOCODE GPS COORDINATES TO NEAREST BATANGAS TOWN OR BARANGAY
function findNearestPreset(lat, lng) {
    if (lat == null || lng == null) return { name: "Brgy. Marawoy, Lipa City", barangay: "Brgy. Marawoy", city: "Lipa City, Batangas" };
    let closest = null;                                                         // CLOSEST PRESET LOCATION OBJECT
    let minDistance = Infinity;                                                 // MINIMUM HAVERSINE DISTANCE FOUND SO FAR

    // SCAN PRESETS AND IDENTIFY MINIMUM HAVERSINE DISTANCE
    for (const key of Object.keys(BATANGAS_GEO_PRESETS)) {
        if (key === "LIPA_HUB") continue;
        const preset = BATANGAS_GEO_PRESETS[key];
        const d = calculateDistanceKm(lat, lng, preset.lat, preset.lng);
        if (d < minDistance) {
            minDistance = d;
            closest = { ...preset, distanceToPresetKm: d };
        }
    }
    return closest || { name: "Lipa City Area", barangay: "Brgy. Marawoy", city: "Lipa City, Batangas" };
}

// RESOLVE DEFAULT GPS COORDINATES FROM CITY AND BARANGAY TEXT
function getCityCoordinates(city = "", barangay = "") {
    const raw = `${city} ${barangay}`.toLowerCase();
    if (raw.includes("marawoy")) return { ...BATANGAS_GEO_PRESETS.MARAWOY };
    if (raw.includes("tambo")) return { ...BATANGAS_GEO_PRESETS.TAMBO };
    if (raw.includes("sabang")) return { ...BATANGAS_GEO_PRESETS.SABANG };
    if (raw.includes("inosloban")) return { ...BATANGAS_GEO_PRESETS.INOSLOBAN };
    if (raw.includes("balintawak")) return { ...BATANGAS_GEO_PRESETS.BALINTAWAK };
    if (raw.includes("tanauan")) return { ...BATANGAS_GEO_PRESETS.TANAUAN };
    if (raw.includes("malvar")) return { ...BATANGAS_GEO_PRESETS.MALVAR };
    if (raw.includes("tomas")) return { ...BATANGAS_GEO_PRESETS.STO_TOMAS };
    if (raw.includes("balete")) return { ...BATANGAS_GEO_PRESETS.BALETE };
    if (raw.includes("mataasnakahoy") || raw.includes("kahoy")) return { ...BATANGAS_GEO_PRESETS.MATAASNAKAHOY };
    if (raw.includes("san jose")) return { ...BATANGAS_GEO_PRESETS.SAN_JOSE };
    if (raw.includes("garcia")) return { ...BATANGAS_GEO_PRESETS.PADRE_GARCIA };
    if (raw.includes("rosario")) return { ...BATANGAS_GEO_PRESETS.ROSARIO };
    if (raw.includes("batangas city")) return { ...BATANGAS_GEO_PRESETS.BATANGAS_CITY };
    // DEFAULT TO LIPA CITY CENTRAL HUB VICINITY
    return { lat: 13.9575, lng: 121.1633, name: city || "Lipa City, Batangas" };
}

// CALCULATE DISTANCE IN KILOMETERS USING THE MATHEMATICAL HAVERSINE FORMULA
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 0; // GUARD AGAINST NULL COORDINATES
    const R = 6371;                                                             // MEAN RADIUS OF EARTH IN KILOMETERS (6,371 KM)
    const dLat = (lat2 - lat1) * Math.PI / 180;                                 // LATITUDE DIFFERENCE CONVERTED TO RADIANS
    const dLon = (lon2 - lon1) * Math.PI / 180;                                 // LONGITUDE DIFFERENCE CONVERTED TO RADIANS
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +                               // SQUARE OF HALF LATITUDE DIFFERENCE
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *     // PRODUCT OF COSINE OF BOTH LATITUDES
        Math.sin(dLon / 2) * Math.sin(dLon / 2);                               // SQUARE OF HALF LONGITUDE DIFFERENCE
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));                   // ANGULAR DISTANCE IN RADIANS
    return Math.round(R * c * 10) / 10;                                         // DISTANCE IN KM ROUNDED TO 1 DECIMAL PLACE
}

// CALCULATE DISTANCE FROM THE REGIONAL CENTRAL HUB TO ANY DESTINATION
function getDistanceFromHub(lat, lng) {
    const hubLat = UB_LIPA_HUB.lat;                                             // CENTRAL HUB LATITUDE (13.9692° N)
    const hubLng = UB_LIPA_HUB.lng;                                             // CENTRAL HUB LONGITUDE (121.1594° E)
    return calculateDistanceKm(hubLat, hubLng, lat, lng);                       // DISTANCE FROM UB LIPA HUB IN KILOMETERS
}

// FETCH REAL TURN-BY-TURN DRIVING ROAD ROUTE FROM OSRM (OPEN SOURCE ROUTING MACHINE)
async function fetchRoadRoute(waypoints) {
    if (!waypoints || waypoints.length < 2) return null;
    try {
        // STEP 1: CONVERT LEAFLET [LAT, LNG] ARRAY TO OSRM "LNG,LAT" DELIMITED STRING
        const coordString = waypoints.map(pt => {
            const lat = Number(pt[0]);
            const lng = Number(pt[1]);
            return `${lng.toFixed(6)},${lat.toFixed(6)}`;
        }).join(";");

        // STEP 2: QUERY OSRM PUBLIC ROUTING API FOR DRIVING GEOMETRIES
        const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;
        const resp = await fetch(url);
        if (!resp.ok) return null;
        const data = await resp.json();

        // STEP 3: PARSE GEOJSON ROUTE COORDINATES BACK INTO LEAFLET POLYLINE FORMAT
        if (data.code === "Ok" && data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            // FLIP GEOJSON [LNG, LAT] INTO LEAFLET [LAT, LNG]
            const latLngs = route.geometry.coordinates.map(pt => [pt[1], pt[0]]);
            const distanceKm = Math.round((route.distance / 1000) * 10) / 10;
            const durationMins = Math.max(1, Math.round(route.duration / 60));
            return {
                latLngs,
                distanceKm,
                durationMins
            };
        }
    } catch (err) {
        console.warn("OSRM road routing fallback:", err);
    }
    return null;
}

// ============================================================================
// AI ROUTE OPTIMIZATION ENGINE (TRAVELING SALESPERSON / NEAREST-NEIGHBOR + 2-OPT)
// PURPOSE: Computes the most fuel-efficient delivery sequence between an origin
//          and multiple customer stops, ensuring couriers visit closer stops first
//          (e.g., Customer 2 before Customer 1) and eliminating wasteful zigzagging.
// ============================================================================
function optimizeDeliveryRoute(startPoint, stops) {
    if (!stops || stops.length <= 1) {
        return {
            optimizedStops: stops ? [...stops] : [],
            originalDistanceKm: 0,
            optimizedDistanceKm: 0,
            savedDistanceKm: 0,
            savingsPercent: 0,
            isReordered: false
        };
    }

    const startLat = Number(startPoint?.lat || (typeof UB_LIPA_HUB !== "undefined" ? UB_LIPA_HUB.lat : 13.9692));
    const startLng = Number(startPoint?.lng || (typeof UB_LIPA_HUB !== "undefined" ? UB_LIPA_HUB.lng : 121.1594));
    const origin = { lat: startLat, lng: startLng };

    // HELPER: RESOLVE LAT/LNG COORDINATES FOR ANY CONSIGNMENT
    const getCoords = (p) => {
        let lat = p.lat;
        let lng = p.lng;
        if (!lat || !lng) {
            const c = (typeof getCityCoordinates === "function") 
                ? getCityCoordinates(p.city, p.barangay || "")
                : { lat: startLat, lng: startLng };
            lat = c.lat;
            lng = c.lng;
        }
        return { lat: Number(lat), lng: Number(lng) };
    };

    // HELPER: COMPUTE TOTAL HAVERSINE PATH DISTANCE (ORIGIN -> STOP 1 -> STOP 2 -> ...)
    const computePathDist = (orderedStops) => {
        let total = 0;
        let prev = origin;
        for (let i = 0; i < orderedStops.length; i++) {
            const curr = getCoords(orderedStops[i]);
            total += calculateDistanceKm(prev.lat, prev.lng, curr.lat, curr.lng);
            prev = curr;
        }
        return total;
    };

    const originalDist = computePathDist(stops);
    let bestOrder = [...stops];
    let bestDist = originalDist;

    // FOR 2 TO 8 STOPS: FULL PERMUTATION EVALUATION (EXACT GLOBAL OPTIMUM IN < 2ms)
    if (stops.length <= 8) {
        const permute = (arr) => {
            if (arr.length <= 1) return [arr];
            const result = [];
            for (let i = 0; i < arr.length; i++) {
                const current = arr[i];
                const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
                const perms = permute(remaining);
                for (let j = 0; j < perms.length; j++) {
                    result.push([current].concat(perms[j]));
                }
            }
            return result;
        };

        const allPermutations = permute(stops);
        for (let i = 0; i < allPermutations.length; i++) {
            const currentPerm = allPermutations[i];
            const dist = computePathDist(currentPerm);
            if (dist < bestDist - 0.001) {
                bestDist = dist;
                bestOrder = currentPerm;
            }
        }
    } else {
        // FOR > 8 STOPS: NEAREST NEIGHBOR GREEDY HEURISTIC + 2-OPT LOCAL SEARCH
        const unvisited = [...stops];
        const greedyOrder = [];
        let currentPos = origin;

        while (unvisited.length > 0) {
            let nearestIdx = 0;
            let nearestDist = Infinity;
            for (let i = 0; i < unvisited.length; i++) {
                const c = getCoords(unvisited[i]);
                const d = calculateDistanceKm(currentPos.lat, currentPos.lng, c.lat, c.lng);
                if (d < nearestDist) {
                    nearestDist = d;
                    nearestIdx = i;
                }
            }
            const nextStop = unvisited.splice(nearestIdx, 1)[0];
            greedyOrder.push(nextStop);
            currentPos = getCoords(nextStop);
        }

        bestOrder = greedyOrder;
        bestDist = computePathDist(bestOrder);

        // 2-OPT EDGE-SWAPPING REFINEMENT
        let improved = true;
        let iterations = 0;
        while (improved && iterations < 50) {
            improved = false;
            iterations++;
            for (let i = 0; i < bestOrder.length - 1; i++) {
                for (let j = i + 1; j < bestOrder.length; j++) {
                    const candidate = [...bestOrder.slice(0, i), ...bestOrder.slice(i, j + 1).reverse(), ...bestOrder.slice(j + 1)];
                    const candDist = computePathDist(candidate);
                    if (candDist < bestDist - 0.05) {
                        bestDist = candDist;
                        bestOrder = candidate;
                        improved = true;
                        break;
                    }
                }
                if (improved) break;
            }
        }
    }

    const savedKm = Math.max(0, Math.round((originalDist - bestDist) * 10) / 10);
    const savingsPercent = originalDist > 0 ? Math.round((savedKm / originalDist) * 100) : 0;
    const isReordered = stops.some((s, idx) => s.trackingNo !== bestOrder[idx].trackingNo);

    return {
        optimizedStops: bestOrder,
        originalDistanceKm: Math.round(originalDist * 10) / 10,
        optimizedDistanceKm: Math.round(bestDist * 10) / 10,
        savedDistanceKm: savedKm,
        savingsPercent: savingsPercent,
        isReordered: isReordered
    };
}

// ============================================================================
// SECTION 3: COURIER FLEET RADAR & LIVE DRIVER GPS TELEMETRY
// ============================================================================

// RESOLVE VEHICLE EMOJI ICON BASED ON VEHICLE CATEGORY (MOTORCYCLE VS CARGO TRUCK)
function getVehicleEmoji(type) {
    if (!type) return "🏍️";
    const t = String(type).toLowerCase();
    if (t.includes("truck")) return "🚚";
    return "🏍️";
}

// FETCH ACTIVE REGISTERED FIELD COURIERS FROM LOCAL DIRECTORY AND FIRESTORE
async function getRegisteredDrivers() {
    let drivers = [];

    // 1. READ FROM LOCAL CACHED DIRECTORY
    try {
        const stored = JSON.parse(localStorage.getItem("swift_staff_directory") || "[]");
        stored.forEach(s => {
            const roleStr = (s.role || "").toLowerCase();
            if (roleStr.includes("driver") || roleStr.includes("rider")) {
                if (!drivers.some(d => (d.email && d.email.toLowerCase() === (s.email || "").toLowerCase()) || d.name.toLowerCase() === (s.name || "").toLowerCase())) {
                    drivers.push({
                        id: s.id || s.uid,
                        name: s.name,
                        email: s.email,
                        role: s.role,
                        vehicleType: s.vehicleType || "Motorcycle"
                    });
                }
            }
        });
    } catch (e) {}

    // 2. QUERY CLOUD FIRESTORE FOR APPROVED ACTIVE COURIERS
    if (isFirebaseOnline && db) {
        try {
            const snap = await db.collection("staff").get();
            snap.forEach(doc => {
                const data = doc.data();
                const roleStr = (data.role || "").toLowerCase();
                // EXCLUDE QUARANTINED COURIERS FROM DISPATCH ROTATION
                if ((roleStr.includes("driver") || roleStr.includes("rider")) && data.status !== "quarantined") {
                    const existingIdx = drivers.findIndex(d => (d.email && d.email.toLowerCase() === (data.email || "").toLowerCase()) || d.name.toLowerCase() === (data.name || "").toLowerCase());
                    const driverObj = {
                        id: doc.id,
                        name: data.name,
                        email: data.email,
                        role: data.role,
                        vehicleType: data.vehicleType || "Motorcycle"
                    };
                    if (existingIdx >= 0) {
                        drivers[existingIdx] = driverObj;
                    } else {
                        drivers.push(driverObj);
                    }
                }
            });
        } catch (e) {}
    }

    return drivers;
}

// LOCAL CACHE STORE FOR DRIVER GPS COORDINATES
const DEFAULT_DRIVER_LOCATIONS = {
    "usr_maewsenpai": {
        driverId: "usr_maewsenpai",
        driverName: "Tom Cruise",
        vehicleType: "Motorcycle (Express 2-Wheeler)",
        lat: 13.9392,
        lng: 121.1586,
        status: "Out for Delivery",
        currentStreet: "Brgy. Inosloban, Lipa City, Batangas",
        activeParcelsCount: 3,
        nextStopTracking: "TRK-1001"
    }
};

// RETRIEVE CACHED DRIVER LOCATIONS WITH STRICT COURIER-ONLY ROLE FILTERING
function getLocalDriverLocations() {
    try {
        const raw = localStorage.getItem("SWIFT_DRIVER_LOCATIONS");
        if (raw) {
            const parsed = JSON.parse(raw);
            const clean = {};
            for (const id in parsed) {
                const d = parsed[id];
                const name = (d.driverName || "").toLowerCase();
                const role = (d.role || "").toLowerCase();
                // STRICTLY FILTER OUT MOCK COURIERS OR MANAGEMENT DISPATCHERS
                if (!name.includes("carlo") && !name.includes("juan") && !name.includes("alessandre") && !role.includes("management") && !role.includes("dispatcher")) {
                    clean[id] = d;
                }
            }
            if (Object.keys(clean).length > 0) {
                localStorage.setItem("SWIFT_DRIVER_LOCATIONS", JSON.stringify(clean));
                return clean;
            }
        }
    } catch (e) {}
    return { ...DEFAULT_DRIVER_LOCATIONS };
}

// SAVE COURIER GPS POSITIONS TO LOCAL STORAGE AND BROADCAST UPDATE EVENT
function saveLocalDriverLocations(locations) {
    try {
        localStorage.setItem("SWIFT_DRIVER_LOCATIONS", JSON.stringify(locations));
        window.dispatchEvent(new CustomEvent("swift_driver_locations_updated", { detail: locations }));
    } catch (e) {}
}

// UPDATE COURIER LIVE GPS TELEMETRY IN FIRESTORE AND LOCAL CACHE
async function updateDriverLiveLocation(driverData) {
    if (!driverData || !driverData.driverId) return;
    const locations = getLocalDriverLocations();
    locations[driverData.driverId] = {
        ...(locations[driverData.driverId] || {}),
        ...driverData,
        updatedAt: new Date().toISOString()
    };
    saveLocalDriverLocations(locations);

    if (isFirebaseOnline && db) {
        try {
            await db.collection("driver_locations").doc(driverData.driverId).set({
                driverId: driverData.driverId,
                driverName: driverData.driverName || "Field Driver",
                vehicleType: driverData.vehicleType || "Motorcycle (Express 2-Wheeler)",
                lat: Number(driverData.lat),
                lng: Number(driverData.lng),
                status: driverData.status || "Out for Delivery",
                activeParcelsCount: Number(driverData.activeParcelsCount || 0),
                nextStopTracking: driverData.nextStopTracking || "",
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch (e) {
            console.warn("Firestore driver_locations fallback:", e.message);
        }
    }
}

// REAL-TIME FIRESTORE AND STORAGE EVENT LISTENER FOR LIVE DRIVER MOVEMENTS
function listenToDriverLiveLocations(callback) {
    if (typeof callback !== "function") return;

    // 1. INITIAL EMISSION FROM LOCAL CACHE
    callback(getLocalDriverLocations());

    // 2. CROSS-TAB STORAGE EVENT LISTENER
    window.addEventListener("storage", (e) => {
        if (e.key === "SWIFT_DRIVER_LOCATIONS") {
            callback(getLocalDriverLocations());
        }
    });

    window.addEventListener("swift_driver_locations_updated", (e) => {
        if (e.detail) callback(e.detail);
    });

    // 3. FIRESTORE REAL-TIME SNAPSHOT LISTENER
    if (isFirebaseOnline && db) {
        try {
            db.collection("driver_locations").onSnapshot((snapshot) => {
                const current = getLocalDriverLocations();
                let hasChanges = false;
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const name = (data?.driverName || "").toLowerCase();
                    // PURGE NON-COURIER OR MOCK ACCOUNTS FROM RADAR TELEMETRY
                    if (doc.id === "usr_carlo" || doc.id === "usr_juan" || name.includes("carlo") || name.includes("juan") || name.includes("alessandre")) {
                        db.collection("driver_locations").doc(doc.id).delete().catch(() => {});
                        if (current[doc.id]) {
                            delete current[doc.id];
                            hasChanges = true;
                        }
                        return;
                    }
                    if (data && data.driverId) {
                        current[data.driverId] = {
                            ...(current[data.driverId] || {}),
                            ...data
                        };
                        hasChanges = true;
                    }
                });
                snapshot.docChanges().forEach(change => {
                    if (change.type === "removed" && current[change.doc.id]) {
                        delete current[change.doc.id];
                        hasChanges = true;
                    }
                });
                if (hasChanges) {
                    try {
                        localStorage.setItem("SWIFT_DRIVER_LOCATIONS", JSON.stringify(current));
                    } catch (e) {}
                    callback(current);
                }
            }, (err) => {
                console.warn("Firestore driver_locations snapshot fallback:", err.message);
            });
        } catch (e) {
            console.warn("Firestore driver_locations listener fallback:", e);
        }
    }
}

// CENTER AND HIGHLIGHT A DRIVER'S LIVE LOCATION BASED ON PARCEL TRACKING NUMBER
function focusDriverLocationByParcel(trackingNo) {
    if (!trackingNo) return;
    if (!parcelsList || parcelsList.length === 0) parcelsList = getLocalParcels();
    const p = parcelsList.find(x => x.trackingNo === trackingNo);
    if (!p) {
        showToast("Consignment not found in manifest.", "warning");
        return;
    }

    let driverId = p.assignedDriverId || p.assignedDriverUid;
    if (!driverId && p.assignedDriver) {
        const name = p.assignedDriver.toLowerCase();
        if (name.includes("cruise") || name.includes("tom")) driverId = "usr_maewsenpai";
    }

    if (!driverId) {
        showToast(`Consignment ${trackingNo} is not yet assigned to an active field courier.`, "info");
        return;
    }

    const radarEl = document.getElementById("fleetRadarSection");
    if (radarEl) {
        radarEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (typeof window.focusFleetRadarDriver === "function") {
        window.focusFleetRadarDriver(driverId);
    } else {
        showToast(`Locating courier for ${trackingNo}...`, "info");
    }
}

// ============================================================================
// SECTION 4: BASELINE CONSIGNMENT MANIFEST (SEED DATASET)
// ============================================================================

// INITIAL 30 SEEDED CONSIGNMENTS FOR BRANCH #04 SORTING & DISPATCH OPERATIONS
const INITIAL_PARCELS = [
    {
        trackingNo: "TRK-1001",
        name: "Alessandre Kyle E. Sanidad",
        phone: "0917-***-1146",
        city: "Lipa City, Batangas",
        barangay: "Inosloban",
        addressDetails: "Block 4 Lot 12, Villa San Jose",
        landmarks: "Near Inosloban Elementary School / Blue Gate",
        package: "Mechanical Keyboard & Keycaps",
        paymentMethod: "COD",
        cod: "₱1,250.00",
        status: "Out for Delivery",
        assignedDriver: "Tom Cruise",
        driverVehicle: "Motorcycle (Express 2-Wheeler)",
        assignedDriverId: "usr_maewsenpai"
    },
    {
        trackingNo: "TRK-1002",
        name: "Samantha Jean Q. Adaya",
        phone: "0918-***-0766",
        city: "Lipa City, Batangas",
        barangay: "Marawoy",
        addressDetails: "Unit 301, Marawoy Commercial Complex",
        landmarks: "Behind SM City Lipa / Puregold",
        package: "UB-Lipa CITEC Department Uniform",
        paymentMethod: "COD",
        cod: "₱850.00",
        status: "Out for Delivery",
        assignedDriver: "Tom Cruise",
        driverVehicle: "Motorcycle (Express 2-Wheeler)",
        assignedDriverId: "usr_maewsenpai"
    },
    {
        trackingNo: "TRK-1003",
        name: "Joanna Rei E. Aguila",
        phone: "0919-***-0614",
        city: "Lipa City, Batangas",
        barangay: "Tambo",
        addressDetails: "154 J.P. Laurel Highway",
        landmarks: "Across Lipa Medix Medical Hospital",
        package: "Computer RAM & NVMe SSD Drive",
        paymentMethod: "COD",
        cod: "₱3,400.00",
        status: "Out for Delivery",
        assignedDriver: "Tom Cruise",
        driverVehicle: "Motorcycle (Express 2-Wheeler)",
        assignedDriverId: "usr_maewsenpai"
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
        status: "Waiting to be Assigned to Driver"
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
        status: "Waiting to be Assigned to Driver"
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
        status: "Waiting to be Assigned to Driver"
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
        status: "Waiting to be Assigned to Driver"
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
        status: "Waiting to be Assigned to Driver"
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
        status: "Waiting to be Assigned to Driver"
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
        status: "Waiting to be Assigned to Driver"
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
        status: "Waiting to be Assigned to Driver"
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
        status: "Waiting to be Assigned to Driver"
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
        status: "Waiting to be Assigned to Driver"
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
        status: "Waiting to be Assigned to Driver"
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

// AUTO-BIND GPS COORDINATES AND DISTANCES FROM HUB TO ALL SEED PARCELS
INITIAL_PARCELS.forEach(p => {
    if (!p.lat || !p.lng) {
        const coords = getCityCoordinates(p.city, p.barangay || "");
        p.lat = coords.lat;
        p.lng = coords.lng;
        p.distanceKm = getDistanceFromHub(p.lat, p.lng);
    }
});

// RUNTIME APPLICATION STATE FOR CONSIGNMENTS AND ACTIVE TABLE FILTERS
let parcelsList = [];
let currentSelectedTracking = null;
let activeTabFilter = "ALL";
let editingTrackingNo = null;

// ============================================================================
// SECTION 5: DATA ACCESS LAYER & PERSISTENCE (FIRESTORE & LOCAL STORAGE)
// ============================================================================

// RETRIEVE PARCELS FROM LOCALSTORAGE (WITH AUTOMATIC STATUS NORMALIZATION)
function getLocalParcels() {
    try {
        const stored = localStorage.getItem("swift_parcels_db");
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
                let modified = false;
                parsed.forEach(p => {
                    if (!p.lat || !p.lng) {
                        const coords = getCityCoordinates(p.city, p.barangay || "");
                        p.lat = coords.lat;
                        p.lng = coords.lng;
                        p.distanceKm = getDistanceFromHub(p.lat, p.lng);
                        modified = true;
                    }
                    // BUSINESS RULE: A PARCEL CANNOT BE "OUT FOR DELIVERY" WITHOUT AN ASSIGNED COURIER
                    if ((!p.assignedDriver && !p.assignedDriverId) && (p.status || "").includes("Out for Delivery")) {
                        p.status = "Waiting to be Assigned to Driver";
                        modified = true;
                    }
                });

                // ENSURE SEED COURIER TOM CRUISE HAS ACTIVE SHIPMENTS ASSIGNED IF NO PARCELS CURRENTLY ASSIGNED
                const hasAssigned = parsed.some(p => (p.assignedDriver || "").toLowerCase().includes("tom") || (p.assignedDriverId || "") === "usr_maewsenpai");
                if (!hasAssigned) {
                    const sampleTrks = ["TRK-1001", "TRK-1002", "TRK-1003"];
                    parsed.forEach(p => {
                        if (sampleTrks.includes(p.trackingNo)) {
                            p.assignedDriver = "Tom Cruise";
                            p.driverVehicle = "Motorcycle (Express 2-Wheeler)";
                            p.assignedDriverId = "usr_maewsenpai";
                            p.status = "Out for Delivery";
                            if (p.trackingNo === "TRK-1001") {
                                p.city = "Lipa City, Batangas";
                                p.barangay = "Inosloban";
                                p.addressDetails = "Block 4 Lot 12, Villa San Jose";
                                p.landmarks = "Near Inosloban Elementary School / Blue Gate";
                            } else if (p.trackingNo === "TRK-1002") {
                                p.city = "Lipa City, Batangas";
                                p.barangay = "Marawoy";
                                p.addressDetails = "Unit 301, Marawoy Commercial Complex";
                                p.landmarks = "Behind SM City Lipa / Puregold";
                            } else if (p.trackingNo === "TRK-1003") {
                                p.city = "Lipa City, Batangas";
                                p.barangay = "Tambo";
                                p.addressDetails = "154 J.P. Laurel Highway";
                                p.landmarks = "Across Lipa Medix Medical Hospital";
                            }
                            const coords = getCityCoordinates(p.city, p.barangay || "");
                            p.lat = coords.lat;
                            p.lng = coords.lng;
                            p.distanceKm = getDistanceFromHub(p.lat, p.lng);
                            modified = true;
                        }
                    });
                }

                if (modified) {
                    saveLocalParcels(parsed);
                }
                return parsed;
            }
        }
    } catch (e) {}
    return [...INITIAL_PARCELS];
}

// SAVE CURRENT PARCELS LIST TO LOCALSTORAGE
function saveLocalParcels(data) {
    try {
        localStorage.setItem("swift_parcels_db", JSON.stringify(data));
    } catch (e) {}
}

// LOAD PARCELS FROM LOCALSTORAGE AND SYNCHRONIZE WITH CLOUD FIRESTORE
async function loadParcels() {
    parcelsList = getLocalParcels();
    renderManifestTable();

    // ATTEMPT FIRESTORE FETCH IF DB IS AVAILABLE
    if (isFirebaseOnline && db) {
        try {
            const snapshot = await db.collection("parcels").get();
            if (!snapshot.empty) {
                const cloudParcels = [];
                snapshot.forEach(doc => {
                    if (doc.id === "TRK-0000") return; // Skip honeypot canary
                    const data = doc.data();
                    // BUSINESS RULE: NORMALIZE ANY UNASSIGNED FIRESTORE PARCEL TO "WAITING TO BE ASSIGNED TO DRIVER"
                    if ((!data.assignedDriver && !data.assignedDriverId) && (data.status || "").includes("Out for Delivery")) {
                        data.status = "Waiting to be Assigned to Driver";
                        if (db) {
                            db.collection("parcels").doc(doc.id).update({ status: "Waiting to be Assigned to Driver" }).catch(() => {});
                        }
                    }
                    cloudParcels.push(data);
                });
                if (cloudParcels.length > 0) {
                    parcelsList = cloudParcels;
                    saveLocalParcels(parcelsList);
                    renderManifestTable();
                }
            } else {
                // If cloud collection is completely empty, seed INITIAL_PARCELS so all devices share the same data
                try {
                    const batch = db.batch();
                    INITIAL_PARCELS.forEach(p => {
                        const ref = db.collection("parcels").doc(p.trackingNo);
                        batch.set(ref, {
                            ...p,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    });
                    await batch.commit();
                } catch (seedErr) {
                    console.warn("Firestore parcel seeding notice:", seedErr.message);
                }
            }
        } catch (err) {
            console.warn("Firestore sync skipped:", err.message);
        }

        // Establish real-time bidirectional listener for cross-device synchronization
        listenToParcelsCloudSync();
    }
}

// REAL-TIME CLOUD FIRESTORE LISTENER FOR BIDIRECTIONAL CROSS-DEVICE PARCEL SYNC
let parcelsSyncUnsubscribe = null;
function listenToParcelsCloudSync() {
    if (parcelsSyncUnsubscribe) return;
    if (isFirebaseOnline && db) {
        try {
            parcelsSyncUnsubscribe = db.collection("parcels").onSnapshot((snapshot) => {
                if (!snapshot || snapshot.empty) return;
                const cloudParcels = [];
                snapshot.forEach(doc => {
                    if (doc.id === "TRK-0000") return; // Skip canary honeypot
                    const data = doc.data();
                    if ((!data.assignedDriver && !data.assignedDriverId) && (data.status || "").includes("Out for Delivery")) {
                        data.status = "Waiting to be Assigned to Driver";
                    }
                    cloudParcels.push(data);
                });
                if (cloudParcels.length > 0) {
                    parcelsList = cloudParcels;
                    saveLocalParcels(parcelsList);
                    if (typeof renderManifestTable === "function") renderManifestTable();
                    if (typeof renderDriverRunSheet === "function") renderDriverRunSheet();
                    window.dispatchEvent(new CustomEvent("swift_parcels_cloud_synced", { detail: parcelsList }));
                }
            }, (err) => {
                console.warn("Firestore parcels snapshot notice:", err.message);
            });
        } catch (e) {
            console.warn("Firestore parcels listener failed:", e);
        }
    }
}

// REGISTER AND MANIFEST A NEW PARCEL SHIPMENT IN THE DATABASE
async function addParcelRecord(parcelData) {
    // VARIABLES FOR SHIPMENT TRACKING IDENTIFIERS AND DISTANCE
    const newTracking = parcelData.trackingNo || generateTrackingNo();          // UNIQUE CONSIGNMENT IDENTIFIER (E.G. TRK-202611-XXXX)
    const coords = (parcelData.lat && parcelData.lng)                           // RESOLVE DESTINATION LATITUDE AND LONGITUDE
        ? { lat: parcelData.lat, lng: parcelData.lng }                          // USE EXPLICIT COURIER PINNED COORDINATES
        : getCityCoordinates(parcelData.city, parcelData.barangay);             // FALLBACK TO BARANGAY / CITY PRESET COORDINATES
    const dist = getDistanceFromHub(coords.lat, coords.lng);                    // TRANSIT DISTANCE FROM UB LIPA CENTRAL HUB IN KM

    // VARIABLES FOR COMPLETE SHIPMENT RECORD ATTRIBUTES
    const newRecord = {
        trackingNo: newTracking,                                                // CONSIGNMENT TRACKING NUMBER
        name: parcelData.name,                                                  // RECIPIENT FULL NAME
        phone: parcelData.phone || "0917-***-" + Math.floor(1000 + Math.random() * 9000), // MASKED CONTACT NUMBER (DATA PRIVACY ACT)
        city: parcelData.city || "Lipa City, Batangas",                         // DESTINATION MUNICIPALITY
        barangay: parcelData.barangay || "",                                    // LOCAL DESTINATION BARANGAY
        addressDetails: parcelData.addressDetails || "",                        // STREET / UNIT / BUILDING SPECIFICS
        landmarks: parcelData.landmarks || "",                                  // LOCAL WAYFINDING LANDMARKS
        lat: coords.lat,                                                        // DESTINATION LATITUDE COORDINATE
        lng: coords.lng,                                                        // DESTINATION LONGITUDE COORDINATE
        distanceKm: dist,                                                       // ROAD DISTANCE FROM CENTRAL HUB IN KM
        status: parcelData.status || (parcelData.assignedDriver ? "Out for Delivery" : "Waiting to be Assigned to Driver"), // INITIAL HUB WORKFLOW STATUS
        assignedDriver: parcelData.assignedDriver || "",                        // DISPATCHED COURIER NAME
        driverVehicle: parcelData.driverVehicle || "",                          // COURIER VEHICLE PROFILE
        assignedDriverId: parcelData.assignedDriverId || "",                    // DISPATCHED COURIER STAFF ID
        package: parcelData.package || "General Merchandise Parcel",            // CARGO MANIFEST ITEM DESCRIPTION
        paymentMethod: parcelData.paymentMethod || "COD",                       // PAYMENT SETTLEMENT METHOD
        paymentStatus: parcelData.paymentStatus || "pending_collection",        // FINANCIAL CLEARANCE STATUS
        cod: parcelData.cod || "₱0.00"                                          // CASH TO COLLECT FROM RECIPIENT IN PESOS
    };

    // PREPEND NEW RECORD TO TOP OF RUNTIME ARRAY
    parcelsList.unshift(newRecord);
    saveLocalParcels(parcelsList);

    // SAVE DIRECTLY TO CLOUD FIRESTORE
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

// UPDATE TRANSIT STATUS AND ASSIGNED COURIER FOR A SPECIFIC CONSIGNMENT
async function updateParcelStatusRecord(trackingNo, newStatus, assignedDriver = "", driverVehicle = "", assignedDriverId = "") {
    const item = parcelsList.find(p => p.trackingNo === trackingNo);            // FIND MATCHING CONSIGNMENT IN RUNTIME CACHE
    if (item) {
        item.status = newStatus;                                                // ASSIGN NEW TRANSIT LIFECYCLE STATUS
        if (assignedDriver) {
            item.assignedDriver = assignedDriver;                               // ASSIGN DESIGNATED FIELD COURIER NAME
            item.driverVehicle = driverVehicle;                                 // RECORD ASSIGNED TRANSPORT VEHICLE
            item.assignedDriverId = assignedDriverId;                           // RECORD ASSIGNED DRIVER STAFF IDENTIFIER
        }
        saveLocalParcels(parcelsList);                                          // CACHE UPDATED RECORD IN LOCAL STORAGE
        window.dispatchEvent(new CustomEvent("swift_parcels_updated", { detail: parcelsList }));

        if (isFirebaseOnline && db) {
            try {
                // VARIABLES FOR FIRESTORE SYNCHRONIZATION PAYLOAD
                const updatePayload = {
                    ...item,
                    status: newStatus,                                          // NEW CONSIGNMENT STATUS
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp() // SERVER AUDIT TIMESTAMP
                };
                if (assignedDriver) {
                    updatePayload.assignedDriver = assignedDriver;              // FIELD COURIER NAME
                    updatePayload.driverVehicle = driverVehicle;                // TRANSPORT VEHICLE CLASSIFICATION
                    if (assignedDriverId) updatePayload.assignedDriverId = assignedDriverId; // DRIVER USER ID
                }
                await db.collection("parcels").doc(trackingNo).set(updatePayload, { merge: true }); // MERGE TO FIRESTORE
            } catch (e) {
                console.warn("Firestore update error:", e.message);
            }
        }
        return true;
    }
    return false;
}

// RECORD FAILED DELIVERY ATTEMPT WITH AUDIT TRAIL AND LOCAL/CLOUD SYNC
async function logParcelDeliveryAttempt(trackingNo, reason = "Customer Not Available / Gate Closed", notes = "", driverSession = null) {
    const item = parcelsList.find(p => p.trackingNo === trackingNo);
    if (!item) return false;

    // INCREMENT CURRENT ATTEMPTS COUNT (STARTS AT 1)
    const prevAttempts = item.attempts || 1;
    const newAttemptNo = prevAttempts + 1;
    item.attempts = newAttemptNo;

    if (!Array.isArray(item.attemptHistory)) {
        item.attemptHistory = [];
    }

    const attemptEntry = {
        attemptNumber: prevAttempts,
        timestamp: new Date().toISOString(),
        reason: reason || "Customer Not Available / Gate Closed",
        notes: notes || "",
        driverName: driverSession?.name || item.assignedDriver || "Field Courier",
        driverId: driverSession?.uid || item.assignedDriverId || ""
    };
    item.attemptHistory.push(attemptEntry);

    item.lastAttemptReason = reason;
    item.lastAttemptNotes = notes;
    item.lastAttemptAt = new Date().toISOString();

    // UPDATE TRANSIT LIFECYCLE STATUS ACCORDING TO ATTEMPTS LIMIT (MAX 3 ATTEMPTS)
    if (newAttemptNo > 3) {
        item.status = "Failed Delivery - Max Attempts Exceeded (Return to Hub)";
    } else {
        item.status = `Attempted Delivery (${prevAttempts}/3 - ${reason})`;
    }

    // CACHE UPDATED RECORD IN LOCAL BROWSER STORAGE
    saveLocalParcels(parcelsList);

    // MERGE TO CLOUD FIRESTORE PARCELS COLLECTION
    if (isFirebaseOnline && db) {
        try {
            await db.collection("parcels").doc(trackingNo).set({
                ...item,
                attempts: item.attempts,
                attemptHistory: item.attemptHistory,
                status: item.status,
                lastAttemptReason: item.lastAttemptReason,
                lastAttemptNotes: item.lastAttemptNotes,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch (e) {
            console.warn("Firestore delivery attempt error:", e.message);
        }
    }
    return true;
}

// START ACTIVE DELIVERY FOR A SPECIFIC CONSIGNMENT
async function startParcelDelivery(trackingNo, driverSession = null) {
    const item = parcelsList.find(p => p.trackingNo === trackingNo);
    if (!item) return false;

    item.status = "Out for Delivery";
    item.deliveryStartedAt = new Date().toISOString();
    if (driverSession) {
        if (!item.assignedDriver) item.assignedDriver = driverSession.name;
        if (!item.driverVehicle) item.driverVehicle = driverSession.vehicleType;
        if (!item.assignedDriverId) item.assignedDriverId = driverSession.uid;
    }

    saveLocalParcels(parcelsList);

    if (isFirebaseOnline && db) {
        try {
            await db.collection("parcels").doc(trackingNo).set({
                ...item,
                status: "Out for Delivery",
                deliveryStartedAt: item.deliveryStartedAt,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        } catch (e) {
            console.warn("Firestore start delivery error:", e.message);
        }
    }
    return true;
}

// ============================================================================
// SECTION 6: STAFF AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)
// ============================================================================

// RETRIEVE LOCAL STAFF DIRECTORY CACHE
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
            active: true,
            verified: true,
            status: "active"
        },
        {
            id: "usr_2420572",
            name: "Roy Matthew L. Perilla",
            email: "2420572@ub.edu.ph",
            role: "Management (Branch Dispatcher)",
            active: true,
            verified: true,
            status: "active"
        },
        {
            id: "usr_2420417",
            name: "Christan Angelo Parcon",
            email: "2420417@ub.edu.ph",
            role: "Management (Branch Dispatcher)",
            active: true,
            verified: true,
            status: "active"
        },
        {
            id: "usr_alessandrekyle",
            name: "Alessandre Kyle E. Sanidad",
            email: "alessandrekyle@gmail.com",
            role: "Management (Branch Dispatcher)",
            active: true,
            verified: true,
            status: "active"
        },
        {
            id: "usr_maewsenpai",
            name: "Tom Cruise",
            email: "maewsenpai@gmail.com",
            role: "Driver (Delivery Courier Rider)",
            vehicleType: "Motorcycle (Express 2-Wheeler)",
            active: true,
            verified: true,
            status: "active"
        }
    ];
}

// VERIFY EMPLOYEE CREDENTIALS AND INITIATE AUTHORIZED USER SESSION
async function signInStaff(email, password) {
    if (!password) {
        return { success: false, message: "Please enter your password." };
    }
    if (!email) {
        return { success: false, message: "Please enter your employee email." };
    }

    const clean = email.toLowerCase().trim();

    // 1. OWNER / ADMINISTRATOR LOGIN (BOSSING JEFF)
    if (clean === "jeff@swiftlogistics.ph" || clean.includes("jeff") || clean.includes("bossing")) {
        const user = {
            uid: "usr_jeff",
            email: "jeff@swiftlogistics.ph",
            name: "Bossing Jeff",
            role: "Business Owner (Administrator)",
            totpSecret: (typeof TOTP !== 'undefined' && TOTP.getSecretForEmail) ? TOTP.getSecretForEmail("jeff@swiftlogistics.ph") : "JBSWY3DPEHPK3PXP"
        };
        localStorage.setItem("swift_session_user", JSON.stringify(user));
        return { success: true, user: user };
    }

    // 2. CHECK CLOUD FIRESTORE /staff FIRST (PRIMARY SOURCE OF TRUTH)
    if (isFirebaseOnline && db) {
        try {
            const snapshot = await db.collection("staff").where("email", "==", clean).get();
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                const data = doc.data();

                // CHECK FOR TRIPWIRE QUARANTINE LOCKOUT
                if (data.status === "quarantined") {
                    const reasonTxt = data.quarantineReason ? `\nReason: ${data.quarantineReason}` : "";
                    return {
                        success: false,
                        message: `Access Denied: Account quarantined by TripwireJS.${reasonTxt}\nContact Bossing Jeff to review.`
                    };
                }

                // CHECK FOR PENDING IDENTITY VERIFICATION
                if (data.status === "pending_verification" || data.verified === false) {
                    return {
                        success: false,
                        message: "Registration Pending: Your staff account has not been approved yet. Contact Bossing Jeff on the Owner Console to verify and activate your account."
                    };
                }

                // ACCOUNT IS ACTIVE AND APPROVED: CLEAN UP STALE REGISTRATIONS
                try {
                    let pendingList = JSON.parse(localStorage.getItem("swift_pending_registrations") || "[]");
                    pendingList = pendingList.filter(r => (r.email || "").toLowerCase() !== clean);
                    localStorage.setItem("swift_pending_registrations", JSON.stringify(pendingList));
                } catch (e) {}

                // SYNC VERIFIED ACCOUNT TO LOCAL DIRECTORY CACHE
                try {
                    let dir = JSON.parse(localStorage.getItem("swift_staff_directory") || "[]");
                    dir = dir.filter(s => (s.email || "").toLowerCase() !== clean);
                    dir.push({
                        id: doc.id,
                        name: data.name,
                        email: clean,
                        role: data.role,
                        active: true,
                        status: "active",
                        verified: true
                    });
                    localStorage.setItem("swift_staff_directory", JSON.stringify(dir));
                } catch (e) {}

                const roleLabel = (data.role && (data.role.toLowerCase().includes("driver") || data.role === "rider")) 
                    ? "Driver (Delivery Courier Rider)" 
                    : "Management (Branch Dispatcher)";

                const totpSec = data.totpSecret || ((typeof TOTP !== 'undefined' && TOTP.getSecretForEmail) ? TOTP.getSecretForEmail(clean) : "JBSWY3DPEHPK3PXP");
                const vehicleCategory = data.vehicleType || ((roleLabel.includes("Driver") || roleLabel.includes("Rider")) ? "Motorcycle (Express 2-Wheeler)" : "");
                const user = {
                    uid: doc.id,
                    email: clean,
                    name: data.name || "Employee",
                    role: roleLabel,
                    vehicleType: vehicleCategory,
                    totpSecret: totpSec
                };
                localStorage.setItem("swift_session_user", JSON.stringify(user));
                return { success: true, user: user };
            }

            // CHECK FIRESTORE /registrations FOR PENDING REQUESTS
            const regSnapshot = await db.collection("registrations").where("email", "==", clean).get();
            if (!regSnapshot.empty) {
                const regData = regSnapshot.docs[0].data();
                if (regData.status === "pending_verification") {
                    return {
                        success: false,
                        message: "Registration Pending: Your staff account has not been approved yet. Contact Bossing Jeff on the Owner Console to verify and activate your account."
                    };
                }
            }
        } catch (err) {
            console.warn("Firestore staff verification notice:", err.message);
        }
    }

    // 3. FALLBACK: CHECK LOCAL STAFF DIRECTORY (LOCAL OR OFFLINE SESSIONS)
    const localDirectory = getLocalStaffDirectory();
    const matched = localDirectory.find(s => (s.email || "").toLowerCase() === clean);
    if (matched) {
        if (matched.status === "active" || matched.verified === true) {
            const totpSec = matched.totpSecret || ((typeof TOTP !== 'undefined' && TOTP.getSecretForEmail) ? TOTP.getSecretForEmail(clean) : "JBSWY3DPEHPK3PXP");
            const isDriv = matched.role && (matched.role.toLowerCase().includes("driver") || matched.role === "rider");
            const vehicleCategory = matched.vehicleType || (isDriv ? "Motorcycle (Express 2-Wheeler)" : "");
            const user = {
                uid: matched.id || ("usr_" + clean.split("@")[0]),
                email: clean,
                name: matched.name,
                role: isDriv ? "Driver (Delivery Courier Rider)" : "Management (Branch Dispatcher)",
                vehicleType: vehicleCategory,
                totpSecret: totpSec
            };
            localStorage.setItem("swift_session_user", JSON.stringify(user));
            return { success: true, user: user };
        }
        if (matched.status === "pending_verification" || matched.verified === false) {
            return {
                success: false,
                message: "Registration Pending: Your staff account has not been approved yet. Contact Bossing Jeff on the Owner Console to verify and activate your account."
            };
        }
        if (matched.active === false || matched.status === "quarantined") {
            const reasonTxt = matched.quarantineReason ? `\nReason: ${matched.quarantineReason}` : "";
            return {
                success: false,
                message: `Access Denied: Account quarantined by TripwireJS.${reasonTxt}\nContact Bossing Jeff to review.`
            };
        }
    }

    // 4. CHECK LOCAL PENDING REGISTRATIONS QUEUE
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

    // 5. STRICT ACCESS DENIAL FOR UNPROVISIONED ACCOUNTS
    return {
        success: false,
        message: "Access Denied: Account not provisioned by Business Owner. Please click 'Register Staff' to submit an account request for verification."
    };
}

// TERMINATE EMPLOYEE SESSION AND REDIRECT TO LOGIN PORTAL
function signOutStaff() {
    if (isFirebaseOnline && auth) {
        auth.signOut().catch(() => {});
    }
    localStorage.removeItem("swift_session_user");
    window.location.href = "login.html";
}

// GET ACTIVE STAFF SESSION FROM LOCALSTORAGE
function getStaffSession() {
    try {
        const stored = localStorage.getItem("swift_session_user");
        if (stored) return JSON.parse(stored);
    } catch (e) {}
    return null;
}

// ============================================================================
// SECTION 7: CUSTOMER WAYBILL TRACKING & DETAIL CARD
// ============================================================================

// UPDATE THE 4-STEP HORIZONTAL VISUAL DELIVERY TIMELINE
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

// SEARCH CONSIGNMENT BY TRACKING NUMBER OR CUSTOMER NAME (INSPECTED BY TRIPWIREJS)
function lookupParcel(query, showAlert = false) {
    const clean = (query || "").trim().toUpperCase();
    if (!clean) return;

    // TRIPWIREJS LAYER-7 SENTRY INSPECTION (SCRAPING VELOCITY & CANARY DETECTION)
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
        const elAssignedDriver = document.getElementById("cardAssignedDriver");
        if (elAssignedDriver) {
            if (found.assignedDriver) {
                const isOut = (found.status || "").includes("Out for Delivery");
                elAssignedDriver.innerHTML = `
                    <span style="display:inline-flex; align-items:center; gap:4px; background:#EFF6FF; border:1px solid #BFDBFE; color:#1E40AF; padding:2px 8px; border-radius:12px;">
                        ${getVehicleEmoji(found.driverVehicle)} <strong>${found.assignedDriver}</strong> (${found.driverVehicle || 'Motorcycle'})
                    </span>
                    ${isOut ? `
                        <button class="btn-table-track" style="margin-left:6px;" onclick="focusDriverLocationByParcel('${found.trackingNo}')" title="View live driver location on Fleet Radar">
                            📍 Live Driver GPS
                        </button>
                    ` : ''}
                `;
            } else {
                const isWaiting = (found.status || "").includes("Waiting") || (!found.assignedDriver && !found.assignedDriverId);
                elAssignedDriver.innerHTML = isWaiting
                    ? `<span style="color:#D97706; font-weight:600; font-size:11px;">⚠️ Waiting to be Assigned to Driver</span>`
                    : `<span style="color:#94A3B8; font-weight:500; font-size:10.5px;">Courier: Unassigned</span>`;
            }
        }
        updateTimeline(found.status);
    } else if (showAlert) {
        showToast(`No parcel found matching "${query}".`, "warning");
    }
}

// QUICK-LOOKUP SHORTCUT TO POPULATE TRACKING CARD AND FOCUS ROUTE
function quickLookup(trackingNo, showAlert = false) {
    const input = document.getElementById("searchQueryInput");
    if (input) input.value = trackingNo;
    lookupParcel(trackingNo, showAlert);
    const card = document.getElementById("parcelResultCard");
    if (card && showAlert) card.scrollIntoView({ behavior: "smooth" });
}

// ============================================================================
// SECTION 8: MANIFEST TABLE RENDERING, SEARCH & KPI METRICS
// ============================================================================

// RE-RENDER THE SHIPMENTS MANIFEST TABLE WITH STATUS PILLS AND ACTION BUTTONS
function renderManifestTable() {
    const tbody = document.getElementById("manifestTableBody");
    if (!tbody) return;

    updateKPIs();

    const filterText = (document.getElementById("tableFilterInput")?.value || "").trim().toUpperCase();
    let filtered = parcelsList;

    // 1. FILTER ACCORDING TO ACTIVE NAVIGATION TAB
    if (activeTabFilter === "OUT") {
        filtered = filtered.filter(p => p.status.includes("Out for Delivery") && (p.assignedDriver || p.assignedDriverId));
    } else if (activeTabFilter === "HUB") {
        filtered = filtered.filter(p => p.status.includes("Hub") || p.status.includes("Transit") || p.status.includes("Pickup") || p.status.includes("Waiting") || (!p.assignedDriver && !p.assignedDriverId && !p.status.includes("Delivered")));
    } else if (activeTabFilter === "DELIVERED") {
        filtered = filtered.filter(p => p.status.includes("Delivered"));
    }

    // 2. FILTER ACCORDING TO LIVE KEYWORD SEARCH INPUT
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
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:32px; color:var(--text-muted);"><strong style="color:var(--text-title); font-size:13px;">No shipments found in database.</strong><br><span style="font-size:12px;">Click <strong>Book New Parcel</strong> to manifest a shipment.</span></td></tr>`;
        return;
    }

    // 3. GENERATE TABLE ROWS FOR ALL FILTERED CONSIGNMENTS
    filtered.forEach(p => {
        const tr = document.createElement("tr");

        // DYNAMIC COLOR CODING FOR SHIPMENT TRANSIT BADGE
        let badgeColor = "background:#EFF6FF; color:#1D4ED8; border:1px solid #BFDBFE;";
        if (p.status.includes("Delivered")) {
            badgeColor = "background:#ECFDF5; color:#047857; border:1px solid #A7F3D0;";
        } else if (p.status.includes("Hub") || p.status.includes("Pickup") || p.status.includes("Waiting") || (!p.assignedDriver && !p.assignedDriverId)) {
            badgeColor = "background:#FEF3C7; color:#B45309; border:1px solid #FDE68A;";
        }

        // PAYMENT METHOD BADGE (COD VS DEBIT CARD VS E-WALLET)
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

        // FORMATTED ADDRESS AND LANDMARK DISPLAY
        let locationDisplay = p.city;
        if (p.addressDetails) {
            locationDisplay = `<div><strong>${p.city}</strong><div style="font-size:10.5px; color:var(--text-muted); line-height:1.2; margin-top:2px;">${p.addressDetails}</div></div>`;
        }

        tr.innerHTML = `
            <td style="width: 34px; text-align: center;">
                <input type="checkbox" class="parcel-checkbox" value="${p.trackingNo}" onchange="updateBatchDispatchBar()" style="cursor: pointer;">
            </td>
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
                ${p.assignedDriver ? `
                    <div style="margin-top:4px;">
                        <span style="font-size:10px; font-weight:700; color:#1E40AF; background:#EFF6FF; border:1px solid #DBEAFE; padding:1px 6px; border-radius:10px; display:inline-flex; align-items:center; gap:3px;">
                            ${getVehicleEmoji(p.driverVehicle)} ${p.assignedDriver}
                        </span>
                    </div>
                ` : ''}
            </td>
            <td style="text-align:right;">
                <button class="btn btn-sm btn-outline" style="padding:3px 8px; font-size:11.5px;" onclick="quickLookup('${p.trackingNo}', true)">Track</button>
                <button class="btn btn-sm btn-outline" style="padding:3px 8px; font-size:11.5px; margin-left:4px;" onclick="openUpdateStatusModal('${p.trackingNo}')">Dispatch</button>
                ${p.status.includes("Out for Delivery") && (p.assignedDriver || p.assignedDriverId) ? `
                    <button class="btn-table-track" style="margin-left:4px;" onclick="focusDriverLocationByParcel('${p.trackingNo}')" title="Locate courier live GPS on Fleet Radar">📍 Driver GPS</button>
                ` : ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// TOGGLE SELECT ALL CHECKBOXES IN MANIFEST TABLE
function toggleSelectAllParcels(masterCheck) {
    const isChecked = masterCheck?.checked || false;
    document.querySelectorAll(".parcel-checkbox").forEach(cb => {
        cb.checked = isChecked;
    });
    updateBatchDispatchBar();
}

// UPDATE FLOATING BATCH DISPATCH BAR VISIBILITY AND COUNTER
async function updateBatchDispatchBar() {
    const checked = Array.from(document.querySelectorAll(".parcel-checkbox:checked"));
    const bar = document.getElementById("batchDispatchBar");
    const countEl = document.getElementById("batchSelectedCount");
    const select = document.getElementById("batchDriverSelect");
    const masterCheck = document.getElementById("selectAllParcels");

    if (countEl) countEl.innerText = checked.length;

    const totalCheckboxes = document.querySelectorAll(".parcel-checkbox").length;
    if (masterCheck && totalCheckboxes > 0) {
        masterCheck.checked = checked.length === totalCheckboxes;
    }

    if (checked.length > 0) {
        if (bar) bar.style.display = "flex";
        if (select && select.options.length <= 1) {
            select.innerHTML = `<option value="">-- Choose Courier Driver --</option>`;
            const drivers = await getRegisteredDrivers();
            drivers.forEach(d => {
                const opt = document.createElement("option");
                opt.value = `${d.name}|${d.vehicleType || 'Motorcycle'}|${d.id || ''}`;
                opt.innerText = `${getVehicleEmoji(d.vehicleType)} ${d.name} (${d.vehicleType || 'Motorcycle'})`;
                if ((d.name || "").toLowerCase().includes("tom") || (d.id || "") === "usr_maewsenpai") {
                    opt.selected = true;
                }
                select.appendChild(opt);
            });
        }
    } else {
        if (bar) bar.style.display = "none";
    }
}

// CLEAR BATCH DISPATCH SELECTION AND HIDE TOOLBAR
function clearBatchSelection() {
    document.querySelectorAll(".parcel-checkbox").forEach(cb => { cb.checked = false; });
    const masterCheck = document.getElementById("selectAllParcels");
    if (masterCheck) masterCheck.checked = false;
    const bar = document.getElementById("batchDispatchBar");
    if (bar) bar.style.display = "none";
}

// CONFIRM BATCH ASSIGNMENT OF MULTIPLE SHIPMENTS TO COURIER
async function confirmBatchDispatch() {
    const checked = Array.from(document.querySelectorAll(".parcel-checkbox:checked")).map(cb => cb.value);
    if (checked.length === 0) {
        showToast("Please select at least one consignment.", "warning");
        return;
    }
    const select = document.getElementById("batchDriverSelect");
    if (!select || !select.value) {
        showToast("Please select a courier driver to dispatch to.", "warning");
        return;
    }
    const parts = select.value.split("|");
    const driverName = parts[0] || "";
    const driverVehicle = parts[1] || "Motorcycle (Express 2-Wheeler)";
    const driverId = parts[2] || "";

    for (const trk of checked) {
        await updateParcelStatusRecord(trk, "Out for Delivery", driverName, driverVehicle, driverId);
    }

    clearBatchSelection();
    showToast(`Dispatched ${checked.length} consignments to ${driverName}! Route optimized.`);

    if (typeof window.focusFleetRadarDriver === "function" && driverId) {
        window.focusFleetRadarDriver(driverId);
    }
}

// RECALCULATE LOGISTICS KEY PERFORMANCE INDICATORS (TOTAL, SORTING, OUT, DELIVERED, COD)
function updateKPIs() {
    const total = parcelsList.length;
    const out = parcelsList.filter(p => p.status.includes("Out for Delivery") && (p.assignedDriver || p.assignedDriverId)).length;
    const hub = parcelsList.filter(p => p.status.includes("Hub") || p.status.includes("Transit") || p.status.includes("Pickup") || p.status.includes("Waiting") || (!p.assignedDriver && !p.assignedDriverId && !p.status.includes("Delivered"))).length;
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

    // UPDATE TOP KPI DISPLAY CARDS
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

    // UPDATE NAVIGATION TAB COUNTERS
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

// TAB FILTER SWITCHER (ALL, OUT FOR DELIVERY, AT HUB / SORTING, DELIVERED)
function filterManifest(tab, btn) {
    activeTabFilter = tab;
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    if (btn) btn.classList.add("active");
    renderManifestTable();
}

// REAL-TIME SEARCH FILTER INPUT HANDLER
function handleTableFilter() {
    renderManifestTable();
}

// ============================================================================
// SECTION 9: DISPATCH & STATUS UPDATE MODAL CONTROLS
// ============================================================================

// OPEN BOOKING MODAL FOR INTAKE OF NEW SHIPMENTS
function openBookParcelModal() {
    const m = document.getElementById("bookParcelModal");
    if (m) {
        m.style.display = "flex";
        m.classList.remove("hidden");
    }
}

// CLOSE BOOKING MODAL
function closeBookParcelModal() {
    const m = document.getElementById("bookParcelModal");
    if (m) {
        m.style.display = "none";
        m.classList.add("hidden");
    }
}

// ============================================================================
// SUBMIT NEW CONSIGNMENT BOOKING FROM MODAL
// PURPOSE:  Reads user inputs, geocodes destination, generates tracking number,
//           and registers shipment in both local cache and Cloud Firestore.
// ============================================================================
async function handleBookParcelSubmit(e) {
    // STEP 1: PREVENT DEFAULT FORM RELOAD
    e.preventDefault();

    // STEP 2: HARVEST INPUT VALUES FROM MODAL FORM
    const name = document.getElementById("newRecipName")?.value.trim();
    const phone = document.getElementById("newRecipPhone")?.value.trim();
    const city = document.getElementById("newRecipCity")?.value.trim();
    const pkg = document.getElementById("newPackageDesc")?.value.trim();
    const cod = document.getElementById("newCodAmount")?.value.trim();

    // STEP 3: SANITY CHECK (RECIPIENT NAME IS REQUIRED)
    if (!name) return;

    // STEP 4: PERSIST NEW RECORD VIA ADDPARCELRECORD ENGINE
    const newRec = await addParcelRecord({ name, phone, city, package: pkg, cod });

    // STEP 5: CLOSE MODAL, NOTIFY OPERATOR, AND RE-RENDER MANIFEST TABLE
    closeBookParcelModal();
    showToast(`Parcel ${newRec.trackingNo} registered for ${name}.`);
    renderManifestTable();
    quickLookup(newRec.trackingNo);
    e.target.reset();
}

// ============================================================================
// OPEN STATUS & DISPATCH MODAL (ASSIGN COURIER OR UPDATE TRANSIT STAGE)
// PURPOSE:  Populates current shipment status and queries approved couriers from
//           Cloud Firestore to populate the assignment dropdown.
// ============================================================================
async function openUpdateStatusModal(trackingNo) {
    // STEP 1: STORE ACTIVE TRACKING NUMBER BEING EDITED
    editingTrackingNo = trackingNo;

    // STEP 2: LOCATE PARCEL RECORD IN RUNTIME ARRAY
    const found = parcelsList.find(p => p.trackingNo === trackingNo);
    if (found) {
        document.getElementById("updateModalTrackingNo").innerText = found.trackingNo;
        document.getElementById("updateModalCustomerName").innerText = found.name;
        let targetStatus = found.status || "Waiting to be Assigned to Driver";
        if (targetStatus.includes("Waiting")) targetStatus = "Waiting to be Assigned to Driver";
        else if (targetStatus.includes("Out for Delivery")) targetStatus = "Out for Delivery";
        document.getElementById("updateStatusSelect").value = targetStatus;

        // STEP 3: DYNAMICALLY POPULATE COURIER DRIVER SELECT DROPDOWN FROM FIRESTORE
        const driverSelect = document.getElementById("updateDriverSelect");
        if (driverSelect) {
            driverSelect.innerHTML = `<option value="">-- No Driver Assigned --</option>`;
            const drivers = await getRegisteredDrivers();
            drivers.forEach(d => {
                const opt = document.createElement("option");
                opt.value = `${d.name}|${d.vehicleType || 'Motorcycle'}|${d.id || ''}`;
                opt.innerText = `${getVehicleEmoji(d.vehicleType)} ${d.name} (${d.vehicleType || 'Motorcycle'})`;
                // AUTO-SELECT CURRENTLY ASSIGNED DRIVER IF ALREADY SET
                if (found.assignedDriver && found.assignedDriver.toLowerCase() === d.name.toLowerCase()) {
                    opt.selected = true;
                }
                driverSelect.appendChild(opt);
            });
        }
    }

    // STEP 4: DISPLAY STATUS UPDATE MODAL
    const m = document.getElementById("updateStatusModal");
    if (m) {
        m.style.display = "flex";
        m.classList.remove("hidden");
    }
}

// CLOSE DISPATCH & STATUS UPDATE MODAL
function closeUpdateStatusModal() {
    const m = document.getElementById("updateStatusModal");
    if (m) {
        m.style.display = "none";
        m.classList.add("hidden");
    }
}

// ============================================================================
// CONFIRM STATUS TRANSITION & ASSIGN FIELD COURIER
// PURPOSE:  Enforces core business rule: A parcel CANNOT be "Out for Delivery"
//           without an assigned courier. Writes update to Cloud Firestore.
// ============================================================================
async function confirmStatusUpdate() {
    // STEP 1: VERIFY VALID TRACKING NUMBER IS SELECTED
    if (!editingTrackingNo) return;

    // STEP 2: READ SELECTED STATUS AND DRIVER ASSIGNMENT
    let newStatus = document.getElementById("updateStatusSelect").value;        // SELECTED NEW STATUS (E.G. OUT FOR DELIVERY)
    const driverSelect = document.getElementById("updateDriverSelect");         // DRIVER SELECTION DROPDOWN ELEMENT
    let assignedDriver = "";                                                    // ASSIGNED COURIER FULL NAME
    let driverVehicle = "";                                                     // ASSIGNED TRANSPORT VEHICLE TYPE
    let assignedDriverId = "";                                                  // ASSIGNED COURIER UNIQUE STAFF ID
    if (driverSelect && driverSelect.value) {
        const parts = driverSelect.value.split("|");                            // PARSE NAME|VEHICLE|STAFFID DELIMITER
        assignedDriver = parts[0] || "";                                        // EXTRACT DRIVER FULL NAME
        driverVehicle = parts[1] || "";                                         // EXTRACT VEHICLE CLASSIFICATION
        assignedDriverId = parts[2] || "";                                      // EXTRACT STAFF IDENTIFIER
    }

    // STEP 3: ENFORCE CORE BUSINESS RULE
    // IF STATUS IS "OUT FOR DELIVERY" BUT NO DRIVER IS SELECTED, REVERT TO "WAITING TO BE ASSIGNED"
    if (newStatus.includes("Out for Delivery") && !assignedDriver) {
        newStatus = "Waiting to be Assigned to Driver";
        showToast("No courier selected. Status set to 'Waiting to be Assigned to Driver'.", "info");
    }

    // STEP 4: PERSIST UPDATED STATUS AND DRIVER TO FIRESTORE AND LOCAL STORAGE
    await updateParcelStatusRecord(editingTrackingNo, newStatus, assignedDriver, driverVehicle, assignedDriverId);

    // STEP 5: CLOSE MODAL, NOTIFY OPERATOR, AND RE-RENDER MANIFEST TABLE
    closeUpdateStatusModal();
    const driverNotice = assignedDriver ? ` and assigned to ${assignedDriver} (${driverVehicle})` : "";
    showToast(`Status updated to "${newStatus}"${driverNotice}.`);
    renderManifestTable();
    if (currentSelectedTracking === editingTrackingNo) {
        quickLookup(editingTrackingNo);
    }
}

// ============================================================================
// SECTION 10: USER NOTIFICATIONS & SYSTEM TOAST ALERTS
// ============================================================================

// DISPLAY A TEMPORARY FLOATING NOTIFICATION TOAST TO THE USER
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
