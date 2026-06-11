<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>World Cup 2026 Sweepstake</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;800&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet">
<style>
:root{
  --paper:#F5F2E8; --panel:#FFFFFF; --panel-2:#FBF9F2;
  --ink:#1A2A20; --muted:#5C6B60;
  --amber:#B97800; --amber-bg:#FFB400; --green:#1E7A46; --red:#C0392B;
  --line:#D9D3C2;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#F5F2E8}
body{background:var(--paper);color:var(--ink);font-family:'Barlow Condensed',sans-serif;font-size:18px;line-height:1.35}
.mono{font-family:'IBM Plex Mono',monospace}
.wrap{max-width:760px;margin:0 auto;padding:0 14px 80px}

/* scoreboard header */
header{padding:26px 0 14px;text-align:center;border-bottom:3px solid var(--ink)}
header .eyebrow{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.28em;color:var(--green);text-transform:uppercase;font-weight:600}
header h1{font-size:clamp(34px,8vw,54px);font-weight:800;text-transform:uppercase;letter-spacing:.02em;line-height:1.02;margin:6px 0 2px;color:#14211A}
header .sub{color:var(--muted);font-size:16px;font-weight:500}
.scoreboard{display:flex;justify-content:center;gap:10px;margin:18px 0 4px;flex-wrap:wrap}
.tile{background:#14211A;border-radius:6px;padding:10px 16px;min-width:96px}
.tile .num{font-family:'IBM Plex Mono',monospace;font-size:26px;font-weight:600;color:#FFB400}
.tile .lbl{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#B8C4BB;margin-top:2px}
.tile.pot .num{color:#57D98A}

/* vidiprinter ticker */
.ticker{background:var(--amber-bg);color:#181200;overflow:hidden;white-space:nowrap;border-top:2px solid #14211A;border-bottom:2px solid #14211A}
.ticker-track{display:inline-block;padding:7px 0;font-family:'IBM Plex Mono',monospace;font-size:13px;font-weight:600;animation:scroll 40s linear infinite}
.ticker-track span{margin:0 26px}
@keyframes scroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@media (prefers-reduced-motion: reduce){.ticker-track{animation:none;white-space:normal;padding:7px 14px}}

section{margin-top:34px}
h2{font-size:24px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;display:flex;align-items:baseline;gap:10px;color:#14211A}
h2 .count{font-family:'IBM Plex Mono',monospace;font-size:13px;color:var(--muted);font-weight:400}
.rule-note{color:var(--muted);font-size:15px;font-weight:500;margin:2px 0 12px}

/* pending rulings */
.pending{border:2px dashed var(--amber);border-radius:8px;background:#FFF6E0;padding:12px 14px;margin-bottom:10px}
.pending .key{font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--amber);word-break:break-all}
.pending .what{font-weight:700;font-size:19px;margin:2px 0}
.pending .det{color:var(--muted);font-size:15px}

/* prize board */
.board{display:grid;grid-template-columns:1fr;gap:8px;margin-top:12px}
@media(min-width:560px){.board{grid-template-columns:1fr 1fr}}
.prize{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:12px 14px;display:flex;gap:12px;align-items:flex-start;box-shadow:0 1px 2px rgba(26,42,32,.05)}
.prize.claimed{border:2px solid var(--green);background:#F0F8F2}
.prize .emoji{font-size:24px;line-height:1.2}
.prize .name{font-weight:800;font-size:19px;text-transform:uppercase;letter-spacing:.02em;color:#14211A}
.prize .desc{color:var(--muted);font-size:14.5px;font-weight:500;margin-top:1px}
.prize .winner{margin-top:7px;font-family:'IBM Plex Mono',monospace;font-size:13px;color:var(--green);font-weight:600}
.prize .winner .person{color:var(--ink)}
.prize .leader{margin-top:7px;font-family:'IBM Plex Mono',monospace;font-size:12.5px;color:var(--amber);font-weight:600}
.badge{font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:.12em;padding:3px 7px;border-radius:3px;margin-left:auto;flex-shrink:0;text-transform:uppercase;font-weight:600}
.badge.open{border:1px solid var(--line);color:var(--muted);background:var(--panel-2)}
.badge.claimed{background:var(--green);color:#fff}
.badge.long{border:1px solid var(--amber);color:var(--amber);background:#FFF6E0}

/* butterfly */
.butterfly{background:#14211A;border-radius:10px;padding:18px;margin-top:12px;text-align:center;color:#E8EFE9}
.butterfly .next-lbl{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.24em;color:#B8C4BB;text-transform:uppercase}
.butterfly .next-team{font-size:clamp(30px,7vw,44px);font-weight:800;text-transform:uppercase;color:#FFB400;line-height:1.05;margin:4px 0 2px}
.butterfly .next-person{font-family:'IBM Plex Mono',monospace;font-size:14px;color:#B8C4BB}
.butterfly .meta{display:flex;justify-content:center;gap:24px;margin-top:14px;flex-wrap:wrap}
.butterfly .meta div{font-family:'IBM Plex Mono',monospace;font-size:13px;color:#B8C4BB}
.butterfly .meta b{color:#fff;font-weight:600}
.goal-log{margin-top:14px;text-align:left;border-top:1px solid rgba(232,239,233,.25);padding-top:10px}
.goal-log .g{display:flex;gap:10px;font-family:'IBM Plex Mono',monospace;font-size:12.5px;padding:4px 0;color:#C9D3CC}
.goal-log .g .n{color:#FFB400;min-width:38px}
.goal-log .g .bteam{margin-left:auto;color:#57D98A}

/* tables */
table{width:100%;border-collapse:collapse;margin-top:12px;font-size:16px;background:var(--panel);border:1px solid var(--line);border-radius:8px}
th{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);text-align:left;padding:8px;border-bottom:2px solid var(--ink)}
td{padding:9px 8px;border-bottom:1px solid var(--line);font-weight:500}
td.money{font-family:'IBM Plex Mono',monospace;color:var(--green);text-align:right;font-weight:600}

.fixtures{display:grid;gap:6px;margin-top:12px}
.fx{display:flex;justify-content:space-between;gap:10px;background:var(--panel);border:1px solid var(--line);border-radius:6px;padding:9px 12px;font-size:16px;font-weight:600}
.fx .when{font-family:'IBM Plex Mono',monospace;font-size:12px;color:var(--muted);font-weight:400;flex-shrink:0}

footer{margin-top:44px;text-align:center;color:var(--muted);font-family:'IBM Plex Mono',monospace;font-size:11.5px;line-height:1.7}
.empty{background:var(--panel);border:1px dashed var(--line);border-radius:8px;padding:18px;text-align:center;color:var(--muted);font-weight:500;margin-top:12px}
a{color:var(--green)}
:focus-visible{outline:2px solid var(--green);outline-offset:2px}
</style>
</head>
<body>

<header>
  <div class="wrap">
    <div class="eyebrow">£10 a team &nbsp;·&nbsp; 48 teams &nbsp;·&nbsp; £480 pot</div>
    <h1>World Cup 2026<br>Sweepstake</h1>
    <div class="sub">Tom's decision is final. Obviously.</div>
    <div class="scoreboard" id="scoreboard"></div>
  </div>
</header>

<div class="ticker" aria-label="Latest sweepstake news"><div class="ticker-track" id="ticker"></div></div>

<main class="wrap">

  <section id="pendingSection" hidden>
    <h2>⚖️ Awaiting Tom's Ruling <span class="count" id="pendingCount"></span></h2>
    <p class="rule-note">The machine spotted these — a human needs to confirm.</p>
    <div id="pending"></div>
  </section>

  <section>
    <h2>🦋 The Butterfly Effect</h2>
    <p class="rule-note">Every goal maps to a team, A–Z, looping every 48. Whoever lands the final goal of the tournament takes the whole pot.</p>
    <div class="butterfly" id="butterfly"></div>
  </section>

  <section>
    <h2>🏅 The Prize Board <span class="count" id="boardCount"></span></h2>
    <div class="board" id="board"></div>
  </section>

  <section>
    <h2>💰 Winnings So Far</h2>
    <div id="leaderboard"></div>
  </section>

  <section>
    <h2>📅 Matches</h2>
    <div class="fixtures" id="results"></div>
    <div class="fixtures" id="upcoming" style="margin-top:10px"></div>
  </section>

  <footer id="footer"></footer>
</main>

<script>
const gbp = n => "£" + n;
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

async function load(){
  let d;
  try {
    const res = await fetch("data.json?t=" + Date.now());
    d = await res.json();
  } catch(e){
    document.getElementById("board").innerHTML = '<div class="empty">No data yet — waiting for the first engine run.</div>';
    return;
  }
  render(d);
}

function render(d){
  const claimed = d.claims?.length || 0;
  const firstPrizes = (d.board||[]).filter(a=>a.kind==="first").length;
  const longPrizes  = (d.board||[]).filter(a=>a.kind==="long").length;

  // scoreboard
  document.getElementById("scoreboard").innerHTML = `
    <div class="tile"><div class="num">${claimed}/30</div><div class="lbl">Prizes claimed</div></div>
    <div class="tile pot"><div class="num">${gbp(d.butterfly?.potValue ?? 0)}</div><div class="lbl">Butterfly pot</div></div>
    <div class="tile"><div class="num">${d.butterfly?.totalGoals ?? 0}</div><div class="lbl">Goals</div></div>`;

  // ticker — latest claims then latest goals; duplicated for seamless loop
  const items = [];
  for (const c of (d.claims||[]).slice(0,6)) items.push(`🏆 ${c.emoji} ${c.name.toUpperCase()} — ${c.team.toUpperCase()}${c.owner ? " ("+c.owner.toUpperCase()+")" : ""} · ${gbp(10)}`);
  for (const g of (d.butterfly?.recentGoals||[]).slice(0,6)) items.push(`⚽ GOAL #${g.goalNumber} ${g.player.toUpperCase()} ${g.minute} (${g.teamName.toUpperCase()}) → 🦋 ${g.butterflyTeam.toUpperCase()}`);
  if (!items.length) items.push("⏳ WAITING FOR KICK-OFF — EVERY GOAL MATTERS 🦋");
  const half = items.map(t=>`<span>${esc(t)}</span>`).join("· ");
  document.getElementById("ticker").innerHTML = half + half;

  // pending rulings
  const pend = d.pending || [];
  if (pend.length){
    document.getElementById("pendingSection").hidden = false;
    document.getElementById("pendingCount").textContent = pend.length + " open";
    document.getElementById("pending").innerHTML = pend.map(p=>`
      <div class="pending">
        <div class="what">${p.emoji||""} ${esc(p.name)} — ${esc(p.team)}</div>
        <div class="det">${esc(p.detail)} · ${esc(p.match)}</div>
        <div class="key">key: ${esc(p.key)}</div>
      </div>`).join("");
  }

  // butterfly
  const b = d.butterfly || {};
  const owner = t => { const lb=(d.leaderboard||[]); for(const p of lb){ if(p.teams?.includes(t)) return p.person; } return null; };
  const nextOwner = b.nextGoalTeam ? owner(b.nextGoalTeam) : null;
  document.getElementById("butterfly").innerHTML = `
    <div class="next-lbl">Next goal wins for</div>
    <div class="next-team">${esc(b.nextGoalTeam || "TBD")}</div>
    ${nextOwner?`<div class="next-person">${esc(nextOwner)}</div>`:""}
    <div class="meta">
      <div>Pot: <b>${gbp(b.potValue||0)}</b></div>
      <div>Holding it now: <b>${esc(b.currentWinner || "—")}</b></div>
    </div>
    ${(b.recentGoals||[]).length?`
    <div class="goal-log">
      ${b.recentGoals.map(g=>`<div class="g"><span class="n">#${g.goalNumber}</span><span>${esc(g.player)} ${esc(g.minute)} · ${esc(g.teamName)}</span><span class="bteam">🦋 ${esc(g.butterflyTeam)}</span></div>`).join("")}
    </div>`:""}`;

  // prize board — claimed first, then open firsts, then long
  const order = a => a.status==="claimed" ? 0 : a.kind==="first" ? 1 : 2;
  const board = [...(d.board||[])].sort((x,y)=>order(x)-order(y));
  document.getElementById("boardCount").textContent = `${claimed} claimed · ${30-claimed} open`;
  document.getElementById("board").innerHTML = board.map(a=>`
    <div class="prize ${a.status}">
      <div class="emoji">${a.emoji}</div>
      <div style="flex:1">
        <div class="name">${esc(a.name)}</div>
        <div class="desc">${esc(a.desc)}</div>
        ${a.claim?`<div class="winner">→ ${esc(a.claim.team)}${a.owner?` <span class="person">(${esc(a.owner)})</span>`:""} · ${esc(a.claim.detail)}</div>`:""}
        ${a.leader?`<div class="leader">current best: ${esc(a.leader.team)} — ${esc(a.leader.detail)}</div>`:""}
      </div>
      <div class="badge ${a.status==="claimed"?"claimed":(a.kind==="long"?"long":"open")}">${a.status==="claimed"?"£10":(a.kind==="long"?"After final":"Open")}</div>
    </div>`).join("");

  // leaderboard
  const lb = d.leaderboard || [];
  document.getElementById("leaderboard").innerHTML = lb.length ? `
    <table><thead><tr><th>Punter</th><th>Teams</th><th style="text-align:right">Won</th></tr></thead><tbody>
    ${lb.map(p=>`<tr><td>${esc(p.person)}</td><td style="color:var(--muted)">${esc(p.teams.join(", "))}</td><td class="money">${gbp(p.winnings)}</td></tr>`).join("")}
    </tbody></table>`
    : '<div class="empty">Names not assigned yet — Tom\'s on it.</div>';

  // matches
  const fmt = iso => new Date(iso).toLocaleString("en-GB",{weekday:"short",hour:"2-digit",minute:"2-digit",day:"numeric",month:"short"});
  document.getElementById("results").innerHTML = (d.results||[]).map(r=>`<div class="fx"><span>${esc(r.match)}</span><span class="when">FT</span></div>`).join("");
  document.getElementById("upcoming").innerHTML = (d.upcoming||[]).map(u=>`<div class="fx"><span>${esc(u.match)}</span><span class="when">${fmt(u.date)}</span></div>`).join("");

  document.getElementById("footer").innerHTML =
    `Updated ${new Date(d.updatedAt).toLocaleString("en-GB")} · ${d.matchesProcessed||0} matches processed<br>` +
    `Ties, unclaimed and unawardable prizes feed the Butterfly pot 🦋 · Tom's decision is final on all rulings`;
}
load();
setInterval(load, 5*60*1000); // refresh every 5 mins
</script>
</body>
</html>
