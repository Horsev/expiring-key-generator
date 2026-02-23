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

const decode = (secretKey) => {
  const base = secretKey.length;
  const decoderMap = buildDecoderMap(secretKey);

  const decodeChar = decodeDigit(decoderMap);

  const mapCharToDigit = (ch) => assertKnownDigit(decodeChar(ch), ch);
  const reduceDigitsToState = (state, digit) =>
    applyDecodedDigit(base)(state, digit);

  return (hash) =>
    String(
      toChars(hash)
        .map(mapCharToDigit)
        .reduce(reduceDigitsToState, initDecodeState()).value,
    );
};

export { decode };
