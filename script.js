// ✅ Name-based profiles, hash routing, Save & Review, browser-like back

let name = "";

/* -------------------- UTIL -------------------- */
const $ = (id) => document.getElementById(id);
const show = (id, display = "block") => { const el = $(id); if (el) el.style.display = display; };

/* -------------------- ROUTER -------------------- */
function route() {
  // Hide all pages
  ["welcomeScreen", "namePrompt", "mainApp", "reviewPage"].forEach(id => show(id, "none"));

  const hash = window.location.hash || "";
  if (hash === "#name") {
    show("namePrompt");
  } else if (hash === "#main") {
    show("mainApp");
    $("greeting").textContent = `Hello, ${name}!`;
  } else if (hash === "#review") {
    show("reviewPage");
    renderReview(); // always refresh review content
  } else {
    show("welcomeScreen", "flex");
  }
}

/* -------------------- NAME SAVE / LOAD -------------------- */
function saveName() {
  const input = $("nameInput").value.trim();
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

function loadUserData() {
  const saved = localStorage.getItem("currentUser");
  if (saved) name = saved;

  // Show habit inline if present
  const plan = loadPlan();
  if (plan && plan.habit) {
    if ($("habitName")) $("habitName").textContent = plan.habit;
    if ($("habitInput")) $("habitInput").value = plan.habit;
    if ($("habitDisplay")) $("habitDisplay").style.display = "block";
  }
}

/* -------------------- PLAN SAVE / REVIEW -------------------- */
function collectPlanFromDOM() {
  const v = (id) => ($(id)?.value || "").trim();
  const list = (sel) => Array.from(document.querySelectorAll(sel)).map(li => ({
    text: li.textContent,
    checked: li.classList.contains("checked"),
  }));

  return {
    user: name || localStorage.getItem("currentUser") || "You",
    date: new Date().toISOString(),

    habit: v("habitInput"),

    priorities: [v("priority1"), v("priority2"), v("priority3")].filter(Boolean),
    mood: v("moodInput"),

    appointments: list("#appointments li"),
    todos: list("#todoList li"),

    exercise: { notes: v("exerciseNotes"), minutes: v("exerciseMinutes") },
    meals: {
      breakfast: v("mealBreakfast"),
      lunch: v("mealLunch"),
      dinner: v("mealDinner"),
      snacks: v("mealSnacks"),
    },

    water: document.querySelectorAll("#waterTracker .water-dot.filled").length,
    goals: Array.from(document.querySelectorAll(".goalInput"))
      .map(inp => inp.value.trim())
      .filter(Boolean),

    notes: v("notesInput"),
  };
}

function savePlan(plan) {
  const who = name || localStorage.getItem("currentUser") || "You";
  localStorage.setItem(`plan_${who}`, JSON.stringify(plan));
}

function loadPlan() {
  const who = name || localStorage.getItem("currentUser") || "You";
  const raw = localStorage.getItem(`plan_${who}`);
  return raw ? JSON.parse(raw) : null;
}

function saveAndReview() {
  const plan = collectPlanFromDOM();
  savePlan(plan);
  renderReview();
  window.location.hash = "#review";
}

function renderReview() {
  const plan = loadPlan() || collectPlanFromDOM();
  const el = $("reviewContent");
  if (!el) return;

  const list = (arr) =>
    arr && arr.length
      ? `<ul>${arr
          .map(item =>
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

function createNewPlan() {
  // Clear inputs/textareas
  [
    "habitInput","priority1","priority2","priority3","moodInput","appointmentInput",
    "todoInput","exerciseNotes","exerciseMinutes","mealBreakfast","mealLunch",
    "mealDinner","mealSnacks","notesInput",
  ].forEach(id => {
    const el = $(id);
    if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) el.value = "";
  });

  // Goals
  document.querySelectorAll(".goalInput").forEach(i => (i.value = ""));

  // Lists
  const appts = $("appointments");
  const todos = $("todoList");
  if (appts) appts.innerHTML = "";
  if (todos) todos.innerHTML = "";

  // Water
  document.querySelectorAll("#waterTracker .water-dot").forEach(dot => dot.classList.remove("filled"));

  // Habit display reset
  if ($("habitDisplay")) $("habitDisplay").style.display = "none";
  if ($("habitName")) $("habitName").textContent = "";

  // Remove saved plan
  const who = name || localStorage.getItem("currentUser") || "You";
  localStorage.removeItem(`plan_${who}`);

  // Back to main edit
  window.location.hash = "#main";
}

/* -------------------- TIMELINE / LISTS / WATER -------------------- */
const times = [
  "6:00 AM","7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM",
  "12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM",
  "6:00 PM","7:00 PM","8:00 PM","9:00 PM","10:00 PM","11:00 PM","12:00 AM"
];

function buildTimeline() {
  const container = $("timelineContainer");
  if (!container) return;
  container.innerHTML = "";
  times.forEach(time => {
    const row = document.createElement("div");
    row.className = "time-row";
    row.innerHTML = `
      <span class="time-label">${time}</span>
      <input type="text" class="time-input" data-time="${time}" placeholder="What will you do?" />
    `;
    container.appendChild(row);
  });
}

function addAppointment() {
  const val = $("appointmentInput")?.value || "";
  if (val.trim()) {
    const li = document.createElement("li");
    li.textContent = val.trim();
    li.onclick = () => li.classList.toggle("checked");
    $("appointments").appendChild(li);
    $("appointmentInput").value = "";
  }
}

function addTodo() {
  const val = $("todoInput")?.value || "";
  if (val.trim()) {
    const li = document.createElement("li");
    li.textContent = val.trim();
    li.onclick = () => li.classList.toggle("checked");
    $("todoList").appendChild(li);
    $("todoInput").value = "";
  }
}

function toggleDot(el) { el.classList.toggle("filled"); }

/* -------------------- BIND UI HANDLERS -------------------- */
function bindUIHandlers() {
  // Save button (image with id="saveBtn" containing newsave.png)
  $("saveBtn")?.removeEventListener("click", saveAndReview); // avoid double-binding
  $("saveBtn")?.addEventListener("click", saveAndReview);

  // Back arrow on Review page
  $("backArrow")?.addEventListener("click", () => {
    if (window.history.length > 1) window.history.back();
    else window.location.hash = "#main";
  });

  // Welcome → Name
  $("clickHereButton")?.addEventListener("click", () => {
    window.location.hash = "#name";
  });
}

/* -------------------- INIT -------------------- */
document.addEventListener("DOMContentLoaded", () => {
  loadUserData();
  buildTimeline();
  route();
  bindUIHandlers();
});

window.addEventListener("hashchange", () => {
  route();
  bindUIHandlers(); // ensure handlers exist after page switch
});
