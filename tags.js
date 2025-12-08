// ===== TAGS PAGE FUNCTIONALITY =====
// Manages tags with creation, deletion, and viewing tagged items

let currentTagSearchQuery = "";

// ===== INITIALIZATION =====

document.addEventListener("DOMContentLoaded", () => {
  renderTagsPage();
  setupTagsEventListeners();
  updateTaskCounterBadges();
});

// Listen for updates from other pages
window.addEventListener("dataUpdated", (e) => {
  if (
    e.detail.key === "tags" ||
    e.detail.key === "tasks" ||
    e.detail.key === "notes"
  ) {
    renderTagsPage();
    updateTaskCounterBadges();
  }
});

// ===== RENDER FUNCTIONS =====

/**
 * Render the tags page
 */
function renderTagsPage() {
  let tags = getTags();

  // Apply search filter
  if (currentTagSearchQuery) {
    tags = searchItems(tags, currentTagSearchQuery, ["name"]);
  }

  // Sort by creation date (newest first)
  tags.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  renderTagsGrid(tags);
}

/**
 * Render tags in grid
 * @param {Array} tags - Tags to render
 */
function renderTagsGrid(tags) {
  const container = document.querySelector(".tags-grid");
  if (!container) return;

  if (tags.length === 0) {
    container.innerHTML = `
      <p style="text-align: center; color: #999; padding: 40px; grid-column: 1 / -1;">
        ${
          currentTagSearchQuery
            ? "No tags match your search"
            : "No tags yet. Create one to organize and categorize your tasks!"
        }
      </p>
    `;
    return;
  }

  let html = "";

  tags.forEach((tag) => {
    const itemsWithTag = getItemsWithTag(tag.id);
    const totalCount = itemsWithTag.tasks.length + itemsWithTag.notes.length;

    html += `
      <div class="tag-card">
        <div class="tag-card-header">
          <h3 class="tag-name">#${tag.name}</h3>
          <button class="icon-btn delete-btn" onclick="confirmDeleteTag('${
            tag.id
          }')" title="Delete tag">
            🗑️
          </button>
        </div>
        <div class="tag-stats">
          <span class="tag-count">${totalCount} item${
      totalCount !== 1 ? "s" : ""
    }</span>
          <div class="tag-breakdown">
            <span title="${itemsWithTag.tasks.length} task(s)">📋 ${
      itemsWithTag.tasks.length
    }</span>
            <span title="${itemsWithTag.notes.length} note(s)">📝 ${
      itemsWithTag.notes.length
    }</span>
          </div>
        </div>
        <button class="btn-view-tag" onclick="openViewTagModal('${
          tag.id
        }')">View All →</button>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ===== TAG ACTIONS =====

/**
 * Open modal to add new tag
 */
function openAddTagModal() {
  let html = `
    <form id="tag-form" onsubmit="saveTag(event)">
      <div class="form-group">
        <label for="tag-name">Tag Name *</label>
        <input type="text" id="tag-name" class="form-input" placeholder="Enter tag name (without #)" required />
      </div>

      <div class="form-buttons">
        <button type="button" class="btn-cancel" onclick="closeTagModal()">Cancel</button>
        <button type="submit" class="btn-save">Create Tag</button>
      </div>
    </form>
  `;

  const modal = createModal({
    title: "Create Tag",
    content: html,
    closeOnBackground: true,
  });

  setTimeout(() => {
    const nameInput = modal.querySelector("#tag-name");
    if (nameInput) nameInput.focus();
  }, 100);
}

/**
 * Open modal to view all items with a tag
 * @param {string} tagId - Tag ID to view
 */
function openViewTagModal(tagId) {
  event?.stopPropagation();
  const tag = getTag(tagId);
  const items = getItemsWithTag(tagId);

  if (!tag) return;

  let html = `
    <div class="tag-view-modal">
      <div style="padding: 20px; background: #f8f9fa; border-radius: 4px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px 0;">#${tag.name}</h3>
        <p style="margin: 0; color: #666; font-size: 14px;">Created ${getRelativeTime(
          tag.createdAt
        )}</p>
        <p style="margin: 8px 0 0 0; color: #999; font-size: 13px;">${
          items.tasks.length + items.notes.length
        } total item(s)</p>
      </div>

      <div class="tag-view-items">
  `;

  // Display tasks with this tag
  if (items.tasks.length > 0) {
    html +=
      '<div class="tag-section"><h4 style="margin-bottom: 10px; color: #333;">📋 Tasks</h4>';
    items.tasks.forEach((task) => {
      html += `
        <div class="tag-item task-item" style="opacity: ${
          task.completed ? "0.6" : "1"
        };">
          <div class="tag-item-icon">📌</div>
          <div class="tag-item-info">
            <div style="text-decoration: ${
              task.completed ? "line-through" : "none"
            }; font-weight: 500;">${task.title}</div>
            <small style="color: #999;">${formatDateShort(task.date)}${
        task.time ? ` at ${task.time}` : ""
      } • ${task.type}</small>
          </div>
          <span class="tag-item-status" style="background: ${
            task.completed ? "#4CAF50" : "#999"
          }; color: white; padding: 2px 6px; border-radius: 2px; font-size: 11px;">
            ${task.completed ? "✓ Done" : "○ Todo"}
          </span>
        </div>
      `;
    });
    html += "</div>";
  }

  // Display notes with this tag
  if (items.notes.length > 0) {
    html +=
      '<div class="tag-section"><h4 style="margin-bottom: 10px; color: #333;">📝 Notes</h4>';
    items.notes.forEach((note) => {
      html += `
        <div class="tag-item note-item" style="background: ${note.color}33;">
          <div class="tag-item-icon">📓</div>
          <div class="tag-item-info">
            <div style="font-weight: 500;">${note.title}</div>
            <small style="color: #999;">${getRelativeTime(
              note.createdAt
            )}</small>
          </div>
        </div>
      `;
    });
    html += "</div>";
  }

  if (items.tasks.length === 0 && items.notes.length === 0) {
    html +=
      '<p style="color: #999; text-align: center; padding: 40px;">No items tagged with #${tag.name}</p>';
  }

  html += "</div></div>";

  const modal = createModal({
    title: `#${tag.name}`,
    content: html,
    closeOnBackground: true,
  });
}

/**
 * Save tag (create new)
 * @param {Event} event - Form submit event
 */
function saveTag(event) {
  event.preventDefault();

  const name = document.getElementById("tag-name").value.trim();

  // Validate
  if (!validateRequired(name)) {
    showError("Please enter a tag name");
    return;
  }

  // Check if tag already exists
  const existingTag = getTags().find(
    (t) => t.name.toLowerCase() === name.toLowerCase()
  );
  if (existingTag) {
    showError("A tag with this name already exists");
    return;
  }

  // Create new tag
  const newTag = createTag(name);
  addTag(newTag);
  showSuccess(`Tag #${name} created`);

  closeTagModal();
  renderTagsPage();
  updateTaskCounterBadges();
}

/**
 * Confirm deletion of tag
 * @param {string} tagId - Tag ID to delete
 */
function confirmDeleteTag(tagId) {
  event?.stopPropagation();
  const tag = getTag(tagId);
  if (!tag) return;

  if (
    window.confirm(
      `Delete tag #${tag.name}? This will not delete the items tagged with it.`
    )
  ) {
    deleteTag(tagId);
    showSuccess("Tag deleted");
    renderTagsPage();
    updateTaskCounterBadges();
  }
}

/**
 * Close the tag modal
 */
function closeTagModal() {
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
function handleTagsSearch(query) {
  currentTagSearchQuery = query;
  renderTagsPage();
}

// ===== EVENT LISTENERS =====

/**
 * Setup event listeners for tags page
 */
function setupTagsEventListeners() {
  const addBtn = document.querySelector(".add-btn");
  if (addBtn) {
    addBtn.onclick = openAddTagModal;
  }

  const searchInput = document.querySelector(".tags-search");
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        handleTagsSearch(e.target.value);
      }, 300);
    });
  }

  // Handle modal close with ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeTagModal();
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

