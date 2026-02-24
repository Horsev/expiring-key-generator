import { encode } from "./encode.js";
import { generateSecretKey } from "./generateKey.js";
import {
  createPublicKeyGenerator,
  createKeyValidator as _createKeyValidator,
} from "./publicKey.js";

const toCodec = (secretKey) => ({ encode: encode(secretKey) });

const createKeyGenerator = (secretKey) =>
  createPublicKeyGenerator(toCodec(secretKey));

const createKeyValidator = (secretKey) =>
  _createKeyValidator(toCodec(secretKey));

export { generateSecretKey, createKeyGenerator, createKeyValidator };
