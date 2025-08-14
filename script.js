// ✅ Rewritten with name-based profiles, hash routing, browser back arrow functionality
let name = "";

/* -------------------- ROUTER -------------------- */
function route() {
  const hash = window.location.hash;

  // Hide all pages first
  const $ = (id) => document.getElementById(id);
  $("welcomeScreen").style.display = "none";
  $("namePrompt").style.display = "none";
  $("mainApp").style.display = "none";
  const reviewEl = $("reviewPage"); // may not exist on first HTMLs
  if (reviewEl) reviewEl.style.display = "none";

  if (hash === "#name") {
    $("namePrompt").style.display = "block";
  } else if (hash === "#main") {
    $("mainApp").style.display = "block";
    $("greeting").textContent = `Hello, ${name}!`;
  } else if (hash === "#review" && reviewEl) {
    reviewEl.style.display = "block";
    renderReview(); // ensure content is fresh on navigation
  } else {
    $("welcomeScreen").style.display = "flex";
  }
}

/* -------------------- NAME SAVE / LOAD -------------------- */
function saveName() {
  const input = document.getElementById("nameInput").value.trim();
  if (!input) return;
  name = input;
  localStorage.setItem("currentUser", name);
  window.location.hash = "#main";
  loadUserData(); // populate any stored data for this user
}

function goBackToName() {
  name = "";
  localStorage.removeItem("currentUser");
  window.location.hash = "#name";
}

// Load minimal user profile (habit currently)
function loadUserData() {
  const saved = localStorage.getItem("currentUser");
  if (saved) name = saved;

  // Load stored plan if exists and reflect habit inline for nice UX
  const plan = loadPlan();
  if (plan && plan.habit) {
    const habitNameEl = document.getElementById("habitName");
    const habitInputEl = document.getElementById("habitInput");
    const habitDisplayEl = document.getElementById("habitDisplay");
    if (habitNameEl) habitNameEl.textContent = plan.habit;
    if (habitInputEl) habitInputEl.value = plan.habit;
    if (habitDisplayEl) habitDisplayEl.style.display = "block";
  }
}

/* -------------------- PLAN SAVE / REVIEW -------------------- */
// Collect everything from the UI into one object
function collectPlanFromDOM() {
  const v = (id) => (document.getElementById(id)?.value || "").trim();
  const list = (sel) =>
    Array.from(document.querySelectorAll(sel)).map((li) => ({
      text: li.textContent,
      checked: li.classList.contains("checked"),
    }));

  return {
    user: name || localStorage.getItem("currentUser") || "You",
    date: new Date().toISOString(),

    // Habit
    habit: v("habitInput"),

    // Priorities / Mood
    priorities: [v("priority1"), v("priority2"), v("priority3")].filter(Boolean),
    mood: v("moodInput"),

    // Lists
    appointments: list("#appointments li"),
    todos: list("#todoList li"),

    // Exercise & Meals
    exercise: { notes: v("exerciseNotes"), minutes: v("exerciseMinutes") },
    meals: {
      breakfast: v("mealBreakfast"),
      lunch: v("mealLunch"),
      dinner: v("mealDinner"),
      snacks: v("mealSnacks"),
    },

    // Water & Goals
    water: document.querySelectorAll("#waterTracker .water-dot.filled").length,
    goals: Array.from(document.querySelectorAll(".goalInput"))
      .map((inp) => inp.value.trim())
      .filter(Boolean),

    // Notes
    notes: v("notesInput"),
  };
}

// Persist plan for current user
function savePlan(plan) {
  const who = name || localStorage.getItem("currentUser") || "You";
  localStorage.setItem(`plan_${who}`, JSON.stringify(plan));
}

function loadPlan() {
  const who = name || localStorage.getItem("currentUser") || "You";
  const raw = localStorage.getItem(`plan_${who}`);
  return raw ? JSON.parse(raw) : null;
}

// Save + go to Review page
function saveAndReview() {
  const plan = collectPlanFromDOM();
  savePlan(plan);
  renderReview();
  window.location.hash = "#review";
}

// Build Review page content from saved plan
function renderReview() {
  const plan = loadPlan() || collectPlanFromDOM();
  const el = document.getElementById("reviewContent");
  if (!el) return;

  const list = (arr) =>
    arr && arr.length
      ? `<ul>${arr
          .map((item) =>
            typeof item === "string"
              ? `<li>${item}</li>`
              : `<li>${item.text}${item.checked ? " ✅" : ""}</li>`
          )
          .join("")}</ul>`
      : "<em>None</em>";

  el.innerHTML = `
    <div class="review-card">
      <p><strong>User:</strong> ${plan.user}</p>
      <p><strong>Date:</strong> ${new Date(plan.date).toLocaleString()}</p>

      <h3>Habit</h3>
      <p>${plan.habit || "<em>—</em>"}</p>

      <h3>Top Priorities</h3>
      ${list(plan.priorities)}

      <h3>Mood</h3>
      <p>${plan.mood || "<em>—</em>"}</p>

      <h3>Appointments</h3>
      ${list(plan.appointments)}

      <h3>Things to Get Done</h3>
      ${list(plan.todos)}

      <h3>Exercise</h3>
      <p>${plan.exercise?.notes || "<em>—</em>"} ${
        plan.exercise?.minutes ? `(${plan.exercise.minutes} min)` : ""
      }</p>

      <h3>Meals</h3>
      <ul>
        <li><strong>Breakfast:</strong> ${plan.meals?.breakfast || "—"}</li>
        <li><strong>Lunch:</strong> ${plan.meals?.lunch || "—"}</li>
        <li><strong>Dinner:</strong> ${plan.meals?.dinner || "—"}</li>
        <li><strong>Snacks:</strong> ${plan.meals?.snacks || "—"}</li>
      </ul>

      <h3>Water Intake</h3>
      <p>${plan.water || 0}/8</p>

      <h3>Daily Habits & Goals</h3>
      ${list(plan.goals)}

      <h3>Notes</h3>
      <p>${plan.notes || "<em>—</em>"}</p>
    </div>
  `;
}

// Reset everything for a new plan
function createNewPlan() {
  // Clear inputs/textareas
  [
    "habitInput","priority1","priority2","priority3","moodInput","appointmentInput",
    "todoInput","exerciseNotes","exerciseMinutes","mealBreakfast","mealLunch",
    "mealDinner","mealSnacks","notesInput",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === "TEXTAREA" || el.tagName === "INPUT") el.value = "";
  });

  // Goals
  document.querySelectorAll(".goalInput").forEach((i) => (i.value = ""));

  // Lists
  const appts = document.getElementById("appointments");
  const todos = document.getElementById("todoList");
  if (appts) appts.innerHTML = "";
  if (todos) todos.innerHTML = "";

  // Water
  document
    .querySelectorAll("#waterTracker .water-dot")
    .forEach((dot) => dot.classList.remove("filled"));

  // Habit display reset (keep simple)
  const habitDisplay = document.getElementById("habitDisplay");
  const habitNameEl = document.getElementById("habitName");
  if (habitDisplay) habitDisplay.style.display = "none";
  if (habitNameEl) habitNameEl.textContent = "";

  // Remove saved plan
  const who = name || localStorage.getItem("currentUser") || "You";
  localStorage.removeItem(`plan_${who}`);

  // Back to main edit
  window.location.hash = "#main";
}

/* -------------------- WELCOME / TIMELINE / LISTS / WATER -------------------- */
// Click into name prompt from welcome
document.getElementById("clickHereButton")?.addEventListener("click", () => {
  window.location.hash = "#name";
});

// Minimal timeline (optional container)
const times = [
  "6:00 AM","7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM",
  "12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM",
  "6:00 PM","7:00 PM","8:00 PM","9:00 PM","10:00 PM","11:00 PM","12:00 AM"
];

function buildTimeline() {
  const container = document.getElementById("timelineContainer");
  if (!container) return;
  container.innerHTML = "";
  times.forEach((time) => {
    const row = document.createElement("div");
    row.className = "time-row";
    row.innerHTML = `
      <span class="time-label">${time}</span>
      <input type="text" class="time-input" data-time="${time}" placeholder="What will you do?" />
    `;
    container.appendChild(row);
  });
}

// Appointments / Todos add (no per-section saves)
function addAppointment() {
  const val = document.getElementById("appointmentInput")?.value || "";
  if (val.trim()) {
    const li = document.createElement("li");
    li.textContent = val.trim();
    li.onclick = () => li.classList.toggle("checked");
    document.getElementById("appointments").appendChild(li);
    document.getElementById("appointmentInput").value = "";
  }
}

function addTodo() {
  const val = document.getElementById("todoInput")?.value || "";
  if (val.trim()) {
    const li = document.createElement("li");
    li.textContent = val.trim();
    li.onclick = () => li.classList.toggle("checked");
    document.getElementById("todoList").appendChild(li);
    document.getElementById("todoInput").value = "";
  }
}

// Water dots
function toggleDot(el) {
  el.classList.toggle("filled");
}

/* -------------------- LEGACY HABITS (kept harmless) -------------------- */
/* If you no longer want "saveHabit", it's unused now, but keeping it no-ops is safe. */
function saveHabit() {
  // Not used (UI no longer has a Save Habit button), but reflect habitInput into display if needed
  const habit = document.getElementById("habitInput")?.value.trim();
  if (!habit) return;
  const habitNameEl = document.getElementById("habitName");
  const habitDisplayEl = document.getElementById("habitDisplay");
  if (habitNameEl) habitNameEl.textContent = habit;
  if (habitDisplayEl) habitDisplayEl.style.display = "block";
}

/* -------------------- INIT -------------------- */
window.addEventListener("load", () => {
  loadUserData();
  buildTimeline();
  route();

  // Hook the single Save button (image)
  document.getElementById("saveBtn")?.addEventListener("click", saveAndReview);
});
window.addEventListener("hashchange", route);
// Handle back arrow click
document.getElementById("backArrow")?.addEventListener("click", () => {
  // If there's a previous page in history, go back like a normal browser
  if (window.history.length > 1) {
    window.history.back();
  } else {
    // If no history, just go to main app
    window.location.hash = "#main";
  }
});
