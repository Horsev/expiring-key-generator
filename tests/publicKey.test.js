import { describe, it, expect } from "vitest";
import {
  createKeyGenerator,
  createKeyValidator,
  createHourlyKeyGenerator,
  createHourlyKeyValidator,
} from "../src/index.js";

const SECRET_KEY = "GYJDTP8WL6EQZ1AMN2UXFB379I4KCV5RSH";
const INVALID_KEY_MSG = "Invalid secret key";

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

  it("returns correct results on repeated calls with same window (memoized)", () => {
    const today = new Date("2026-02-23");
    const validKey = generateKey(new Date("2026-02-10"));
    const expiredKey = generateKey(new Date("2026-01-01"));

    expect(isKeyValid(validKey, today, 28)).toBe(true);
    expect(isKeyValid(expiredKey, today, 28)).toBe(false);
    expect(isKeyValid(validKey, today, 28)).toBe(true);
  });

  it("cache invalidates when window changes", () => {
    const key = generateKey(new Date("2026-02-01"));
    expect(isKeyValid(key, new Date("2026-02-23"), 28)).toBe(true);
    expect(isKeyValid(key, new Date("2026-02-23"), 5)).toBe(false);
  });
});

describe("createHourlyKeyGenerator", () => {
  const generateHourlyKey = createHourlyKeyGenerator(SECRET_KEY);

  it("is deterministic — same date+hour produces same hash", () => {
    const date = new Date("2026-02-23T14:00:00");
    expect(generateHourlyKey(date)).toBe(generateHourlyKey(date));
  });

  it("different hours produce different hashes", () => {
    const a = generateHourlyKey(new Date("2026-02-23T10:00:00"));
    const b = generateHourlyKey(new Date("2026-02-23T11:00:00"));
    expect(a).not.toBe(b);
  });

  it("hourly hash differs from daily hash for same Date", () => {
    const date = new Date("2026-02-23T14:00:00");
    const dailyKey = createKeyGenerator(SECRET_KEY)(date);
    const hourlyKey = generateHourlyKey(date);
    expect(hourlyKey).not.toBe(dailyKey);
  });

  it("output is valid base64", () => {
    const hash = generateHourlyKey(new Date("2026-02-23T14:00:00"));
    expect(/^[A-Za-z0-9+/]+=*$/.test(hash)).toBe(true);
  });

  it("output is 44 characters (SHA256 base64)", () => {
    const hash = generateHourlyKey(new Date("2026-02-23T14:00:00"));
    expect(hash.length).toBe(44);
  });
});

describe("createHourlyKeyValidator", () => {
  const generateHourlyKey = createHourlyKeyGenerator(SECRET_KEY);
  const isHourlyKeyValid = createHourlyKeyValidator(SECRET_KEY);

  it("returns true when key is within the hour window", () => {
    const key = generateHourlyKey(new Date("2026-02-23T10:00:00"));
    expect(isHourlyKeyValid(key, new Date("2026-02-23T14:00:00"), 5)).toBe(true);
  });

  it("returns false when key is outside the hour window", () => {
    const key = generateHourlyKey(new Date("2026-02-23T08:00:00"));
    expect(isHourlyKeyValid(key, new Date("2026-02-23T14:00:00"), 5)).toBe(false);
  });

  it("returns true on exact boundary (hour 5)", () => {
    const key = generateHourlyKey(new Date("2026-02-23T09:00:00"));
    expect(isHourlyKeyValid(key, new Date("2026-02-23T14:00:00"), 5)).toBe(true);
  });

  it("returns false one hour past boundary", () => {
    const key = generateHourlyKey(new Date("2026-02-23T08:00:00"));
    expect(isHourlyKeyValid(key, new Date("2026-02-23T14:00:00"), 5)).toBe(false);
  });

  it("returns true for key generated in current hour", () => {
    const now = new Date("2026-02-23T14:00:00");
    const key = generateHourlyKey(now);
    expect(isHourlyKeyValid(key, now, 24)).toBe(true);
  });

  it("cache invalidates when hour changes", () => {
    const key = generateHourlyKey(new Date("2026-02-23T10:00:00"));
    expect(isHourlyKeyValid(key, new Date("2026-02-23T14:00:00"), 5)).toBe(true);
    expect(isHourlyKeyValid(key, new Date("2026-02-23T16:00:00"), 5)).toBe(false);
  });
});

describe("secret key validation", () => {
  it("rejects key with wrong length", () => {
    expect(() => createKeyGenerator("ABC")).toThrow(INVALID_KEY_MSG);
  });

  it("rejects key containing O", () => {
    expect(() =>
      createKeyGenerator("OYJDTP8WL6EQZ1AMN2UXFB379I4KCV5RSH"),
    ).toThrow(INVALID_KEY_MSG);
  });

  it("rejects key containing 0", () => {
    expect(() =>
      createKeyGenerator("0YJDTP8WL6EQZ1AMN2UXFB379I4KCV5RSH"),
    ).toThrow(INVALID_KEY_MSG);
  });

  it("rejects key with duplicate characters", () => {
    expect(() =>
      createKeyGenerator("AAJDTP8WL6EQZ1AMN2UXFB379I4KCV5RSH"),
    ).toThrow(INVALID_KEY_MSG);
  });

  it("rejects non-string input", () => {
    expect(() => createKeyGenerator(12345)).toThrow(INVALID_KEY_MSG);
  });

  it("validates on createKeyValidator too", () => {
    expect(() => createKeyValidator("bad")).toThrow(INVALID_KEY_MSG);
  });
});
