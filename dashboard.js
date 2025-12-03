// Dashboard functionality for index.html

// Initialize data from localStorage
function getData(key, defaultValue = []) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

function saveData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Format date
function formatDate(date) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

// Get relative time
function getRelativeTime(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(date).toLocaleDateString();
}

// Update dashboard stats
function updateDashboard() {
  const tasks = getData("tasks");
  const notes = getData("notes");
  const lists = getData("lists");

  // Current date
  const currentDateEl = document.getElementById("current-date");
  if (currentDateEl) {
    currentDateEl.textContent = formatDate(new Date());
  }

  // Tasks stats
  const today = new Date().toDateString();
  const todayTasks = tasks.filter(
    (t) => new Date(t.date).toDateString() === today
  );
  const completedTasks = tasks.filter((t) => t.completed);

  const totalTasksEl = document.getElementById("total-tasks");
  if (totalTasksEl) totalTasksEl.textContent = tasks.length;

  const completedTasksEl = document.getElementById("completed-tasks");
  if (completedTasksEl) completedTasksEl.textContent = completedTasks.length;

  const todayCountEl = document.getElementById("today-count");
  if (todayCountEl) {
    if (todayTasks.length > 0) {
      todayCountEl.textContent = todayTasks.length;
      todayCountEl.style.display = "inline-block";
    } else {
      todayCountEl.style.display = "none";
    }
  }

  const upcomingCountEl = document.getElementById("upcoming-count");
  if (upcomingCountEl) {
    const upcomingCount = tasks.filter((t) => !t.completed).length;
    if (upcomingCount > 0) {
      upcomingCountEl.textContent = upcomingCount;
      upcomingCountEl.style.display = "inline-block";
    } else {
      upcomingCountEl.style.display = "none";
    }
  }

  // Update stat changes
  const tasksChangeEl = document.getElementById("tasks-change");
  if (tasksChangeEl) {
    if (tasks.length > 0) {
      tasksChangeEl.textContent = `${todayTasks.length} due today`;
    } else {
      tasksChangeEl.textContent = "No tasks yet";
    }
  }

  const completionRateEl = document.getElementById("completion-rate");
  if (completionRateEl) {
    if (tasks.length > 0) {
      const completionRate = Math.round(
        (completedTasks.length / tasks.length) * 100
      );
      completionRateEl.textContent = `${completionRate}% completion`;
    } else {
      completionRateEl.textContent = "0% completion";
    }
  }

  // Notes stats
  const totalNotesEl = document.getElementById("total-notes");
  if (totalNotesEl) totalNotesEl.textContent = notes.length;

  const notesChangeEl = document.getElementById("notes-change");
  if (notesChangeEl) {
    if (notes.length > 0) {
      const recentNotes = notes.filter((n) => {
        const hoursSince =
          (new Date() - new Date(n.createdAt)) / (1000 * 60 * 60);
        return hoursSince < 24;
      }).length;
      if (recentNotes > 0) {
        notesChangeEl.textContent = `${recentNotes} updated today`;
      } else {
        notesChangeEl.textContent = `${notes.length} total notes`;
      }
    } else {
      notesChangeEl.textContent = "No notes yet";
    }
  }

  // Lists stats
  const activeListsEl = document.getElementById("active-lists");
  if (activeListsEl) activeListsEl.textContent = lists.length;

  const listsChangeEl = document.getElementById("lists-change");
  if (listsChangeEl) {
    if (lists.length > 0) {
      listsChangeEl.textContent = `${lists.length} active lists`;
    } else {
      listsChangeEl.textContent = "No lists yet";
    }
  }

  // Update today's focus
  renderTodayFocus(todayTasks);

  // Update week preview
  renderWeekPreview(tasks);

  // Update recent notes
  renderRecentNotes(notes);
}

// Render today's focus
function renderTodayFocus(tasks) {
  const container = document.getElementById("today-focus");
  if (!container) return;

  if (tasks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No tasks scheduled for today. Add some tasks to get started!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = tasks
    .slice(0, 3)
    .map(
      (task) => `
    <div class="focus-card ${task.type}">
      <div class="focus-header">
        <span class="focus-badge ${task.type}-badge">${task.type}</span>
        <span class="focus-time">${task.time || "All day"}</span>
      </div>
      <h3>${task.title}</h3>
      <p>${task.description || "No description"}</p>
    </div>
  `
    )
    .join("");
}

// Render week preview
function renderWeekPreview(tasks) {
  const container = document.getElementById("week-preview");
  if (!container) return;

  const today = new Date();
  const weekDays = [];

  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    weekDays.push(date);
  }

  container.innerHTML = weekDays
    .map((date) => {
      const dayTasks = tasks.filter(
        (t) => new Date(t.date).toDateString() === date.toDateString()
      );

      const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

      return `
      <div class="calendar-day">
        <div class="day-header">
          <span class="day-name">${dayNames[date.getDay()]}</span>
          <span class="day-number">${date.getDate()}</span>
        </div>
        <div class="day-events">
          ${
            dayTasks.length > 0
              ? dayTasks
                  .slice(0, 2)
                  .map(
                    (task) =>
                      `<div class="mini-event ${task.type}">${task.title}</div>`
                  )
                  .join("")
              : '<span class="no-events">No events</span>'
          }
        </div>
      </div>
    `;
    })
    .join("");
}

// Render recent notes
function renderRecentNotes(notes) {
  const container = document.getElementById("recent-notes");
  if (!container) return;

  if (notes.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No notes yet. Create your first note!</p>
      </div>
    `;
    return;
  }

  const sortedNotes = notes.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  container.innerHTML = sortedNotes
    .slice(0, 3)
    .map(
      (note) => `
    <div class="recent-note" style="background: ${
      note.color
    };" onclick="window.location.href='sticky-wall.html'">
      <h4>${note.title}</h4>
      <p>${note.content}</p>
      <span class="note-time">${getRelativeTime(note.createdAt)}</span>
    </div>
  `
    )
    .join("");
}

// Quick action functions
function showQuickAdd() {
  alert("Quick add feature - Navigate to specific pages to add items");
}

function addTask() {
  window.location.href = "today.html";
}

function addNote() {
  window.location.href = "sticky-wall.html";
}

function scheduleEvent() {
  window.location.href = "calendar.html";
}

function createList() {
  window.location.href = "lists.html";
}

// Initialize dashboard on load
document.addEventListener("DOMContentLoaded", updateDashboard);
