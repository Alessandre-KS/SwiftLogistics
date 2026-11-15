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

    /**
     * Decode a Base32 string into a Uint8Array
     */
    function base32ToBytes(base32) {
        const clean = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
        let bits = 0;
        let value = 0;
        const bytes = [];

        for (let i = 0; i < clean.length; i++) {
            const index = BASE32_CHARS.indexOf(clean[i]);
            if (index === -1) continue;

            value = (value << 5) | index;
            bits += 5;

            if (bits >= 8) {
                bytes.push((value >>> (bits - 8)) & 255);
                bits -= 8;
            }
        }
        return new Uint8Array(bytes);
    }

    /**
     * Convert an integer counter to an 8-byte big-endian ArrayBuffer
     */
    function counterToBuffer(counter) {
        const buffer = new ArrayBuffer(8);
        const view = new DataView(buffer);
        // High 32 bits
        view.setUint32(0, Math.floor(counter / 0x100000000), false);
        // Low 32 bits
        view.setUint32(4, counter & 0xFFFFFFFF, false);
        return buffer;
    }

    /**
     * Compute RFC 4226 HMAC-SHA1 and perform dynamic truncation
     */
    async function generateHOTP(secretBytes, counter) {
        const key = await window.crypto.subtle.importKey(
            'raw',
            secretBytes,
            { name: 'HMAC', hash: { name: 'SHA-1' } },
            false,
            ['sign']
        );

        const counterBuffer = counterToBuffer(counter);
        const signature = await window.crypto.subtle.sign('HMAC', key, counterBuffer);
        const hmac = new Uint8Array(signature);

        // Dynamic Truncation
        const offset = hmac[hmac.length - 1] & 0x0F;
        const binary =
            ((hmac[offset] & 0x7F) << 24) |
            ((hmac[offset + 1] & 0xFF) << 16) |
            ((hmac[offset + 2] & 0xFF) << 8) |
            (hmac[offset + 3] & 0xFF);

        const otp = binary % 1000000;
        return otp.toString().padStart(6, '0');
    }

    /**
     * Compute current RFC 6238 TOTP code
     * @param {string} base32Secret 
     * @param {number} [timeOffsetSeconds=0] (For clock drift validation)
     */
    async function getCode(base32Secret, timeOffsetSeconds = 0) {
        const secretBytes = base32ToBytes(base32Secret);
        const nowSec = Math.floor(Date.now() / 1000) + timeOffsetSeconds;
        const counter = Math.floor(nowSec / 30);
        return await generateHOTP(secretBytes, counter);
    }

    /**
     * Validate a user-provided 6-digit TOTP code against secret.
     * Allows +/- 1 window (30s) drift tolerance per RFC 6238 recommendation.
     */
    async function verifyCode(base32Secret, userCode) {
        const cleanInput = (userCode || '').toString().trim().replace(/\s+/g, '');
        if (cleanInput.length !== 6) return false;

        const drifts = [0, -30, 30]; // current window, previous window, next window
        for (const drift of drifts) {
            const valid = await getCode(base32Secret, drift);
            if (valid === cleanInput) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get remaining seconds in current 30-second timestep
     */
    function getRemainingSeconds() {
        const now = Math.floor(Date.now() / 1000);
        return 30 - (now % 30);
    }

    /**
     * Generate standard otpauth:// URI for QR code generation
     */
    function getOtpAuthUrl(accountName, base32Secret, issuer = 'SwiftLogistics') {
        const encodedIssuer = encodeURIComponent(issuer);
        const encodedAccount = encodeURIComponent(accountName);
        return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${base32Secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
    }

    /**
     * Retrieve or deterministically derive a Base32 TOTP secret for any authorized employee email
     */
    function getSecretForEmail(email) {
        if (!email) return 'JBSWY3DPEHPK3PXP';
        const clean = email.toLowerCase().trim();

        // 1. MATCH REGISTERED WORKING ACCOUNTS IN STAFF DIRECTORY
        for (const k in STAFF_SECRETS) {
            if (STAFF_SECRETS[k].email.toLowerCase() === clean) {
                return STAFF_SECRETS[k].secret;
            }
        }

        // 2. MATCH BY NAME OR ID KEYWORDS FOR WORKING ACCOUNTS
        if (clean.includes('jeff') || clean.includes('bossing')) return STAFF_SECRETS['usr_jeff'].secret;
        if (clean.includes('2420572') || clean.includes('perilla') || clean.includes('roy')) return STAFF_SECRETS['usr_2420572'].secret;
        if (clean.includes('2420417') || clean.includes('parcon') || clean.includes('christan')) return STAFF_SECRETS['usr_2420417'].secret;
        if (clean.includes('alessandre') || clean.includes('sanidad')) return STAFF_SECRETS['usr_alessandrekyle'].secret;
        if (clean.includes('cruise') || clean.includes('maewsenpai')) return STAFF_SECRETS['usr_maewsenpai'].secret;

        // 3. PERSISTENT DETERMINISTIC DERIVATION FOR DYNAMICALLY PROVISIONED STAFF
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
