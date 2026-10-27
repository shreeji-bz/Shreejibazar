import {
  PLAY_TYPES,
  PLAY_TYPE_MULTIPLIERS,
  assertSelectionValid,
  expandPalti,
  isWinner,
  payoutFor,
  reversalOf,
  resultDigits,
} from './wager-settlement';

// Realistic "last time" strings exactly as they appear in the game UI:
// "02:52:41" or "3h 32m 11sec". The win check must strip everything non-digit.
const TIME = '02:52:41'; // digits "025241"
const HUMAN = '3h 32m 11sec'; // digits "332111"

describe('resultDigits', () => {
  it('strips every non-digit character', () => {
    expect(resultDigits(TIME)).toBe('025241');
    expect(resultDigits(HUMAN)).toBe('33211');
    expect(resultDigits('')).toBe('');
  });
});

describe('reversalOf', () => {
  it('reverses a selection', () => {
    expect(reversalOf('12')).toBe('21');
    expect(reversalOf('123')).toBe('321');
  });

  it('returns the same value for a palindrome', () => {
    expect(reversalOf('121')).toBe('121');
  });
});

describe('expandPalti', () => {
  it('with-palti covers the number and its reversal', () => {
    expect(expandPalti('12', true).sort()).toEqual(['12', '21']);
  });

  it('without-palti covers only the number', () => {
    expect(expandPalti('12', false)).toEqual(['12']);
  });

  it('does not duplicate a palindrome', () => {
    expect(expandPalti('121', true)).toEqual(['121']);
  });
});

describe('isWinner', () => {
  it('single: digit present in result', () => {
    expect(isWinner('single', '2', TIME)).toBe(true);
    expect(isWinner('single', '9', TIME)).toBe(false);
  });

  it('jodi: exact 2-digit sequence present', () => {
    expect(isWinner('jodi', '52', TIME)).toBe(true); // 025241 contains "52"
    expect(isWinner('jodi', '14', TIME)).toBe(false); // "41" is there, "14" is not
  });

  it('crossing: all selection digits appear somewhere in result', () => {
    expect(isWinner('crossing', '25', TIME)).toBe(true);
    expect(isWinner('crossing', '02', TIME)).toBe(true);
    expect(isWinner('crossing', '7', TIME)).toBe(false);
  });

  it('panel: all three digits present', () => {
    expect(isWinner('panel', '241', TIME)).toBe(true); // 0,2,5,2,4,1 -> 2,4,1 present
    expect(isWinner('panel', '999', TIME)).toBe(false);
  });

  it('palti: number OR its reversal', () => {
    // "14" is NOT consecutive in 025241, but its reversal "41" is -> with-palti
    // wins via the mirror; without palti it is a loss.
    expect(isWinner('palti', '14', TIME, true)).toBe(true);
    expect(isWinner('palti', '14', TIME, false)).toBe(false);
  });

  it('rejects empty result', () => {
    expect(isWinner('jodi', '52', '')).toBe(false);
  });
});

describe('payoutFor', () => {
  it('pays stake * multiplier on a win, 0 on a loss', () => {
    expect(payoutFor('single', '2', 10, TIME)).toBe(10 * PLAY_TYPE_MULTIPLIERS.single);
    expect(payoutFor('single', '9', 10, TIME)).toBe(0);
    expect(payoutFor('jodi', '52', 10, TIME)).toBe(10 * PLAY_TYPE_MULTIPLIERS.jodi);
  });
});

describe('assertSelectionValid', () => {
  it('accepts valid selections per type', () => {
    expect(() => assertSelectionValid('single', '5')).not.toThrow();
    expect(() => assertSelectionValid('jodi', '42')).not.toThrow();
    expect(() => assertSelectionValid('crossing', '25')).not.toThrow();
    expect(() => assertSelectionValid('palti', '123')).not.toThrow();
    expect(() => assertSelectionValid('panel', '123')).not.toThrow();
  });

  it('rejects malformed selections', () => {
    expect(() => assertSelectionValid('single', '12')).toThrow();
    expect(() => assertSelectionValid('jodi', '1')).toThrow();
    expect(() => assertSelectionValid('jodi', '123')).toThrow();
    expect(() => assertSelectionValid('palti', '1')).toThrow();
    expect(() => assertSelectionValid('panel', '12')).toThrow();
    expect(() => assertSelectionValid('panel', 'abcd')).toThrow();
  });

  it('exposes every play type the app produces', () => {
    expect(PLAY_TYPES).toContain('crossing');
    expect(PLAY_TYPES).toContain('palti');
  });
});
