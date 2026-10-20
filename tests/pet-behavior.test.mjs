import test from 'node:test';
import assert from 'node:assert/strict';
import { nextState, floorTarget, ease } from '../resources/js/features/pet/behavior/stateMachine.js';

test('weighted routine never repeats its last state', () => {
    let previous = 'idle-sit';
    for (let index = 0; index < 10000; index++) {
        const next = nextState(previous);
        assert.notEqual(next, previous); previous = next;
    }
});
test('destinations leave a margin at both desktop and mobile sizes', () => {
    for (const width of [240, 300, 375, 700]) {
        for (let index = 0; index < 1000; index++) {
            const size = 210 * 1.35, target = floorTarget(width, 310, size);
            assert.ok(Math.abs(target.x) <= Math.max(0, width / 2 - size / 2 - 12));
            assert.ok(Math.abs(target.y) <= 310 * .055);
            assert.ok(target.depth >= .9 && target.depth <= 1.05);
        }
    }
});
test('movement starts and ends gently without overshooting', () => {
    assert.equal(ease(0), 0); assert.equal(ease(1), 1);
    assert.ok(ease(.05) < .01); assert.ok(ease(.95) > .99);
});
