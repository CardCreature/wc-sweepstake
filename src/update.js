/**
 * WORLD CUP 2026 SWEEPSTAKE ENGINE
 * Fetches match data from API-Football, evaluates achievement rules,
 * maintains state in data/state.json and publishes docs/data.json for the dashboard.
 *
 * Run: API_FOOTBALL_KEY=xxx node src/update.js
 */

const fs = require("fs");
const path = require("path");

const API = "https://v3.football.api-sports.io";
const LEAGUE = 1; // FIFA World Cup
const SEASON = 2026;
const KEY = process.env.API_FOOTBALL_KEY;

const ROOT = path.join(__dirname, "..");
const STATE_FILE = path.join(ROOT, "data", "state.json");
const DATA_FILE = path.join(ROOT, "docs", "data.json");
const PARTICIPANTS_FILE = path.join(ROOT, "config", "participants.json");
const RULINGS_FILE = path.join(ROOT, "config", "rulings.json");

// ---------------------------------------------------------------------------
// Achievement definitions
// kind: "first" (green, first-to-happen) | "long" (blue, awarded after final)
// mode: "auto" (engine awards it) | "review" (engine flags candidates, Tom rules)
//       | "manual" (no detection possible — Tom claims via rulings.json)
// ---------------------------------------------------------------------------
const ACHIEVEMENTS = [
  { id: "masterclass",    kind: "first", mode: "auto",   emoji: "🧠", name: "Jose & Arteta Masterclass", desc: "First team to win with under 30% possession." },
  { id: "vinnie",         kind: "first", mode: "auto",   emoji: "🦵", name: "The Vinnie Jones Entrance", desc: "First sub booked within 5 minutes of coming on." },
  { id: "fergie",         kind: "first", mode: "auto",   emoji: "⏱️", name: "The Fergie Sandwich", desc: "First team to score in 45+ and 90+ stoppage time in the same match." },
  { id: "warnock",        kind: "first", mode: "auto",   emoji: "🟨", name: "Neil Warnock Would Be Proud", desc: "First team with 5+ yellow cards in a match." },
  { id: "clutch",         kind: "first", mode: "auto",   emoji: "🧊", name: "Clutch Gene", desc: "First team to win a knockout match after trailing." },
  { id: "great_escape",   kind: "first", mode: "review", emoji: "🪂", name: "The Great Escape", desc: "First team to score 90'+ to avoid elimination." },
  { id: "streets",        kind: "first", mode: "auto",   emoji: "👴", name: "The Streets Won't Forget", desc: "First scorer aged 35 or over." },
  { id: "smash_grab",     kind: "first", mode: "auto",   emoji: "🛍️", name: "Smash & Grab", desc: "First team to win with fewer shots than their opponent." },
  { id: "early_bath",     kind: "first", mode: "review", emoji: "👔", name: "Early Bath (Suit Edition)", desc: "First coach / bench staff sent off." },
  { id: "check_complete", kind: "first", mode: "review", emoji: "📺", name: "Check Complete", desc: "First player sent off after a VAR review." },
  { id: "double_trouble", kind: "first", mode: "auto",   emoji: "🟨🟨", name: "Double Trouble", desc: "First red card for two yellows." },
  { id: "leadership",     kind: "first", mode: "review", emoji: "🎖️", name: "Leadership Qualities", desc: "First captain booked for dissent." },
  { id: "ghost_squad",    kind: "first", mode: "auto",   emoji: "👻", name: "Ghost Squad", desc: "First team to win with exactly one shot on target." },
  { id: "character",      kind: "first", mode: "auto",   emoji: "💪", name: "We Showed Great Character", desc: "First team to win after trailing in the 80th minute (normal time)." },
  { id: "beach",          kind: "first", mode: "review", emoji: "👕", name: "You've Been On The Beach Already", desc: "First booking for shirt removal in a celebration." },
  { id: "wasted_journey", kind: "first", mode: "auto",   emoji: "🚌", name: "Wasted Journey", desc: "First sub to be subbed off (normal time)." },
  { id: "barclays",       kind: "first", mode: "auto",   emoji: "🛡️", name: "Peak Barclays", desc: "First defender to score a brace." },
  { id: "hat_trick",      kind: "first", mode: "auto",   emoji: "🎩", name: "First Hat-Trick", desc: "First hat-trick of the tournament." },
  { id: "welly",          kind: "first", mode: "manual", emoji: "🚀", name: "F**king Welly It!", desc: "First goal from 35+ yards. (Tom verifies distance.)" },
  { id: "goaliazio",      kind: "first", mode: "auto",   emoji: "🍝", name: "Goaliazio", desc: "First win in a 7+ goal match (normal time)." },
  { id: "hows_your_luck", kind: "first", mode: "review", emoji: "🍀", name: "How's Your Luck?", desc: "First team to hit woodwork, miss a pen and not score (normal time)." },
  { id: "thrones",        kind: "first", mode: "auto",   emoji: "🐉", name: "Game of Thrones", desc: "First match with 3+ lead changes — team scoring the final lead-change goal wins." },
  { id: "redemption",     kind: "first", mode: "auto",   emoji: "📈", name: "Redemption Arc", desc: "First player to score after previously missing a penalty." },
  { id: "sorry",          kind: "first", mode: "auto",   emoji: "🙏", name: "Sorry About That", desc: "First own-goal scorer to later score at the right end." },
  { id: "giant_killer",   kind: "long",  mode: "auto",   emoji: "🗡️", name: "Giant Killer", desc: "Lowest FIFA-ranked nation to reach the knockouts." },
  { id: "agent_chaos",    kind: "long",  mode: "auto",   emoji: "🤡", name: "Agent Chaos", desc: "Team involved in the most own goals." },
  { id: "blink",          kind: "long",  mode: "auto",   emoji: "⚡", name: "Blink And You'll Miss It", desc: "Fastest goal of the tournament." },
  { id: "better_late",    kind: "long",  mode: "auto",   emoji: "🌙", name: "Better Late Than Never", desc: "Latest normal-time goal of the tournament." },
  { id: "sieve",          kind: "long",  mode: "auto",   emoji: "🕳️", name: "The Sieve", desc: "Team that conceded the most goals across the tournament." },
  { id: "nice_to_see_you",kind: "long",  mode: "auto",   emoji: "🚪", name: "It's Nice To See You Here, Now F*** Off", desc: "Earliest substitution of the tournament." },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}
function writeJson(file, obj) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(obj, null, 2));
}
async function apiGet(endpoint, params) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API}${endpoint}?${qs}`, { headers: { "x-apisports-key": KEY } });
  if (!res.ok) throw new Error(`API ${endpoint} ${res.status}`);
  const body = await res.json();
  if (body.errors && Object.keys(body.errors).length) {
    throw new Error(`API error: ${JSON.stringify(body.errors)}`);
  }
  return body.response;
}
// total elapsed including stoppage, e.g. 90+4 -> 94, but keep both parts
function evTime(ev) {
  return { elapsed: ev.time.elapsed ?? 0, extra: ev.time.extra ?? 0, total: (ev.time.elapsed ?? 0) + (ev.time.extra ?? 0) };
}
function isShootout(ev) {
  return (ev.comments || "").toLowerCase().includes("penalty shootout");
}
function isGoalEvent(ev) {
  return ev.type === "Goal" && ev.detail !== "Missed Penalty" && !isShootout(ev);
}
function isKnockout(fx) {
  const r = (fx.league.round || "").toLowerCase();
  return !r.includes("group");
}
function minuteLabel(ev) {
  const t = evTime(ev);
  return t.extra ? `${t.elapsed}+${t.extra}'` : `${t.elapsed}'`;
}
function statVal(stats, teamId, type) {
  const block = (stats || []).find(s => s.team.id === teamId);
  if (!block) return null;
  const item = (block.statistics || []).find(x => x.type === type);
  if (!item || item.value == null) return null;
  return typeof item.value === "string" ? parseFloat(item.value) : item.value;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  if (!KEY) throw new Error("API_FOOTBALL_KEY env var not set");

  const state = readJson(STATE_FILE, {
    processedFixtures: [],   // finished fixture ids fully scored
    claims: {},              // achievementId -> claim object
    candidates: {},          // candidateKey -> candidate object (awaiting Tom)
    playerAges: {},          // playerId -> age (cached lookups)
    missedPens: [],          // {playerId, playerName, team, fixtureId, when}
    ownGoalScorers: [],      // {playerId, playerName, team, fixtureId}
    goals: [],               // every NT/ET goal: {fixtureId, date, teamId, teamName, player, minute, sortKey}
    long: {},                // tournament-long trackers
    ownGoalInvolvement: {},  // teamName -> count
    tournamentComplete: false,
  });
  const participants = readJson(PARTICIPANTS_FILE, { teams: {}, fifaRankings: {} });
  const rulings = readJson(RULINGS_FILE, { confirm: [], reject: [], manualClaims: {} });
  let apiCalls = 0;

  // 1. All fixtures (one call)
  const fixtures = await apiGet("/fixtures", { league: LEAGUE, season: SEASON }); apiCalls++;
  fixtures.sort((a, b) => new Date(a.fixture.date) - new Date(b.fixture.date));

  // Auto-populate participants file with team names on first sight
  const aliases = { "Czechia": "Czech Republic" };
  let teamsAdded = false;
  for (const fx of fixtures) {
    for (const side of ["home", "away"]) {
      let name = fx.teams[side].name;
      if (name && aliases[name]) name = aliases[name];
      if (name && !(name in participants.teams) && !name.toLowerCase().includes("winner") && !name.toLowerCase().includes("runner")) {
        participants.teams[name] = ""; teamsAdded = true;
      }
    }
  }
  if (teamsAdded) writeJson(PARTICIPANTS_FILE, participants);

  // 2. Fixtures needing processing: finished & not yet processed, or currently live
  const FINISHED = ["FT", "AET", "PEN"];
  const LIVE = ["1H", "HT", "2H", "ET", "BT", "P"];
  const toProcess = fixtures.filter(fx =>
    (FINISHED.includes(fx.fixture.status.short) && !state.processedFixtures.includes(fx.fixture.id)) ||
    LIVE.includes(fx.fixture.status.short)
  ).slice(0, 12); // safety cap per run

  for (const fxLite of toProcess) {
    const detail = await apiGet("/fixtures", { id: fxLite.fixture.id }); apiCalls++;
    const fx = detail[0];
    if (!fx) continue;
    const finished = FINISHED.includes(fx.fixture.status.short);
    await scoreFixture(fx, state, finished, () => apiCalls++);
    if (finished) state.processedFixtures.push(fx.fixture.id);
  }

  // 3. Apply Tom's rulings (confirm/reject candidates, manual claims)
  applyRulings(state, rulings);

  // 4. Tournament-long awards finalise after the final
  const finalFx = fixtures.find(fx => (fx.league.round || "").toLowerCase() === "final");
  state.tournamentComplete = !!(finalFx && FINISHED.includes(finalFx.fixture.status.short));
  if (state.tournamentComplete) finaliseLongAwards(state, participants);

  // 5. Butterfly Effect pot + goal mapping
  const butterfly = computeButterfly(state, participants);

  // 6. Publish dashboard data
  publish(state, participants, fixtures, butterfly, rulings);
  writeJson(STATE_FILE, state);
  console.log(`Done. API calls used this run: ${apiCalls}. Claims: ${Object.keys(state.claims).length}. Pending rulings: ${Object.values(state.candidates).filter(c => c.status === "pending").length}.`);
}

// ---------------------------------------------------------------------------
// Score a single fixture against all rules
// ---------------------------------------------------------------------------
async function scoreFixture(fx, state, finished, countCall) {
  const fid = fx.fixture.id;
  const events = (fx.events || []).filter(e => !isShootout(e));
  const home = fx.teams.home, away = fx.teams.away;
  const matchLabel = `${home.name} v ${away.name}`;
  const winner = home.winner ? home : away.winner ? away : null; // includes pens/ET winner

  // --- build chronological goal timeline (normal + extra time) ---
  const goalEvents = events.filter(isGoalEvent).sort((a, b) => evTime(a).total - evTime(b).total || (evTime(a).elapsed - evTime(b).elapsed));
  const timeline = []; // {teamId, minute info, score after}
  let hs = 0, as = 0;
  for (const g of goalEvents) {
    if (g.team.id === home.id) hs++; else if (g.team.id === away.id) as++;
    timeline.push({ ev: g, hs, as });
  }

  // record goals for Butterfly / fastest / latest — re-derive this fixture's goals every run
  // so live matches update in real time and VAR cancellations get reflected on next refresh.
  // Protective check: if the API briefly returns empty events (happens right after FT while
  // stats are computing), don't wipe existing goals for this fixture.
  const existingForFid = state.goals.filter(g => g.fixtureId === fid).length;
  if (timeline.length > 0 || existingForFid === 0) {
    state.goals = state.goals.filter(g => g.fixtureId !== fid);
    for (const t of timeline) {
      const g = t.ev, tm = evTime(g);
      state.goals.push({
        fixtureId: fid, date: fx.fixture.date, teamId: g.team.id, teamName: g.team.name,
        player: g.player?.name || "Unknown", minute: minuteLabel(g),
        elapsed: tm.elapsed, extra: tm.extra,
        sortKey: `${fx.fixture.date}|${String(tm.total).padStart(3, "0")}|${String(tm.elapsed).padStart(3, "0")}`,
      });
    }
    state.goals.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }

  const claimIfFirst = (id, team, detail) => {
    if (state.claims[id]) return;
    state.claims[id] = { achievementId: id, team, detail, match: matchLabel, fixtureId: fid, date: fx.fixture.date, awardedBy: "auto", claimedAt: new Date().toISOString() };
    console.log(`CLAIMED ${id}: ${team} — ${detail}`);
  };
  const flag = (id, team, detail) => {
    const key = `${id}|${fid}|${team}`;
    if (state.candidates[key] || state.claims[id]) return;
    state.candidates[key] = { key, achievementId: id, team, detail, match: matchLabel, fixtureId: fid, date: fx.fixture.date, status: "pending" };
    console.log(`REVIEW ${id}: ${team} — ${detail}`);
  };

  // Stats-based rules need the match finished + statistics present
  if (finished && winner && fx.statistics?.length) {
    const wId = winner.id, lId = winner.id === home.id ? away.id : home.id;
    const poss = statVal(fx.statistics, wId, "Ball Possession");
    if (poss != null && poss < 30) claimIfFirst("masterclass", winner.name, `Won with ${poss}% possession`);
    const wShots = statVal(fx.statistics, wId, "Total Shots"), lShots = statVal(fx.statistics, lId, "Total Shots");
    if (wShots != null && lShots != null && wShots < lShots) claimIfFirst("smash_grab", winner.name, `Won with ${wShots} shots to ${lShots}`);
    const sot = statVal(fx.statistics, wId, "Shots on Goal");
    if (sot === 1) claimIfFirst("ghost_squad", winner.name, `Won with exactly 1 shot on target`);
  }

  // Cards
  const cards = events.filter(e => e.type === "Card");
  for (const team of [home, away]) {
    const yellows = cards.filter(c => c.team.id === team.id && c.detail === "Yellow Card").length;
    if (finished && yellows >= 5) claimIfFirst("warnock", team.name, `${yellows} yellow cards in one match`);
  }
  for (const c of cards) {
    if (c.detail === "Second Yellow card") claimIfFirst("double_trouble", c.team.name, `${c.player?.name || "Player"} sent off for two yellows (${minuteLabel(c)})`);
    if ((c.detail === "Red Card" || c.detail === "Second Yellow card")) {
      // VAR-adjacent red: a Var event within 3 minutes before the card
      const t = evTime(c).total;
      const varNearby = events.some(v => v.type === "Var" && Math.abs(evTime(v).total - t) <= 3);
      if (varNearby) flag("check_complete", c.team.name, `${c.player?.name || "Player"} red card near a VAR review (${minuteLabel(c)}) — confirm it followed the review`);
    }
    if ((c.detail === "Red Card") && !c.player?.id) {
      flag("early_bath", c.team.name, `Red card with no player listed (${minuteLabel(c)}) — likely bench/coaching staff: "${c.comments || c.player?.name || "unnamed"}"`);
    }
  }

  // Captains & shirt-removal candidates need the players block
  const captains = new Set();
  const defenders = new Set();
  for (const tp of fx.players || []) {
    for (const p of tp.players || []) {
      const g = p.statistics?.[0]?.games;
      if (g?.captain) captains.add(p.player.id);
      if ((g?.position || "") === "D") defenders.add(p.player.id);
    }
  }
  for (const c of cards) {
    if (c.detail === "Yellow Card" && c.player?.id && captains.has(c.player.id)) {
      flag("leadership", c.team.name, `Captain ${c.player.name} booked (${minuteLabel(c)}) — confirm it was for dissent`);
    }
    // booked within 2 mins of scoring -> possible shirt-off celebration
    if (c.detail === "Yellow Card" && c.player?.id) {
      const scoredJustBefore = goalEvents.some(g => g.player?.id === c.player.id && evTime(c).total - evTime(g).total >= 0 && evTime(c).total - evTime(g).total <= 2);
      if (scoredJustBefore) flag("beach", c.team.name, `${c.player.name} booked right after scoring (${minuteLabel(c)}) — confirm shirt removal`);
    }
  }

  // Substitution rules
  const subs = events.filter(e => e.type === "subst").sort((a, b) => evTime(a).total - evTime(b).total);
  // API-Football: player = player going OFF, assist = player coming ON
  const cameOnAt = {}; // playerId -> total minute
  for (const s of subs) {
    const onP = s.assist, offP = s.player, t = evTime(s);
    if (onP?.id) cameOnAt[onP.id] = t.total;
    if (offP?.id && cameOnAt[offP.id] != null && t.elapsed <= 90) {
      claimIfFirst("wasted_journey", s.team.name, `${offP.name} subbed on (${cameOnAt[offP.id]}') then off (${minuteLabel(s)})`);
    }
    // tournament-long: earliest sub (exclude half-time reshuffles at minute 45)
    if (t.elapsed !== 45 || t.extra > 0) {
      trackLong(state, "nice_to_see_you", t.total, "min", {
        team: s.team.name, detail: `${offP?.name || "Player"} off ${minuteLabel(s)} (${matchLabel})`, value: t.total, display: minuteLabel(s),
      });
    }
  }
  for (const c of cards) {
    if (c.detail === "Yellow Card" && c.player?.id && cameOnAt[c.player.id] != null) {
      const gap = evTime(c).total - cameOnAt[c.player.id];
      if (gap >= 0 && gap <= 5) claimIfFirst("vinnie", c.team.name, `${c.player.name} booked ${gap} min after coming on (${minuteLabel(c)})`);
    }
  }

  // Stoppage-time sandwich, scorer-based rules
  const scorerGoals = {}; // playerId -> [{ev}]
  for (const g of goalEvents) {
    if (g.player?.id) (scorerGoals[g.player.id] = scorerGoals[g.player.id] || []).push(g);
  }
  for (const team of [home, away]) {
    const tg = goalEvents.filter(g => g.team.id === team.id);
    const fhStoppage = tg.some(g => evTime(g).elapsed === 45 && evTime(g).extra > 0);
    const shStoppage = tg.some(g => evTime(g).elapsed === 90 && evTime(g).extra > 0);
    if (fhStoppage && shStoppage) claimIfFirst("fergie", team.name, `Scored in 45+ and 90+ stoppage time`);
  }
  for (const [pid, gs] of Object.entries(scorerGoals)) {
    const proper = gs.filter(g => g.detail !== "Own Goal");
    if (proper.length >= 3) claimIfFirst("hat_trick", proper[0].team.name, `${proper[0].player.name} hat-trick (${proper.map(minuteLabel).join(", ")})`);
    if (proper.length >= 2 && defenders.has(Number(pid))) claimIfFirst("barclays", proper[0].team.name, `Defender ${proper[0].player.name} scored a brace`);
  }

  // 35+ scorer — lazy age lookup (cached)
  if (!state.claims["streets"]) {
    for (const g of goalEvents) {
      if (g.detail === "Own Goal" || !g.player?.id) continue;
      if (state.playerAges[g.player.id] == null) {
        try {
          const pr = await apiGet("/players", { id: g.player.id, season: SEASON }); countCall();
          state.playerAges[g.player.id] = pr?.[0]?.player?.age ?? -1;
        } catch { state.playerAges[g.player.id] = -1; }
      }
      const age = state.playerAges[g.player.id];
      if (age >= 35) { claimIfFirst("streets", g.team.name, `${g.player.name} (${age}) scored (${minuteLabel(g)})`); break; }
    }
  }

  // Missed penalties + redemption arc + own-goal redemption (cross-match memory)
  for (const ev of events) {
    if (ev.type === "Goal" && ev.detail === "Missed Penalty" && ev.player?.id) {
      if (!state.missedPens.some(m => m.playerId === ev.player.id && m.fixtureId === fid && m.minute === minuteLabel(ev))) {
        state.missedPens.push({ playerId: ev.player.id, playerName: ev.player.name, team: ev.team.name, fixtureId: fid, minute: minuteLabel(ev), date: fx.fixture.date });
      }
    }
  }
  // shootout misses count too
  for (const ev of (fx.events || []).filter(isShootout)) {
    if (ev.type === "Goal" && ev.detail === "Missed Penalty" && ev.player?.id) {
      if (!state.missedPens.some(m => m.playerId === ev.player.id && m.fixtureId === fid && m.minute === "shootout")) {
        state.missedPens.push({ playerId: ev.player.id, playerName: ev.player.name, team: ev.team.name, fixtureId: fid, minute: "shootout", date: fx.fixture.date });
      }
    }
  }
  for (const g of goalEvents) {
    if (g.detail === "Own Goal" || !g.player?.id) continue;
    const priorMiss = state.missedPens.find(m => m.playerId === g.player.id && (m.date < fx.fixture.date || (m.fixtureId === fid && true)));
    if (priorMiss && !(priorMiss.fixtureId === fid && priorMiss.minute === minuteLabel(g))) {
      claimIfFirst("redemption", g.team.name, `${g.player.name} scored after missing a penalty (${priorMiss.minute === "shootout" ? "shootout miss" : "missed pen " + priorMiss.minute})`);
    }
  }
  for (const g of goalEvents) {
    if (g.detail === "Own Goal" && g.player?.id) {
      // own goal: credited team is g.team; scorer plays for the OTHER team
      const scorerTeam = g.team.id === home.id ? away.name : home.name;
      if (!state.ownGoalScorers.some(o => o.playerId === g.player.id)) {
        state.ownGoalScorers.push({ playerId: g.player.id, playerName: g.player.name, team: scorerTeam, fixtureId: fid, date: fx.fixture.date });
      }
    }
  }
  // Re-derive own goal events per fixture (only when finished, to avoid live-VAR phantoms)
  if (finished) {
    state.ownGoalEvents = (state.ownGoalEvents || []).filter(e => e.fixtureId !== fid);
    for (const g of goalEvents) {
      if (g.detail === "Own Goal" && g.player?.id) {
        const scorerTeam = g.team.id === home.id ? away.name : home.name;
        state.ownGoalEvents.push({ fixtureId: fid, creditedTeam: g.team.name, scorerTeam });
      }
    }
    // Recompute ownGoalInvolvement from scratch each time — self-correcting
    state.ownGoalInvolvement = {};
    for (const e of state.ownGoalEvents) {
      state.ownGoalInvolvement[e.creditedTeam] = (state.ownGoalInvolvement[e.creditedTeam] || 0) + 1;
      state.ownGoalInvolvement[e.scorerTeam] = (state.ownGoalInvolvement[e.scorerTeam] || 0) + 1;
    }
    // Update Agent Chaos live leader
    const ag = Object.entries(state.ownGoalInvolvement).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    if (ag.length) {
      const topVal = ag[0][1];
      const topTeams = ag.filter(([, v]) => v === topVal).map(([t]) => t);
      state.long.agent_chaos = {
        score: -topVal, team: topTeams[0],
        detail: topTeams.length > 1
          ? `Joint leaders (${topTeams.join(", ")}) — ${topVal} own goal(s) each`
          : `${topVal} own goal(s) involved in`,
        tied: topTeams.length > 1,
      };
    } else {
      delete state.long.agent_chaos;
    }
  }
  for (const g of goalEvents) {
    if (g.detail !== "Own Goal" && g.player?.id) {
      const og = state.ownGoalScorers.find(o => o.playerId === g.player.id);
      if (og && (og.date <= fx.fixture.date)) {
        // ensure the proper goal isn't before the own goal in the same match
        const sameMatch = og.fixtureId === fid;
        const ogEv = sameMatch ? goalEvents.find(x => x.detail === "Own Goal" && x.player?.id === g.player.id) : null;
        if (!sameMatch || (ogEv && evTime(g).total > evTime(ogEv).total)) {
          claimIfFirst("sorry", g.team.name, `${g.player.name} scored at the right end after an earlier own goal`);
        }
      }
    }
  }

  // The Sieve — track conceded per fixture, then aggregate (supports live updates)
  if (fx.goals?.home != null && fx.goals?.away != null) {
    state.concededByMatch = state.concededByMatch || {};
    state.concededByMatch[fid] = {
      [home.name]: fx.goals.away || 0,
      [away.name]: fx.goals.home || 0,
    };
    state.conceded = {};
    for (const m of Object.values(state.concededByMatch)) {
      for (const [team, n] of Object.entries(m)) {
        state.conceded[team] = (state.conceded[team] || 0) + n;
      }
    }
    const sv = Object.entries(state.conceded).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
    if (sv.length) {
      const topVal = sv[0][1];
      const topTeams = sv.filter(([, v]) => v === topVal).map(([t]) => t);
      state.long.sieve = {
        score: -topVal, team: topTeams[0],
        detail: topTeams.length > 1
          ? `Joint leaders (${topTeams.join(", ")}) — ${topVal} conceded each`
          : `${topVal} goals conceded so far`,
        tied: topTeams.length > 1,
      };
    }
  }

  // Result / timeline rules (finished matches only)
  if (finished && winner) {
    // Giant Killer tracking: any team appearing in a knockout fixture
    if (isKnockout(fx)) {
      state.knockoutTeams = state.knockoutTeams || [];
      for (const t of [home.name, away.name]) if (!state.knockoutTeams.includes(t)) state.knockoutTeams.push(t);
    }
    // 7+ goals in normal time (fulltime score = 90-min score)
    const ft = fx.score.fulltime;
    if (ft?.home != null && ft.home + ft.away >= 7) claimIfFirst("goaliazio", winner.name, `Won a ${ft.home}-${ft.away} thriller`);

    // trailing-based rules
    const trailedEver = { [home.id]: false, [away.id]: false };
    let scoreAt80 = null;
    let leadChanges = 0, lastLeader = 0, finalLeadChangeGoal = null;
    for (const t of timeline) {
      const leader = t.hs > t.as ? 1 : t.as > t.hs ? -1 : 0;
      if (leader !== 0 && lastLeader !== 0 && leader !== lastLeader) { leadChanges++; finalLeadChangeGoal = t.ev; }
      if (leader !== 0) lastLeader = leader;
      if (t.hs > t.as) trailedEver[away.id] = true;
      if (t.as > t.hs) trailedEver[home.id] = true;
      const tm = evTime(t.ev);
      if (tm.elapsed <= 80) scoreAt80 = { hs: t.hs, as: t.as };
    }
    if (leadChanges >= 3 && finalLeadChangeGoal) {
      claimIfFirst("thrones", finalLeadChangeGoal.team.name, `${leadChanges} lead changes — final lead-change goal by ${finalLeadChangeGoal.player?.name || "?"} (${minuteLabel(finalLeadChangeGoal)})`);
    }
    if (isKnockout(fx) && trailedEver[winner.id]) {
      claimIfFirst("clutch", winner.name, `Won a knockout tie after trailing`);
    }
    // trailing at the 80th, normal time, then won
    const s80 = scoreAt80 || { hs: 0, as: 0 };
    const winnerTrailingAt80 = (winner.id === home.id && s80.as > s80.hs) || (winner.id === away.id && s80.hs > s80.as);
    const ftWin = ft?.home != null && ((winner.id === home.id && ft.home > ft.away) || (winner.id === away.id && ft.away > ft.home));
    if (winnerTrailingAt80 && ftWin) claimIfFirst("character", winner.name, `Trailing in the 80th, won ${ft.home}-${ft.away} in normal time`);

    // Great Escape candidates: 90+ goal in a knockout by a team that was behind/level
    if (isKnockout(fx)) {
      for (const t of timeline) {
        const tm = evTime(t.ev);
        if (tm.elapsed >= 90) {
          flag("great_escape", t.ev.team.name, `${t.ev.player?.name || "Goal"} at ${minuteLabel(t.ev)} in a knockout tie — confirm it staved off elimination`);
          break;
        }
      }
    }

    // How's Your Luck candidates: missed pen + scored 0 (woodwork needs Tom's eyes)
    for (const team of [home, away]) {
      const missed = events.some(e => e.detail === "Missed Penalty" && e.team.id === team.id);
      const scored = goalEvents.some(g => g.team.id === team.id);
      if (missed && !scored) flag("hows_your_luck", team.name, `Missed a pen and didn't score — confirm they also hit the woodwork`);
    }

    // tournament-long trackers
    if (timeline.length) {
      const first = timeline[0], fTm = evTime(first.ev);
      const secondsApprox = fTm.total; // minute resolution
      trackLong(state, "blink", secondsApprox, "min", { team: first.ev.team.name, detail: `${first.ev.player?.name || "?"} ${minuteLabel(first.ev)} (${matchLabel})`, value: secondsApprox, display: minuteLabel(first.ev) });
      for (const t of timeline) {
        const tm = evTime(t.ev);
        // Normal-time = up to ~100 minutes total (handles both stoppage-time encodings: 90+8 and rolled-in 98)
        if (tm.total <= 100) {
          trackLong(state, "better_late", -tm.total, "min", { team: t.ev.team.name, detail: `${t.ev.player?.name || "?"} ${minuteLabel(t.ev)} (${matchLabel})`, value: tm.total, display: minuteLabel(t.ev) });
        }
      }
    }
  }
}

// keep the best (lowest score wins) record for a tournament-long award
function trackLong(state, id, score, unit, record) {
  const cur = state.long[id];
  if (!cur || score < cur.score) state.long[id] = { score, unit, ...record };
  else if (cur && score === cur.score && cur.detail !== record.detail) {
    state.long[id].tied = true; // ties feed the Butterfly pot
    state.long[id].tieDetail = record.detail;
  }
}

function applyRulings(state, rulings) {
  for (const key of rulings.confirm || []) {
    const c = state.candidates[key];
    if (c && c.status === "pending" && !state.claims[c.achievementId]) {
      state.claims[c.achievementId] = { achievementId: c.achievementId, team: c.team, detail: c.detail, match: c.match, fixtureId: c.fixtureId, date: c.date, awardedBy: "Tom's ruling", claimedAt: new Date().toISOString() };
      c.status = "confirmed";
    } else if (c) c.status = c.status === "pending" ? "superseded" : c.status;
  }
  for (const key of rulings.reject || []) {
    if (state.candidates[key]) state.candidates[key].status = "rejected";
  }
  // Unclaim: removes an existing claim so the prize is open again. Runs every time, so it
  // survives state wipes (the auto-claim re-fires then gets removed again).
  for (const id of rulings.unclaim || []) {
    if (state.claims[id]) delete state.claims[id];
  }
  for (const [achId, claim] of Object.entries(rulings.manualClaims || {})) {
    if (claim?.team) {
      // Manual claims always override auto-claims. Tom's decision is final.
      state.claims[achId] = { achievementId: achId, team: claim.team, detail: claim.detail || "Awarded by Tom", match: claim.match || "", awardedBy: "Tom's ruling", claimedAt: new Date().toISOString() };
    }
  }
}

function finaliseLongAwards(state, participants) {
  // Agent Chaos
  const entries = Object.entries(state.ownGoalInvolvement).sort((a, b) => b[1] - a[1]);
  if (entries.length && !state.claims["agent_chaos"]) {
    const top = entries[0], tied = entries.length > 1 && entries[1][1] === top[1];
    if (!tied) state.claims["agent_chaos"] = { achievementId: "agent_chaos", team: top[0], detail: `Involved in ${top[1]} own goals`, awardedBy: "auto", claimedAt: new Date().toISOString() };
  }
  // Giant Killer — needs fifaRankings in participants.json {teamName: rank}
  const ranks = participants.fifaRankings || {};
  if (Object.keys(ranks).length && !state.claims["giant_killer"] && (state.knockoutTeams || []).length) {
    const ranked = state.knockoutTeams.map(t => [t, ranks[t] || 0]).filter(([, r]) => r > 0).sort((a, b) => b[1] - a[1]);
    if (ranked.length) state.claims["giant_killer"] = { achievementId: "giant_killer", team: ranked[0][0], detail: `FIFA rank ${ranked[0][1]} — lowest-ranked knockout team`, awardedBy: "auto", claimedAt: new Date().toISOString() };
  }
  for (const id of ["blink", "better_late", "nice_to_see_you", "sieve"]) {
    const rec = state.long[id];
    if (rec && !state.claims[id] && !rec.tied) {
      state.claims[id] = { achievementId: id, team: rec.team, detail: rec.detail, awardedBy: "auto", claimedAt: new Date().toISOString() };
    }
  }
}

function computeButterfly(state, participants) {
  const teamNames = Object.keys(participants.teams).sort((a, b) => a.localeCompare(b, "en"));
  const n = teamNames.length || 48;
  const mapped = state.goals.map((g, i) => ({ ...g, goalNumber: i + 1, butterflyTeam: teamNames.length ? teamNames[i % n] : "TBD" }));
  const last = mapped[mapped.length - 1] || null;
  const nextTeam = teamNames.length ? teamNames[mapped.length % n] : "TBD";
  // pot: £10 per rejected-and-unclaimed or tied achievement; final at tournament end, projected before
  // The pot only accrues at the end of the tournament — unclaimed and tied prizes contribute then.
  // Mid-tournament, a rejected candidate doesn't mean the prize is lost (another match could trigger it).
  let potItems = [];
  if (state.tournamentComplete) {
    for (const a of ACHIEVEMENTS) {
      if (!state.claims[a.id]) potItems.push(a.id);
    }
  }
  return {
    potValue: potItems.length * 10, potItems,
    totalGoals: mapped.length,
    lastGoal: last,
    nextGoalTeam: nextTeam,
    currentWinner: last ? last.butterflyTeam : null,
    recentGoals: mapped.slice(-10).reverse(),
    teamOrder: teamNames,
  };
}

function publish(state, participants, fixtures, butterfly, rulings) {
  const FINISHED = ["FT", "AET", "PEN"];
  const claims = Object.values(state.claims).map(c => {
    const a = ACHIEVEMENTS.find(x => x.id === c.achievementId);
    return { ...c, name: a?.name, emoji: a?.emoji, kind: a?.kind, owner: participants.teams[c.team] || null };
  }).sort((a, b) => (b.claimedAt || "").localeCompare(a.claimedAt || ""));

  const pending = Object.values(state.candidates).filter(c => c.status === "pending").map(c => {
    const a = ACHIEVEMENTS.find(x => x.id === c.achievementId);
    return { ...c, name: a?.name, emoji: a?.emoji };
  });

  const board = ACHIEVEMENTS.map(a => ({
    ...a,
    status: state.claims[a.id] ? "claimed" : "open",
    claim: state.claims[a.id] || null,
    owner: state.claims[a.id] ? (participants.teams[state.claims[a.id].team] || null) : null,
    leader: a.kind === "long" && !state.claims[a.id] && state.long[a.id] ? { team: state.long[a.id].team, detail: state.long[a.id].detail } : null,
  }));

  // simple per-person tally
  const people = {};
  for (const [team, person] of Object.entries(participants.teams)) {
    if (!person) continue;
    people[person] = people[person] || { person, teams: [], winnings: 0, achievements: 0 };
    people[person].teams.push(team);
  }
  for (const c of claims) {
    const person = participants.teams[c.team];
    if (person && people[person]) { people[person].winnings += 10; people[person].achievements++; }
  }

  const upcoming = fixtures.filter(fx => !FINISHED.includes(fx.fixture.status.short)).slice(0, 6)
    .map(fx => ({ match: `${fx.teams.home.name} v ${fx.teams.away.name}`, date: fx.fixture.date, round: fx.league.round, status: fx.fixture.status.short }));
  const results = fixtures.filter(fx => FINISHED.includes(fx.fixture.status.short)).slice(-6).reverse()
    .map(fx => ({ match: `${fx.teams.home.name} ${fx.goals.home}-${fx.goals.away} ${fx.teams.away.name}`, round: fx.league.round, status: fx.fixture.status.short }));

  writeJson(DATA_FILE, {
    updatedAt: new Date().toISOString(),
    tournamentComplete: state.tournamentComplete,
    board, claims, pending, butterfly,
    leaderboard: Object.values(people).sort((a, b) => b.winnings - a.winnings),
    upcoming, results,
    matchesProcessed: state.processedFixtures.length,
  });
}

main().catch(err => { console.error(err); process.exit(1); });
