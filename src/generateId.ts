import {createHash, randomBytes} from 'crypto';

export const BASE62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
export const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // No I, L, O, U

export interface GenerateIdOptions {
    length?: number
    input?: string // deterministic mode
    sequential?: boolean // timestamp-prefixed
    alphabet?: 'base62' | 'crockford'
}

export function encodeCustomAlphabet(
    input: Buffer | bigint,
    length: number,
    alphabet: string
): string {

    let num = typeof input === 'bigint'
        ? input
        : BigInt(`0x${input.toString('hex')}`);

    const chars: string[] = [];
    const base = BigInt(alphabet.length);

    while (chars.length < length) {

        const index = Number(num % base);

        chars.unshift(alphabet[index]);
        num /= base;

    }

    return chars.join('');

}

/**
 * Generates a compact, encoded ID.
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
        alphabet = 'base62',
    } = options;

    const charset = alphabet === 'crockford' ? CROCKFORD : BASE62;

    if (input) {

        const hash = createHash('sha256').update(input).digest();

        return encodeCustomAlphabet(hash, length, charset);

    }

    if (sequential) {

        if (length < 16) throw new Error('Sequential ID length must be at least 16 to include timestamp prefix');

        const timestamp = Date.now().toString(36).padStart(8, '0');
        const randLength = length - 8;
        const randomBytesNeeded = Math.ceil((randLength * Math.log2(charset.length)) / 8);
        const randPart = encodeCustomAlphabet(randomBytes(randomBytesNeeded), randLength, charset);

        return timestamp + randPart;

    }

    const raw = randomBytes(Math.ceil((length * Math.log2(charset.length)) / 8));

    return encodeCustomAlphabet(raw, length, charset);

}
