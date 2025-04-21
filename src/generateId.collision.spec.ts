import {test} from 'hoare';
import {generateId} from './generateId';

test('random ids do not collide in 1 million generations for length of 8', (assert) => {

    const seen = new Set<string>();

    for (let i = 0; i < 1_000_000; i++) {

        const id = generateId({length: 8});

        assert.isFalse(seen.has(id), `Duplicate ID detected: ${id}`);
        seen.add(id);

    }

});

