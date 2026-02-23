import { describe, it, expect } from "vitest";
import { createCodec } from "../src/index.js";

const SECRET_KEY = "GYJDTP8WL6EQZ1AMN2UXFB379I4KCV5RSH";

describe("createCodec", () => {
  const codec = createCodec(SECRET_KEY);

  describe("round-trip", () => {
    const cases = ["1", "42", "20260223", "288261825", "99999999"];

    const assertRoundTrip = (input) => {
      const hash = codec.encode(input);
      const decoded = codec.decode(hash);
      expect(decoded).toBe(input);
    };

    it.each(cases)("encode then decode '%s' returns original", assertRoundTrip);
  });

  describe("encode", () => {
    it("produces a shorter string than the input for large numbers", () => {
      const hash = codec.encode("20260223");
      expect(hash.length).toBeLessThan("20260223".length);
    });

    it("only contains characters from the secret key", () => {
      const hash = codec.encode("20260223");
      const validChars = new Set(SECRET_KEY.split(""));
      const allValid = hash.split("").every((ch) => validChars.has(ch));
      expect(allValid).toBe(true);
    });

    it("different inputs produce different hashes", () => {
      const hash1 = codec.encode("20260223");
      const hash2 = codec.encode("20260224");
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("decode", () => {
    it("throws on invalid characters", () => {
      expect(() => codec.decode("!!!")).toThrow('Invalid char: "!"');
    });
  });

  describe("different secret keys produce different hashes", () => {
    it("same input, different key, different hash", () => {
      const otherCodec = createCodec("ABCDEFGHIJKLMNOPQRSTUVWXYZ");
      const hash1 = codec.encode("20260223");
      const hash2 = otherCodec.encode("20260223");
      expect(hash1).not.toBe(hash2);
    });
  });
});
