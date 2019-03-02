import { it } from 'mocha';
import assert from 'assert';
import { double, power } from './number';

it('double', () => {
  assert.equal(double(2), 4);
});

it('power', () => {
  assert.equal(power(2, 4), 16);
});
