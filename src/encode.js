const encodeDigit = (digit, secretKey) => secretKey[digit];
const divideValue = (value, base) => Math.floor(value / base);
const getRemainder = (value, base) => value % base;

const encode = (secretKey) => (input) => {
  const base = secretKey.length;
  const value = Number(input);

  if (!Number.isInteger(value) || value < 0)
    throw new Error(`Invalid input: "${input}"`);
  if (value === 0) return secretKey[0];

  const encodedDigits = [];
  let remaining = value;

  while (remaining > 0) {
    encodedDigits.push(encodeDigit(getRemainder(remaining, base), secretKey));
    remaining = divideValue(remaining, base);
  }

  return encodedDigits.join("");
};

export { encode };
