import { encode } from "./encode.js";
import { decode } from "./decode.js";
import { generateSecretKey } from "./generateKey.js";
import {
  createPublicKeyGenerator,
  createKeyValidator as _createKeyValidator,
} from "./publicKey.js";

const createCodec = (secretKey) => ({
  encode: encode(secretKey),
  decode: decode(secretKey),
});

const createKeyGenerator = (secretKey) =>
  createPublicKeyGenerator(createCodec(secretKey));

const createKeyValidator = (secretKey) =>
  _createKeyValidator(createCodec(secretKey));

export { generateSecretKey, createKeyGenerator, createKeyValidator };
