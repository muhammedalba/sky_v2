/**
 * Utility functions for Invoice rendering, ZATCA Phase-1 TLV encoding, and Arabic currency spelling.
 */

export const getLocalizedValue = (
  val?: string | { en?: string; ar?: string },
  locale = "ar",
): string => {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val[locale as "en" | "ar"] || val.ar || val.en || "";
};

export const getLocationName = (
  loc?: string | { name?: string | { en?: string; ar?: string } },
  locale = "ar",
): string => {
  if (!loc) return "";
  if (typeof loc === "string") return loc;
  if (typeof loc.name === "string") return loc.name;
  if (loc.name && typeof loc.name === "object")
    return loc.name[locale as "en" | "ar"] || loc.name.ar || loc.name.en || "";
  return "";
};

/**
 * Helper for Arabic amount in words (تفقيط المبلغ)
 */
export function numberToArabicWords(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded <= 0) return "صفر ريال سعودي";

  const units = [
    "",
    "واحد",
    "اثنان",
    "ثلاثة",
    "أربعة",
    "خمسة",
    "ستة",
    "سبعة",
    "ثمانية",
    "تسعة",
  ];
  const tens = [
    "",
    "عشرة",
    "عشرون",
    "ثلاثون",
    "أربعون",
    "خمسون",
    "ستون",
    "سبعون",
    "ثمانون",
    "تسعون",
  ];
  const hundreds = [
    "",
    "مائة",
    "مائتان",
    "ثلاثمائة",
    "أربعمائة",
    "خمسمائة",
    "ستمائة",
    "سبعمائة",
    "ثمانمائة",
    "تسعمائة",
  ];
  const thousands = [
    "",
    "ألف",
    "ألفان",
    "ثلاثة آلاف",
    "أربعة آلاف",
    "خمسة آلاف",
    "ستة آلاف",
    "سبعة آلاف",
    "ثمانية آلاف",
    "تسعة آلاف",
  ];

  if (rounded < 10) return `${units[rounded]} ريال سعودي`;
  if (rounded < 100) {
    const u = rounded % 10;
    const t = Math.floor(rounded / 10);
    return u === 0
      ? `${tens[t]} ريال سعودي`
      : `${units[u]} و${tens[t]} ريال سعودي`;
  }
  if (rounded < 1000) {
    const h = Math.floor(rounded / 100);
    const rem = rounded % 100;
    if (rem === 0) return `${hundreds[h]} ريال سعودي`;
    return `${hundreds[h]} و${numberToArabicWords(rem)}`;
  }
  if (rounded < 10000) {
    const th = Math.floor(rounded / 1000);
    const rem = rounded % 1000;
    if (rem === 0) return `${thousands[th]} ريال سعودي`;
    return `${thousands[th]} و${numberToArabicWords(rem)}`;
  }

  return `${amount.toLocaleString("ar-SA")} ريال سعودي`;
}

/**
 * Synchronous pure SHA-256 hex generator for ZATCA invoice hashing.
 */
export function sha256Hex(str: string): string {
  function rightRotate(n: number, b: number): number {
    return (n >>> b) | (n << (32 - b));
  }

  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  const H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  const bytes = new TextEncoder().encode(str);
  const len = bytes.length;
  const bitLen = len * 8;

  const k = (448 - ((len + 1) % 64) + 64) % 64;
  const padded = new Uint8Array(len + 1 + k + 8);
  padded.set(bytes);
  padded[len] = 0x80;

  const highBits = Math.floor(bitLen / 0x100000000);
  const lowBits = bitLen & 0xffffffff;

  padded[padded.length - 8] = (highBits >>> 24) & 0xff;
  padded[padded.length - 7] = (highBits >>> 16) & 0xff;
  padded[padded.length - 6] = (highBits >>> 8) & 0xff;
  padded[padded.length - 5] = highBits & 0xff;

  padded[padded.length - 4] = (lowBits >>> 24) & 0xff;
  padded[padded.length - 3] = (lowBits >>> 16) & 0xff;
  padded[padded.length - 2] = (lowBits >>> 8) & 0xff;
  padded[padded.length - 1] = lowBits & 0xff;

  const w = new Int32Array(64);
  for (let i = 0; i < padded.length; i += 64) {
    for (let j = 0; j < 16; j++) {
      const idx = i + j * 4;
      w[j] = (padded[idx] << 24) | (padded[idx + 1] << 16) | (padded[idx + 2] << 8) | padded[idx + 3];
    }
    for (let j = 16; j < 64; j++) {
      const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
      const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
    }

    let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];

    for (let j = 0; j < 64; j++) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[j] + w[j]) | 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    H[0] = (H[0] + a) | 0;
    H[1] = (H[1] + b) | 0;
    H[2] = (H[2] + c) | 0;
    H[3] = (H[3] + d) | 0;
    H[4] = (H[4] + e) | 0;
    H[5] = (H[5] + f) | 0;
    H[6] = (H[6] + g) | 0;
    H[7] = (H[7] + h) | 0;
  }

  return H.map((h) => (h >>> 0).toString(16).padStart(8, "0")).join("");
}

/**
 * Encodes invoice data into ZATCA Phase-1 & Phase-2 compliant Base64 TLV string.
 * Tags: 01 Seller, 02 VAT No, 03 DateTime, 04 Total with VAT, 05 VAT Amount, 06 Invoice Hash.
 */
export function buildZatcaTlvBase64({
  sellerName,
  vatNumber,
  invoiceDateTime,
  totalWithVat,
  vatAmount,
  invoiceHash,
}: {
  sellerName: string;
  vatNumber: string;
  invoiceDateTime: string;
  totalWithVat: string;
  vatAmount: string;
  invoiceHash?: string;
}): string {
  const encoder = new TextEncoder();

  function encodeTlv(tag: number, value: string): Uint8Array {
    const valueBytes = encoder.encode(value);
    const tlv = new Uint8Array(2 + valueBytes.length);
    tlv[0] = tag;
    tlv[1] = valueBytes.length;
    tlv.set(valueBytes, 2);
    return tlv;
  }

  const hash =
    invoiceHash ||
    sha256Hex(`${sellerName}|${vatNumber}|${invoiceDateTime}|${totalWithVat}|${vatAmount}`);

  const fields = [
    encodeTlv(1, sellerName),
    encodeTlv(2, vatNumber),
    encodeTlv(3, invoiceDateTime),
    encodeTlv(4, totalWithVat),
    encodeTlv(5, vatAmount),
    encodeTlv(6, hash),
  ];

  const totalLength = fields.reduce((sum, f) => sum + f.length, 0);
  const merged = new Uint8Array(totalLength);
  let offset = 0;
  for (const field of fields) {
    merged.set(field, offset);
    offset += field.length;
  }

  let binary = "";
  const chunkSize = 0x8000; // 32KB safe stack chunk limit
  for (let i = 0; i < merged.length; i += chunkSize) {
    binary += String.fromCharCode.apply(
      null,
      Array.from(merged.subarray(i, i + chunkSize)),
    );
  }
  return btoa(binary);
}
