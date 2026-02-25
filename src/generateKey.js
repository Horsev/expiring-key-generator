import { randomInt } from "node:crypto";

const SAFE_ALPHABET = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";

const toArray = (str) => str.split("");
const attachRandom = (val) => ({ val, key: randomInt(2 ** 48 - 1) });
const compareByKey = (a, b) => a.key - b.key;
const extractVal = ({ val }) => val;

const shuffle = (arr) =>
  arr.map(attachRandom).sort(compareByKey).map(extractVal);

const SAFE_PATTERN = /^[A-NP-Z1-9]{34}$/;

const isValidSecretKey = (key) =>
  typeof key === "string" &&
  SAFE_PATTERN.test(key) &&
  new Set(key).size === 34;

const generateSecretKey = () => shuffle(toArray(SAFE_ALPHABET)).join("");

export { generateSecretKey, isValidSecretKey, SAFE_ALPHABET };
