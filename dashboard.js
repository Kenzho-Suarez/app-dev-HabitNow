// ===== DASHBOARD FUNCTIONALITY =====
// Complete dashboard with real-time stats, quick actions, and data sync

// Update dashboard stats
function updateDashboard() {
  const tasks = getTasks();
  const notes = getNotes();
  const lists = getLists();

  // Current date
  const currentDateEl = document.getElementById("current-date");
  if (currentDateEl) {
    currentDateEl.textContent = formatDate(new Date());
  }

  // Tasks stats
  const today = getTodayDate();
  const todayTasks = tasks.filter((t) => isToday(t.date));
  const uncompletedTasks = tasks.filter((t) => !t.completed);
  const completedTasks = tasks.filter((t) => t.completed);
  const upcomingTasks = tasks.filter((t) => !t.completed && isFuture(t.date));
  const todayUncompleted = todayTasks.filter((t) => !t.completed);

  // Update total tasks (only uncompleted)
  const totalTasksEl = document.getElementById("total-tasks");
  if (totalTasksEl) totalTasksEl.textContent = uncompletedTasks.length;

  // Update completed tasks (show total count across all time)
  const completedTasksEl = document.getElementById("completed-tasks");
  if (completedTasksEl) completedTasksEl.textContent = completedTasks.length;

  // Update completion rate (based on ALL tasks including completed)
  const completionRateEl = document.getElementById("completion-rate");
  if (completionRateEl) {
    const allTasks = tasks.length;
    if (allTasks > 0) {
      const completionRate = Math.round(
        (completedTasks.length / allTasks) * 100
      );
      completionRateEl.textContent = `${completionRate}% completion`;
    } else {
      completionRateEl.textContent = "No tasks yet";
    }
  }

  // Update tasks change stat
  const tasksChangeEl = document.getElementById("tasks-change");
  if (tasksChangeEl) {
    if (todayUncompleted.length > 0) {
      tasksChangeEl.textContent = `${todayUncompleted.length} due today`;
    } else if (tasks.length > 0) {
      tasksChangeEl.textContent = "All tasks completed today";
    } else {
      tasksChangeEl.textContent = "No tasks yet";
    }
  }

  // Update today count badge
  const todayCountEl = document.getElementById("today-count");
  if (todayCountEl) {
    if (todayTasks.length > 0) {
      todayCountEl.textContent = todayTasks.length;
      todayCountEl.style.display = "inline-block";
    } else {
      todayCountEl.style.display = "none";
    }
  }

  // Update upcoming count badge
  const upcomingCountEl = document.getElementById("upcoming-count");
  if (upcomingCountEl) {
    if (upcomingTasks.length > 0) {
      upcomingCountEl.textContent = upcomingTasks.length;
      upcomingCountEl.style.display = "inline-block";
    } else {
      upcomingCountEl.style.display = "none";
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

  // Update sections
  renderTodayFocus(todayTasks);
  renderWeekPreview(tasks);
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

// Render recent notes - FIXED
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
    }; cursor: pointer; position: relative;" onclick="openNoteFromDashboard('${
        note.id
      }')">
      <h4 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: #222;">${
        note.title
      }</h4>
      <p style="margin: 0 0 10px 0; font-size: 13px; color: #444; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${
        note.content
      }</p>
      <span class="note-time" style="font-size: 11px; color: #666;">${getRelativeTime(
        note.createdAt
      )}</span>
    </div>
  `
    )
    .join("");
}

// Open note from dashboard - NEW
function openNoteFromDashboard(noteId) {
  sessionStorage.setItem("editNoteId", noteId);
  window.location.href = "sticky-wall.html";
}

// Quick action functions - FIXED
function showQuickAdd() {
  let html = `
    <div class="quick-add-modal-content">
      <div class="quick-add-buttons">
        <button class="quick-add-btn" onclick="addTask(); closeModal(document.querySelector('.modal.active'));">
          <span class="quick-add-icon">📋</span>
          <span>Add Task</span>
        </button>
        <button class="quick-add-btn" onclick="addNote(); closeModal(document.querySelector('.modal.active'));">
          <span class="quick-add-icon">📝</span>
          <span>New Note</span>
        </button>
        <button class="quick-add-btn" onclick="scheduleEvent(); closeModal(document.querySelector('.modal.active'));">
          <span class="quick-add-icon">📅</span>
          <span>Schedule Event</span>
        </button>
        <button class="quick-add-btn" onclick="createListPage(); closeModal(document.querySelector('.modal.active'));">
          <span class="quick-add-icon">📚</span>
          <span>Create List</span>
        </button>
      </div>
    </div>
  `;

  createModal({
    title: "Quick Add",
    content: html,
    closeOnBackground: true,
  });
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

function createListPage() {
  window.location.href = "lists.html";
}

// ===== INITIALIZATION =====

document.addEventListener("DOMContentLoaded", () => {
  updateDashboard();

  // Setup quick add button
  const quickAddBtn = document.querySelector(".add-btn");
  if (quickAddBtn) {
    quickAddBtn.onclick = showQuickAdd;
  }

  // Ensure action buttons work
  window.addTask = addTask;
  window.addNote = addNote;
  window.scheduleEvent = scheduleEvent;
  window.createList = createListPage;
  window.openNoteFromDashboard = openNoteFromDashboard;
});

// Listen for data updates from other pages
window.addEventListener("dataUpdated", (e) => {
  updateDashboard();
});

// Update dashboard periodically to reflect real-time changes
setInterval(updateDashboard, 3000);
