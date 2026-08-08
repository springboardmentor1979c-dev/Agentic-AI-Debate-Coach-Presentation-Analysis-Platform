const API = "http://127.0.0.1:8000";
const state = { token: localStorage.getItem("orator_token"), user: JSON.parse(localStorage.getItem("orator_user") || "null") };
const $ = (selector) => document.querySelector(selector);

function setMessage(element, message, success = false) { element.textContent = message; element.classList.toggle("success", success); }
function authHeaders() { return { "Content-Type": "application/json", Authorization: `Bearer ${state.token}` }; }
async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || "Something went wrong. Please try again.");
  return data;
}

document.querySelectorAll(".auth-tabs button").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".auth-tabs button").forEach((tab) => tab.classList.toggle("active", tab === button));
  $("#loginForm").classList.toggle("active", button.dataset.tab === "login");
  $("#registerForm").classList.toggle("active", button.dataset.tab === "register");
  setMessage($("#formMessage"), "");
}));

$("#loginForm").addEventListener("submit", async (event) => {
  event.preventDefault(); const form = new FormData(event.currentTarget); const message = $("#formMessage"); setMessage(message, "Connecting to your studio…");
  try { const data = await api("/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) }); state.token = data.access_token; state.user = { id: data.id, name: data.name, email: form.get("email"), role: data.role }; localStorage.setItem("orator_token", state.token); localStorage.setItem("orator_user", JSON.stringify(state.user)); window.location.href = "dashboard.html"; } catch (error) { setMessage(message, error.message); }
});

$("#registerForm").addEventListener("submit", async (event) => {
  event.preventDefault(); const form = new FormData(event.currentTarget); const message = $("#formMessage"); setMessage(message, "Creating your practice room…");
  try { await api("/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) }); $("#loginForm [name=email]").value = form.get("email"); $("#loginForm [name=password]").value = form.get("password"); document.querySelector('[data-tab="login"]').click(); setMessage(message, "Account created. Sign in to enter your studio.", true); } catch (error) { setMessage(message, error.message); }
});

function roleCopy(role) { return { Learner: "Shape your voice through deliberate practice.", Coach: "Guide learners toward their clearest thinking.", Educator: "Create space for thoughtful, confident speakers.", Admin: "Oversee the people and practice within your platform." }[role] || "Your practice space is ready."; }
async function showApp() {
  $("#authView").hidden = true; $("#appView").hidden = false; $("#signOutBtn").hidden = false;
  $("#emailText").textContent = state.user.email; $("#roleLabel").textContent = `${state.user.role.toUpperCase()} SPACE`;
  $("#roleCard").textContent = state.user.role; $("#roleDescription").textContent = roleCopy(state.user.role);
  try {
    if (state.user.role === "Learner") { const dashboard = await api("/learner/dashboard", { headers: authHeaders() }); $("#welcomeTitle").textContent = dashboard.message; }
    else if (["Coach", "Educator"].includes(state.user.role)) { const guidance = await api("/guidance/learners", { headers: authHeaders() }); $("#welcomeTitle").textContent = guidance.message; }
    else { const users = await api("/admin/users", { headers: authHeaders() }); $("#welcomeTitle").textContent = `${users.length} voices in your platform.`; }
    await loadProfile();
  } catch (error) { $("#accessMessage").textContent = error.message; }
}
async function loadProfile() {
  try { const profile = await api("/profile", { headers: authHeaders() }); renderProfile(profile); } catch (error) { if (!error.message.includes("Profile not found")) console.warn(error); }
}
function renderProfile(profile) { $("#profileSummary").hidden = false; $("#profileName").textContent = profile.name; $("#profileExperience").textContent = profile.experience; $("#profileGoals").textContent = profile.goals; $("#profileTopics").textContent = profile.preferred_topics.join(", "); $("#focusTitle").textContent = "Your practice is taking shape."; $("#focusBody").textContent = "Your speaker profile is ready. Return any time to refine the direction of your work."; $("#focusAction").textContent = "Refine profile →"; }
function openProfile() { const dialog = $("#profileDialog"); dialog.showModal(); }
$("#editProfileBtn").addEventListener("click", openProfile); $("#focusAction").addEventListener("click", openProfile);
$(".close-button").addEventListener("click", () => $("#profileDialog").close());
$("#profileForm").addEventListener("submit", async (event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const payload = { name: form.get("name"), experience: form.get("experience"), goals: form.get("goals"), preferred_topics: form.get("topics").split(",").map((topic) => topic.trim()).filter(Boolean) }; try { const profile = await api("/profile", { method: "PUT", headers: authHeaders(), body: JSON.stringify(payload) }); renderProfile(profile); $("#profileMessage").textContent = "Saved."; setTimeout(() => $("#profileDialog").close(), 450); } catch (error) { $("#profileMessage").textContent = error.message; } });
$("#signOutBtn").addEventListener("click", () => { localStorage.removeItem("orator_token"); localStorage.removeItem("orator_user"); location.reload(); });
if (state.token && state.user) window.location.href = "dashboard.html";
