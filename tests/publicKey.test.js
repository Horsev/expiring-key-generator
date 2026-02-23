import { describe, it, expect } from "vitest";
import {
  createKeyGenerator,
  createKeyValidator,
} from "../src/index.js";

const SECRET_KEY = "GYJDTP8WL6EQZ1AMN2UXFB379I4KCV5RSH";

describe("createKeyGenerator", () => {
  const generateKey = createKeyGenerator(SECRET_KEY);

  it("is deterministic — same date produces same hash", () => {
    const date = new Date("2026-02-23");
    expect(generateKey(date)).toBe(generateKey(date));
  });

  it("different dates produce different hashes", () => {
    const a = generateKey(new Date("2026-02-23"));
    const b = generateKey(new Date("2026-02-24"));
    expect(a).not.toBe(b);
  });

  it("different secret keys produce different hashes for same date", () => {
    const otherGen = createKeyGenerator("ABCDEFGHIJKLMNPQRSTUVWXYZ123456789");
    const date = new Date("2026-02-23");
    expect(generateKey(date)).not.toBe(otherGen(date));
  });

  it("output is valid base64", () => {
    const hash = generateKey(new Date("2026-02-23"));
    const isBase64 = /^[A-Za-z0-9+/]+=*$/.test(hash);
    expect(isBase64).toBe(true);
  });

  it("output is 44 characters (SHA256 base64)", () => {
    const hash = generateKey(new Date("2026-02-23"));
    expect(hash.length).toBe(44);
  });
});

describe("createKeyValidator", () => {
  const generateKey = createKeyGenerator(SECRET_KEY);
  const isKeyValid = createKeyValidator(SECRET_KEY);

  it("returns true when key is within the window", () => {
    const key = generateKey(new Date("2026-02-01"));
    expect(isKeyValid(key, new Date("2026-02-23"), 28)).toBe(true);
  });

  it("returns false when key is outside the window", () => {
    const key = generateKey(new Date("2026-02-01"));
    expect(isKeyValid(key, new Date("2026-04-01"), 28)).toBe(false);
  });

  it("returns true on exact boundary (day 28)", () => {
    const key = generateKey(new Date("2026-02-01"));
    expect(isKeyValid(key, new Date("2026-03-01"), 28)).toBe(true);
  });

  it("returns false one day past boundary", () => {
    const key = generateKey(new Date("2026-02-01"));
    expect(isKeyValid(key, new Date("2026-03-02"), 28)).toBe(false);
  });

  it("returns true for key generated today", () => {
    const today = new Date("2026-02-23");
    const key = generateKey(today);
    expect(isKeyValid(key, today, 28)).toBe(true);
  });

  it("rejects key from different secret key", () => {
    const otherKey = createKeyGenerator("ABCDEFGHIJKLMNPQRSTUVWXYZ123456789")(
      new Date("2026-02-23"),
    );
    expect(isKeyValid(otherKey, new Date("2026-02-23"), 28)).toBe(false);
  });
});
