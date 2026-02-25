import { encode } from "./encode.js";
import { generateSecretKey, isValidSecretKey } from "./generateKey.js";
import {
  createPublicKeyGenerator,
  createKeyValidator as _createKeyValidator,
} from "./publicKey.js";

const assertValidKey = (key) => {
  if (!isValidSecretKey(key))
    throw new Error(
      "Invalid secret key: must be a 34-char permutation of the safe alphabet",
    );
};

const toCodec = (secretKey) => {
  assertValidKey(secretKey);
  return { encode: encode(secretKey) };
};

const createKeyGenerator = (secretKey) =>
  createPublicKeyGenerator(toCodec(secretKey));

const createKeyValidator = (secretKey) =>
  _createKeyValidator(toCodec(secretKey));

export { generateSecretKey, createKeyGenerator, createKeyValidator };
