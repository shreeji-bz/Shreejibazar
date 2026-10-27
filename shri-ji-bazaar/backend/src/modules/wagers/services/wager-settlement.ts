/**
 * Pure win-determination + payout math for the betting games.
 *
 * Kept free of any database / supabase imports so it can be unit-tested
 * directly with jest. Every play type the app can produce is handled here;
 * the wager `play_type` CHECK constraint (database/migrations/013_*.sql) must
 * stay in sync with `PLAY_TYPES` below.
 */

export type PlayType = 'single' | 'jodi' | 'double' | 'panel' | 'crossing' | 'palti';

export const PLAY_TYPES: PlayType[] = ['single', 'jodi', 'double', 'panel', 'crossing', 'palti'];

/** Payout multiplier per play type (stake * multiplier = payout on a win). */
export const PLAY_TYPE_MULTIPLIERS: Record<PlayType, number> = {
  single: 9,
  double: 18,
  jodi: 90,
  panel: 150,
  crossing: 9,
  palti: 90,
};

/**
 * The digits a result string actually carries. A declared "last time" looks
 * like "02:52:41" or "3h 32m 11sec" — we strip every non-digit character so
 * the win check only ever compares real digits.
 */
export function resultDigits(resultText: string): string {
  return (resultText || '').replace(/[^0-9]/g, '');
}

/** Reverse of a numeric selection: '12' -> '21', '123' -> '321'. */
export function reversalOf(selection: string): string {
  return selection.trim().split('').reverse().join('');
}

/**
 * Palti expansion. "With Palti" on a number also covers its reversal (the
 * mirror/cross), so '12' expands to ['12', '21'] and '123' to ['123', '321'].
 * "Without Palti" is just the number itself.
 */
export function expandPalti(selection: string, withPalti: boolean): string[] {
  const sel = selection.trim();
  if (!withPalti) return [sel];
  const rev = reversalOf(sel);
  return rev === sel ? [sel] : [sel, rev];
}

/**
 * Does a given selection win against the declared result?
 *
 * - single   : result contains the digit.
 * - jodi     : result contains the exact 2-digit sequence (consecutive).
 * - crossing : every digit of the selection appears somewhere in the result
 *              (order-agnostic) — this is the "Crossing" free-entry mode.
 * - panel    : all 3 digits of the selection appear in the result.
 * - double   : result contains the exact 2-digit sequence.
 * - palti    : result contains the number OR its reversal.
 */
export function isWinner(
  playType: PlayType,
  selection: string,
  resultText: string,
  withPalti: boolean = false
): boolean {
  const sel = selection.trim();
  if (!sel) return false;
  const result = resultDigits(resultText);
  if (!result) return false;

  switch (playType) {
    case 'single':
      // One digit: it must appear in the result.
      return sel.length === 1 && result.includes(sel);

    case 'jodi':
    case 'double':
      // Two digits: the exact consecutive pair must appear in the result.
      return sel.length === 2 && result.includes(sel);

    case 'crossing':
      // Every digit of the selection shows up somewhere in the result.
      return sel.length > 0 && sel.length <= 3 && Array.from(new Set(sel)).every((d) => result.includes(d));

    case 'panel':
      // Three digits in any order, each present in the result.
      return sel.length === 3 && sel.split('').every((d) => result.includes(d));

    case 'palti':
      return expandPalti(sel, withPalti).some((v) => result.includes(v));

    default:
      return false;
  }
}

/** Payout for a winning selection (stake * multiplier). 0 for a loss. */
export function payoutFor(
  playType: PlayType,
  selection: string,
  stake: number,
  resultText: string,
  withPalti: boolean = false
): number {
  if (!isWinner(playType, selection, resultText, withPalti)) return 0;
  const mult = PLAY_TYPE_MULTIPLIERS[playType] ?? 0;
  return Math.floor(stake * mult);
}

/**
 * Validate a selection for a play type (used by the wager service before a
 * bet is accepted). Throws with a human message on failure.
 */
export function assertSelectionValid(playType: PlayType, selection: string): void {
  const sel = (selection || '').trim();
  if (sel.length === 0) throw new Error('Selection is required');
  if (!/^[0-9]+$/.test(sel)) throw new Error('Selection must be numeric');

  switch (playType) {
    case 'single':
      if (sel.length !== 1) throw new Error('Single requires one digit (0-9)');
      break;
    case 'jodi':
    case 'crossing':
      // Crossing accepts 1-3 digits; jodi is exactly 2.
      if (playType === 'jodi' && sel.length !== 2) throw new Error('Jodi requires exactly 2 digits (00-99)');
      if (sel.length > 3) throw new Error('Selection is too long');
      break;
    case 'panel':
      if (sel.length !== 3) throw new Error('Panel requires exactly 3 digits');
      break;
    case 'palti':
      if (sel.length < 2 || sel.length > 3) throw new Error('Palti requires 2 or 3 digits');
      break;
    default:
      throw new Error(`Invalid play type: ${playType}`);
  }
}
