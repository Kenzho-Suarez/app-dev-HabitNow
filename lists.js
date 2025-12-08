// ===== LISTS PAGE FUNCTIONALITY =====
// Manages task lists with creation, editing, and deletion

let currentListEditId = null;
let currentListSearchQuery = "";

// ===== INITIALIZATION =====

document.addEventListener("DOMContentLoaded", () => {
  renderListsPage();
  setupListsEventListeners();
  updateTaskCounterBadges();
});

// Listen for updates from other pages
window.addEventListener("dataUpdated", (e) => {
  if (e.detail.key === "lists" || e.detail.key === "tasks") {
    renderListsPage();
    updateTaskCounterBadges();
  }
});

// ===== RENDER FUNCTIONS =====

/**
 * Render the lists page
 */
function renderListsPage() {
  let lists = getLists();

  // Apply search filter
  if (currentListSearchQuery) {
    lists = searchItems(lists, currentListSearchQuery, ["name"]);
  }

  // Sort by creation date (newest first)
  lists.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  renderListsGrid(lists);
}

/**
 * Render lists in grid
 * @param {Array} lists - Lists to render
 */
function renderListsGrid(lists) {
  const container = document.querySelector(".lists-grid");
  if (!container) return;

  if (lists.length === 0) {
    container.innerHTML = `
      <p style="text-align: center; color: #999; padding: 40px; grid-column: 1 / -1;">
        ${
          currentListSearchQuery
            ? "No lists match your search"
            : "No lists yet. Create one to organize your tasks!"
        }
      </p>
    `;
    return;
  }

  let html = "";

  lists.forEach((list) => {
    const tasks = getTasks().filter((t) => list.taskIds.includes(t.id));
    const previewTasks = tasks.slice(0, 3);

    html += `
      <div class="list-card" style="border-left: 4px solid ${list.color};">
        <div class="list-card-header">
          <h3 class="list-name">${list.name}</h3>
          <div class="list-actions">
            <button class="icon-btn edit-btn" onclick="openEditListModal('${
              list.id
            }')" title="Edit list">
              ✏️
            </button>
            <button class="icon-btn delete-btn" onclick="confirmDeleteList('${
              list.id
            }')" title="Delete list">
              🗑️
            </button>
          </div>
        </div>
        <div class="list-meta">
          <span class="list-count">${tasks.length} task${
      tasks.length !== 1 ? "s" : ""
    }</span>
          <span class="list-date">${getRelativeTime(list.createdAt)}</span>
        </div>
        <div class="list-preview">
          ${
            previewTasks.length > 0
              ? previewTasks
                  .map(
                    (task) =>
                      `<div class="preview-task" title="${task.title}">
                      <span class="preview-check">${
                        task.completed ? "✓" : "○"
                      }</span>
                      <span>${task.title}</span>
                    </div>`
                  )
                  .join("")
              : '<span style="color: #999; font-size: 14px;">No tasks yet</span>'
          }
          ${
            tasks.length > 3
              ? `<div class="preview-more">+${tasks.length - 3} more</div>`
              : ""
          }
        </div>
        <button class="btn-view-list" onclick="openViewListModal('${
          list.id
        }')">View List →</button>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ===== LIST ACTIONS =====

/**
 * Open modal to add new list
 */
function openAddListModal() {
  currentListEditId = null;

  let html = `
    <form id="list-form" onsubmit="saveList(event)">
      <div class="form-group">
        <label for="list-name">List Name *</label>
        <input type="text" id="list-name" class="form-input" placeholder="Enter list name" required />
      </div>

      <div class="form-group">
        <label>Color *</label>
        <div class="color-picker">
          <label class="color-option">
            <input type="radio" name="list-color" value="#4CAF50" checked />
            <span class="color-sample" style="background: #4CAF50;"></span>
            <span>Green</span>
          </label>
          <label class="color-option">
            <input type="radio" name="list-color" value="#2196F3" />
            <span class="color-sample" style="background: #2196F3;"></span>
            <span>Blue</span>
          </label>
          <label class="color-option">
            <input type="radio" name="list-color" value="#FF9800" />
            <span class="color-sample" style="background: #FF9800;"></span>
            <span>Orange</span>
          </label>
          <label class="color-option">
            <input type="radio" name="list-color" value="#FF1493" />
            <span class="color-sample" style="background: #FF1493;"></span>
            <span>Pink</span>
          </label>
        </div>
      </div>

      <div class="form-buttons">
        <button type="button" class="btn-cancel" onclick="closeListModal()">Cancel</button>
        <button type="submit" class="btn-save">Create List</button>
      </div>
    </form>
  `;

  const modal = createModal({
    title: "Create List",
    content: html,
    closeOnBackground: true,
  });

  setTimeout(() => {
    const nameInput = modal.querySelector("#list-name");
    if (nameInput) nameInput.focus();
  }, 100);
}

/**
 * Open modal to edit existing list
 * @param {string} listId - List ID to edit
 */
function openEditListModal(listId) {
  event?.stopPropagation();
  currentListEditId = listId;
  const list = getList(listId);
  if (!list) return;

  let html = `
    <form id="list-form" onsubmit="saveList(event)">
      <div class="form-group">
        <label for="list-name">List Name *</label>
        <input type="text" id="list-name" class="form-input" value="${
          list.name
        }" required />
      </div>

      <div class="form-group">
        <label>Color *</label>
        <div class="color-picker">
          <label class="color-option">
            <input type="radio" name="list-color" value="#4CAF50" ${
              list.color === "#4CAF50" ? "checked" : ""
            } />
            <span class="color-sample" style="background: #4CAF50;"></span>
            <span>Green</span>
          </label>
          <label class="color-option">
            <input type="radio" name="list-color" value="#2196F3" ${
              list.color === "#2196F3" ? "checked" : ""
            } />
            <span class="color-sample" style="background: #2196F3;"></span>
            <span>Blue</span>
          </label>
          <label class="color-option">
            <input type="radio" name="list-color" value="#FF9800" ${
              list.color === "#FF9800" ? "checked" : ""
            } />
            <span class="color-sample" style="background: #FF9800;"></span>
            <span>Orange</span>
          </label>
          <label class="color-option">
            <input type="radio" name="list-color" value="#FF1493" ${
              list.color === "#FF1493" ? "checked" : ""
            } />
            <span class="color-sample" style="background: #FF1493;"></span>
            <span>Pink</span>
          </label>
        </div>
      </div>

      <div class="form-buttons">
        <button type="button" class="btn-cancel" onclick="closeListModal()">Cancel</button>
        <button type="submit" class="btn-save">Save Changes</button>
      </div>
    </form>
  `;

  const modal = createModal({
    title: "Edit List",
    content: html,
    closeOnBackground: true,
  });

  setTimeout(() => {
    const nameInput = modal.querySelector("#list-name");
    if (nameInput) nameInput.focus();
  }, 100);
}

/**
 * Open modal to view all tasks in a list
 * @param {string} listId - List ID to view
 */
function openViewListModal(listId) {
  event?.stopPropagation();
  const list = getList(listId);
  const tasks = getTasksInList(listId);

  if (!list) return;

  let html = `
    <div class="list-view-modal">
      <div style="padding: 20px; background: #f8f9fa; border-radius: 4px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
          <h3 style="margin: 0;">${list.name}</h3>
          <span style="background: ${
            list.color
          }; color: white; padding: 2px 8px; border-radius: 3px; font-size: 12px;">
            ${tasks.length} task${tasks.length !== 1 ? "s" : ""}
          </span>
        </div>
        <p style="margin: 0; color: #666; font-size: 14px;">Created ${getRelativeTime(
          list.createdAt
        )}</p>
      </div>

      <div class="list-view-tasks">
        ${
          tasks.length === 0
            ? '<p style="color: #999; text-align: center; padding: 40px;">No tasks in this list yet</p>'
            : tasks
                .map(
                  (task) =>
                    `
                <div class="list-view-task" style="opacity: ${
                  task.completed ? "0.6" : "1"
                };">
                  <input type="checkbox" ${
                    task.completed ? "checked" : ""
                  } onchange="toggleTaskCompletion('${
                      task.id
                    }'); setTimeout(() => openViewListModal('${listId}'), 500);" />
                  <div class="list-task-info">
                    <div style="text-decoration: ${
                      task.completed ? "line-through" : "none"
                    };">${task.title}</div>
                    ${
                      task.date
                        ? `<small style="color: #999;">${formatDateShort(
                            task.date
                          )}${task.time ? ` at ${task.time}` : ""}</small>`
                        : ""
                    }
                  </div>
                  <span class="list-task-type" style="background: ${getTypeColor(
                    task.type
                  )}; color: white; padding: 2px 6px; border-radius: 2px; font-size: 12px;">
                    ${task.type}
                  </span>
                </div>
              `
                )
                .join("")
        }
      </div>
    </div>
  `;

  const modal = createModal({
    title: `Tasks in ${list.name}`,
    content: html,
    closeOnBackground: true,
  });
}

/**
 * Save list (create or update)
 * @param {Event} event - Form submit event
 */
function saveList(event) {
  event.preventDefault();

  const name = document.getElementById("list-name").value.trim();
  const color =
    document.querySelector("input[name='list-color']:checked")?.value ||
    "#4CAF50";

  // Validate
  if (!validateRequired(name)) {
    showError("Please enter a list name");
    return;
  }

  if (currentListEditId) {
    // Update existing list
    updateList(currentListEditId, {
      name,
      color,
    });
    showSuccess("List updated successfully");
  } else {
    // Create new list
    const newList = createList(name, {
      color,
    });
    addList(newList);
    showSuccess("List created");
  }

  closeListModal();
  renderListsPage();
  updateTaskCounterBadges();
}

/**
 * Confirm deletion of list
 * @param {string} listId - List ID to delete
 */
function confirmDeleteList(listId) {
  event?.stopPropagation();
  const list = getList(listId);
  if (!list) return;

  if (
    window.confirm(
      `Delete list "${list.name}"? Tasks in this list will not be deleted.`
    )
  ) {
    deleteList(listId);
    showSuccess("List deleted");
    renderListsPage();
    updateTaskCounterBadges();
  }
}

/**
 * Close the list modal
 */
function closeListModal() {
  const modals = document.querySelectorAll(".modal.active");
  modals.forEach((modal) => {
    modal.classList.remove("active");
    setTimeout(() => modal.remove(), 300);
  });
}

// ===== SEARCH FUNCTIONALITY =====

/**
 * Handle search input changes
 * @param {string} query - Search query
 */
function handleListsSearch(query) {
  currentListSearchQuery = query;
  renderListsPage();
}

// ===== EVENT LISTENERS =====

/**
 * Setup event listeners for lists page
 */
function setupListsEventListeners() {
  const addBtn = document.querySelector(".add-btn");
  if (addBtn) {
    addBtn.onclick = openAddListModal;
  }

  const searchInput = document.querySelector(".lists-search");
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        handleListsSearch(e.target.value);
      }, 300);
    });
  }

  // Handle modal close with ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeListModal();
    }
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

// Poll for counter updates
setInterval(updateTaskCounterBadges, 2000);

// Initialize event listeners on load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", setupListsEventListeners);
} else {
  setupListsEventListeners();
}
