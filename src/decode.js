const toChars = (str) => str.split("");

const initDecoderMap = () => ({});
const addDecoderEntry = (map, ch, i) => ((map[ch] = i), map);
const buildDecoderMap = (secretKey) =>
  secretKey.split("").reduce(addDecoderEntry, initDecoderMap());

const lookupDigit = (decoderMap) => (ch) => decoderMap[ch];

const assertDefined = (value, ch) => {
  if (value === undefined) throw new Error(`Invalid char: "${ch}"`);
  return value;
};

const resolveChar = (decoderMap) => (ch) =>
  assertDefined(lookupDigit(decoderMap)(ch), ch);

const initState = () => ({ value: 0, multiplier: 1 });

const applyDigit = (base) => (state, digit) => ({
  value: state.value + digit * state.multiplier,
  multiplier: state.multiplier * base,
});

const extractValue = (state) => state.value;

const decode = (secretKey) => {
  const charToDigit = resolveChar(buildDecoderMap(secretKey));
  const accumulateDigit = applyDigit(secretKey.length);

  return (hash) =>
    String(
      extractValue(
        toChars(hash).map(charToDigit).reduce(accumulateDigit, initState()),
      ),
    );
};

export { decode };
