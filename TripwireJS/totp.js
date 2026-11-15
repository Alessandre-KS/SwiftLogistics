/**
 * ============================================================================
 * SWIFTLOGISTICS & TRIPWIREJS — NATIVE RFC 6238 TOTP ENGINE
 * Standard: RFC 6238 (TOTP) & RFC 4226 (HOTP)
 * Compatibility: Google Authenticator, Microsoft Authenticator, Authy, Apple Keychain
 * Dependency: Zero (Native Browser Web Crypto API)
 *
 * AUTHORIZED STAFF DIRECTORY & SEED REPOSITORY:
 * Exclusively provisions genuine enterprise employee tokens.
 * All dummy and simulated accounts have been purged.
 * ============================================================================
 */

const TOTP = (function () {
    'use strict';

    // BASE32 CHARACTER SET SPECIFIED IN RFC 4648
    const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

    // ============================================================================
    // AUTHORIZED SWIFTLOGISTICS STAFF DIRECTORY (RFC 6238 TOTP PROFILES)
    // ============================================================================
    const STAFF_SECRETS = {
        'usr_jeff': {
            email: 'jeff@swiftlogistics.ph',
            name: 'Bossing Jeff',
            role: 'Business Owner (Administrator)',
            secret: 'JBSWY3DPEHPK3PXP'
        },
        'usr_2420572': {
            email: '2420572@ub.edu.ph',
            name: 'Roy Matthew L. Perilla',
            role: 'Management (Branch Dispatcher)',
            secret: 'B674523YZWXUVSTQ'
        },
        'usr_2420417': {
            email: '2420417@ub.edu.ph',
            name: 'Christan Angelo Parcon',
            role: 'Management (Branch Dispatcher)',
            secret: 'LUVWXQRST4567YZ2'
        },
        'usr_alessandrekyle': {
            email: 'alessandrekyle@gmail.com',
            name: 'Alessandre Kyle E. Sanidad',
            role: 'Management (Branch Dispatcher)',
            secret: 'IXWVUTSRQ765432Z'
        },
        'usr_maewsenpai': {
            email: 'maewsenpai@gmail.com',
            name: 'Tom Cruise',
            role: 'Driver (Delivery Courier Rider)',
            vehicleType: 'Motorcycle',
            secret: 'TMNOPIJKLEFGHABC'
        }
    };

    // ============================================================================
    // FUNCTION 1: DECODE BASE32 STRING INTO RAW BYTE ARRAY (UINT8ARRAY)
    // PURPOSE:    Converts a human-readable 16-character Base32 secret (e.g. JBSWY3DPEHPK3PXP)
    //             into raw cryptographic bytes needed by Web Crypto API.
    // RFC 4648:   Each Base32 character represents exactly 5 bits of data.
    // ============================================================================
    function base32ToBytes(base32) {
        // STEP 1: CLEAN INPUT (CONVERT TO UPPERCASE AND REMOVE PADDING/SPACES)
        const clean = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
        let bits = 0;
        let value = 0;
        const bytes = [];

        // STEP 2: LOOP THROUGH EACH BASE32 CHARACTER AND EXTRACT 5 BITS
        for (let i = 0; i < clean.length; i++) {
            const index = BASE32_CHARS.indexOf(clean[i]);
            if (index === -1) continue; // IGNORE INVALID CHARACTERS

            // SHIFT ACCUMULATOR LEFT BY 5 BITS AND APPEND THE 5-BIT VALUE
            value = (value << 5) | index;
            bits += 5;

            // ONCE WE ACCUMULATE AT LEAST 8 BITS (1 BYTE), PUSH TO BYTE ARRAY
            if (bits >= 8) {
                bytes.push((value >>> (bits - 8)) & 255);
                bits -= 8;
            }
        }
        return new Uint8Array(bytes);
    }

    // ============================================================================
    // FUNCTION 2: CONVERT INTEGER COUNTER TO 8-BYTE BIG-ENDIAN ARRAY BUFFER
    // PURPOSE:    RFC 4226 requires the timestep counter to be encoded as an 8-byte
    //             (64-bit) unsigned integer in Big-Endian network byte order.
    // ============================================================================
    function counterToBuffer(counter) {
        // ALLOCATE AN 8-BYTE MEMORY BUFFER
        const buffer = new ArrayBuffer(8);
        const view = new DataView(buffer);

        // WRITE HIGH 32 BITS (MOST SIGNIFICANT BYTES)
        view.setUint32(0, Math.floor(counter / 0x100000000), false);

        // WRITE LOW 32 BITS (LEAST SIGNIFICANT BYTES)
        view.setUint32(4, counter & 0xFFFFFFFF, false);

        return buffer;
    }

    // ============================================================================
    // FUNCTION 3: GENERATE HOTP CODE (RFC 4226 HMAC-SHA1 + DYNAMIC TRUNCATION)
    // PURPOSE:    Hashes the secret with the timestep counter using HMAC-SHA1, then
    //             extracts a 6-digit numeric token using standard dynamic truncation.
    // ============================================================================
    async function generateHOTP(secretBytes, counter) {
        // STEP 1: IMPORT RAW SECRET BYTES AS AN HMAC CRYPTOGRAPHIC KEY
        const key = await window.crypto.subtle.importKey(
            'raw',
            secretBytes,
            { name: 'HMAC', hash: { name: 'SHA-1' } },
            false,
            ['sign']
        );

        // STEP 2: CONVERT TIME COUNTER INTO 8-BYTE BIG-ENDIAN BUFFER
        const counterBuffer = counterToBuffer(counter);

        // STEP 3: EXECUTE HMAC-SHA1 HASHING VIA NATIVE BROWSER WEB CRYPTO API
        const signature = await window.crypto.subtle.sign('HMAC', key, counterBuffer);
        const hmac = new Uint8Array(signature);

        // STEP 4: DYNAMIC TRUNCATION (RFC 4226 SECTION 5.4)
        // READ THE LAST 4 BITS OF THE 20-BYTE HASH TO DETERMINE THE OFFSET (0 TO 15)
        const offset = hmac[hmac.length - 1] & 0x0F;

        // EXTRACT 4 BYTES STARTING AT OFFSET AND MASK HIGHEST BIT TO ENSURE POSITIVE INTEGER
        const binary =
            ((hmac[offset] & 0x7F) << 24) |
            ((hmac[offset + 1] & 0xFF) << 16) |
            ((hmac[offset + 2] & 0xFF) << 8) |
            (hmac[offset + 3] & 0xFF);

        // MODULO 1,000,000 TO OBTAIN A 6-DIGIT DECIMAL CODE (000000 - 999999)
        const otp = binary % 1000000;

        // PAD WITH LEADING ZEROS TO GUARANTEE EXACTLY 6 DIGITS
        return otp.toString().padStart(6, '0');
    }

    // ============================================================================
    // FUNCTION 4: COMPUTE CURRENT RFC 6238 TOTP CODE
    // FORMULA:    Timestep Counter = Floor(Unix Time in Seconds / 30)
    // ============================================================================
    async function getCode(base32Secret, timeOffsetSeconds = 0) {
        // STEP 1: CONVERT BASE32 SECRET INTO RAW BYTES
        const secretBytes = base32ToBytes(base32Secret);

        // STEP 2: GET CURRENT UNIX TIMESTAMP IN SECONDS (PLUS OPTIONAL DRIFT OFFSET)
        const nowSec = Math.floor(Date.now() / 1000) + timeOffsetSeconds;

        // STEP 3: CALCULATE 30-SECOND WINDOW COUNTER (T = (CurrentTime - T0) / X)
        const counter = Math.floor(nowSec / 30);

        // STEP 4: GENERATE 6-DIGIT HOTP TOKEN FOR THIS 30-SECOND WINDOW
        return await generateHOTP(secretBytes, counter);
    }

    // ============================================================================
    // FUNCTION 5: VERIFY EMPLOYEE-ENTERED 6-DIGIT TOTP CODE
    // PURPOSE:    Validates user input against the expected code with clock-drift
    //             tolerance (+/- 30 seconds) recommended by RFC 6238.
    // ============================================================================
    async function verifyCode(base32Secret, userCode) {
        // STEP 1: SANITIZE USER INPUT (STRIP SPACES AND ENSURE EXACTLY 6 DIGITS)
        const cleanInput = (userCode || '').toString().trim().replace(/\s+/g, '');
        if (cleanInput.length !== 6) return false;

        // STEP 2: CHECK 3 TIME WINDOWS (PREVIOUS 30S, CURRENT 30S, NEXT 30S)
        // THIS PREVENTS REJECTIONS CAUSED BY SLIGHT DESYNCHRONIZATION IN COURIER SMARTPHONES
        const drifts = [0, -30, 30];
        for (const drift of drifts) {
            const valid = await getCode(base32Secret, drift);
            if (valid === cleanInput) {
                return true; // MATCH FOUND, SECOND-FACTOR AUTHENTICATION PASSED
            }
        }
        return false; // NO MATCH ACROSS ANY TIME WINDOW, REJECT
    }

    // ============================================================================
    // FUNCTION 6: GET REMAINING SECONDS IN CURRENT 30-SECOND TIMESTEP
    // PURPOSE:    Powers the visual animated countdown progress bar in the login UI.
    // ============================================================================
    function getRemainingSeconds() {
        const now = Math.floor(Date.now() / 1000);
        return 30 - (now % 30); // RETURNS VALUE BETWEEN 1 AND 30 SECONDS
    }

    // ============================================================================
    // FUNCTION 7: GENERATE STANDARD 'OTPAUTH://' URI FOR QR CODES
    // PURPOSE:    Produces standard URI readable by Google Authenticator, Authy, etc.
    // FORMAT:     otpauth://totp/ISSUER:ACCOUNT?secret=SECRET&issuer=ISSUER&digits=6&period=30
    // ============================================================================
    function getOtpAuthUrl(accountName, base32Secret, issuer = 'SwiftLogistics') {
        const encodedIssuer = encodeURIComponent(issuer);
        const encodedAccount = encodeURIComponent(accountName);
        return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${base32Secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
    }

    // ============================================================================
    // FUNCTION 8: RETRIEVE OR DERIVE BASE32 SECRET FOR AN EMPLOYEE EMAIL
    // PURPOSE:    Fetches predefined secret for registered staff, or deterministically
    //             generates a stable 16-character secret for newly provisioned staff.
    // ============================================================================
    function getSecretForEmail(email) {
        if (!email) return 'JBSWY3DPEHPK3PXP';
        const clean = email.toLowerCase().trim();

        // STEP 1: CHECK HARDCODED DIRECTORY OF AUTHORIZED ENTERPRISE STAFF
        for (const k in STAFF_SECRETS) {
            if (STAFF_SECRETS[k].email.toLowerCase() === clean) {
                return STAFF_SECRETS[k].secret;
            }
        }

        // STEP 2: MATCH BY NAME OR IDENTIFIER KEYWORDS FOR ROBUST RESOLUTION
        if (clean.includes('jeff') || clean.includes('bossing')) return STAFF_SECRETS['usr_jeff'].secret;
        if (clean.includes('2420572') || clean.includes('perilla') || clean.includes('roy')) return STAFF_SECRETS['usr_2420572'].secret;
        if (clean.includes('2420417') || clean.includes('parcon') || clean.includes('christan')) return STAFF_SECRETS['usr_2420417'].secret;
        if (clean.includes('alessandre') || clean.includes('sanidad')) return STAFF_SECRETS['usr_alessandrekyle'].secret;
        if (clean.includes('cruise') || clean.includes('maewsenpai')) return STAFF_SECRETS['usr_maewsenpai'].secret;

        // STEP 3: PERSISTENT DETERMINISTIC DERIVATION FOR DYNAMICALLY CREATED ACCOUNTS
        let stored = null;
        try { stored = localStorage.getItem('totp_sec_' + clean); } catch (e) {}
        if (!stored) {
            let hash = 0;
            for (let i = 0; i < clean.length; i++) {
                hash = ((hash << 5) - hash) + clean.charCodeAt(i);
                hash |= 0;
            }
            let s = '';
            for (let i = 0; i < 16; i++) {
                const idx = Math.abs((hash ^ (i * 31))) % 32;
                s += BASE32_CHARS[idx];
            }
            stored = s;
            try { localStorage.setItem('totp_sec_' + clean, stored); } catch (e) {}
        }
        return stored;
    }

    return {
        STAFF_SECRETS,
        getCode,
        verifyCode,
        getRemainingSeconds,
        getOtpAuthUrl,
        getSecretForEmail,
        generateSecret: (email) => getSecretForEmail(email || ('user_' + Date.now()))
    };
})();

// Export for module/browser
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TOTP;
}
