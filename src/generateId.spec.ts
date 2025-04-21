import {test} from 'hoare';
import {generateId, encodeCustomAlphabet, BASE62} from './generateId';

const base62Regex = /^[A-Za-z0-9]+$/;

//
// ─── RANDOM ID TESTS ─────────────────────────────────────────────
//

test('generates a random id of default length (10)', (assert) => {

    const id = generateId();

    assert.equal(id.length, 10);
    assert.isTrue(base62Regex.test(id), 'ID contains invalid characters');

});

test('generates a random id of default length (16) if using sequential', (assert) => {

    const id = generateId({sequential: true});

    assert.equal(id.length, 16);
    assert.isTrue(base62Regex.test(id), 'ID contains invalid characters');

});

test('generates a random id of custom length (16)', (assert) => {

    const id = generateId({length: 16});

    assert.equal(id.length, 16);
    assert.isTrue(base62Regex.test(id), 'ID contains invalid characters');

});

test('generates ID using Crockford base32 alphabet', (assert) => {

    const crockfordRegex = /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]+$/;

    const id = generateId({length: 12, alphabet: 'crockford'});

    assert.equal(id.length, 12);
    assert.isTrue(crockfordRegex.test(id), `ID contains invalid characters: ${id}`);

});

//
// ─── DETERMINISTIC ID TESTS ──────────────────────────────────────
//

test('generates deterministic id for same input', (assert) => {

    const id1 = generateId({input: 'user:123'});
    const id2 = generateId({input: 'user:123'});

    assert.equal(id1, id2);

});

test('different deterministic inputs produce different ids', (assert) => {

    const id1 = generateId({input: 'abc'});
    const id2 = generateId({input: 'def'});

    assert.isTrue(id1 !== id2);

});

test('deterministic id respects length', (assert) => {

    const id = generateId({input: 'log:xyz', length: 8});

    assert.equal(id.length, 8);

});

//
// ─── SEQUENTIAL ID TESTS ─────────────────────────────────────────
//

test('sequential ids are lexicographically non-decreasing in 50 samples', async (assert) => {

    const ids: string[] = [];

    for (let i = 0; i < 50; i++) {

        ids.push(generateId({sequential: true, length: 16}));
        await new Promise((r) => setTimeout(r, 10));

    }

    const sorted = [...ids].sort();

    assert.equal(JSON.stringify(ids), JSON.stringify(sorted));

});

test('sequential id respects length', (assert) => {

    const id = generateId({sequential: true, length: 20});

    assert.equal(id.length, 20);

});

test('throws if sequential id is too short', (assert) => {

    let threw = false;

    try {

        generateId({sequential: true, length: 6});

    } catch (err) {

        threw = true;

    }
    assert.isTrue(threw, 'Expected error for sequential length < 8');

});

//
// ─── INTERNAL: BASE62 ENCODING ───────────────────────────────────
//

test('encodeBase62 handles Buffer input', (assert) => {

    const buffer = Buffer.from([0x12, 0x34, 0xab, 0xcd]);
    const encoded = encodeCustomAlphabet(buffer, 6, BASE62);

    assert.equal(typeof encoded, 'string');
    assert.equal(encoded.length, 6);

});

test('encodeBase62 handles bigint input', (assert) => {

    const num = 12345678901234567890n;
    const encoded = encodeCustomAlphabet(num, 12, BASE62);

    assert.equal(typeof encoded, 'string');
    assert.equal(encoded.length, 12);

});

test('encodeBase62 handles small bigint and pads correctly', (assert) => {

    const encoded = encodeCustomAlphabet(1n, 6, BASE62);

    assert.equal(encoded.length, 6);

});
