import { test, expect } from '@playwright/test';
import 'dotenv/config';

// ─── Test Data Sets ────────────────────────────────────────────────────────────
const DATASETS = {
  dataset1: {
    name: "Standard 3-game set, Team A dominant",
    teamA: ["Fred", "Joe"],
    teamB: ["Larry", "Sal"],
    dealers: ["Fred", "Sal", "Joe", "Larry"],
    games: [
      { hands: [{ scoreA: 4, scoreB: -2 }, { scoreA: 4, scoreB: -2 }, { scoreA: 4, scoreB: -2 }], expectedWinner: "TeamA" },
      { hands: [{ scoreA: 4, scoreB: -2 }, { scoreA: 4, scoreB: -2 }, { scoreA: 4, scoreB: -2 }], expectedWinner: "TeamA" },
      { hands: [{ scoreA: 4, scoreB: -2 }, { scoreA: 4, scoreB: -2 }, { scoreA: 4, scoreB: -2 }], expectedWinner: "TeamA" },
    ]
  },

  dataset2: {
    name: "Competitive set, Team B wins",
    teamA: ["Fred", "Floyd"],
    teamB: ["Larry", "Sal"],
    dealers: ["Larry", "Fred", "Sal", "Floyd"],
    games: [
      { hands: [{ scoreA: -2, scoreB: 4 }, { scoreA: -2, scoreB: 4 }, { scoreA: -2, scoreB: 4 }], expectedWinner: "TeamB" },
      { hands: [{ scoreA: -2, scoreB: 4 }, { scoreA: -2, scoreB: 4 }, { scoreA: -2, scoreB: 4 }], expectedWinner: "TeamB" },
      { hands: [{ scoreA: -2, scoreB: 4 }, { scoreA: -2, scoreB: 4 }, { scoreA: -2, scoreB: 4 }], expectedWinner: "TeamB" },
    ]
  },

  dataset3: {
    name: "Mixed results with bumps",
    teamA: ["Joe", "Sal"],
    teamB: ["Fred", "Larry"],
    dealers: ["Joe", "Fred", "Sal", "Larry"],
    games: [
      { hands: [{ scoreA: 6, scoreB: -3 }, { scoreA: -3, scoreB: 6 }, { scoreA: 6, scoreB: -3 }, { scoreA: 6, scoreB: -3 }], expectedWinner: "TeamA" },
      { hands: [{ scoreA: -3, scoreB: 6 }, { scoreA: -3, scoreB: 6 }, { scoreA: -3, scoreB: 6 }], expectedWinner: "TeamB" },
      { hands: [{ scoreA: 6, scoreB: -3 }, { scoreA: 6, scoreB: -3 }, { scoreA: 6, scoreB: -3 }], expectedWinner: "TeamA" },
    ]
  }
};

// ─── Helper: Login ─────────────────────────────────────────────────────────────
async function login(page) {
  await page.goto(process.env.APP_URL || 'https://willowy-maamoul-acd996.netlify.app/');
  await page.locator('input[type="email"]').fill(process.env.TEST_EMAIL || '');
  await page.locator('input[type="password"]').fill(process.env.TEST_PASSWORD || '');
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL('**/', { timeout: 10000 });
  console.log('✅ Logged in');
}

// ─── Helper: Select Teams ──────────────────────────────────────────────────────
async function selectTeams(page, teamA, teamB) {
  console.log(`  Setting up teams: A=[${teamA}] B=[${teamB}]`);

  await page.getByRole('button', { name: 'players' }).click();
  await page.waitForTimeout(500);

  const allPlayers = ['Fred', 'Joe', 'Larry', 'Sal', 'Floyd'];

  // Reset everyone to unassigned first
  for (const player of allPlayers) {
    for (let i = 0; i < 3; i++) {
      const el = page.locator('div').filter({ hasText: new RegExp(`^${player}(Team A|Team B)?$`) }).first();
      const text = await el.textContent().catch(() => '');
      if (text.includes('Team A') || text.includes('Team B')) {
        await el.click();
        await page.waitForTimeout(200);
      } else {
        break;
      }
    }
  }

  // Assign Team A (1 click = Team A)
  for (const player of teamA) {
    await page.locator('div').filter({ hasText: new RegExp(`^${player}$`) }).first().click();
    await page.waitForTimeout(300);
  }

  // Assign Team B (None -> Team A -> Team B)
  for (const player of teamB) {
    await page.locator('div').filter({ hasText: new RegExp(`^${player}$`) }).first().click(); // -> Team A
    await page.waitForTimeout(200);
    await page.getByText(`${player}Team A`).click(); // -> Team B
    await page.waitForTimeout(300);
  }

  console.log('  ✅ Teams assigned');
}

// ─── Helper: Select Dealers ────────────────────────────────────────────────────
async function selectDealers(page, dealers) {
  console.log(`  Setting dealers: [${dealers}]`);

  await page.getByRole('button', { name: 'game' }).click();
  await page.waitForTimeout(500);

  await page.getByRole('button', { name: 'Select Dealers' }).click();
  await page.waitForTimeout(500);

  for (const dealer of dealers) {
    await page.locator('span').filter({ hasText: new RegExp(`^${dealer}$`) }).first().click();
    await page.waitForTimeout(300);
  }

  await page.getByRole('button', { name: 'Confirm' }).click();
  await page.waitForTimeout(500);

  console.log('  ✅ Dealers selected');
}

// ─── Helper: Enter a single hand score ────────────────────────────────────────
async function enterHand(page, scoreA, scoreB, handIndex) {
  console.log(`    Hand ${handIndex + 1}: A=${scoreA}, B=${scoreB}`);

  await page.getByRole('button', { name: 'Add Score' }).first().click();
  await page.waitForTimeout(500);

  await page.getByRole('spinbutton').first().fill(String(scoreA));
  await page.waitForTimeout(200);
  await page.getByRole('spinbutton').nth(1).fill(String(scoreB));
  await page.waitForTimeout(200);

  await page.getByRole('button', { name: 'Add Score' }).nth(1).click();
  await page.waitForTimeout(500);
}

// ─── Helper: End Game ─────────────────────────────────────────────────────────
async function endGame(page, expectedWinner) {
  await page.getByRole('button', { name: 'End Game' }).click();
  await page.waitForTimeout(500);

  if (expectedWinner === 'TeamA') {
    await page.getByRole('button', { name: 'Team A Wins' }).click();
  } else {
    await page.getByRole('button', { name: 'Team B Wins' }).click();
  }

  await page.waitForTimeout(1000);
  console.log(`  ✅ Game ended — ${expectedWinner} wins`);
}

// ─── Helper: End Set ──────────────────────────────────────────────────────────
async function endSet(page) {
  const endSetBtn = page.getByRole('button', { name: /end set/i });
  if (await endSetBtn.isVisible()) {
    await endSetBtn.click();
    await page.waitForTimeout(500);
    const confirmBtn = page.getByRole('button', { name: /confirm|yes|ok/i });
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
      await page.waitForTimeout(500);
    }
  }
  console.log('✅ Set ended');
}

// ─── Helper: End Session & Update Leaderboard ─────────────────────────────────
async function endSession(page) {
  const endSessionBtn = page.getByRole('button', { name: /end session/i });
  if (await endSessionBtn.isVisible()) {
    await endSessionBtn.click();
    await page.waitForTimeout(500);
    const confirmBtn = page.getByRole('button', { name: /confirm|yes|ok/i });
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
      await page.waitForTimeout(500);
    }
  }

  const leaderboardBtn = page.getByRole('button', { name: /leaderboard|update/i });
  if (await leaderboardBtn.isVisible()) {
    await leaderboardBtn.click();
    await page.waitForTimeout(1000);
  }

  console.log('✅ Session ended & leaderboard updated');
}

// ─── Main Tests ────────────────────────────────────────────────────────────────
for (const [datasetKey, dataset] of Object.entries(DATASETS)) {
  test(`Pitch Simulation - ${dataset.name}`, async ({ page }) => {
    test.setTimeout(180000);

    console.log(`\n🃏 Starting: ${dataset.name}`);

    await login(page);
    await selectTeams(page, dataset.teamA, dataset.teamB);
    await selectDealers(page, dataset.dealers);

    for (let gameIdx = 0; gameIdx < dataset.games.length; gameIdx++) {
      const game = dataset.games[gameIdx];
      console.log(`\n  🎮 Game ${gameIdx + 1}`);

      for (let handIdx = 0; handIdx < game.hands.length; handIdx++) {
        await enterHand(page, game.hands[handIdx].scoreA, game.hands[handIdx].scoreB, handIdx);
      }

      await endGame(page, game.expectedWinner);
    }

    await endSet(page);
    await page.screenshot({ path: `test-results/${datasetKey}-complete.png` });

    console.log(`\n✅ COMPLETED: ${dataset.name}`);
  });
}

// ─── DB Verification Test ──────────────────────────────────────────────────────
test('Verify scoring calculations in database', async ({ page }) => {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://lhlnjggrljdgmytmoaqb.supabase.co';
  const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

  const response = await page.request.get(
    `${supabaseUrl}/rest/v1/games?select=id,winner,score_a,score_b&completed_at=not.is.null&order=id.desc&limit=20`,
    {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    }
  );

  const games = await response.json();
  console.log(`\n📊 Checking ${games.length} completed games from DB:`);

  let passCount = 0;
  let failCount = 0;

  for (const game of games) {
    const scoreA = parseFloat(game.score_a);
    const scoreB = parseFloat(game.score_b);
    const expectedWinner = scoreA > scoreB ? 'A' : 'B';
    const winnerMatch = game.winner === expectedWinner;

    if (winnerMatch) {
      passCount++;
      console.log(`  ✅ Game ${game.id}: Winner=${game.winner}, A=${scoreA}, B=${scoreB}`);
    } else {
      failCount++;
      console.log(`  ❌ Game ${game.id}: Expected=${expectedWinner}, Got=${game.winner}, A=${scoreA}, B=${scoreB}`);
    }

    expect(game.winner).toBe(expectedWinner);
  }

  console.log(`\nResults: ${passCount} passed, ${failCount} failed`);
});
