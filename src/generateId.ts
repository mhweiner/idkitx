import {createHash, randomBytes} from 'crypto';

const BASE62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Encodes a Buffer or bigint into a fixed-length base62 string.
 */
export function encodeBase62(buffer: Buffer | bigint, length: number): string {

    let num = typeof buffer === 'bigint'
        ? buffer
        : BigInt(`0x${buffer.toString('hex')}`);

    const chars = [];

    while (chars.length < length) {

        const index = Number(num % 62n);

        chars.unshift(BASE62[index]);
        num /= 62n;

    }
    return chars.join('');

}

export interface GenerateIdOptions {
    length?: number
    input?: string // deterministic mode
    sequential?: boolean // timestamp-prefixed
}

/**
 * Generates a compact, base62 ID.
 *
 * - Random by default
 * - Deterministic if `input` is provided
 * - Sequential if `sequential: true`
 */
export function generateId(options: GenerateIdOptions = {}): string {

    const {
        input,
        sequential = false,
        length = options.sequential ? 16 : 10,
    } = options;

    if (input) {

        // Deterministic hash. Ignores sequential option.

        const hash = createHash('sha256').update(input).digest();

        return encodeBase62(hash, length);

    }

    if (sequential) {

        if (length < 16) throw new Error('sequential ID length must be at least 16 to make room for timestamp');

        const timestamp = Date.now().toString(36).padStart(8, '0'); // base36 for sortable prefix
        const randomBytesNeeded = Math.ceil(((length - 8) * Math.log2(62)) / 8);
        const randPart = encodeBase62(randomBytes(randomBytesNeeded), length - 8);

        return timestamp + randPart;

    }

    // Fully random
    const raw = randomBytes(Math.ceil((length * Math.log2(62)) / 8));

    return encodeBase62(raw, length);

}
