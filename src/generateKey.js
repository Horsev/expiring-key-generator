const SAFE_ALPHABET = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";

const toArray = (str) => str.split("");
const attachRandom = (val) => ({ val, key: Math.random() });
const compareByKey = (a, b) => a.key - b.key;
const extractVal = ({ val }) => val;

const shuffle = (arr) =>
  arr.map(attachRandom).sort(compareByKey).map(extractVal);

const generateSecretKey = () => shuffle(toArray(SAFE_ALPHABET)).join("");

export { generateSecretKey, SAFE_ALPHABET };
