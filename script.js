// Load saved name
let name = localStorage.getItem("name");

window.onload = () => {
  if (name) {
    showMainApp();
  }

  loadFromStorage();
};

function saveName() {
  const input = document.getElementById("nameInput").value.trim();
  if (!input) return;
  localStorage.setItem("name", input);
  name = input;
  showMainApp();
}

function showMainApp() {
  document.getElementById("namePrompt").style.display = "none";
  document.getElementById("mainApp").style.display = "block";
  document.getElementById("greeting").textContent = `Hello, ${name}!`;
}

// ========== Tomorrow Task Logic ==========

let tomorrowTasks = JSON.parse(localStorage.getItem("tomorrowTasks") || "[]");
let todayTasks = JSON.parse(localStorage.getItem("todayTasks") || "[]");
let lastOpenDate = localStorage.getItem("lastOpenDate");

function addTomorrowTask() {
  const input = document.getElementById("todoInput").value.trim();
  if (!input) return;
  tomorrowTasks.push({ text: input, done: false });
  document.getElementById("todoInput").value = "";
  saveAndRender();
}

// When the day changes, move tomorrowTasks → todayTasks
function checkDaySwitch() {
  const today = new Date().toLocaleDateString();
  if (lastOpenDate !== today) {
    todayTasks = [...tomorrowTasks];
    tomorrowTasks = [];
    lastOpenDate = today;
    saveAll();
  }
}

function toggleTodayTask(index) {
  todayTasks[index].done = !todayTasks[index].done;
  saveAndRender();
}

// ========== Habit Builders ==========

let goodHabits = JSON.parse(localStorage.getItem("goodHabits") || "[]");

function addGoodHabit() {
  const input = document.getElementById("goodHabitInput").value.trim();
  if (!input) return;
  goodHabits.push({ text: input, done: false });
  document.getElementById("goodHabitInput").value = "";
  saveAndRender();
}

function toggleGoodHabit(index) {
  goodHabits[index].done = !goodHabits[index].done;
  saveAndRender();
}

// ========== Habit Breakers ==========

let badHabits = JSON.parse(localStorage.getItem("badHabits") || "[]");

function addBadHabit() {
  const input = document.getElementById("badHabitInput").value.trim();
  if (!input) return;
  badHabits.push({ text: input, avoided: false });
  document.getElementById("badHabitInput").value = "";
  saveAndRender();
}

function toggleBadHabit(index) {
  badHabits[index].avoided = !badHabits[index].avoided;
  saveAndRender();
}

// ========== Rendering and Saving ==========

function saveAll() {
  localStorage.setItem("tomorrowTasks", JSON.stringify(tomorrowTasks));
  localStorage.setItem("todayTasks", JSON.stringify(todayTasks));
  localStorage.setItem("lastOpenDate", lastOpenDate);
  localStorage.setItem("goodHabits", JSON.stringify(goodHabits));
  localStorage.setItem("badHabits", JSON.stringify(badHabits));
}

function saveAndRender() {
  saveAll();
  renderAll();
}

function renderAll() {
  const tomorrowList = document.getElementById("tomorrowList");
  const todayList = document.getElementById("todayList");
  const goodList = document.getElementById("goodHabits");
  const badList = document.getElementById("badHabits");

  tomorrowList.innerHTML = "";
  todayList.innerHTML = "";
  goodList.innerHTML = "";
  badList.innerHTML = "";

  tomorrowTasks.forEach((task, i) => {
    const li = document.createElement("li");
    li.textContent = task.text;
    tomorrowList.appendChild(li);
  });

  todayTasks.forEach((task, i) => {
    const li = document.createElement("li");
    li.textContent = task.text;
    if (task.done) li.classList.add("checked");
    li.onclick = () => toggleTodayTask(i);
    todayList.appendChild(li);
  });

  goodHabits.forEach((habit, i) => {
    const li = document.createElement("li");
    li.textContent = habit.text;
    if (habit.done) li.classList.add("checked");
    li.onclick = () => toggleGoodHabit(i);
    goodList.appendChild(li);
  });

  badHabits.forEach((habit, i) => {
    const li = document.createElement("li");
    li.textContent = habit.text + (habit.avoided ? " ✅" : " ❌");
    li.onclick = () => toggleBadHabit(i);
    badList.appendChild(li);
  });
}

function loadFromStorage() {
  checkDaySwitch();
  renderAll();
}
