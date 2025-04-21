<picture>
    <source srcset="docs/idkitx-white.svg" media="(prefers-color-scheme: dark)">
    <source srcset="docs/idkitx-black.svg" media="(prefers-color-scheme: light)">
    <img src="docs/idkitx-black.svg" alt="Logo" style="margin: 0 0 10px" size="250">
</picture> 

[![build status](https://github.com/mhweiner/idkitx/actions/workflows/release.yml/badge.svg)](https://github.com/mhweiner/idkitx/actions)
[![SemVer](https://img.shields.io/badge/SemVer-2.0.0-blue)]()
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)
[![AutoRel](https://img.shields.io/badge/v2-AutoRel?label=AutoRel&labelColor=0ab5fc&color=grey&link=https%3A%2F%2Fgithub.com%2Fmhweiner%2Fautorel)](https://github.com/mhweiner/autorel)

**idkitx** is a flexible, URL-safe ID generator designed for performance, compactness, and clarity.

It gives you short, secure IDs that can be **random**, **deterministic**, or **sequential** — in a consistent, Base62 format. It was designed to solve specific problems at [aeroview.io](https://aeroview.io) and is now open-sourced for the community. Inspired by the best parts of `nanoid`, `ulid`, `ksuid`, and `hashids`, it provides a simple API for generating IDs that are both human-readable and database-friendly.

```ts
import { generateId } from 'idkitx';

generateId();                               // e.g., 'A9bzK2XcPv' (random)
generateId({ length: 8 });                  // e.g., '4MfbTz1q' (shorter random ID)
generateId({ input: 'user:42' });           // deterministic — same input = same ID
generateId({ sequential: true });           // e.g., '0v4mG6CZKuSk31H8', sortable by timestamp
generateId({ sequential: true, length: 20 }); // longer sequential ID (must be ≥ 16)
generateId({ alphabet: 'crockford' }); // e.g., '2Z5G1K9DMQ', Base32 Crockford encoding, fewer similar chars, but less entropy per char
```

✅ Customizable entropy via length  
✅ Compact, URL-friendly, human-readable (Base62 or Crockford's Base32)  
✅ Deterministic mode for de-duping/idempotency (hash of input)  
✅ Sequential mode (timestamp + randomness) for insert performance  
✅ Random mode (short but globally unique)  
✅ Fully typed, fast, 100% test coverage  

## 🚀 Why idkitx?

**idkitx** is for developers who want:

- **Shorter IDs** than UUIDs (as few as 8–12 characters)
- **Better insert/index performance** than ULID or UUID in some databases
- **More flexibility** than libraries that only do random or sequential
- **Postgres-friendly primary keys**

It uses Node’s `crypto.randomBytes()` under the hood, just like `uuid`, `nanoid`, and `ulid`. While this provides strong randomness for uniqueness and distribution, **`idkitx` is not a cryptography library** and should not be used to generate secrets or session tokens.

## 🤔 When *not* to use idkitx

While **idkitx** is great for compact, flexible ID generation, it’s not ideal for every situation:
- ❌ You need universally recognized ID formats (e.g. for APIs, OAuth, logs) — use uuid
- ❌ You need monotonicity across distributed systems — use ulid with a monotonic factory
- ❌ You require binary-compatible formats (e.g. 128-bit UUIDs stored in binary columns) — use uuid or native database GUID types
- ❌ You need audited cryptographic guarantees — use crypto.randomUUID() or a dedicated crypto library

## 🔍 How it compares

| Feature                     | `idkitx`              | `uuid/v4`           | `ulid`            | `nanoid`         |
|----------------------------|----------------------|---------------------|-------------------|------------------|
| URL-safe                   | ✅                   | ✅ (v4 only)        | ✅                | ✅               |
| Compact (8–16 chars)       | ✅                   | ❌ (36 chars)       | ❌ (26 chars)     | ✅               |
| Fully random option        | ✅                   | ✅                  | ❌ (prefix only)  | ✅               |
| Deterministic (hash) mode  | ✅                   | ❌                  | ❌                | ❌               |
| Sequential sortable mode   | ✅ (best-effort)     | ❌                  | ✅                | ❌               |
| Zero dependencies          | ✅                   | ✅ (native only)    | ✅                | ✅               |
| Configurable length        | ✅                   | ❌                  | ❌                | ✅               |
| Binary compatibility       | ❌                   | ✅ (128-bit)        | ❌                | ❌               |
| Audited for crypto tokens  | ❌                   | ✅ (via WebCrypto)  | ❌                | ❌               |

> ⚠️ ULID is sortable within a process, but only guaranteed monotonic with a factory. UUIDv4 is cryptographically secure, but 36 characters long and not sortable.

## Installation

```bash
npm i idkitx
```

## API Reference

### `generateId(options?: GenerateIdOptions): string`

Generates a Base62-encoded ID string. Defaults to random.

**Options:**

| Option        | Type        | Default | Description                                                                 |
|---------------|-------------|---------|-----------------------------------------------------------------------------|
| `length`      | `number`    | 10 or 16 | Total length of the ID. Defaults to `10` (random/deterministic) or `16` (sequential). |
| `input`       | `string?`   | `undefined` | If provided, generates a deterministic ID based on hash of the input.      |
| `sequential`  | `boolean?`  | `false` | If `true`, prepends an 8-char timestamp prefix for sortable IDs.           |

### `encodeBase62(bufferOrBigint, length): string`

Internal utility for encoding `Buffer` or `bigint` values into Base62, padded to a fixed length.

Not exported publicly unless needed.

### 📏 Entropy and Choosing a Length

Each character in a Base62-encoded ID contributes approximately **5.95 bits of entropy**. Use this to estimate how long your IDs should be based on how many you’ll generate.

| Length | Bits of Entropy | Example Use Case                 | 1% Collision Likely At       |
|--------|------------------|----------------------------------|------------------------------|
| 6      | ~36 bits         | Tiny systems, temp tokens        | ~600,000 IDs                 |
| 8      | ~48 bits         | Short-lived sessions, test data | ~3 million IDs               |
| 10     | ~60 bits         | Default for random IDs           | ~37 million IDs              |
| 12     | ~71 bits         | Public slugs, deterministic keys | ~230 million IDs             |
| 16     | ~95 bits         | Global scale, ULID/UUID alt      | ~1.3 billion IDs             |
| 20     | ~119 bits        | Practically collision-proof      | ~75 billion IDs              |

If you're using **crockford** encoding, the entropy per character is slightly lower (5 bits), so adjust your length accordingly.

#### 💡 Recommendation

- Use **10–12 characters** for most app-level IDs
- Use **16+ characters** for large-scale, high-throughput systems
- Deterministic IDs should be long enough to minimize hash collisions
- **Sequential IDs** must be **≥16** to make room for the timestamp prefix

> `idkitx` uses Node’s `crypto.randomBytes()` for high-entropy randomness. But even good randomness can collide — make sure your **length matches your scale**.

## Contributing

- ⭐ Star this repo if you like it!
- 🐛 Open an [issue](https://github.com/mhweiner/idkitx/issues) for bugs or suggestions.
- 🤝 Submit a PR to `main` — all tests must pass.

## Related Projects

- [autorel](https://github.com/mhweiner/autorel): Automate semantic releases based on conventional commits.
- [hoare](https://github.com/mhweiner/hoare): A fast, defensive test runner for JS/TS.
- [jsout](https://github.com/mhweiner/jsout): A minimal logger for JS/TS, syslog-style.
- [brek](https://github.com/mhweiner/brek): Typed config loader for dynamic, secret-based configs.
- [pgsmith](https://github.com/mhweiner/pgsmith): A SQL builder for parameterized queries in PostgreSQL.