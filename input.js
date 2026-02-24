console.clear();

const SECRET_KEY = "GYJDTP8WL6EQZ1AMN2UXFB379I4KCV5RSH";

const RE_HASH_IPN = /(\w{3})(\w+)/;

const encodeDigit = (digit, secretKey) => secretKey[digit];
const divideSecretId = (id, base) => Math.floor(id / base);
const getRemainder = (id, base) => id % base;

const convertSecretIdToPublicHash = (secretKey) => (userSecretId) => {
  const encodedDigits = [];
  while (userSecretId > 0) {
    encodedDigits.push(
      encodeDigit(getRemainder(userSecretId, secretKey.length), secretKey),
    );
    userSecretId = divideSecretId(userSecretId, secretKey.length);
  }
  return encodedDigits.join("");
};

//
//
const initDecoderMap = () => ({});
const addDecoderEntry = (map, ch, i) => ((map[ch] = i), map);

const buildDecoderMap = (secretKey) =>
  secretKey.split("").reduce(addDecoderEntry, initDecoderMap());

const decodeDigit = (decoderMap) => (ch) => decoderMap[ch];

const initDecodeState = () => ({ value: 0, multiplier: 1 });

const assertKnownDigit = (digit, ch) => {
  if (digit === undefined) throw new Error(`Invalid char: "${ch}"`);
  return digit;
};

const applyDecodedDigit = (base) => (state, digit) => ({
  value: state.value + digit * state.multiplier,
  multiplier: state.multiplier * base,
});

const toChars = (str) => str.split("");

// --- decoder (publicHash -> secretId) ---

const convertPublicHashToSecretId = (secretKey) => {
  const base = secretKey.length;
  const decoderMap = buildDecoderMap(secretKey);

  const decodeChar = decodeDigit(decoderMap);

  const mapCharToDigit = (ch) => assertKnownDigit(decodeChar(ch), ch);
  const reduceDigitsToState = (state, digit) =>
    applyDecodedDigit(base)(state, digit);

  return (publicHash) =>
    toChars(publicHash)
      .map(mapCharToDigit)
      .reduce(reduceDigitsToState, initDecodeState()).value;
};

//
//

const getHashByCode = convertSecretIdToPublicHash(SECRET_KEY);
const getCodeByHash = convertPublicHashToSecretId(SECRET_KEY);

const hashIPN = getHashByCode(ipnCode);
const decodedHash = getCodeByHash(hashIPN);

// Example usage
const newDate = new Date().toISOString().split("T")[0];
const input = newDate.replace(/-/g, "");

const hash = getHashByCode(input);
const decoded = getCodeByHash(hash);

console.log(input, hash, decoded);