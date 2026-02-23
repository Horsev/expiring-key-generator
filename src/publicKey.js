import { createHash } from "node:crypto";

const toISODate = (date) => date.toISOString().split("T")[0];
const stripDashes = (str) => str.replace(/-/g, "");
const toDigits = (date) => stripDashes(toISODate(date));
const sha256Base64 = (str) =>
  createHash("sha256").update(str).digest("base64");

const createPublicKeyGenerator = (codec) => (date) =>
  sha256Base64(codec.encode(toDigits(date)));

const subtractDays = (date, days) =>
  new Date(date.getTime() - days * 86_400_000);

const generateDateRange = (endDate, days) =>
  Array.from({ length: days + 1 }, (_, i) => subtractDays(endDate, i));

const createKeyValidator = (codec) => (hash, currentDate, days) => {
  const generateKey = createPublicKeyGenerator(codec);
  const dateRange = generateDateRange(currentDate, days);
  const isMatch = (date) => generateKey(date) === hash;
  return dateRange.some(isMatch);
};

export { createPublicKeyGenerator, createKeyValidator };
