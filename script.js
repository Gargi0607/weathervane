(() => {
  "use strict";

  const STORAGE_KEY = "weathervane.entries.v1";

  /* ---------- Weather scale (replaces plain 1–5 rating) ---------- */
  const WEATHER = [
    { id: 1, label: "storm",    color: "var(--rose)",
      icon: `<path d="M8 20h20a7 7 0 0 0-2-13.7A10 10 0 0 0 7 12 6 6 0 0 0 8 20Z" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M15 24l-3 6M22 24l-3 6M19 22l-3 7" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>` },
    { id: 2, label: "cloudy",   color: "var(--rose)",
      icon: `<path d="M8 22h20a7 7 0 0 0-2-13.7A10 10 0 0 0 7 14 6 6 0 0 0 8 22Z" stroke="currentColor" stroke-width="1.6" fill="none"/>` },
    { id: 3, label: "overcast", color: "var(--gold)",
      icon: `<path d="M6 18h24" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M9 23h22" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M12 13h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>` },
    { id: 4, label: "breezy",   color: "var(--sage)",
      icon: `<circle cx="14" cy="16" r="7" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M22 12h8M23 18h9M22 24h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>` },
    { id: 5, label: "clear",    color: "var(--sage)",
      icon: `<circle cx="20" cy="18" r="7" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="M20 5v3M20 28v3M33 18h-3M10 18H7M29 9l-2 2M13 25l-2 2M29 27l-2-2M13 11l-2-2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>` },
  ];

  const TAGS = ["work", "relationships", "sleep", "health", "loneliness", "anxiety", "money", "other"];

  /* ---------- Recommendation matrix ----------
     Keyed by weather id (1-5) and tag. Several options each so it doesn't
     repeat itself; picked at random. This is the part that replaces the
     "same advice for every problem" behavior. */
  const MATRIX = {
    1: { // storm
      work: ["Work can wait ten minutes. Step away from the screen and let your shoulders drop.", "Pick the one task you can undo the most damage by skipping today — skip it."],
      relationships: ["If it's raw right now, you don't owe anyone a reply this second. Breathe before you respond.", "Write down what you actually want them to understand — not to send yet, just to see it clearly."],
      sleep: ["A storm on no sleep is heavier than it needs to be. If you can, protect the next few hours for rest.", "Skip screens for 15 minutes before you try to sleep tonight — even just tonight."],
      health: ["Your body is part of this. A glass of water and five minutes of stillness first.", "If something physical is scaring you, that's worth a real call, not just riding it out."],
      loneliness: ["Storms are heavier alone. Is there one person you could text just to say 'rough day'?", "You don't need the full story to reach out — 'having a hard time' is a complete sentence."],
      anxiety: ["Try box breathing: in for 4, hold 4, out for 4, hold 4. Three rounds.", "Name three things you can see right now. It won't fix it, but it can anchor you."],
      money: ["Money stress in a storm feels bigger than it is. One small, concrete next step — not the whole plan.", "This one's heavy. Is there a person — a friend, an advisor — you could hand even part of it to?"],
      other: ["Whatever this is, it's allowed to be this hard right now. You don't have to solve it today.", "Storms pass. Right now the job is just getting through the next hour."],
    },
    2: { // cloudy
      work: ["Lower the bar for today. Finished-and-imperfect beats stalled.", "Take a real break — not a scroll break, an actual one."],
      relationships: ["A short, honest check-in with someone might lighten this more than working it out alone.", "It's okay to just not be at your best with people today. Say so if you need to."],
      sleep: ["Tired makes everything look greyer than it is. An earlier night tonight might help more than anything else on this list.", "A 20-minute nap if you can — anything longer tends to backfire."],
      health: ["A short walk outside, even five minutes, tends to shift a cloudy day more than you'd expect.", "Check when you last ate or drank water — cloudy days sometimes have a boring cause."],
      loneliness: ["Low-key company can help even without deep conversation. Is there somewhere you could just be around people?", "Message someone something small and low-stakes — no need for a big conversation."],
      anxiety: ["Write down what's actually looping in your head. Getting it out of your head and onto paper helps.", "Try slowing your exhale — longer out-breath than in-breath, for a minute."],
      money: ["Pick one small, boring admin task related to it and just do that one thing.", "Cloudy money-stress is often about uncertainty, not amount. What's one thing you could find out today?"],
      other: ["Not every off day needs a cause. Be a bit gentler with yourself today.", "Do one small thing that's reliably made you feel steadier before."],
    },
    3: { // overcast
      work: ["Steady is fine. Keep the pace you've got — no need to push today.", "A short list of just the essentials might make the day feel lighter."],
      relationships: ["Nothing urgent here — maybe just notice who you'd like to reach out to this week.", "A neutral day is a good day to send that message you've been putting off."],
      sleep: ["Worth a check: how's your sleep been the last few nights, not just last night?", "Maybe nothing to fix — just keep an eye on the pattern."],
      health: ["A good day to do something maintaining rather than urgent — a walk, some water, some food that isn't from a wrapper.", "Nothing wrong, just worth tending to as usual."],
      loneliness: ["A quiet day might still be a good day to make a small plan with someone for later this week.", "No urgency, but connection compounds — even a small check-in helps."],
      anxiety: ["Worth noticing what's in the background, even if it's not loud today.", "A calm day is a good day to practice a breathing technique so it's ready when you need it."],
      money: ["A steady day is a good time for a quick, unemotional look at where things stand.", "Nothing urgent — maybe just a five-minute check on your accounts."],
      other: ["Middle-of-the-road days are normal, not a problem to solve.", "Use the steadiness while it's here — is there something you've been putting off?"],
    },
    4: { // breezy
      work: ["Good momentum — worth noting what made today easier so you can find it again.", "A good day to tackle the thing you've been avoiding, while the energy's there."],
      relationships: ["A good day to reach out to someone you've missed — the ease tends to carry over.", "Worth telling someone what's going well, not just checking in when it's hard."],
      sleep: ["Whatever you did last night, it's working. Worth repeating tonight.", "Good energy today — still worth protecting your sleep tonight so it holds."],
      health: ["Good day to move a bit, since it tends to be easier when you're already feeling okay.", "Keep doing whatever's been working — no need to change it."],
      loneliness: ["A good day to make plans, since reaching out is easier when you're feeling good.", "Worth banking this feeling — note who or what helped get you here."],
      anxiety: ["Good day to notice what's not weighing on you right now — that's information too.", "If a breathing or grounding habit has been working, this is a good day to reinforce it."],
      money: ["A clearer-headed day is a good time to actually plan, not just react.", "Worth using this steadiness to set up something for the harder days."],
      other: ["Good days are worth noticing, not just surviving. What's contributing to this one?", "Keep whatever's working — small good days add up."],
    },
    5: { // clear
      work: ["This is a good one — let yourself actually enjoy the momentum instead of rushing to the next thing.", "Worth writing down what led here, so it's easier to find again."],
      relationships: ["Good energy is worth sharing — reach out to someone just because.", "A good day to tell someone what they mean to you, no occasion needed."],
      sleep: ["Whatever's working, keep it going tonight too.", "Good days like this are often built the night before — worth noticing the pattern."],
      health: ["Feeling good is a good time to bank some movement or a good meal, not just coast.", "Nothing to fix — enjoy it."],
      loneliness: ["Good day to be generous with your time toward someone else.", "Use this energy to strengthen a connection, not just enjoy it solo."],
      anxiety: ["A genuinely clear day. Let it be that, without hunting for what could go wrong.", "Worth remembering this feeling is available — it'll help on the harder days."],
      money: ["A clear-headed day is a good time to make one decision you've been putting off.", "Good day to feel good about progress, even small progress."],
      other: ["Let this one just be good. You don't need a reason.", "Worth a note in the log about what got you here."],
    },
  };

  const NO_TAG_FALLBACK = {
    1: ["Whatever today is, it's allowed to be hard. You don't have to fix it right now — just get through the next hour."],
    2: ["A heavier day. Lower your expectations of yourself a little and be more patient than usual."],
    3: ["A steady, in-between day. Nothing urgent — just keep going at your own pace."],
    4: ["Good momentum today — notice what's working so you can find it again."],
    5: ["A genuinely good one. Let yourself enjoy it without overanalyzing it."],
  };

  /* ---------- State ---------- */
  let entries = loadEntries();
  let selectedWeather = null;
  let selectedTags = new Set();
  let lastEntryForFeedback = null;

  function loadEntries() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
  function saveEntries() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  /* ---------- Render: weather dial ---------- */
  const dialEl = document.querySelector(".dial");
  function renderDial() {
    dialEl.innerHTML = WEATHER.map(w => `
      <button class="weather-opt" role="radio" aria-checked="false" data-id="${w.id}" style="color:${w.id===selectedWeather ? w.color : ''}">
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">${w.icon}</svg>
        <span>${w.label}</span>
      </button>
    `).join("");
  }
  renderDial();

  dialEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".weather-opt");
    if (!btn) return;
    selectedWeather = Number(btn.dataset.id);
    [...dialEl.children].forEach(c => {
      const active = Number(c.dataset.id) === selectedWeather;
      c.setAttribute("aria-checked", active);
      const w = WEATHER.find(w => w.id === Number(c.dataset.id));
      c.style.color = active ? w.color : "";
    });
    document.getElementById("tagsPanel").hidden = false;
    document.getElementById("tagsPanel").scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  /* ---------- Render: tag chips ---------- */
  const tagChipsEl = document.getElementById("tagChips");
  tagChipsEl.innerHTML = TAGS.map(t => `<button class="chip" type="button" aria-pressed="false" data-tag="${t}">${t}</button>`).join("");
  tagChipsEl.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const tag = chip.dataset.tag;
    if (selectedTags.has(tag)) { selectedTags.delete(tag); chip.setAttribute("aria-pressed", "false"); }
    else { selectedTags.add(tag); chip.setAttribute("aria-pressed", "true"); }
  });

  /* ---------- Submit check-in ---------- */
  document.getElementById("submitCheckin").addEventListener("click", () => {
    if (!selectedWeather) return;
    const note = document.getElementById("noteInput").value.trim();
    const tags = [...selectedTags];
    const suggestion = pickSuggestion(selectedWeather, tags);

    const entry = {
      date: new Date().toISOString(),
      weather: selectedWeather,
      tags,
      note,
      suggestion,
      feedback: null,
    };
    entries.push(entry);
    saveEntries();
    lastEntryForFeedback = entry;

    showResponse(entry);
    renderJourney();

    // reset the input panel for next time
    selectedTags.clear();
    document.getElementById("noteInput").value = "";
    [...tagChipsEl.children].forEach(c => c.setAttribute("aria-pressed", "false"));
  });

  function pickSuggestion(weatherId, tags) {
    const pool = [];
    tags.forEach(tag => {
      const options = MATRIX[weatherId]?.[tag];
      if (options) pool.push(...options);
    });
    if (pool.length === 0) {
      const fallback = NO_TAG_FALLBACK[weatherId];
      return fallback[Math.floor(Math.random() * fallback.length)];
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /* ---------- Render: response card ---------- */
  function showResponse(entry) {
    const section = document.getElementById("responseSection");
    const eyebrow = document.getElementById("responseEyebrow");
    const text = document.getElementById("responseText");
    const w = WEATHER.find(w => w.id === entry.weather);

    eyebrow.textContent = entry.tags.length
      ? `${w.label} · ${entry.tags.join(", ")}`
      : w.label;
    text.textContent = entry.suggestion;

    document.querySelectorAll(".feedback-btn").forEach(b => b.setAttribute("aria-pressed", "false"));
    section.hidden = false;
    section.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  document.querySelectorAll(".feedback-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!lastEntryForFeedback) return;
      lastEntryForFeedback.feedback = btn.dataset.vote;
      saveEntries();
      document.querySelectorAll(".feedback-btn").forEach(b => b.setAttribute("aria-pressed", "false"));
      btn.setAttribute("aria-pressed", "true");
    });
  });

  /* ---------- Journey / trail ---------- */
  function renderJourney() {
    const journeySection = document.getElementById("journeySection");
    const emptyState = document.getElementById("emptyState");

    if (entries.length === 0) {
      journeySection.hidden = true;
      emptyState.hidden = false;
      return;
    }
    journeySection.hidden = false;
    emptyState.hidden = true;

    // insight line
    const insightEl = document.getElementById("journeyInsight");
    insightEl.textContent = buildInsight();

    // trail dots
    const track = document.getElementById("trailTrack");
    const svg = document.getElementById("trailSvg");
    const recent = entries.slice(-30);
    const n = recent.length;
    const dotSpacing = 64;
    track.style.minWidth = Math.max(n * dotSpacing, 300) + "px";

    track.innerHTML = "";
    const points = recent.map((e, i) => {
      const w = WEATHER.find(w => w.id === e.weather);
      const x = 32 + i * dotSpacing;
      const y = 90 - (e.weather - 1) * 16; // storm low, clear high
      const dot = document.createElement("div");
      dot.className = "trail-dot";
      dot.style.left = x + "px";
      dot.style.top = y + "px";
      dot.style.background = w.color;
      dot.title = `${w.label} — ${new Date(e.date).toLocaleDateString()}`;
      track.appendChild(dot);
      return { x, y };
    });

    const widthPx = Math.max(n * dotSpacing, 300);
    svg.setAttribute("viewBox", `0 0 ${widthPx} 110`);
    if (points.length > 1) {
      const path = points.map((p, i) => (i === 0 ? "M" : "L") + `${p.x} ${p.y}`).join(" ");
      svg.innerHTML = `<path d="${path}" stroke="var(--dusk)" stroke-width="1.2" fill="none" opacity="0.35"/>`;
    } else {
      svg.innerHTML = "";
    }
    // scroll trail to the latest entry
    track.parentElement.scrollLeft = track.parentElement.scrollWidth;

    // list of recent entries (most recent first)
    const listEl = document.getElementById("logList");
    listEl.innerHTML = entries.slice(-8).reverse().map(e => {
      const w = WEATHER.find(w => w.id === e.weather);
      const dateStr = new Date(e.date).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
      return `
        <div class="log-item">
          <span class="dot" style="background:${w.color}"></span>
          <div class="log-body">
            <span class="log-date">${dateStr} · ${w.label}</span>
            ${e.tags.length ? `<span class="log-tags">${e.tags.join(", ")}</span>` : ""}
            ${e.note ? `<p class="log-note">${escapeHtml(e.note)}</p>` : ""}
          </div>
        </div>`;
    }).join("");
  }

  function buildInsight() {
    if (entries.length < 3) return `${entries.length} check-in${entries.length === 1 ? "" : "s"} logged so far.`;
    const recentWeek = entries.filter(e => (Date.now() - new Date(e.date).getTime()) < 7 * 24 * 3600 * 1000);
    const sample = recentWeek.length ? recentWeek : entries.slice(-7);
    const tagCounts = {};
    sample.forEach(e => e.tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));
    const topTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0];
    const avg = sample.reduce((s, e) => s + e.weather, 0) / sample.length;
    const avgLabel = WEATHER[Math.round(avg) - 1]?.label ?? "mixed";
    return topTag
      ? `This week, averaging ${avgLabel} · most logged theme: ${topTag[0]}`
      : `This week, averaging ${avgLabel}`;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------- Reset ---------- */
  document.getElementById("resetData").addEventListener("click", () => {
    if (!confirm("This clears every check-in from this browser. Continue?")) return;
    entries = [];
    saveEntries();
    document.getElementById("responseSection").hidden = true;
    renderJourney();
  });

  /* ---------- Init ---------- */
  renderJourney();
})();
