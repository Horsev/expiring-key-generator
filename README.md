# expiring-key-generator

Generate date-based keys and validate them within a time window. Uses a secret alphabet for base-N encoding + SHA256 hashing.

- Zero dependencies (besides Node's `crypto`)
- Algorithmic generation
- No Database needed

## Install

```bash
npm install expiring-key-generator
```

## Usage

```javascript
import {
  generateSecretKey,
  createKeyGenerator,
  createKeyValidator,
} from "expiring-key-generator";

// 1. Generate a secret key (store this securely)
const secretKey = generateSecretKey();

// 2. Generate a key from a date
const generateKey = createKeyGenerator(secretKey);
const key = generateKey(new Date()); // => base64 SHA256 string

// 3. Validate a key is within a 28-day window
const isKeyValid = createKeyValidator(secretKey);
isKeyValid(key, new Date(), 28); // => true
```

## API

### `generateSecretKey()`

Returns a randomly shuffled 34-character string from a safe alphabet (`A-Z` without `O`, `1-9` without `0`) — visually unambiguous characters only.

### `createKeyGenerator(secretKey)`

Throws if `secretKey` is not a valid 34-character permutation of the safe alphabet.

Returns a function `(date) => string` that encodes a date into a deterministic base64 SHA256 hash.

```
Date → "2026-02-23" → "20260223" → base-N encode → SHA256 base64
```

Same date + same secret key always produces the same hash.

### `createKeyValidator(secretKey)`

Throws if `secretKey` is not a valid 34-character permutation of the safe alphabet.

Returns a function `(hash, currentDate, days) => boolean` that checks whether a key was generated within the last `days` days.

```javascript
const isKeyValid = createKeyValidator(secretKey);

isKeyValid(key, new Date("2026-02-23"), 28); // true if key was created within last 28 days
```

## Changelog

### 1.2.0

- Validate secret key on `createKeyGenerator` / `createKeyValidator` — must be a 34-char permutation of the safe alphabet

### 1.1.2

- Fix `crypto.randomInt` range error on Node 21+ (`max` exceeded `2^48 - 1`) thx [Mike Podgorniy](https://www.npmjs.com/~mike_podgorniy)

### 1.1.1

- Add demo link to README

### 1.1.0

- Use `crypto.randomInt` instead of `Math.random` for cryptographically secure key generation
- Fix timezone bug — date encoding now uses local date instead of UTC
- Add input validation to encoder (rejects non-integer and negative values, handles `"0"`)
- Hoist key generator in validator closure for better performance
- Remove unused `decode` import from public API barrel
- Add `engines` field (`node >= 16`)

### 1.0.0

- Initial release — `generateSecretKey`, `createKeyGenerator`, `createKeyValidator`

## Demo

See the [terminal demo](https://github.com/Horsev/expiring-key-generator-demo) for a working example with sample output.

## License

MIT
