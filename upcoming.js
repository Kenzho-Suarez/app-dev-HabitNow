// ===== UPCOMING PAGE FUNCTIONALITY =====
// Manages upcoming/future tasks with filtering, editing, and deletion

let currentUpcomingTaskEditId = null;
let currentUpcomingFilter = "all";

// ===== INITIALIZATION =====

document.addEventListener("DOMContentLoaded", () => {
  renderUpcomingPage();
  setupUpcomingEventListeners();
  updateTaskCounterBadges();
});

// Listen for updates from other pages
window.addEventListener("dataUpdated", (e) => {
  if (e.detail.key === "tasks") {
    renderUpcomingPage();
    updateTaskCounterBadges();
  }
});

// ===== RENDER FUNCTIONS =====

/**
 * Render the upcoming tasks page with sorting and filtering
 */
function renderUpcomingPage() {
  const tasks = getTasks();
  const upcomingTasks = tasks.filter((t) => isFuture(t.date) && !t.completed);

  // Sort by date
  const sortedTasks = sortTasksByDate(upcomingTasks);

  // Apply filter
  const filteredTasks = filterTasksByType(sortedTasks, currentUpcomingFilter);

  // Render tasks
  renderUpcomingList(filteredTasks);
}

/**
 * Render the list of upcoming tasks
 * @param {Array} tasks - Tasks to render
 */
function renderUpcomingList(tasks) {
  const container = document.querySelector(".upcoming-list");
  if (!container) return;

  if (tasks.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: #999; padding: 60px 20px;">
        <p style="font-size: 16px; margin-bottom: 10px;">No upcoming tasks</p>
        <p style="font-size: 14px;">Add tasks to schedule them for the future</p>
      </div>
    `;
    return;
  }

  let html = '<div class="upcoming-items">';

  // Group tasks by date
  const groupedTasks = groupTasksByDate(tasks);
  const sortedDates = Object.keys(groupedTasks).sort();

  sortedDates.forEach((dateStr) => {
    const dateTasks = groupedTasks[dateStr];
    const dateObj = new Date(dateStr);

    html += `
      <div class="upcoming-date-group">
        <div class="upcoming-date-header">
          <span class="upcoming-date">${formatDate(dateObj)}</span>
          <span class="upcoming-task-count">${dateTasks.length} task${
      dateTasks.length > 1 ? "s" : ""
    }</span>
        </div>
    `;

    dateTasks.forEach((task) => {
      html += `
        <div class="upcoming-item" onclick="viewUpcomingTask('${task.id}')">
          <div class="upcoming-item-left">
            <input type="checkbox" class="upcoming-checkbox" ${
              task.completed ? "checked" : ""
            } onchange="event.stopPropagation(); toggleUpcomingTaskCompletion('${
        task.id
      }')" title="Mark as done" />
            <span class="upcoming-type-badge ${task.type}-badge">${
        task.type
      }</span>
          </div>
          <div class="upcoming-item-content">
            <h4 class="upcoming-item-title" style="${
              task.completed
                ? "text-decoration: line-through; opacity: 0.6;"
                : ""
            }">${task.title}</h4>
            ${
              task.description
                ? `<p class="upcoming-item-description">${task.description}</p>`
                : ""
            }
            <div class="upcoming-item-meta">
              ${
                task.time
                  ? `<span class="upcoming-time">🕐 ${task.time}</span>`
                  : '<span class="upcoming-time">All day</span>'
              }
              ${
                task.tags && task.tags.length > 0
                  ? `<span class="upcoming-tags">${task.tags
                      .map((tagId) => `#${getTag(tagId)?.name || "unknown"}`)
                      .join(" ")}</span>`
                  : ""
              }
            </div>
          </div>
          <div class="upcoming-item-actions" onclick="event.stopPropagation();">
            <button class="icon-btn edit-btn" onclick="openEditUpcomingTaskModal('${
              task.id
            }')" title="Edit task">
              ✏️
            </button>
            <button class="icon-btn delete-btn" onclick="confirmDeleteUpcomingTask('${
              task.id
            }')" title="Delete task">
              🗑️
            </button>
          </div>
        </div>
      `;
    });

    html += "</div>";
  });

  html += "</div>";
  container.innerHTML = html;
}

/**
 * View task details (for reference)
 * @param {string} taskId - Task ID to view
 */
function viewUpcomingTask(taskId) {
  const task = getTask(taskId);
  if (!task) return;

  let html = `
    <div style="padding: 20px; background: #f8f9fa; border-radius: 4px;">
      <p><strong>Title:</strong> ${task.title}</p>
      <p><strong>Date:</strong> ${formatDate(task.date)}</p>
      ${task.time ? `<p><strong>Time:</strong> ${task.time}</p>` : ""}
      ${
        task.description
          ? `<p><strong>Description:</strong> ${task.description}</p>`
          : ""
      }
      <p><strong>Type:</strong> <span style="text-transform: capitalize; color: ${getTypeColor(
        task.type
      )};">${task.type}</span></p>
      ${
        task.tags && task.tags.length > 0
          ? `<p><strong>Tags:</strong> ${task.tags
              .map((tagId) => getTag(tagId)?.name || "unknown")
              .join(", ")}</p>`
          : ""
      }
    </div>
  `;

  const modal = createModal({
    title: "Task Details",
    content: html,
  });
}

// ===== FILTER FUNCTIONALITY =====

/**
 * Handle filter button clicks
 */
function setupUpcomingEventListeners() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // Remove active class from all buttons
      filterBtns.forEach((b) => b.classList.remove("active"));

      // Add active class to clicked button
      e.target.classList.add("active");

      // Update filter
      const filterValue = e.target.textContent.toLowerCase();
      if (filterValue === "all") {
        currentUpcomingFilter = "all";
      } else if (filterValue === "work") {
        currentUpcomingFilter = "work";
      } else if (filterValue === "personal") {
        currentUpcomingFilter = "personal";
      }

      // Re-render
      renderUpcomingPage();
    });
  });

  const addBtn = document.querySelector(".add-btn");
  if (addBtn) {
    addBtn.onclick = openAddUpcomingTaskModal;
  }

  // Handle modal close with ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeUpcomingTaskModal();
    }
  });
}

// ===== TASK ACTIONS =====

/**
 * Open modal to add new upcoming task
 */
function openAddUpcomingTaskModal() {
  currentUpcomingTaskEditId = null;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  let html = `
    <form id="upcoming-task-form" onsubmit="saveUpcomingTask(event)">
      <div class="form-group">
        <label for="upcoming-task-title">Task Title *</label>
        <input type="text" id="upcoming-task-title" class="form-input" placeholder="Enter task title" required />
      </div>

      <div class="form-group">
        <label for="upcoming-task-description">Description</label>
        <textarea id="upcoming-task-description" class="form-textarea" placeholder="Add task details" rows="3"></textarea>
      </div>

      <div class="form-row">
        <div class="form-group" style="flex: 1;">
          <label for="upcoming-task-date">Date *</label>
          <input type="date" id="upcoming-task-date" class="form-input" value="${tomorrowStr}" required />
        </div>

        <div class="form-group" style="flex: 1;">
          <label for="upcoming-task-time">Time</label>
          <input type="time" id="upcoming-task-time" class="form-input" />
        </div>
      </div>

      <div class="form-group">
        <label for="upcoming-task-type">Type *</label>
        <select id="upcoming-task-type" class="form-select" required>
          <option value="personal">Personal</option>
          <option value="work">Work</option>
        </select>
      </div>

      <div class="form-group">
        <label for="upcoming-task-tags">Tags (comma-separated tag names)</label>
        <input type="text" id="upcoming-task-tags" class="form-input" placeholder="e.g., urgent, important" />
      </div>

      <div class="form-buttons">
        <button type="button" class="btn-cancel" onclick="closeUpcomingTaskModal()">Cancel</button>
        <button type="submit" class="btn-save">Add Task</button>
      </div>
    </form>
  `;

  const modal = createModal({
    title: "Add Event",
    content: html,
    closeOnBackground: true,
  });

  setTimeout(() => {
    const titleInput = modal.querySelector("#upcoming-task-title");
    if (titleInput) titleInput.focus();
  }, 100);
}

/**
 * Open modal to edit existing upcoming task
 * @param {string} taskId - Task ID to edit
 */
function openEditUpcomingTaskModal(taskId) {
  event?.stopPropagation();
  currentUpcomingTaskEditId = taskId;
  const task = getTask(taskId);
  if (!task) return;

  let html = `
    <form id="upcoming-task-form" onsubmit="saveUpcomingTask(event)">
      <div class="form-group">
        <label for="upcoming-task-title">Task Title *</label>
        <input type="text" id="upcoming-task-title" class="form-input" value="${
          task.title
        }" required />
      </div>

      <div class="form-group">
        <label for="upcoming-task-description">Description</label>
        <textarea id="upcoming-task-description" class="form-textarea" rows="3">${
          task.description || ""
        }</textarea>
      </div>

      <div class="form-row">
        <div class="form-group" style="flex: 1;">
          <label for="upcoming-task-date">Date *</label>
          <input type="date" id="upcoming-task-date" class="form-input" value="${
            task.date
          }" required />
        </div>

        <div class="form-group" style="flex: 1;">
          <label for="upcoming-task-time">Time</label>
          <input type="time" id="upcoming-task-time" class="form-input" value="${
            task.time || ""
          }" />
        </div>
      </div>

      <div class="form-group">
        <label for="upcoming-task-type">Type *</label>
        <select id="upcoming-task-type" class="form-select" required>
          <option value="personal" ${
            task.type === "personal" ? "selected" : ""
          }>Personal</option>
          <option value="work" ${
            task.type === "work" ? "selected" : ""
          }>Work</option>
        </select>
      </div>

      <div class="form-group">
        <label for="upcoming-task-tags">Tags (comma-separated tag names)</label>
        <input type="text" id="upcoming-task-tags" class="form-input" placeholder="e.g., urgent, important" value="${
          task.tags && task.tags.length > 0
            ? task.tags.map((tagId) => getTag(tagId)?.name || "").join(", ")
            : ""
        }" />
      </div>

      <div class="form-buttons">
        <button type="button" class="btn-cancel" onclick="closeUpcomingTaskModal()">Cancel</button>
        <button type="submit" class="btn-save">Save Changes</button>
      </div>
    </form>
  `;

  const modal = createModal({
    title: "Edit Event",
    content: html,
    closeOnBackground: true,
  });

  setTimeout(() => {
    const titleInput = modal.querySelector("#upcoming-task-title");
    if (titleInput) titleInput.focus();
  }, 100);
}

/**
 * Save task (create or update)
 * @param {Event} event - Form submit event
 */
function saveUpcomingTask(event) {
  event.preventDefault();

  const title = document.getElementById("upcoming-task-title").value.trim();
  const description = document
    .getElementById("upcoming-task-description")
    .value.trim();
  const date = document.getElementById("upcoming-task-date").value;
  const time = document.getElementById("upcoming-task-time").value;
  const type = document.getElementById("upcoming-task-type").value;
  const tagsInput = document.getElementById("upcoming-task-tags").value.trim();

  // Validate
  if (!validateRequired(title)) {
    showError("Please enter a task title");
    return;
  }

  if (!validateTaskDate(date)) {
    showError("Please select a future date");
    return;
  }

  // Parse tags
  const tagNames = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  const tags = getTags();
  const taskTagIds = tagNames.map((tagName) => {
    let tag = tags.find((t) => t.name.toLowerCase() === tagName.toLowerCase());
    if (!tag) {
      tag = createTag(tagName);
      tags.push(tag);
    }
    return tag.id;
  });
  saveTags(tags);

  if (currentUpcomingTaskEditId) {
    // Update existing task
    updateTask(currentUpcomingTaskEditId, {
      title,
      description,
      date,
      time,
      type,
      tags: taskTagIds,
    });
    showSuccess("Task updated successfully");
  } else {
    // Create new task
    const newTask = createTask(title, date, {
      description,
      time,
      type,
      tags: taskTagIds,
    });
    addTask(newTask);
    showSuccess("Event added");
  }

  closeUpcomingTaskModal();
  renderUpcomingPage();
  updateTaskCounterBadges();
}

/**
 * Toggle task completion status
 * @param {string} taskId - Task ID to toggle
 */
function toggleUpcomingTaskCompletion(taskId) {
  const task = getTask(taskId);
  if (!task) return;

  updateTask(taskId, { completed: !task.completed });
  showSuccess(task.completed ? "Task marked incomplete" : "Task completed!");
  renderUpcomingPage();
  updateTaskCounterBadges();
}

/**
 * Confirm deletion of task
 * @param {string} taskId - Task ID to delete
 */
function confirmDeleteUpcomingTask(taskId) {
  event?.stopPropagation();
  const task = getTask(taskId);
  if (!task) return;

  if (window.confirm(`Delete task "${task.title}"?`)) {
    deleteTask(taskId);
    showSuccess("Task deleted");
    renderUpcomingPage();
    updateTaskCounterBadges();
  }
}

/**
 * Close the task modal
 */
function closeUpcomingTaskModal() {
  const modals = document.querySelectorAll(".modal.active");
  modals.forEach((modal) => {
    modal.classList.remove("active");
    setTimeout(() => modal.remove(), 300);
  });
}

// ===== TASK COUNTER =====

/**
 * Update task counter badges in navigation
 */
function updateTaskCounterBadges() {
  const tasks = getTasks();

  // Update today count
  const todayTasks = tasks.filter((t) => isToday(t.date));
  const todayCountEl = document.getElementById("today-count");
  if (todayCountEl) {
    if (todayTasks.length > 0) {
      todayCountEl.textContent = todayTasks.length;
      todayCountEl.style.display = "inline-block";
    } else {
      todayCountEl.style.display = "none";
    }
  }

  // Update upcoming count (uncompleted future tasks)
  const upcomingTasks = tasks.filter((t) => !t.completed && isFuture(t.date));
  const upcomingCountEl = document.getElementById("upcoming-count");
  if (upcomingCountEl) {
    if (upcomingTasks.length > 0) {
      upcomingCountEl.textContent = upcomingTasks.length;
      upcomingCountEl.style.display = "inline-block";
    } else {
      upcomingCountEl.style.display = "none";
    }
  }
}

// Poll for counter updates (prevent multiple intervals)
if (!window.upcomingCounterPolling) {
  setInterval(updateTaskCounterBadges, 2000);
  window.upcomingCounterPolling = true;
}

