import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeEmail } from './authUtils.js';

test('normalizeEmail trims whitespace and lowercases addresses', () => {
    assert.equal(normalizeEmail('  User@Example.COM  '), 'user@example.com');
});

test('normalizeEmail returns empty string for blank values', () => {
    assert.equal(normalizeEmail('   '), '');
});
