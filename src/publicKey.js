import { createHash } from "node:crypto";

const pad = (n) => String(n).padStart(2, "0");
const toLocalDate = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const stripDashes = (str) => str.replace(/-/g, "");
const toDigits = (date) => stripDashes(toLocalDate(date));
const sha256Base64 = (str) =>
  createHash("sha256").update(str).digest("base64");

const createPublicKeyGenerator = (codec) => (date) =>
  sha256Base64(codec.encode(toDigits(date)));

const subtractDays = (date, days) =>
  new Date(date.getTime() - days * 86_400_000);

const generateDateRange = (endDate, days) =>
  Array.from({ length: days + 1 }, (_, i) => subtractDays(endDate, i));

const createKeyValidator = (codec) => {
  const generateKey = createPublicKeyGenerator(codec);
  let cached = { key: null, hashes: null };

  return (hash, currentDate, days) => {
    const cacheKey = `${toLocalDate(currentDate)}:${days}`;
    if (cached.key !== cacheKey) {
      const dateRange = generateDateRange(currentDate, days);
      cached = { key: cacheKey, hashes: new Set(dateRange.map(generateKey)) };
    }
    return cached.hashes.has(hash);
  };
};

export { createPublicKeyGenerator, createKeyValidator };
