const encodeDigit = (digit, secretKey) => secretKey[digit];
const divideValue = (value, base) => Math.floor(value / base);
const getRemainder = (value, base) => value % base;

const encode = (secretKey) => (input) => {
  const base = secretKey.length;
  const encodedDigits = [];
  let value = Number(input);

  while (value > 0) {
    encodedDigits.push(encodeDigit(getRemainder(value, base), secretKey));
    value = divideValue(value, base);
  }

  return encodedDigits.join("");
};

export { encode };
