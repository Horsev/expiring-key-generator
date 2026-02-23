import { encode } from "./encode.js";
import { decode } from "./decode.js";

const createCodec = (secretKey) => ({
  encode: encode(secretKey),
  decode: decode(secretKey),
});

export { createCodec };
