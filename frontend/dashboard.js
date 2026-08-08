const API = "http://127.0.0.1:8000";
const token = localStorage.getItem("orator_token");
const user = JSON.parse(localStorage.getItem("orator_user") || "null");
const $ = (selector) => document.querySelector(selector);
if (!token || !user) window.location.replace("index.html");
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token}` });
async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, options);
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof data.detail === "string" ? data.detail : data.detail?.[0]?.msg || "Something went wrong.");
  return data;
}
const roleCopy = (role) => ({ Learner: "Shape your voice through deliberate practice.", Coach: "Guide learners toward their clearest thinking.", Educator: "Create space for thoughtful, confident speakers.", Admin: "Oversee the people and practice within your platform." }[role] || "Your practice space is ready.");
const names = { clarity: "Clarity", confidence: "Confidence", argumentation: "Argumentation", rebuttal: "Rebuttal", delivery: "Delivery" };
let debateFormats = [];
const formatMeta = (name) => debateFormats.find((item) => item.format === name);
function renderProfile(profile) { $("#profileSummary").hidden = false; $("#profileName").textContent = profile.name; $("#profileExperience").textContent = profile.experience; $("#profileGoals").textContent = profile.goals; $("#profileTopics").textContent = profile.preferred_topics.join(", "); $("#focusTitle").textContent = "Your practice is taking shape."; $("#focusBody").textContent = "Your speaker profile is ready. Return any time to refine the direction of your work."; $("#focusAction").innerHTML = "Refine profile <span>→</span>"; ["name", "experience", "goals"].forEach((key) => $("#profileForm").elements[key].value = profile[key]); $("#profileForm").elements.topics.value = profile.preferred_topics.join(", "); $("#profileForm").elements.domains.value = (profile.presentation_domains || []).join(", "); $("#profileForm").elements.coaching_preference.value = profile.coaching_preference || "Self-guided"; }
async function loadProfile() { try { renderProfile(await api("/profile", { headers: authHeaders() })); } catch (error) { if (!error.message.includes("Profile not found")) console.warn(error); } }
function renderSkills(skills) { $("#skillsList").innerHTML = Object.entries(names).map(([key, label]) => `<div class="skill-row"><label for="skill-${key}">${label}</label><input id="skill-${key}" data-skill="${key}" type="range" min="0" max="100" value="${skills[key]}"><output>${skills[key]}</output></div>`).join(""); document.querySelectorAll("[data-skill]").forEach((input) => input.addEventListener("input", () => input.nextElementSibling.value = input.value)); }
async function loadSkills() { renderSkills(await api("/skills", { headers: authHeaders() })); }
function renderGoals(goals) { const container = $("#goalsList"); container.classList.toggle("empty-state", goals.length === 0); container.innerHTML = goals.length ? goals.map((goal) => `<label class="feed-item"><span><input class="goal-check" data-goal="${goal.id}" type="checkbox" ${goal.completed ? "checked" : ""}> <strong>${goal.title}</strong>${goal.target_date ? `<span>Target: ${goal.target_date}</span>` : ""}</span><span>${goal.completed ? "Done" : "In progress"}</span></label>`).join("") : "No goals yet — add the first one."; document.querySelectorAll("[data-goal]").forEach((input) => input.addEventListener("change", async () => { await api(`/learning-goals/${input.dataset.goal}`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify({ completed: input.checked }) }); loadGoals(); })); }
async function loadGoals() { renderGoals(await api("/learning-goals", { headers: authHeaders() })); }
function renderHistory(items, kind) { const container = $(kind === "debate" ? "#debatesList" : "#presentationsList"); container.classList.toggle("empty-state", items.length === 0); container.innerHTML = items.length ? items.slice(0, 5).map((item) => `<div class="feed-item"><span><strong>${kind === "debate" ? item.topic : item.title}</strong><span>${kind === "debate" ? item.position : item.domain} · ${new Date(item.created_at + "Z").toLocaleDateString()}</span></span><span class="score-pill">${item.score == null ? "Logged" : `${item.score}/100`}</span></div>`).join("") : (kind === "debate" ? "Your completed debates will appear here." : "Your presentations will appear here."); }
async function loadHistory() { const [debates, presentations] = await Promise.all([api("/debates", { headers: authHeaders() }), api("/presentations", { headers: authHeaders() })]); renderHistory(debates, "debate"); renderHistory(presentations, "presentation"); }
function renderManagement(overview) { $("#managementCard").hidden = false; $("#managementLink").hidden = false; $("#roleCounts").innerHTML = Object.entries(overview.counts).map(([role, count]) => `<div class="role-count"><strong>${count}</strong><span>${role}${count === 1 ? "" : "s"} registered</span></div>`).join(""); $("#managementUsers").innerHTML = overview.users.length ? overview.users.map((account) => `<div class="managed-user"><strong>${account.name}</strong><span>${account.role} · ${account.email}</span></div>`).join("") : "<span class=\"muted\">No lower-level accounts have registered yet.</span>"; }
async function loadManagement() { if (["Admin", "Educator", "Coach"].includes(user.role)) renderManagement(await api("/management/overview", { headers: authHeaders() })); }
function syncPositionOptions() {
  const selected = $("#sessionFormat").value;
  const meta = formatMeta(selected);
  const positions = meta?.positions || ["For", "Against"];
  $("#sessionPosition").innerHTML = positions.map((position) => `<option value="${position}">${position}</option>`).join("");
  $("#sessionForm").elements.opponent_name.placeholder = selected === "AI Debate Simulation" ? "Leave blank for AI Opponent" : "Opponent name (optional)";
}
function renderFormats(formats) {
  debateFormats = formats;
  $("#formatStrip").innerHTML = formats.map((item) => `<div class="format-chip"><strong>${item.format}</strong><span>${item.description}</span></div>`).join("");
  $("#sessionFormat").innerHTML = formats.map((item) => `<option value="${item.format}">${item.format}</option>`).join("");
  syncPositionOptions();
}
function whenLabel(value) {
  if (!value) return "Unscheduled";
  const date = new Date(value.endsWith("Z") || value.includes("+") ? value : `${value}Z`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
function renderSessions(sessions) {
  const container = $("#sessionsList");
  container.classList.toggle("empty-state", sessions.length === 0);
  if (!sessions.length) {
    container.innerHTML = "No sessions yet — create one to practice a format.";
    return;
  }
  container.innerHTML = sessions.map((session) => {
    const participants = session.participants.map((person) => `${person.display_name} · ${person.position}${person.is_ai ? " (AI)" : ""}`).join(" · ");
    const owned = user.id == null || session.creator_id === user.id;
    return `<article class="session-item" data-session="${session.id}">
      <div class="session-top">
        <div>
          <strong>${session.topic}</strong>
          <div class="session-meta">
            <span class="meta-pill accent">${session.format}</span>
            <span class="meta-pill">${session.status.replace("_", " ")}</span>
            <span class="meta-pill">${whenLabel(session.scheduled_at)}</span>
          </div>
          <p class="participant-row">${participants}</p>
          ${session.description ? `<p class="participant-row">${session.description}</p>` : ""}
          ${session.recording_url ? `<p class="participant-row"><a href="${session.recording_url}" target="_blank" rel="noopener">Open recording</a></p>` : ""}
        </div>
        ${owned ? `<div class="session-actions">
          ${session.status !== "in_progress" && session.status !== "completed" && session.status !== "cancelled" ? `<button type="button" data-action="start">Start</button>` : ""}
          ${session.status === "in_progress" ? `<button type="button" data-action="complete">Complete</button>` : ""}
          ${session.status !== "cancelled" && session.status !== "completed" ? `<button type="button" data-action="cancel">Cancel</button>` : ""}
          <button type="button" data-action="delete">Delete</button>
        </div>` : ""}
      </div>
      ${owned ? `<div class="session-recording">
        <textarea data-recording placeholder="Recording notes / transcript summary">${session.recording_notes || ""}</textarea>
        <button type="button" data-action="save-notes">Save recording notes</button>
      </div>` : (session.recording_notes ? `<p class="participant-row">${session.recording_notes}</p>` : "")}
    </article>`;
  }).join("");
  container.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", async () => {
      const card = button.closest("[data-session]");
      const id = card.dataset.session;
      const action = button.dataset.action;
      try {
        if (action === "delete") {
          await api(`/debate-sessions/${id}`, { method: "DELETE", headers: authHeaders() });
        } else if (action === "save-notes") {
          await api(`/debate-sessions/${id}`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify({ recording_notes: card.querySelector("[data-recording]").value }) });
        } else {
          const status = { start: "in_progress", complete: "completed", cancel: "cancelled" }[action];
          await api(`/debate-sessions/${id}`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify({ status }) });
        }
        loadSessions();
      } catch (error) {
        alert(error.message);
      }
    });
  });
}
async function loadFormats() { renderFormats(await api("/debate-formats", { headers: authHeaders() })); }
async function loadSessions() { renderSessions(await api("/debate-sessions", { headers: authHeaders() })); }
function renderArgumentAnalysis(res) {
  $("#argumentAnalysisResults").style.display = "block";
  const s = res.scores;
  const c = res.credibility;

  $("#scoreOverall").textContent = s.overall_strength;
  $("#scoreClarity").textContent = `${s.clarity}/100`;
  $("#scoreRelevance").textContent = `${s.relevance}/100`;
  $("#scoreEvidence").textContent = `${s.evidence_strength}/100`;
  $("#scoreLogic").textContent = `${s.logical_consistency}/100`;
  $("#scorePersuasiveness").textContent = `${s.persuasiveness}/100`;

  $("#barClarity").style.width = `${s.clarity}%`;
  $("#barRelevance").style.width = `${s.relevance}%`;
  $("#barEvidence").style.width = `${s.evidence_strength}%`;
  $("#barLogic").style.width = `${s.logical_consistency}%`;
  $("#barPersuasiveness").style.width = `${s.persuasiveness}%`;

  const badge = $("#credibilityBadge");
  badge.textContent = `Credibility: ${c.level} (${c.score}/100)`;
  badge.style.background = c.level === "High" ? "rgba(182,244,230,.2)" : (c.level === "Medium" ? "rgba(255,210,120,.2)" : "rgba(255,100,130,.2)");
  badge.style.color = c.level === "High" ? "var(--accent)" : (c.level === "Medium" ? "#ffd278" : "#ff8ba7");

  // Fallacies
  const fallaciesContainer = $("#fallaciesList");
  if (!res.fallacies_detected || res.fallacies_detected.length === 0) {
    fallaciesContainer.innerHTML = `<p class="muted">No logical fallacies detected. Strong logical reasoning!</p>`;
  } else {
    fallaciesContainer.innerHTML = res.fallacies_detected.map(f => `
      <div class="fallacy-card">
        <div class="fallacy-header">
          <span class="fallacy-tag">${f.fallacy_name}</span>
          <span class="fallacy-sev">Severity: ${f.severity}</span>
        </div>
        <p class="fallacy-excerpt">"${f.excerpt}"</p>
        <p class="fallacy-expl"><strong>Why it's flawed:</strong> ${f.explanation}</p>
        <div class="fallacy-corr"><strong>Correction Suggestion:</strong> ${f.correction_suggestion}</div>
      </div>
    `).join("");
  }

  // Claims
  const claimsContainer = $("#claimsList");
  if (!res.claims || res.claims.length === 0) {
    claimsContainer.innerHTML = `<p class="muted">No distinct claims identified.</p>`;
  } else {
    claimsContainer.innerHTML = res.claims.map(claim => `
      <div class="claim-card">
        <div><span class="claim-type-tag">${claim.type} Claim</span><span class="claim-statement">${claim.statement}</span></div>
        <div class="claim-assumption">Implicit Assumption: ${claim.implicit_assumption}</div>
      </div>
    `).join("");
  }

  // Evidence
  const evContainer = $("#evidenceList");
  const evItems = res.evidence_evaluation?.evidence_items || [];
  if (evItems.length === 0) {
    evContainer.innerHTML = `<p class="muted">No specific statistical or empirical evidence detected. Consider backing your statements with data.</p>`;
  } else {
    evContainer.innerHTML = evItems.map(ev => `
      <div class="evidence-card">
        <div><strong>Statement:</strong> "${ev.statement}"</div>
        <div class="muted">Types: ${ev.evidence_types.join(", ")} | Specificity: ${ev.specificity} | Credibility: ${ev.estimated_credibility}</div>
      </div>
    `).join("");
  }

  // Reasoning & Feedback
  $("#reasoningMode").textContent = `Primary Mode: ${res.reasoning_analysis.primary_mode} | Coherence Score: ${res.reasoning_analysis.coherence_score}/100`;
  $("#feedbackStrengths").innerHTML = (res.feedback.strengths || []).map(str => `<div>✓ ${str}</div>`).join("");
  $("#feedbackRecs").innerHTML = (res.feedback.recommendations || []).map(rec => `<div>💡 ${rec}</div>`).join("");
}

async function loadArgumentHistory() {
  const container = $("#argumentHistoryList");
  try {
    const history = await api("/argument-analysis/history", { headers: authHeaders() });
    container.classList.toggle("empty-state", history.length === 0);
    if (!history.length) {
      container.innerHTML = "No saved argument reports yet.";
      return;
    }
    container.innerHTML = history.slice(0, 5).map(item => `
      <div class="feed-item" data-arg-id="${item.id}">
        <span>
          <strong>${item.title}</strong>
          <span>${item.topic || 'General'} · Credibility: ${item.credibility_level} · ${new Date(item.created_at + "Z").toLocaleDateString()}</span>
        </span>
        <div style="display:flex;gap:8px;align-items:center;">
          <span class="score-pill">${item.overall_score}/100</span>
          <button type="button" class="text-button" data-action="view-arg" style="font-size:11px;color:var(--accent);">View</button>
          <button type="button" class="text-button" data-action="del-arg" style="font-size:11px;color:#ff8ba7;">Delete</button>
        </div>
      </div>
    `).join("");

    container.querySelectorAll("[data-action]").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const item = e.target.closest("[data-arg-id]");
        const id = item.dataset.argId;
        const action = e.target.dataset.action;
        if (action === "del-arg") {
          await api(`/argument-analysis/${id}`, { method: "DELETE", headers: authHeaders() });
          loadArgumentHistory();
        } else if (action === "view-arg") {
          const detail = await api(`/argument-analysis/${id}`, { headers: authHeaders() });
          renderArgumentAnalysis(detail.analysis_json);
          $("#argTitle").value = detail.title;
          $("#argTopic").value = detail.topic || "";
          $("#argSpeechText").value = detail.speech_text;
          document.querySelector("#argumentEngine").scrollIntoView({ behavior: "smooth" });
        }
      });
    });
  } catch (err) {
    console.warn("Failed to load argument history", err);
  }
}

// Preset Handlers
$("#loadPresetFallacies")?.addEventListener("click", () => {
  $("#argTitle").value = "Policy Critique with Fallacies";
  $("#argTopic").value = "Economic Tax Reform";
  $("#argSpeechText").value = (
    "You are an idiot and corrupt liar so your argument on taxes is completely invalid. " +
    "If we pass this small tax, it will inevitably lead to total collapse of society and disaster will follow. " +
    "So you are saying we should just complete destruction of society and ban everything! " +
    "A famous celebrity said this policy is great, so trust me because everyone knows that."
  );
});

$("#loadPresetEvidence")?.addEventListener("click", () => {
  $("#argTitle").value = "Evidence-Based Plastic Policy";
  $("#argTopic").value = "Single-Use Plastic Ban";
  $("#argSpeechText").value = (
    "We must enact a total ban on single-use plastics immediately because data shows 8 million tons " +
    "enter our oceans annually according to researchers at NASA. Studies from Dr. Smith show a 45% reduction in marine toxicity when bans are enforced. " +
    "Therefore, switching to sustainable alternatives will protect marine biodiversity and long-term economic stability."
  );
});

// Form submit
$("#argumentAnalysisForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const btn = $("#analyzeBtn");
  btn.textContent = "Analyzing Speech...";
  btn.disabled = true;

  const payload = {
    title: $("#argTitle").value.trim() || "Speech Analysis",
    topic: $("#argTopic").value.trim() || null,
    speech_text: $("#argSpeechText").value.trim(),
  };

  try {
    const res = await api("/argument-analysis/analyze", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    renderArgumentAnalysis(res);
    loadArgumentHistory();
  } catch (error) {
    alert(error.message);
  } finally {
    btn.textContent = "Analyze Argument & Fallacies";
    btn.disabled = false;
  }
});

// ===== COUNTERARGUMENT ENGINE =====
function renderCounterResults(res) {
  $("#counterResults").style.display = "block";
  $("#counterStrengthScore").textContent = res.summary.counter_strength_score;
  $("#counterSummaryText").textContent = `${res.summary.claims_addressed} claims addressed · ${res.summary.rebuttals_generated} rebuttals · ${res.summary.counterpoints_generated} counterpoints · ${res.summary.challenge_questions_generated} challenge questions · ${res.summary.strategies_suggested} strategies`;

  // Rebuttals
  $("#rebuttalsList").innerHTML = (res.rebuttals || []).map(r => `
    <div class="rebuttal-card">
      <div class="claim-ref"><strong>${r.claim_id}:</strong> "${r.original_claim.slice(0,120)}${r.original_claim.length > 120 ? '…' : ''}"</div>
      ${r.rebuttals.map(rb => `
        <div class="rebuttal-item">
          <span class="rebuttal-type">${rb.type}</span>
          <div class="rebuttal-text">${rb.rebuttal}</div>
        </div>
      `).join("")}
    </div>
  `).join("") || `<p class="muted">No rebuttals generated.</p>`;

  // Counterpoints
  $("#counterpointsList").innerHTML = (res.counterpoints || []).map(cp => `
    <div class="rebuttal-card">
      <div class="claim-ref"><strong>${cp.claim_id}:</strong> "${cp.original_claim.slice(0,120)}${cp.original_claim.length > 120 ? '…' : ''}"</div>
      ${cp.counterpoints.map(p => `<div class="counterpoint-item">↳ ${p}</div>`).join("")}
    </div>
  `).join("") || `<p class="muted">No counterpoints generated.</p>`;

  // Typed counterarguments (5 types)
  const typed = res.typed_counterarguments || {};
  $("#typedCounterList").innerHTML = Object.entries(typed).map(([typeName, args]) => `
    <div class="typed-section">
      <div class="typed-section-title">${typeName}</div>
      ${args.map(a => `
        <div class="typed-arg">
          <div class="typed-arg-title">${a.title}</div>
          <div class="typed-arg-text">${a.argument}</div>
        </div>
      `).join("")}
    </div>
  `).join("");

  // Alternative Perspectives
  $("#altPerspList").innerHTML = (res.alternative_perspectives || []).map(p => `
    <div class="persp-card">
      <div class="persp-lens">${p.lens}</div>
      <div class="persp-text">${p.perspective}</div>
    </div>
  `).join("");

  // Challenge Questions
  $("#challengeQList").innerHTML = (res.challenge_questions || []).map(cq => `
    <div class="rebuttal-card">
      <div class="claim-ref"><strong>${cq.claim_id}:</strong> ${cq.original_claim.slice(0,100)}${cq.original_claim.length > 100 ? '…' : ''}</div>
      ${cq.questions.map(q => `<div class="challenge-q">❓ ${q}</div>`).join("")}
    </div>
  `).join("");

  // Debate Strategy
  $("#strategyList").innerHTML = (res.debate_strategy || []).map(s => `
    <div class="strategy-card">
      <div class="strategy-header">
        <span class="strategy-name">${s.strategy}</span>
        <span class="strategy-priority ${s.priority.toLowerCase()}">${s.priority} Priority</span>
      </div>
      <div class="strategy-desc">${s.description}</div>
    </div>
  `).join("");
}

async function loadCounterHistory() {
  const container = $("#counterHistoryList");
  try {
    const history = await api("/counterarguments/history", { headers: authHeaders() });
    container.classList.toggle("empty-state", history.length === 0);
    if (!history.length) { container.innerHTML = "No saved counterargument reports yet."; return; }
    container.innerHTML = history.slice(0, 5).map(item => `
      <div class="feed-item" data-counter-id="${item.id}">
        <span>
          <strong>${item.title}</strong>
          <span>${item.topic || 'General'} · ${item.position || 'Opposing'} · ${new Date(item.created_at + "Z").toLocaleDateString()}</span>
        </span>
        <div style="display:flex;gap:8px;align-items:center;">
          <span class="score-pill">${item.counter_strength_score}/100</span>
          <button type="button" class="text-button" data-action="view-counter" style="font-size:11px;color:var(--accent);">View</button>
          <button type="button" class="text-button" data-action="del-counter" style="font-size:11px;color:#ff8ba7;">Delete</button>
        </div>
      </div>
    `).join("");
    container.querySelectorAll("[data-action]").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        const item = e.target.closest("[data-counter-id]");
        const id = item.dataset.counterId;
        if (e.target.dataset.action === "del-counter") {
          await api(`/counterarguments/${id}`, { method: "DELETE", headers: authHeaders() });
          loadCounterHistory();
        } else {
          const detail = await api(`/counterarguments/${id}`, { headers: authHeaders() });
          renderCounterResults(detail.report_json);
          $("#counterTitle").value = detail.title;
          $("#counterTopic").value = detail.topic || "";
          $("#counterPosition").value = detail.position || "";
          $("#counterArgText").value = detail.original_argument;
          document.querySelector("#counterEngine").scrollIntoView({ behavior: "smooth" });
        }
      });
    });
  } catch (err) { console.warn("Failed to load counter history", err); }
}

$("#loadCounterPreset")?.addEventListener("click", () => {
  $("#counterTitle").value = "Rebuttal to Plastic Ban Proposal";
  $("#counterTopic").value = "Single-Use Plastic Ban";
  $("#counterPosition").value = "Against";
  $("#counterArgText").value = (
    "We must enact a total ban on single-use plastics immediately because data shows 8 million tons " +
    "enter our oceans annually according to researchers at NASA. Studies from Dr. Smith show a 45% reduction in marine toxicity when bans are enforced. " +
    "Therefore, switching to sustainable alternatives will protect marine biodiversity and long-term economic stability."
  );
});

$("#counterForm")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const btn = $("#counterBtn");
  btn.textContent = "Generating Counterarguments...";
  btn.disabled = true;
  const payload = {
    title: $("#counterTitle").value.trim() || "Counter-Analysis",
    topic: $("#counterTopic").value.trim() || null,
    position: $("#counterPosition").value.trim() || null,
    argument_text: $("#counterArgText").value.trim(),
  };
  try {
    const res = await api("/counterarguments/generate", { method: "POST", headers: authHeaders(), body: JSON.stringify(payload) });
    renderCounterResults(res);
    loadCounterHistory();
  } catch (error) { alert(error.message); }
  finally { btn.textContent = "Generate Counterarguments"; btn.disabled = false; }
});

function renderPresentationResults(res) {
  const container = $("#presentationResults");
  if (!container) return;
  container.style.display = "block";

  const metrics = res.metrics || {};
  const speech = res.speech_analysis || {};
  const pace = res.speaking_pace_evaluation || {};
  const fillers = res.filler_word_usage || {};
  const conf = res.confidence_assessment || {};
  const clarity = res.clarity_assessment || {};
  const eng = res.audience_engagement_measurement || {};
  const recs = res.recommendations || [];

  $("#presOverallScore").textContent = `${res.overall_score || 0}/100`;
  $("#presPaceWpm").textContent = metrics.speech_pace_wpm || 0;
  $("#presPaceCategory").textContent = metrics.pace_category || "Optimal";
  $("#presFillerCount").textContent = metrics.filler_word_count || 0;
  $("#presFillerDensity").textContent = `${metrics.filler_density || 0} / 100 w`;
  $("#presConfScore").textContent = `${metrics.confidence_score || 0}/100`;
  $("#presConfLevel").textContent = conf.level || "Moderate";
  $("#presClarityScore").textContent = `${metrics.clarity_score || 0}/100`;
  $("#presClarityRating").textContent = clarity.complexity_rating || "Balanced";
  $("#presEngScore").textContent = `${metrics.audience_engagement_score || 0}/100`;
  $("#presEngSub").textContent = eng.has_cta ? "CTA Included" : "No CTA";

  $("#presFillerFeedback").textContent = `Total Fillers: ${fillers.total_count || 0} (${fillers.density_per_100_words || 0} per 100 words)`;
  const fillerList = $("#presFillerList");
  const bd = fillers.breakdown || {};
  if (Object.keys(bd).length > 0) {
    fillerList.innerHTML = Object.entries(bd)
      .map(([word, count]) => `<span class="fallacy-chip warning"><strong>${word}</strong> (${count}×)</span>`)
      .join("");
  } else {
    fillerList.innerHTML = `<span class="fallacy-chip success">No filler words detected! Clean delivery.</span>`;
  }

  $("#presConfFeedback").textContent = conf.feedback || "";
  $("#presStrongAssertions").innerHTML = (conf.strong_assertions || []).length
    ? `<strong>Strong Assertions:</strong> ` + conf.strong_assertions.map(w => `<span class="meta-pill accent">${w}</span>`).join(" ")
    : `<span class="muted">No strong assertion keywords found.</span>`;
  $("#presHedgeWords").innerHTML = (conf.hedge_words || []).length
    ? `<strong>Hedge Words:</strong> ` + conf.hedge_words.map(w => `<span class="meta-pill">${w}</span>`).join(" ")
    : `<span class="muted">No weak hedging words detected. Excellent conviction!</span>`;

  $("#presClarityFeedback").textContent = clarity.feedback || "";
  $("#presPaceFeedback").textContent = pace.feedback || "";
  $("#presTransitions").innerHTML = (clarity.transitions_found || []).length
    ? `<strong>Transitional Phrases:</strong> ` + clarity.transitions_found.map(w => `<span class="meta-pill accent">${w}</span>`).join(" ")
    : `<span class="muted">Consider using transition words (e.g. 'furthermore', 'however') to guide listeners.</span>`;

  $("#presEngFeedback").textContent = eng.feedback || "";
  $("#presHooksList").innerHTML = (eng.hooks_found || []).length
    ? `<strong>Audience Focus Words:</strong> ` + eng.hooks_found.map(w => `<span class="meta-pill accent">${w}</span>`).join(" ")
    : `<span class="muted">Use direct address words like 'you', 'we', 'imagine' to hook your audience.</span>`;

  $("#presRecsList").innerHTML = recs.length
    ? recs.map(r => `<div class="bullet-item">• ${r}</div>`).join("")
    : `<div class="bullet-item">• Keep up the outstanding presentation performance!</div>`;
}

async function loadPresentationHistory() {
  try {
    const items = await api("/presentation/analyses", { headers: authHeaders() });
    const list = $("#presentationAnalysisHistoryList");
    if (!list) return;
    list.classList.toggle("empty-state", items.length === 0);

    if (items.length === 0) {
      list.innerHTML = "No saved presentation analyses yet.";
      return;
    }

    list.innerHTML = items
      .map(
        item => `
      <div class="feed-item" data-pres-id="${item.id}">
        <div>
          <strong>${item.title}</strong>
          <span>${item.wpm} WPM · ${item.pace_category} · ${item.filler_count} Fillers · Conf: ${item.confidence_score}/100</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="score-pill">${item.overall_score}/100</span>
          <button type="button" class="text-button view-pres-btn" style="padding:4px 8px; font-size:11px;">View</button>
          <button type="button" class="text-button del-pres-btn" style="padding:4px 8px; font-size:11px; color:#ff6482;">Del</button>
        </div>
      </div>`
      )
      .join("");

    list.querySelectorAll(".feed-item").forEach(el => {
      const id = el.dataset.presId;
      el.querySelector(".view-pres-btn")?.addEventListener("click", async () => {
        const full = await api(`/presentation/analyses/${id}`, { headers: authHeaders() });
        if (full && full.analysis_json) renderPresentationResults(full.analysis_json);
      });
      el.querySelector(".del-pres-btn")?.addEventListener("click", async () => {
        await api(`/presentation/analyses/${id}`, { method: "DELETE", headers: authHeaders() });
        loadPresentationHistory();
      });
    });
  } catch (err) {
    console.warn("Failed to load presentation history", err);
  }
}

$("#loadPresentationPreset")?.addEventListener("click", () => {
  $("#presTitle").value = "Keynote Address: Future of AI";
  $("#presDuration").value = "120";
  $("#presText").value =
    "Good morning everyone. Imagine a world where artificial intelligence empowers every human being to achieve their full potential. " +
    "Um, we must act today because technology is definitely the most crucial driver of our century. " +
    "However, some people might feel hesitant. Have you ever wondered what happens if we fail to adapt? " +
    "I urge you to join us in shaping a responsible, ethical future. Let us take action together now.";
});

$("#presentationFormEngine")?.addEventListener("submit", async event => {
  event.preventDefault();
  const btn = $("#presBtn");
  btn.textContent = "Analyzing Presentation...";
  btn.disabled = true;
  const durVal = $("#presDuration").value.trim();
  const payload = {
    title: $("#presTitle").value.trim() || "Presentation Analysis",
    duration_seconds: durVal ? parseFloat(durVal) : null,
    speech_text: $("#presText").value.trim(),
  };
  try {
    const res = await api("/presentation/analyze", { method: "POST", headers: authHeaders(), body: JSON.stringify(payload) });
    renderPresentationResults(res);
    loadPresentationHistory();
  } catch (error) {
    alert(error.message);
  } finally {
    btn.textContent = "Analyze Presentation";
    btn.disabled = false;
  }
});

/* --- AI DEBATE SIMULATION ENGINE FRONTEND --- */
let currentSimSessionId = null;

function renderCoachingCorner(coaching) {
  if (!coaching) return;
  $("#simCoachTurnScore").textContent = `${coaching.turn_score || 0}/100`;

  const strList = $("#simCoachStrengths");
  strList.innerHTML = (coaching.strengths || []).length
    ? coaching.strengths.map(s => `<div class="bullet-item">• ${s}</div>`).join("")
    : `<div class="bullet-item">• Clear position stated.</div>`;

  const vulList = $("#simCoachVulnerabilities");
  vulList.innerHTML = (coaching.vulnerabilities || []).length
    ? coaching.vulnerabilities.map(v => `<div class="bullet-item" style="color:#ff9d6c;">• ${v}</div>`).join("")
    : `<div class="bullet-item">• None identified. Strong delivery!</div>`;

  $("#simCoachStrategy").textContent = coaching.strategic_advice || "Focus on building strong empirical proof.";

  const sugList = $("#simCoachSuggestions");
  sugList.innerHTML = (coaching.suggested_responses || []).length
    ? coaching.suggested_responses.map(s => `<span class="fallacy-chip"><strong>Idea:</strong> ${s}</span>`).join("")
    : "";
}

function appendChatTurn(turn, opponent) {
  const chatThread = $("#simChatThread");
  if (!chatThread) return;

  const userBubble = document.createElement("div");
  userBubble.className = "format-chip";
  userBubble.style.background = "rgba(182, 244, 230, 0.12)";
  userBubble.style.borderLeft = "3px solid var(--accent)";
  userBubble.innerHTML = `<strong style="color:var(--accent);">You (Turn ${turn.turn_number}):</strong><p style="margin-top:4px; font-size:12px; line-height:1.45;">${turn.user_argument}</p>`;
  chatThread.appendChild(userBubble);

  const aiBubble = document.createElement("div");
  aiBubble.className = "format-chip";
  aiBubble.style.background = "rgba(14, 38, 72, 0.5)";
  aiBubble.style.borderLeft = "3px solid #64b5f6";
  aiBubble.innerHTML = `<strong style="color:#64b5f6;">${opponent?.avatar || "🤖"} ${opponent?.name || "AI Opponent"} (Rebuttal):</strong><p style="margin-top:4px; font-size:12px; line-height:1.45;">${turn.ai_response}</p>`;
  chatThread.appendChild(aiBubble);

  if (turn.challenge_question) {
    const challengeBox = document.createElement("div");
    challengeBox.className = "format-chip";
    challengeBox.style.background = "rgba(255, 157, 108, 0.15)";
    challengeBox.style.border = "1px dashed #ff9d6c";
    challengeBox.innerHTML = `<strong style="color:#ff9d6c;">⚡ Real-Time Challenge:</strong><p style="margin-top:2px; font-size:12px; font-style:italic;">${turn.challenge_question}</p>`;
    chatThread.appendChild(challengeBox);
  }

  chatThread.scrollTop = chatThread.scrollHeight;
}

function renderSimulationArena(sessionData) {
  currentSimSessionId = sessionData.id || sessionData.session_id;
  const opp = sessionData.opponent || {};

  $("#simulationActiveArea").style.display = "block";
  $("#simOpponentHeader").textContent = `${opp.avatar || "🤖"} ${opp.name || "AI Opponent"} (${opp.title || "Debater"})`;
  $("#simTopicMeta").textContent = `Topic: ${sessionData.topic} | Your Stance: ${sessionData.user_position || "For"}`;
  $("#simTurnCounter").textContent = `Round ${(sessionData.turns || []).length + 1}`;

  const chatThread = $("#simChatThread");
  chatThread.innerHTML = "";

  // Render Opening Statement
  const openingBox = document.createElement("div");
  openingBox.className = "format-chip";
  openingBox.style.background = "rgba(14, 38, 72, 0.5)";
  openingBox.innerHTML = `<strong style="color:#64b5f6;">${opp.avatar || "🤖"} ${opp.name || "AI Opponent"} (Opening Statement):</strong><p style="margin-top:4px; font-size:12px; line-height:1.45;">${opp.opening_statement || "Let us begin."}</p>`;
  chatThread.appendChild(openingBox);

  // Render existing turns
  if (sessionData.turns && sessionData.turns.length > 0) {
    sessionData.turns.forEach(t => appendChatTurn(t, opp));
    const lastTurn = sessionData.turns[sessionData.turns.length - 1];
    if (lastTurn.coaching_feedback) renderCoachingCorner(lastTurn.coaching_feedback);
  }

  if (sessionData.status === "completed" && sessionData.summary) {
    renderSimulationSummary(sessionData.summary);
  }
}

function renderSimulationSummary(summary) {
  const box = $("#simulationSummaryBox");
  if (!box) return;
  box.style.display = "block";
  $("#simWinnerVal").textContent = summary.overall_winner || "Draw";
  $("#simScoreMeta").textContent = `User Score: ${summary.final_user_score} | AI Opponent Score: ${summary.final_ai_score}`;
  $("#simVerdictText").textContent = summary.verdict || "";

  const takeaways = $("#simTakeawaysList");
  takeaways.innerHTML = (summary.key_takeaways || [])
    .map(t => `<div class="bullet-item">• ${t}</div>`)
    .join("");
}

async function loadSimulationHistory() {
  try {
    const items = await api("/simulation/sessions", { headers: authHeaders() });
    const list = $("#simulationHistoryList");
    if (!list) return;
    list.classList.toggle("empty-state", items.length === 0);

    if (items.length === 0) {
      list.innerHTML = "No simulation sessions yet.";
      return;
    }

    list.innerHTML = items
      .map(
        s => `
      <div class="feed-item" data-sim-id="${s.id}">
        <div>
          <strong>${s.topic}</strong>
          <span>Stance: ${s.user_position} · Opponent: ${s.opponent_name} (${s.opponent_title}) · Status: ${s.status}</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="score-pill">${s.status === "completed" ? `Score: ${s.user_score}` : `${s.total_turns} Turns`}</span>
          <button type="button" class="text-button open-sim-btn" style="padding:4px 8px; font-size:11px;">Open</button>
          <button type="button" class="text-button del-sim-btn" style="padding:4px 8px; font-size:11px; color:#ff6482;">Del</button>
        </div>
      </div>`
      )
      .join("");

    list.querySelectorAll(".feed-item").forEach(el => {
      const id = el.dataset.simId;
      el.querySelector(".open-sim-btn")?.addEventListener("click", async () => {
        const full = await api(`/simulation/sessions/${id}`, { headers: authHeaders() });
        if (full) renderSimulationArena(full);
      });
      el.querySelector(".del-sim-btn")?.addEventListener("click", async () => {
        await api(`/simulation/sessions/${id}`, { method: "DELETE", headers: authHeaders() });
        loadSimulationHistory();
      });
    });
  } catch (err) {
    console.warn("Failed to load simulation history", err);
  }
}

$("#loadSimulationPreset")?.addEventListener("click", () => {
  $("#simTopic").value = "Universal Basic Income";
  $("#simUserPosition").value = "For";
  $("#simPersona").value = "socratic";
});

$("#simulationStartForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  const btn = $("#simStartBtn");
  btn.textContent = "Launching Arena...";
  btn.disabled = true;
  const payload = {
    topic: $("#simTopic").value.trim(),
    user_position: $("#simUserPosition").value,
    opponent_persona: $("#simPersona").value,
  };
  try {
    const session = await api("/simulation/start", { method: "POST", headers: authHeaders(), body: JSON.stringify(payload) });
    renderSimulationArena(session);
    loadSimulationHistory();
  } catch (error) {
    alert(error.message);
  } finally {
    btn.textContent = "Start AI Debate Simulation";
    btn.disabled = false;
  }
});

$("#simTurnForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  if (!currentSimSessionId) {
    alert("Please start a debate session first.");
    return;
  }
  const btn = $("#simTurnSubmitBtn");
  btn.textContent = "Submitting Turn...";
  btn.disabled = true;
  const argText = $("#simTurnInput").value.trim();
  try {
    const res = await api(`/simulation/sessions/${currentSimSessionId}/turn`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ user_argument: argText }),
    });
    $("#simTurnInput").value = "";
    const session = await api(`/simulation/sessions/${currentSimSessionId}`, { headers: authHeaders() });
    renderSimulationArena(session);
  } catch (error) {
    alert(error.message);
  } finally {
    btn.textContent = "Submit Turn Argument →";
    btn.disabled = false;
  }
});

$("#simCompleteBtn")?.addEventListener("click", async () => {
  if (!currentSimSessionId) return;
  try {
    const res = await api(`/simulation/sessions/${currentSimSessionId}/complete`, { method: "POST", headers: authHeaders() });
    renderSimulationSummary(res.summary);
    loadSimulationHistory();
  } catch (error) {
    alert(error.message);
  }
});

/* --- PERFORMANCE SCORING ENGINE FRONTEND --- */
function renderScorecardResults(res) {
  const container = $("#scoringResults");
  if (!container) return;
  container.style.display = "block";

  $("#scoreOverallVal").textContent = `${res.overall_performance_score || 0.0}`;
  $("#scoreTierBadge").textContent = res.tier_badge || res.performance_tier || "Novice Practice";
  $("#scoreTierDesc").textContent = res.tier_description || "";

  const s = res.scores || {};
  $("#scoreDebateVal").textContent = `${s.debate_performance || 0.0}`;
  $("#scorePresVal").textContent = `${s.presentation_performance || 0.0}`;
  $("#scoreCriticalVal").textContent = `${s.critical_thinking || 0.0}`;
  $("#scoreCommVal").textContent = `${s.communication_effectiveness || 0.0}`;

  const ct = res.critical_thinking_assessment || {};
  $("#scoreCriticalRating").textContent = ct.rating || "Moderate";

  const cm = res.communication_effectiveness_assessment || {};
  $("#scoreCommRating").textContent = cm.rating || "Developing";

  // Debate Weights Breakdown
  const weightsContainer = $("#debateWeightsBreakdown");
  const w = res.debate_breakdown?.weights || {};
  if (Object.keys(w).length > 0) {
    const labelMap = {
      argument_quality: "Argument Quality (30%)",
      evidence_usage: "Evidence Usage (20%)",
      logical_consistency: "Logical Consistency (20%)",
      rebuttal_effectiveness: "Rebuttal Effectiveness (15%)",
      communication_skills: "Communication Skills (15%)",
    };
    weightsContainer.innerHTML = Object.entries(w)
      .map(
        ([key, data]) =>
          `<span class="fallacy-chip"><strong>${labelMap[key] || key}:</strong> ${data.value} (Contrib: ${data.contribution})</span>`
      )
      .join("");
  } else {
    weightsContainer.innerHTML = `<span class="muted">No breakdown data available.</span>`;
  }

  // Strengths & Growth
  const strList = $("#scoreStrengths");
  strList.innerHTML = (res.strengths || []).length
    ? res.strengths.map(st => `<div class="bullet-item">• ${st}</div>`).join("")
    : `<div class="bullet-item">• Solid baseline performance.</div>`;

  const groList = $("#scoreGrowth");
  groList.innerHTML = (res.growth_areas || []).length
    ? res.growth_areas.map(g => `<div class="bullet-item" style="color:#ff9d6c;">• ${g}</div>`).join("")
    : `<div class="bullet-item">• Excellent balanced score across all metrics!</div>`;

  const planList = $("#scoreCoachingPlan");
  planList.innerHTML = (res.coaching_plan || []).length
    ? res.coaching_plan.map(cp => `<div class="bullet-item">• ${cp}</div>`).join("")
    : `<div class="bullet-item">• Continue practice sessions to maintain peak performance.</div>`;
}

async function loadScorecardHistory() {
  try {
    const items = await api("/scoring/scorecards", { headers: authHeaders() });
    const list = $("#scorecardHistoryList");
    if (!list) return;
    list.classList.toggle("empty-state", items.length === 0);

    if (items.length === 0) {
      list.innerHTML = "No saved performance scorecards yet.";
      return;
    }

    list.innerHTML = items
      .map(
        c => `
      <div class="feed-item" data-card-id="${c.id}">
        <div>
          <strong>${c.title}</strong>
          <span>${c.performance_tier} · Debate: ${c.debate_score} · Pres: ${c.presentation_score} · Critical: ${c.critical_thinking_score}</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="score-pill">${c.overall_performance_score}/100</span>
          <button type="button" class="text-button view-card-btn" style="padding:4px 8px; font-size:11px;">View</button>
          <button type="button" class="text-button del-card-btn" style="padding:4px 8px; font-size:11px; color:#ff6482;">Del</button>
        </div>
      </div>`
      )
      .join("");

    list.querySelectorAll(".feed-item").forEach(el => {
      const id = el.dataset.cardId;
      el.querySelector(".view-card-btn")?.addEventListener("click", async () => {
        const full = await api(`/scoring/scorecards/${id}`, { headers: authHeaders() });
        if (full && full.scorecard_json) renderScorecardResults(full.scorecard_json);
      });
      el.querySelector(".del-card-btn")?.addEventListener("click", async () => {
        await api(`/scoring/scorecards/${id}`, { method: "DELETE", headers: authHeaders() });
        loadScorecardHistory();
      });
    });
  } catch (err) {
    console.warn("Failed to load scorecard history", err);
  }
}

$("#loadScoringPreset")?.addEventListener("click", () => {
  $("#scoreTitle").value = "Keynote & Debate Performance Evaluation";
  $("#scoreAQ").value = "88";
  $("#scoreEU").value = "82";
  $("#scoreLC").value = "85";
  $("#scoreRE").value = "78";
  $("#scoreCS").value = "84";
  $("#scoreText").value =
    "We must enact comprehensive carbon neutrality policies because peer-reviewed research proves a 45% reduction in industrial toxicity. " +
    "Therefore, sustainable investment will drive long-term economic growth. However, critics argue initial transition costs are high.";
});

$("#scoringForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  const btn = $("#scoreBtn");
  btn.textContent = "Computing Weighted Scorecard...";
  btn.disabled = true;

  const getNum = id => {
    const val = $(id).value.trim();
    return val !== "" ? parseFloat(val) : null;
  };

  const payload = {
    title: $("#scoreTitle").value.trim() || "Performance Scorecard",
    speech_text: $("#scoreText").value.trim() || null,
    argument_quality: getNum("#scoreAQ"),
    evidence_usage: getNum("#scoreEU"),
    logical_consistency: getNum("#scoreLC"),
    rebuttal_effectiveness: getNum("#scoreRE"),
    communication_skills: getNum("#scoreCS"),
  };

  try {
    const res = await api("/scoring/evaluate", { method: "POST", headers: authHeaders(), body: JSON.stringify(payload) });
    renderScorecardResults(res);
    loadScorecardHistory();
  } catch (error) {
    alert(error.message);
  } finally {
    btn.textContent = "Evaluate & Compute Weighted Scorecard";
    btn.disabled = false;
  }
});

/* --- RECOMMENDATION & COACHING ENGINE FRONTEND --- */
function renderCoachingPlanResults(res) {
  const container = $("#coachingResults");
  if (!container) return;
  container.style.display = "block";

  $("#coachRoleFeedback").textContent = res.personalized_coaching_feedback || "";
  const lp = res.learning_path || {};
  $("#coachTargetFocus").textContent = `Focus: ${lp.recommended_focus || "Argument Structure"}`;

  // Debate & Presentation Recommendations
  const debRecs = $("#coachDebateRecs");
  debRecs.innerHTML = (res.debate_recommendations || []).length
    ? res.debate_recommendations.map(r => `<div class="bullet-item">• ${r}</div>`).join("")
    : `<div class="bullet-item">• Keep practicing structured claims.</div>`;

  const presRecs = $("#coachPresRecs");
  presRecs.innerHTML = (res.presentation_suggestions || []).length
    ? res.presentation_suggestions.map(s => `<div class="bullet-item">• ${s}</div>`).join("")
    : `<div class="bullet-item">• Maintain current delivery cadence.</div>`;

  // Weekly Learning Path
  const modulesContainer = $("#coachWeeklyModules");
  const mods = lp.weekly_modules || [];
  if (mods.length > 0) {
    modulesContainer.innerHTML = mods
      .map(
        m => `
      <div class="format-chip">
        <strong style="color: var(--accent);">${m.week}: ${m.focus}</strong>
        <div style="margin-top: 6px; font-size: 11px;">
          ${(m.activities || []).map(a => `<div style="color: var(--muted); margin-bottom: 3px;">• ${a}</div>`).join("")}
        </div>
      </div>`
      )
      .join("");
  } else {
    modulesContainer.innerHTML = `<span class="muted">No weekly modules generated.</span>`;
  }

  // Milestones
  const msContainer = $("#coachMilestones");
  const ms = res.skill_development_plan || [];
  msContainer.innerHTML = ms.length
    ? ms.map(m => `<div class="bullet-item"><strong>${m.milestone}:</strong> ${m.task}</div>`).join("")
    : `<div class="bullet-item">• Complete daily practice rounds.</div>`;
}

$("#loadCoachingPreset")?.addEventListener("click", () => {
  $("#coachPlanTitle").value = "4-Week Debate & Presentation Pathway";
  $("#coachExpLevel").value = "Intermediate";
  $("#coachDebateScore").value = "72";
  $("#coachPresScore").value = "78";
});

$("#coachingForm")?.addEventListener("submit", async event => {
  event.preventDefault();
  const btn = $("#coachBtn");
  btn.textContent = "Generating Coaching Plan...";
  btn.disabled = true;

  const payload = {
    title: $("#coachPlanTitle").value.trim() || "Personalized Coaching Plan",
    experience_level: $("#coachExpLevel").value,
    debate_score: $("#coachDebateScore").value ? parseFloat($("#coachDebateScore").value) : 75.0,
    presentation_score: $("#coachPresScore").value ? parseFloat($("#coachPresScore").value) : 75.0,
  };

  try {
    const res = await api("/coaching/generate", { method: "POST", headers: authHeaders(), body: JSON.stringify(payload) });
    renderCoachingPlanResults(res);
    loadCoachingHistory();
  } catch (error) {
    alert(error.message);
  } finally {
    btn.textContent = "Generate Personalized Coaching Plan →";
    btn.disabled = false;
  }
});

async function loadRoleAnalytics() {
  const container = $("#analyticsBody");
  if (!container) return;

  try {
    if (user.role === "Learner") {
      const data = await api("/analytics/learner", { headers: authHeaders() });
      $("#analyticsTitle").textContent = "Learner Performance & Insights";
      container.innerHTML = `
        <div class="format-strip" style="grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));">
          <div class="format-chip"><strong>Latest Rating</strong><span class="score-val" style="font-size:24px; color:var(--accent);">${data.latest_score}/100</span><span>${data.performance_tier}</span></div>
          <div class="format-chip"><strong>Improvement Trend</strong><span class="score-val" style="font-size:24px; color:#a8e7df;">${data.trend_status}</span><span>${data.improvement_trend}</span></div>
        </div>
        <div style="margin-top:16px;">
          <h4 style="font-size:12px; margin-bottom:6px; color:var(--accent);">Coaching Insight</h4>
          <p style="font-size:12px; color:var(--muted);">${data.coaching_insights}</p>
        </div>
        <div style="margin-top:16px;">
          <h4 style="font-size:12px; margin-bottom:6px;">Recommended Exercises</h4>
          <div class="fallacy-chips">
            ${(data.recommended_exercises || []).map(e => `<span class="fallacy-chip"><strong>${e.title}:</strong> ${e.category} (${e.duration})</span>`).join("")}
          </div>
        </div>`;
    } else if (user.role === "Coach") {
      const data = await api("/analytics/coach", { headers: authHeaders() });
      $("#analyticsTitle").textContent = "Debate Coach Progress Monitoring & Skill Gaps";
      container.innerHTML = `
        <div class="format-strip">
          <div class="format-chip"><strong>Assigned Learners</strong><span>${data.total_students} Registered</span></div>
          <div class="format-chip"><strong>Debate Evaluations</strong><span>${data.total_evaluations} Rounds Completed</span></div>
        </div>
        <div style="margin-top:16px;">
          <h4 style="font-size:12px; margin-bottom:6px; color:var(--accent);">Platform Skill Gap Analysis</h4>
          <div class="fallacy-chips">
            ${(data.skill_gap_analysis || []).map(g => `<span class="fallacy-chip warning"><strong>${g.skill}:</strong> Gap ${g.gap_percentage} (${g.recommendation})</span>`).join("")}
          </div>
        </div>
        <div style="margin-top:16px;">
          <h4 style="font-size:12px; margin-bottom:6px;">Student Roster & Scores</h4>
          <div class="feed-list">
            ${(data.students || []).map(s => `<div class="feed-item"><span><strong>${s.name}</strong><span>${s.email} · ${s.tier}</span></span><span class="score-pill">${s.latest_score}/100</span></div>`).join("")}
          </div>
        </div>`;
    } else if (user.role === "Educator") {
      const data = await api("/analytics/educator", { headers: authHeaders() });
      $("#analyticsTitle").textContent = "Educator Class Analytics & Student Leaderboard";
      container.innerHTML = `
        <div class="format-strip">
          <div class="format-chip"><strong>Class Average Score</strong><span class="score-val" style="font-size:24px; color:var(--accent);">${data.class_analytics?.class_average_score}/100</span><span>${data.class_analytics?.class_status}</span></div>
          <div class="format-chip"><strong>Total Class Debates</strong><span>${data.debate_performance_reports?.total_debate_rounds} Rounds</span></div>
          <div class="format-chip"><strong>Class WPM / Fillers</strong><span>${data.presentation_assessment_reports?.avg_wpm} WPM · ${data.presentation_assessment_reports?.avg_filler_density} Density</span></div>
        </div>
        <div style="margin-top:16px;">
          <h4 style="font-size:12px; margin-bottom:6px; color:var(--accent);">Student Rankings Leaderboard</h4>
          <div class="feed-list">
            ${(data.student_rankings || []).map(r => `<div class="feed-item"><span><strong>#${r.rank} ${r.name}</strong><span>${r.email} · ${r.tier}</span></span><span class="score-pill">${r.overall_score}/100</span></div>`).join("")}
          </div>
        </div>`;
    } else if (user.role === "Admin") {
      const data = await api("/analytics/admin", { headers: authHeaders() });
      $("#analyticsTitle").textContent = "Admin Platform Analytics & AI Model Monitoring";
      container.innerHTML = `
        <div class="format-strip" style="grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));">
          <div class="format-chip"><strong>Total Users</strong><span>${data.user_management?.total_users} Accounts</span></div>
          <div class="format-chip"><strong>Argument Analyses</strong><span>${data.platform_analytics?.total_argument_analyses} Reports</span></div>
          <div class="format-chip"><strong>Counter Reports</strong><span>${data.platform_analytics?.total_counter_reports} Reports</span></div>
          <div class="format-chip"><strong>AI Simulations</strong><span>${data.platform_analytics?.total_simulations} Rounds</span></div>
          <div class="format-chip"><strong>Scorecards</strong><span>${data.platform_analytics?.total_scorecards} Scorecards</span></div>
        </div>
        <div style="margin-top:16px;">
          <h4 style="font-size:12px; margin-bottom:6px; color:var(--accent);">AI Model Health Monitoring</h4>
          <div class="fallacy-chips">
            ${(data.ai_model_monitoring || []).map(m => `<span class="fallacy-chip success"><strong>${m.model_name}:</strong> ${m.status} (${m.latency_ms}ms)</span>`).join("")}
          </div>
        </div>`;
    }
  } catch (err) {
    console.warn("Failed to load role analytics", err);
  }
}

async function initialise() {
  $("#emailText").textContent = user.email;
  $("#roleLabel").textContent = `${user.role.toUpperCase()} SPACE`;
  $("#roleCard").textContent = user.role;
  $("#roleDescription").textContent = roleCopy(user.role);
  try {
    if (user.role === "Learner") $("#welcomeTitle").textContent = (await api("/learner/dashboard", { headers: authHeaders() })).message;
    else if (["Coach", "Educator"].includes(user.role)) $("#welcomeTitle").textContent = (await api("/guidance/learners", { headers: authHeaders() })).message;
    else $("#welcomeTitle").textContent = "Platform overview.";
    await Promise.all([loadProfile(), loadSkills(), loadGoals(), loadHistory(), loadManagement(), loadFormats(), loadSessions(), loadArgumentHistory(), loadCounterHistory(), loadPresentationHistory(), loadSimulationHistory(), loadScorecardHistory(), loadCoachingHistory(), loadRoleAnalytics()]);
  } catch (error) {
    $("#accessMessage").textContent = error.message;
    if (error.message.includes("access token")) {
      localStorage.clear();
      window.location.replace("index.html");
    }
  }
}
const openProfile = () => $("#profileDialog").showModal();
$("#editProfileBtn").addEventListener("click", openProfile);
$("#focusAction").addEventListener("click", openProfile);
$(".close-button").addEventListener("click", () => $("#profileDialog").close());
$("#profileForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const split = (name) => form.get(name).split(",").map((item) => item.trim()).filter(Boolean);
  const payload = { name: form.get("name"), experience: form.get("experience"), goals: form.get("goals"), preferred_topics: split("topics"), presentation_domains: split("domains"), coaching_preference: form.get("coaching_preference") };
  try {
    renderProfile(await api("/profile", { method: "PUT", headers: authHeaders(), body: JSON.stringify(payload) }));
    $("#profileMessage").textContent = "Saved.";
    setTimeout(() => $("#profileDialog").close(), 450);
  } catch (error) {
    $("#profileMessage").textContent = error.message;
  }
});
$("#saveSkillsBtn").addEventListener("click", async () => {
  const payload = Object.fromEntries(Object.keys(names).map((key) => [key, Number($(`#skill-${key}`).value)]));
  await api("/skills", { method: "PUT", headers: authHeaders(), body: JSON.stringify(payload) });
  $("#saveSkillsBtn").textContent = "Saved";
  setTimeout(() => $("#saveSkillsBtn").textContent = "Save scores", 1000);
});
$("#goalForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  await api("/learning-goals", { method: "POST", headers: authHeaders(), body: JSON.stringify(Object.fromEntries(form)) });
  event.currentTarget.reset();
  loadGoals();
});
$("#debateForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.currentTarget));
  form.score = form.score ? Number(form.score) : null;
  await api("/debates", { method: "POST", headers: authHeaders(), body: JSON.stringify(form) });
  event.currentTarget.reset();
  loadHistory();
});
$("#presentationForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = Object.fromEntries(new FormData(event.currentTarget));
  form.score = form.score ? Number(form.score) : null;
  await api("/presentations", { method: "POST", headers: authHeaders(), body: JSON.stringify(form) });
  event.currentTarget.reset();
  loadHistory();
});
$("#sessionFormat").addEventListener("change", syncPositionOptions);
$("#sessionForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const debateFormat = form.get("format");
  const meta = formatMeta(debateFormat);
  const myPosition = form.get("position");
  const opposing = (meta?.positions || []).find((position) => position !== myPosition) || "Against";
  const opponentName = (form.get("opponent_name") || "").trim();
  const participants = [{ display_name: user.name || user.email || "You", position: myPosition, user_id: user.id || null, is_ai: false }];
  if (debateFormat === "AI Debate Simulation") {
    participants.push({ display_name: opponentName || "AI Opponent", position: opposing, is_ai: true });
  } else if (opponentName) {
    participants.push({ display_name: opponentName, position: opposing, is_ai: false });
  }
  const scheduled = form.get("scheduled_at");
  const payload = {
    topic: form.get("topic"),
    description: form.get("description") || null,
    format: debateFormat,
    scheduled_at: scheduled ? new Date(scheduled).toISOString() : null,
    status: scheduled ? "scheduled" : "draft",
    recording_url: form.get("recording_url") || null,
    participants,
  };
  try {
    await api("/debate-sessions", { method: "POST", headers: authHeaders(), body: JSON.stringify(payload) });
    event.currentTarget.reset();
    syncPositionOptions();
    loadSessions();
  } catch (error) {
    alert(error.message);
  }
});
$("#signOutBtn").addEventListener("click", () => {
  localStorage.removeItem("orator_token");
  localStorage.removeItem("orator_user");
  window.location.href = "index.html";
});

/* --- IPAD-STYLE POPUP PANEL SYSTEM --- */
let activePanelEl = null;
let activePlaceholder = null;

function closePopupPanel() {
  const panelBackdrop = $("#panelBackdrop");
  const popupPanel = $("#popupPanel");
  const panelContent = $("#panelContent");

  if (panelBackdrop) panelBackdrop.classList.remove("open");
  if (popupPanel) popupPanel.classList.remove("open");

  if (activePanelEl && activePlaceholder) {
    activePlaceholder.replaceWith(activePanelEl);
    activePanelEl.style.display = "";
    activePanelEl = null;
    activePlaceholder = null;
  }
  if (panelContent) panelContent.innerHTML = "";

  document.querySelectorAll(".section-rail a").forEach((a) => {
    a.classList.toggle("nav-active", a.dataset.panel === "overview");
  });
}

function openPopupPanel(panelId, navLink) {
  if (panelId === "overview") {
    closePopupPanel();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  document.querySelectorAll(".section-rail a").forEach((a) => a.classList.remove("nav-active"));
  if (navLink) navLink.classList.add("nav-active");

  if (activePanelEl && activePlaceholder) {
    activePlaceholder.replaceWith(activePanelEl);
    activePanelEl.style.display = "";
    activePanelEl = null;
    activePlaceholder = null;
  }

  const target = document.getElementById(`panel-${panelId}`) || document.getElementById(panelId);
  if (!target) return;

  activePlaceholder = document.createElement("div");
  activePlaceholder.dataset.placeholderFor = panelId;
  target.parentNode.insertBefore(activePlaceholder, target);

  activePanelEl = target;
  target.style.display = "block";
  target.hidden = false;

  const panelContent = $("#panelContent");
  if (panelContent) {
    panelContent.innerHTML = "";
    panelContent.appendChild(target);
  }

  const panelBackdrop = $("#panelBackdrop");
  const popupPanel = $("#popupPanel");
  if (panelBackdrop) panelBackdrop.classList.add("open");
  if (popupPanel) {
    popupPanel.classList.add("open");
    popupPanel.scrollTop = 0;
  }
}

function initPopupNavigation() {
  document.querySelectorAll(".section-rail a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      openPopupPanel(link.dataset.panel, link);
    });
  });

  const closeBtn = $("#panelCloseBtn");
  if (closeBtn) closeBtn.addEventListener("click", closePopupPanel);

  const backdrop = $("#panelBackdrop");
  if (backdrop) backdrop.addEventListener("click", closePopupPanel);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePopupPanel();
  });
}

initPopupNavigation();
initialise();


