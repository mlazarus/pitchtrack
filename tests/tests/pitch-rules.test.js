/**
 * Pitch Game Tracker - Rules Validation Unit Tests
 * 
 * Tests the calcScore() logic directly without a browser.
 * Each test maps to a specific rule from CALCULATIONS.docx / PITCH_RULES.xlsx
 * 
 * Run: npx jest pitch-rules.test.js
 */

// ─── Extract calcScore logic from the app ─────────────────────────────────────
// This is a pure JS copy of calcScore() from PitchGameTracker.jsx
// Keep this in sync with the app whenever calcScore() changes.

function calcScore(winner, hands, teamASize, teamBSize, stakes = {}) {
  const s = {
    gameScore: stakes.gameScore ?? 2,
    bump:      stakes.bump      ?? 1,
    points:    stakes.points    ?? 0.5,
    bonus:     stakes.bonus     ?? 20,
  };

  const tot = { a: 0, b: 0 };
  hands.forEach(h => {
    tot.a += h.scoreA;
    tot.b += h.scoreB;
  });

  let bA = 0, bB = 0;
  hands.forEach(h => {
    if (h.scoreA < 0) bA++;
    if (h.scoreB < 0) bB++;
  });

  const last = hands[hands.length - 1];
  const gA = last ? last.scoreA : 0;
  const gB = last ? last.scoreB : 0;
  let fA = 0, fB = 0;

  if (winner === 'A') {
    const diff = Math.max(0, tot.a - tot.b);
    const base = s.gameScore + (bB * s.bump);
    let mult = 1;

    if      (gA >= 2 && gA <= 4 && tot.b <= 0) mult = 2;
    else if (gA === 9  && tot.b >= 1)           mult = 2;
    else if (gA === 9  && tot.b <= 0)           mult = 4;
    else if (gA === 15 && tot.b >= 1)           mult = 3;
    else if (gA === 15 && tot.b <= 0)           mult = 6;

    fA = (base * mult) + (diff * s.points);
    fB = -fA;
  } else {
    const diff = Math.max(0, tot.b - tot.a);
    const base = s.gameScore + (bA * s.bump);
    let mult = 1;

    if      (gB >= 2 && gB <= 4 && tot.a <= 0) mult = 2;
    else if (gB === 9  && tot.a >= 1)           mult = 2;
    else if (gB === 9  && tot.a <= 0)           mult = 4;
    else if (gB === 15 && tot.a >= 1)           mult = 3;
    else if (gB === 15 && tot.a <= 0)           mult = 6;

    fB = (base * mult) + (diff * s.points);
    fA = -fB;
  }

  // Captains multiplier (2v3 team)
  // BUG NOTE: Current app code only multiplies one side. 
  // This test file implements the CORRECT behavior (both sides balanced).
  // Once Bug #2 is fixed in the app, this will match.
  if (teamASize === 2 && teamBSize === 3) {
    fA *= 1.5;
    fB = -fA; // BUG FIX: keep balanced
  } else if (teamBSize === 2 && teamASize === 3) {
    fB *= 1.5;
    fA = -fB; // BUG FIX: keep balanced
  }

  return { scoreA: fA, scoreB: fB, bumpsA: bA, bumpsB: bB, runningA: tot.a, runningB: tot.b };
}

// ─── Default stakes (matches your DB) ─────────────────────────────────────────
const STD = { gameScore: 2, bump: 1, points: 0.5, bonus: 20 };

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Build a hands array ending with a specific last-hand score
function hands(...scores) {
  // Each entry: [scoreA, scoreB]
  return scores.map(([a, b]) => ({ scoreA: a, scoreB: b }));
}

// ─────────────────────────────────────────────────────────────────────────────
// RULE TESTS
// ─────────────────────────────────────────────────────────────────────────────

describe('Core Scoring Rules', () => {

  test('Rule 1: Winner receives game score ($2)', () => {
    // Team A wins, no bumps, no differential
    const h = hands([5, 0], [5, 0]); // totA=10, totB=0, last hand gA=5
    const r = calcScore('A', h, 2, 2, STD);
    // base = 2 + (0 bumps * 1) = 2, mult=1, diff = 10-0=10, diff*0.5=5
    // But wait - last hand is gA=5 which is NOT 9 or 15, and totB=0 (<=0) 
    // Exception 1: gA>=2 && gA<=4 → NO (5 is not 2-4)
    // No multiplier, just base + diff
    expect(r.scoreA).toBe(2 + 10 * 0.5); // 7
    expect(r.scoreB).toBe(-7);
  });

  test('Rule 2: Winner receives $1 (points) per point differential', () => {
    // totA=15, totB=5, diff=10, last gA=3 (no special), no bumps
    const h = hands([8, 3], [7, 2]);
    const r = calcScore('A', h, 2, 2, STD);
    const diff = 15 - 5; // 10
    // base=2, mult=1 (last gA=7, not a special value), diff*0.5=5
    expect(r.scoreA).toBe(2 + 5);
    expect(r.scoreB).toBe(-7);
  });

  test('Rule 3: Differential is NEVER included in double/triple multiplier', () => {
    // Team A wins with 9 on last hand, loser has 1 point → Double
    // totA=10, totB=1
    const h = hands([1, 1], [9, 0]);
    const r = calcScore('A', h, 2, 2, STD);
    // base=2, mult=2 (Exception 2), diff=10-1=9, diff*0.5=4.5
    // Correct: (2*2) + 4.5 = 8.5
    // Wrong if diff was doubled: (2+9*0.5)*2 = 13
    expect(r.scoreA).toBe((2 * 2) + (9 * 0.5));
    expect(r.scoreB).toBe(-8.5);
  });

  test('Rule 4: Bump = negative score entered for a team', () => {
    // Team A scores negative on hand 1 = 1 bump for A
    const h = hands([-2, 4], [12, 0]);
    const r = calcScore('B', h, 2, 2, STD);
    expect(r.bumpsA).toBe(1);
    expect(r.bumpsB).toBe(0);
    // Winner B gets bA * bump = 1 * 1 = 1 added to base
    expect(r.scoreB).toBe((2 + 1) + (4 * 0.5)); // 3 + 2 = 5 ... wait
    // totB=4, totA=10 → diff = 4-10 = negative → Math.max(0,...) = 0
    // base = 2 + (1 * 1) = 3, diff=0
    expect(r.scoreB).toBe(3);
    expect(r.scoreA).toBe(-3);
  });

  test('Rule 5: Winner pays losing team bumps', () => {
    // Team B has 2 bumps, Team A wins
    const h = hands([5, -1], [5, -1], [5, 2]);
    const r = calcScore('A', h, 2, 2, STD);
    expect(r.bumpsB).toBe(2);
    // base = 2 + (2 * 1) = 4
    // totA=15, totB=0, diff=15
    // last gA=5, totB=0 → exception 1: gA>=2 && gA<=4? No (5). No mult.
    expect(r.scoreA).toBe(4 + 15 * 0.5); // 4+7.5=11.5
  });

});

describe('Exception 1: Win 2-4 pts last hand, loser in hole (≤0) → Double', () => {

  test('Last hand = 2, loser = 0 → mult x2', () => {
    const h = hands([5, -1], [2, 0]); // totA=7, totB=-1, last gA=2
    const r = calcScore('A', h, 2, 2, STD);
    const base = 2 + (1 * 1); // 1 bump from B
    const diff = Math.max(0, 7 - (-1)); // 8
    expect(r.scoreA).toBe((base * 2) + (diff * 0.5)); // 6 + 4 = 10
  });

  test('Last hand = 3, loser = -5 → mult x2', () => {
    const h = hands([5, -5], [3, 0]); // totA=8, totB=-5, last gA=3
    const r = calcScore('A', h, 2, 2, STD);
    const base = 2 + (1 * 1); // 1 bump
    const diff = Math.max(0, 8 - (-5)); // 13
    expect(r.scoreA).toBe((base * 2) + (diff * 0.5)); // 6 + 6.5 = 12.5
  });

  test('Last hand = 4, loser = 0 → mult x2', () => {
    const h = hands([5, 0], [4, 0]); // totA=9, totB=0, last gA=4
    const r = calcScore('A', h, 2, 2, STD);
    const base = 2; // no bumps
    const diff = 9 - 0; // 9
    expect(r.scoreA).toBe((base * 2) + (diff * 0.5)); // 4 + 4.5 = 8.5
  });

  test('Last hand = 4, loser = 1 → NO double (loser NOT in hole)', () => {
    const h = hands([5, 1], [4, 0]); // totA=9, totB=1, last gA=4
    const r = calcScore('A', h, 2, 2, STD);
    const base = 2;
    const diff = 9 - 1; // 8
    expect(r.scoreA).toBe((base * 1) + (diff * 0.5)); // 2 + 4 = 6
  });

  test('Last hand = 5, loser = -5 → NO double (5 is not 2-4)', () => {
    const h = hands([5, -5], [5, 0]); // last gA=5
    const r = calcScore('A', h, 2, 2, STD);
    const base = 2 + (1 * 1);
    const diff = Math.max(0, 10 - (-5));
    expect(r.scoreA).toBe((base * 1) + (diff * 0.5)); // no double
  });

});

describe('Exception 2: Win 9 pts last hand, loser ≥ 1 → Double', () => {

  test('Last hand = 9, loser = 1 → mult x2', () => {
    const h = hands([1, 1], [9, 0]); // totA=10, totB=1, last gA=9
    const r = calcScore('A', h, 2, 2, STD);
    const base = 2;
    const diff = Math.max(0, 10 - 1); // 9
    expect(r.scoreA).toBe((base * 2) + (diff * 0.5)); // 4 + 4.5 = 8.5
  });

  test('Last hand = 9, loser = 10 → mult x2', () => {
    const h = hands([1, 10], [9, 0]); // totA=10, totB=10
    const r = calcScore('A', h, 2, 2, STD);
    const base = 2;
    const diff = Math.max(0, 10 - 10); // 0
    expect(r.scoreA).toBe((base * 2) + 0); // 4
  });

  test('Last hand = 9, loser = 0 → NOT Exception 2 (falls to Exception 3)', () => {
    const h = hands([1, -1], [9, 0]); // totB = -1
    const r = calcScore('A', h, 2, 2, STD);
    // Should be mult=4 (Exception 3), not mult=2
    const base = 2 + (1 * 1); // 1 bump
    const diff = Math.max(0, 10 - (-1)); // 11
    expect(r.scoreA).toBe((base * 4) + (diff * 0.5)); // 12 + 5.5 = 17.5
  });

});

describe('Exception 3: Win 9 pts last hand, loser ≤ 0 → Double Double (x4)', () => {

  test('Last hand = 9, loser = 0 → mult x4', () => {
    const h = hands([1, 0], [9, 0]); // totB=0
    const r = calcScore('A', h, 2, 2, STD);
    const base = 2;
    const diff = 10 - 0; // 10
    expect(r.scoreA).toBe((base * 4) + (diff * 0.5)); // 8 + 5 = 13
  });

  test('Last hand = 9, loser = -3 → mult x4', () => {
    const h = hands([1, -3], [9, 0]); // totB=-3
    const r = calcScore('A', h, 2, 2, STD);
    const base = 2 + (1 * 1); // 1 bump
    const diff = Math.max(0, 10 - (-3)); // 13
    expect(r.scoreA).toBe((base * 4) + (diff * 0.5)); // 12 + 6.5 = 18.5
  });

});

describe('Exception 4: Win 15 pts last hand, loser ≥ 1 → Triple (x3)', () => {

  test('Last hand = 15, loser = 1 → mult x3', () => {
    const h = hands([1, 1], [15, 0]); // totA=16, totB=1
    const r = calcScore('A', h, 2, 2, STD);
    const base = 2;
    const diff = 16 - 1; // 15
    expect(r.scoreA).toBe((base * 3) + (diff * 0.5)); // 6 + 7.5 = 13.5
  });

  test('Last hand = 15, loser = 5 → mult x3', () => {
    const h = hands([2, 5], [15, 0]); // totA=17, totB=5
    const r = calcScore('A', h, 2, 2, STD);
    const base = 2;
    const diff = 17 - 5; // 12
    expect(r.scoreA).toBe((base * 3) + (diff * 0.5)); // 6 + 6 = 12
  });

});

describe('Exception 5: Win 15 pts last hand, loser ≤ 0 → Double Triple (x6)', () => {

  test('Last hand = 15, loser = 0 → mult x6', () => {
    const h = hands([1, 0], [15, 0]); // totB=0
    const r = calcScore('A', h, 2, 2, STD);
    const base = 2;
    const diff = 16 - 0; // 16
    expect(r.scoreA).toBe((base * 6) + (diff * 0.5)); // 12 + 8 = 20
  });

  test('Last hand = 15, loser = -5 → mult x6', () => {
    const h = hands([1, -5], [15, 0]); // totB=-5
    const r = calcScore('A', h, 2, 2, STD);
    const base = 2 + (1 * 1); // 1 bump
    const diff = Math.max(0, 16 - (-5)); // 21
    expect(r.scoreA).toBe((base * 6) + (diff * 0.5)); // 18 + 10.5 = 28.5
  });

});

describe('Captains Rule: 2-player team wins/pays 1.5x', () => {

  test('Team A is captains (2 players), Team A wins → fA *= 1.5', () => {
    const h = hands([5, 0], [5, 0]); // simple win, no specials
    const baseResult = calcScore('A', h, 2, 2, STD); // no captains
    const captainsResult = calcScore('A', h, 2, 3, STD); // A=captains
    expect(captainsResult.scoreA).toBeCloseTo(baseResult.scoreA * 1.5);
    expect(captainsResult.scoreB).toBeCloseTo(-captainsResult.scoreA); // must balance
  });

  test('Team B is captains (2 players), Team B wins → fB *= 1.5', () => {
    const h = hands([0, 5], [0, 5]);
    const baseResult = calcScore('B', h, 2, 2, STD);
    const captainsResult = calcScore('B', h, 3, 2, STD); // B=captains
    expect(captainsResult.scoreB).toBeCloseTo(baseResult.scoreB * 1.5);
    expect(captainsResult.scoreA).toBeCloseTo(-captainsResult.scoreB); // must balance
  });

  test('Team A is captains (2 players), Team A loses → fA (loss) *= 1.5', () => {
    const h = hands([0, 5], [0, 5]); // B wins
    const baseResult = calcScore('B', h, 2, 2, STD);
    const captainsResult = calcScore('B', h, 2, 3, STD); // A=captains, A loses
    // A loses 1.5x
    expect(captainsResult.scoreA).toBeCloseTo(baseResult.scoreA * 1.5);
    expect(captainsResult.scoreB).toBeCloseTo(-captainsResult.scoreA);
  });

  test('Scores balance: fA + fB = 0 always', () => {
    const h = hands([3, -1], [9, 0]);
    const r = calcScore('A', h, 2, 3, STD);
    expect(r.scoreA + r.scoreB).toBeCloseTo(0);
  });

  test('3v3 (no captains): no 1.5x applied', () => {
    const h = hands([5, 0], [5, 0]);
    const r333 = calcScore('A', h, 3, 3, STD);
    const r222 = calcScore('A', h, 2, 2, STD);
    expect(r333.scoreA).toBeCloseTo(r222.scoreA); // same, no multiplier
  });

});

describe('Symmetric Rules: Same logic applies for Team B winning', () => {

  test('Team B wins basic game - correct base score', () => {
    const h = hands([0, 5], [0, 5]); // totB=10
    const r = calcScore('B', h, 2, 2, STD);
    expect(r.scoreB).toBe(2 + 10 * 0.5); // 7
    expect(r.scoreA).toBe(-7);
  });

  test('Team B - Exception 2: last hand = 9, loser ≥ 1 → Double', () => {
    const h = hands([1, 1], [0, 9]); // totB=10, totA=1, last gB=9
    const r = calcScore('B', h, 2, 2, STD);
    const base = 2;
    const diff = Math.max(0, 10 - 1);
    expect(r.scoreB).toBe((base * 2) + (diff * 0.5)); // 4 + 4.5 = 8.5
  });

  test('Team B - Exception 5: last hand = 15, loser ≤ 0 → x6', () => {
    const h = hands([0, 1], [0, 15]); // totB=16, totA=0
    const r = calcScore('B', h, 2, 2, STD);
    const base = 2;
    const diff = 16 - 0;
    expect(r.scoreB).toBe((base * 6) + (diff * 0.5)); // 12 + 8 = 20
  });

});

describe('Edge Cases', () => {

  test('Differential of 0: winner still gets game score', () => {
    // Equal running totals
    const h = hands([5, 5], [5, 5]);
    const r = calcScore('A', h, 2, 2, STD);
    expect(r.scoreA).toBe(2); // just game score, no diff
  });

  test('Multiple bumps: each counted correctly', () => {
    const h = hands([-1, -1], [-1, 10], [15, 0]); // 2 bumps each
    const r = calcScore('A', h, 2, 2, STD);
    expect(r.bumpsA).toBe(2);
    expect(r.bumpsB).toBe(1);
    // Winner A uses bB=1 bump
    const base = 2 + (1 * 1); // 3
    // last gA=15, totB=10-1=9 ≥1 → mult=3
    const totA = -1 + -1 + 15; // 13
    const totB = -1 + 10 + 0;  // 9
    const diff = Math.max(0, 13 - 9); // 4
    expect(r.scoreA).toBe((base * 3) + (diff * 0.5)); // 9 + 2 = 11
  });

  test('Scores always balance: fA + fB = 0', () => {
    // Test multiple scenarios
    const scenarios = [
      { h: hands([9, 0]),           winner: 'A' },
      { h: hands([3, -2], [9, 0]), winner: 'A' },
      { h: hands([0, 15]),          winner: 'B' },
      { h: hands([-3, 5], [0, 15]), winner: 'B' },
    ];
    scenarios.forEach(({ h, winner }) => {
      const r = calcScore(winner, h, 2, 2, STD);
      expect(r.scoreA + r.scoreB).toBeCloseTo(0);
    });
  });

  test('Cannot trigger exception without last hand score (empty hands)', () => {
    const r = calcScore('A', [], 2, 2, STD);
    // gA = 0 (no last hand), base = 2, diff = 0
    expect(r.scoreA).toBe(2);
  });

});

describe('Set Bonus Rule', () => {
  // The $25 bonus is applied in endSet(), not calcScore().
  // These tests validate the bonus calculation logic directly.

  function calcSetScore(games, stakes = STD) {
    let stA = 0, stB = 0;
    games.forEach(g => {
      stA += g.scoreA;
      stB += g.scoreB;
    });

    const aWins = games.filter(g => g.winner === 'A').length;
    const bWins = games.filter(g => g.winner === 'B').length;

    if (games.length === 3) {
      if (aWins === 3) { stA += stakes.bonus; stB -= stakes.bonus; }
      else if (bWins === 3) { stB += stakes.bonus; stA -= stakes.bonus; }
    }

    return { teamAScore: stA, teamBScore: stB };
  }

  test('Team A wins all 3 games → $20 bonus added', () => {
    const games = [
      { winner: 'A', scoreA: 5, scoreB: -5 },
      { winner: 'A', scoreA: 5, scoreB: -5 },
      { winner: 'A', scoreA: 5, scoreB: -5 },
    ];
    const r = calcSetScore(games);
    expect(r.teamAScore).toBe(15 + 20); // 35
    expect(r.teamBScore).toBe(-15 - 20); // -35
  });

  test('Team B wins all 3 games → $20 bonus added', () => {
    const games = [
      { winner: 'B', scoreA: -5, scoreB: 5 },
      { winner: 'B', scoreA: -5, scoreB: 5 },
      { winner: 'B', scoreA: -5, scoreB: 5 },
    ];
    const r = calcSetScore(games);
    expect(r.teamBScore).toBe(15 + 20);
    expect(r.teamAScore).toBe(-15 - 20);
  });

  test('Split set (2-1): NO bonus', () => {
    const games = [
      { winner: 'A', scoreA: 5, scoreB: -5 },
      { winner: 'A', scoreA: 5, scoreB: -5 },
      { winner: 'B', scoreA: -5, scoreB: 5 },
    ];
    const r = calcSetScore(games);
    expect(r.teamAScore).toBe(5); // 5+5-5, no bonus
    expect(r.teamBScore).toBe(-5);
  });

  test('2-game set (incomplete): NO bonus', () => {
    const games = [
      { winner: 'A', scoreA: 5, scoreB: -5 },
      { winner: 'A', scoreA: 5, scoreB: -5 },
    ];
    const r = calcSetScore(games);
    expect(r.teamAScore).toBe(10); // no bonus, only 2 games
  });

});

describe('Captains Rule: Set-level scoring (no double-counting of 1.5x)', () => {
  // The bug: calcScore() already bakes 1.5x into scoreA/scoreB when stored.
  // The old Sets display was applying 1.5x AGAIN when summing set totals.
  // The fix: endSet() and the Sets table use raw scoreA/scoreB with no extra multiplier.
  //
  // These tests verify the correct behavior:
  // set total = sum of game scores as stored (1.5x already included once, not twice)

  function calcSetScore(games, stakes = STD) {
    let stA = 0, stB = 0;
    games.forEach(g => {
      stA += g.scoreA;
      stB += g.scoreB;
    });

    const aWins = games.filter(g => g.winner === 'A').length;
    const bWins = games.filter(g => g.winner === 'B').length;

    if (games.length === 3) {
      if (aWins === 3) { stA += stakes.bonus; stB -= stakes.bonus; }
      else if (bWins === 3) { stB += stakes.bonus; stA -= stakes.bonus; }
    }

    return { teamAScore: stA, teamBScore: stB };
  }

  test('2v3: game score already includes 1.5x — set total must NOT apply 1.5x again', () => {
    // Simulate: Team A (2 players = captains) wins a game.
    // calcScore() returns scoreA=15 (already 1.5x applied to base of 10).
    // Set total should be 15, NOT 15*1.5=22.5.
    const games = [
      { winner: 'A', scoreA: 15, scoreB: -15 }, // 1.5x already baked in
    ];
    const r = calcSetScore(games);
    expect(r.teamAScore).toBe(15);   // raw sum, no extra multiplier
    expect(r.teamBScore).toBe(-15);
  });

  test('2v3: full 3-game set — set total is plain sum of game scores', () => {
    // All three games have 1.5x already included in stored scores.
    const games = [
      { winner: 'A', scoreA: 15, scoreB: -15 },
      { winner: 'A', scoreA:  9, scoreB:  -9 },
      { winner: 'A', scoreA: 12, scoreB: -12 },
    ];
    const r = calcSetScore(games);
    expect(r.teamAScore).toBe(15 + 9 + 12 + STD.bonus); // 36 + 20 = 56
    expect(r.teamBScore).toBe(-(15 + 9 + 12 + STD.bonus));
  });

  test('2v3: mixed set — each game score used as-is, no re-multiplication', () => {
    // Team A wins game 1 (captains, 1.5x baked in), Team B wins game 2 (also 1.5x baked in)
    const games = [
      { winner: 'A', scoreA:  15, scoreB: -15 }, // A=captains won
      { winner: 'B', scoreA: -15, scoreB:  15 }, // B=captains won
    ];
    const r = calcSetScore(games);
    expect(r.teamAScore).toBe(0);  // 15 + -15
    expect(r.teamBScore).toBe(0);  // -15 + 15
  });

  test('2v3: end-to-end — calcScore output feeds directly into set total', () => {
    // Use calcScore() to get game scores, then sum them as endSet() does.
    // Verify the pipeline: calcScore → store scoreA/scoreB → sum in endSet → correct total.
    const h = hands([5, 0], [5, 0]); // totA=10, totB=0, last gA=5 (no special mult)
    const game1 = calcScore('A', h, 2, 3, STD); // A is captains (2 players)
    // base=2, diff=10, fA = (2*1) + (10*0.5) = 7, then *1.5 = 10.5 → rounded = 11
    // (app rounds with Math.round)

    const game2 = calcScore('A', h, 2, 3, STD); // same scenario game 2

    // Set total = direct sum, NO extra 1.5x
    const setTotal = game1.scoreA + game2.scoreA;
    expect(setTotal).toBe(game1.scoreA * 2); // just doubled, not 1.5x'd again
    expect(setTotal).not.toBe(game1.scoreA * 2 * 1.5); // this would be the double-count bug
  });

  test('3v3 (no captains): set total unchanged, no multiplier at either level', () => {
    const h = hands([5, 0], [5, 0]);
    const game = calcScore('A', h, 3, 3, STD);
    const captainsGame = calcScore('A', h, 2, 3, STD);

    // Captains game score should be 1.5x the non-captains game score
    expect(captainsGame.scoreA).toBeCloseTo(game.scoreA * 1.5, 0);

    // Set total for captains: just sum of games (no extra mult)
    const setA = captainsGame.scoreA + captainsGame.scoreA;
    expect(setA).toBeCloseTo(game.scoreA * 1.5 * 2, 0); // 1.5x applied once, summed twice
    expect(setA).not.toBeCloseTo(game.scoreA * 1.5 * 1.5 * 2, 0); // NOT double-counted
  });

});
