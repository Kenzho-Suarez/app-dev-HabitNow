// ===== TODAY PAGE FUNCTIONALITY =====
// Manages today's tasks with completion tracking, editing, and deletion

let currentTodayTaskId = null;
let currentTodayTaskEditId = null;

// ===== INITIALIZATION =====

document.addEventListener("DOMContentLoaded", () => {
  renderTodayPage();
  setupTodayEventListeners();
  updateTaskCounterBadges();
});

// Listen for updates from other pages
window.addEventListener("dataUpdated", (e) => {
  if (e.detail.key === "tasks") {
    renderTodayPage();
    updateTaskCounterBadges();
  }
});

// ===== RENDER FUNCTIONS =====

/**
 * Render the entire today page with tasks organized by type
 */
function renderTodayPage() {
  const today = getTodayDate();
  const tasks = getTasks();
  const todayTasks = tasks.filter((t) => isToday(t.date));

  // Update header date
  const headerDate = document.querySelector(".today-header h2");
  if (headerDate) {
    headerDate.textContent = formatDate(today);
  }

  // Update progress
  const completedCount = todayTasks.filter((t) => t.completed).length;
  const totalCount = todayTasks.length;

  updateProgressBar(completedCount, totalCount);

  // Separate tasks by type
  const workTasks = todayTasks.filter((t) => t.type === "work");
  const personalTasks = todayTasks.filter((t) => t.type === "personal");

  // Render sections
  renderTaskSection("work", workTasks);
  renderTaskSection("personal", personalTasks);
}

/**
 * Render a section of tasks (work or personal)
 * @param {string} type - Task type (work/personal)
 * @param {Array} tasks - Array of tasks for this type
 */
function renderTaskSection(type, tasks) {
  const sectionContainer = document.querySelector(
    `.today-section:nth-child(${type === "work" ? 1 : 2})`
  );
  if (!sectionContainer) return;

  if (tasks.length === 0) {
    sectionContainer.innerHTML = `<h3 class="section-title">${getTypeEmoji(
      type
    )} ${type === "work" ? "Work" : "Personal"} Tasks</h3>
      <p style="text-align: center; color: #999; padding: 20px">No ${type} tasks today</p>`;
    return;
  }

  let html = `<h3 class="section-title">${getTypeEmoji(type)} ${
    type === "work" ? "Work" : "Personal"
  } Tasks</h3>`;
  html += '<div class="today-items">';

  tasks.forEach((task) => {
    const bgColor = task.completed ? "#f5f5f5" : "white";
    const textDecoration = task.completed ? "line-through" : "none";
    const opacity = task.completed ? 0.6 : 1;

    html += `
      <div class="today-item" style="background: ${bgColor}; opacity: ${opacity}; text-decoration: ${textDecoration}">
        <div class="today-item-content">
          <input 
            type="checkbox" 
            class="task-checkbox" 
            ${task.completed ? "checked" : ""} 
            onchange="toggleTaskCompletion('${task.id}')"
          />
          <div class="today-item-text">
            <h4>${task.title}</h4>
            ${
              task.description
                ? `<p class="task-description">${task.description}</p>`
                : ""
            }
            <div class="task-meta">
              ${
                task.time
                  ? `<span class="task-time">🕐 ${task.time}</span>`
                  : ""
              }
              ${
                task.tags && task.tags.length > 0
                  ? `<span class="task-tags">${task.tags
                      .map((tagId) => `#${getTag(tagId)?.name || "unknown"}`)
                      .join(" ")}</span>`
                  : ""
              }
            </div>
          </div>
        </div>
        <div class="today-item-actions">
          <button class="icon-btn edit-btn" onclick="openEditTodayTaskModal('${
            task.id
          }')" title="Edit task">
            ✏️
          </button>
          <button class="icon-btn delete-btn" onclick="confirmDeleteTodayTask('${
            task.id
          }')" title="Delete task">
            🗑️
          </button>
        </div>
      </div>
    `;
  });

  html += "</div>";
  sectionContainer.innerHTML = html;
}

/**
 * Update the progress bar and text
 * @param {number} completed - Number of completed tasks
 * @param {number} total - Total number of tasks
 */
function updateProgressBar(completed, total) {
  const progressFill = document.querySelector(".progress-fill");
  const progressText = document.querySelector(".progress-text");

  if (progressFill) {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    progressFill.style.width = percentage + "%";
  }

  if (progressText) {
    progressText.textContent = `${completed} of ${total} tasks completed`;
  }
}

// ===== TASK ACTIONS =====

/**
 * Toggle task completion status
 * @param {string} taskId - Task ID to toggle
 */
function toggleTaskCompletion(taskId) {
  const task = getTask(taskId);
  if (!task) return;

  updateTask(taskId, { completed: !task.completed });
  renderTodayPage();
  updateTaskCounterBadges();
  showSuccess(
    task.completed ? "Task marked as incomplete" : "Great job! Task completed"
  );
}

/**
 * Open modal to add new task for today
 */
function openAddTodayTaskModal() {
  currentTodayTaskEditId = null;
  const today = getTodayDate();

  let html = `
    <form id="today-task-form" onsubmit="saveTodayTask(event)">
      <div class="form-group">
        <label for="today-task-title">Task Title *</label>
        <input type="text" id="today-task-title" class="form-input" placeholder="Enter task title" required />
      </div>

      <div class="form-group">
        <label for="today-task-description">Description</label>
        <textarea id="today-task-description" class="form-textarea" placeholder="Add task details" rows="3"></textarea>
      </div>

      <div class="form-row">
        <div class="form-group" style="flex: 1;">
          <label for="today-task-time">Time</label>
          <input type="time" id="today-task-time" class="form-input" />
        </div>

        <div class="form-group" style="flex: 1;">
          <label for="today-task-type">Type *</label>
          <select id="today-task-type" class="form-select" required>
            <option value="personal">Personal</option>
            <option value="work">Work</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="today-task-tags">Tags (comma-separated tag names)</label>
        <input type="text" id="today-task-tags" class="form-input" placeholder="e.g., urgent, important" />
      </div>

      <div class="form-buttons">
        <button type="button" class="btn-cancel" onclick="closeAddTodayTaskModal()">Cancel</button>
        <button type="submit" class="btn-save">Add Task</button>
      </div>
    </form>
  `;

  const modal = createModal({
    title: "Add Task for Today",
    content: html,
    closeOnBackground: true,
  });

  // Focus on title input
  setTimeout(() => {
    const titleInput = modal.querySelector("#today-task-title");
    if (titleInput) titleInput.focus();
  }, 100);
}

/**
 * Open modal to edit existing task
 * @param {string} taskId - Task ID to edit
 */
function openEditTodayTaskModal(taskId) {
  currentTodayTaskEditId = taskId;
  const task = getTask(taskId);
  if (!task) return;

  let html = `
    <form id="today-task-form" onsubmit="saveTodayTask(event)">
      <div class="form-group">
        <label for="today-task-title">Task Title *</label>
        <input type="text" id="today-task-title" class="form-input" value="${
          task.title
        }" required />
      </div>

      <div class="form-group">
        <label for="today-task-description">Description</label>
        <textarea id="today-task-description" class="form-textarea" rows="3">${
          task.description || ""
        }</textarea>
      </div>

      <div class="form-row">
        <div class="form-group" style="flex: 1;">
          <label for="today-task-time">Time</label>
          <input type="time" id="today-task-time" class="form-input" value="${
            task.time || ""
          }" />
        </div>

        <div class="form-group" style="flex: 1;">
          <label for="today-task-type">Type *</label>
          <select id="today-task-type" class="form-select" required>
            <option value="personal" ${
              task.type === "personal" ? "selected" : ""
            }>Personal</option>
            <option value="work" ${
              task.type === "work" ? "selected" : ""
            }>Work</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="today-task-tags">Tags (comma-separated tag names)</label>
        <input type="text" id="today-task-tags" class="form-input" placeholder="e.g., urgent, important" value="${
          task.tags && task.tags.length > 0
            ? task.tags.map((tagId) => getTag(tagId)?.name || "").join(", ")
            : ""
        }" />
      </div>

      <div class="form-buttons">
        <button type="button" class="btn-cancel" onclick="closeAddTodayTaskModal()">Cancel</button>
        <button type="submit" class="btn-save">Save Changes</button>
      </div>
    </form>
  `;

  const modal = createModal({
    title: "Edit Task",
    content: html,
    closeOnBackground: true,
  });

  // Focus on title input
  setTimeout(() => {
    const titleInput = modal.querySelector("#today-task-title");
    if (titleInput) titleInput.focus();
  }, 100);
}

/**
 * Save task (create or update)
 * @param {Event} event - Form submit event
 */
function saveTodayTask(event) {
  event.preventDefault();

  const title = document.getElementById("today-task-title").value.trim();
  const description = document
    .getElementById("today-task-description")
    .value.trim();
  const time = document.getElementById("today-task-time").value;
  const type = document.getElementById("today-task-type").value;
  const tagsInput = document.getElementById("today-task-tags").value.trim();

  // Validate
  if (!validateRequired(title)) {
    showError("Please enter a task title");
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

  const today = getTodayDate();

  if (currentTodayTaskEditId) {
    // Update existing task
    updateTask(currentTodayTaskEditId, {
      title,
      description,
      time,
      type,
      tags: taskTagIds,
    });
    showSuccess("Task updated successfully");
  } else {
    // Create new task
    const newTask = createTask(title, today, {
      description,
      time,
      type,
      tags: taskTagIds,
    });
    addTask(newTask);
    showSuccess("Task added for today");
  }

  closeAddTodayTaskModal();
  renderTodayPage();
  updateTaskCounterBadges();
}

/**
 * Confirm deletion of task
 * @param {string} taskId - Task ID to delete
 */
function confirmDeleteTodayTask(taskId) {
  const task = getTask(taskId);
  if (!task) return;

  if (window.confirm(`Delete task "${task.title}"?`)) {
    deleteTask(taskId);
    showSuccess("Task deleted");
    renderTodayPage();
    updateTaskCounterBadges();
  }
}

/**
 * Close the task modal
 */
function closeAddTodayTaskModal() {
  const modals = document.querySelectorAll(".modal.active");
  modals.forEach((modal) => {
    modal.classList.remove("active");
    setTimeout(() => modal.remove(), 300);
  });
}

// ===== EVENT LISTENERS =====

/**
 * Setup event listeners for today page
 */
function setupTodayEventListeners() {
  const addBtn = document.querySelector(".add-btn");
  if (addBtn) {
    addBtn.onclick = openAddTodayTaskModal;
  }

  // Handle any modal open/close with ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAddTodayTaskModal();
    }
  });
}

// ===== TASK COUNTER =====

/**
 * Update task counter badges in navigation
 */
function updateTaskCounterBadges() {
  const tasks = getTasks();
  const today = getTodayDate();

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

// Poll for counter updates
setInterval(updateTaskCounterBadges, 2000);
