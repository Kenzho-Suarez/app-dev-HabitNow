// ===== STICKY WALL PAGE FUNCTIONALITY =====
// Manages sticky notes with colors, search, editing, and deletion

let currentStickyNoteEditId = null;
let currentStickySearchQuery = "";

// ===== INITIALIZATION =====

document.addEventListener("DOMContentLoaded", () => {
  renderStickyWall();
  setupStickyEventListeners();
  updateTaskCounterBadges();

  // Check if we need to open edit modal from dashboard
  const editNoteId = sessionStorage.getItem("editNoteId");
  if (editNoteId) {
    sessionStorage.removeItem("editNoteId");
    setTimeout(() => {
      openEditStickyNoteModal(editNoteId);
    }, 100);
  }
});

// Listen for updates from other pages
window.addEventListener("dataUpdated", (e) => {
  if (e.detail.key === "notes") {
    renderStickyWall();
    updateTaskCounterBadges();
  }
});

// ===== RENDER FUNCTIONS =====

/**
 * Render the sticky wall with all notes
 */
function renderStickyWall() {
  const notes = getNotes();

  // Apply search filter
  let filteredNotes = notes;
  if (currentStickySearchQuery) {
    filteredNotes = searchItems(notes, currentStickySearchQuery, [
      "title",
      "content",
    ]);
  }

  // Sort by creation date (newest first)
  filteredNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  renderStickyNotes(filteredNotes);
}

/**
 * Render sticky notes in grid
 * @param {Array} notes - Notes to render
 */
function renderStickyNotes(notes) {
  const container = document.querySelector(".sticky-wall");
  if (!container) return;

  if (notes.length === 0) {
    container.innerHTML = `
      <p style="text-align: center; color: #999; padding: 40px; grid-column: 1 / -1;">
        ${
          currentStickySearchQuery
            ? "No sticky notes match your search"
            : "No sticky notes yet. Create one to get started!"
        }
      </p>
    `;
    return;
  }

  let html = "";

  notes.forEach((note) => {
    html += `
      <div class="sticky-note" style="background: ${
        note.color
      }; min-height: 180px; display: flex; flex-direction: column; border: 1px solid rgba(0,0,0,0.08); position: relative;" onclick="openEditStickyNoteModal('${
      note.id
    }')">
        <button class="sticky-delete" onclick="event.stopPropagation(); confirmDeleteStickyNote('${
          note.id
        }')" title="Delete note">
          ×
        </button>
        <h4 class="sticky-title" style="margin: 0 0 10px 0; font-size: 16px; font-weight: 700; color: #222;">${
          note.title
        }</h4>
        <p class="sticky-content" style="flex: 1; margin: 0 0 12px 0; font-size: 14px; line-height: 1.5; color: #444; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical;">${
          note.content
        }</p>
        <div class="sticky-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: auto; padding-top: 10px; border-top: 1px solid rgba(0,0,0,0.08);">
          ${
            note.tags && note.tags.length > 0
              ? `<span class="sticky-tags" style="font-size: 11px; color: #666;">${note.tags
                  .map((tagId) => `#${getTag(tagId)?.name || "unknown"}`)
                  .join(" ")}</span>`
              : "<span></span>"
          }
          <span class="sticky-date" style="font-size: 11px; color: #888;" title="${formatDate(
            note.createdAt
          )}">${getRelativeTime(note.createdAt)}</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ===== NOTE ACTIONS =====

/**
 * Open modal to add new note
 */
function openAddStickyNoteModal() {
  currentStickyNoteEditId = null;

  let html = `
    <form id="sticky-note-form" onsubmit="saveStickyNote(event)">
      <div class="form-group">
        <label for="sticky-title">Title *</label>
        <input type="text" id="sticky-title" class="form-input" placeholder="Note title" required />
      </div>

      <div class="form-group">
        <label for="sticky-content">Content *</label>
        <textarea id="sticky-content" class="form-textarea" placeholder="Write your note here..." rows="6" required></textarea>
      </div>

      <div class="form-group">
        <label>Color *</label>
        <div class="color-picker">
          <label class="color-option">
            <input type="radio" name="sticky-color" value="#FFEB3B" checked />
            <span class="color-sample" style="background: #FFEB3B;"></span>
            <span>Yellow</span>
          </label>
          <label class="color-option">
            <input type="radio" name="sticky-color" value="#2196F3" />
            <span class="color-sample" style="background: #2196F3;"></span>
            <span>Blue</span>
          </label>
          <label class="color-option">
            <input type="radio" name="sticky-color" value="#FF1493" />
            <span class="color-sample" style="background: #FF1493;"></span>
            <span>Pink</span>
          </label>
          <label class="color-option">
            <input type="radio" name="sticky-color" value="#FF9800" />
            <span class="color-sample" style="background: #FF9800;"></span>
            <span>Orange</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label for="sticky-tags">Tags (comma-separated)</label>
        <input type="text" id="sticky-tags" class="form-input" placeholder="e.g., important, ideas" />
      </div>

      <div class="form-buttons">
        <button type="button" class="btn-cancel" onclick="closeStickyNoteModal()">Cancel</button>
        <button type="submit" class="btn-save">Create Note</button>
      </div>
    </form>
  `;

  const modal = createModal({
    title: "Add Note",
    content: html,
    closeOnBackground: true,
  });

  setTimeout(() => {
    const titleInput = modal.querySelector("#sticky-title");
    if (titleInput) titleInput.focus();
  }, 100);
}

/**
 * Open modal to edit existing note
 * @param {string} noteId - Note ID to edit
 */
function openEditStickyNoteModal(noteId) {
  currentStickyNoteEditId = noteId;
  const note = getNote(noteId);
  if (!note) return;

  let html = `
    <form id="sticky-note-form" onsubmit="saveStickyNote(event)">
      <div class="form-group">
        <label for="sticky-title">Title *</label>
        <input type="text" id="sticky-title" class="form-input" value="${
          note.title
        }" required />
      </div>

      <div class="form-group">
        <label for="sticky-content">Content *</label>
        <textarea id="sticky-content" class="form-textarea" rows="6" required>${
          note.content
        }</textarea>
      </div>

      <div class="form-group">
        <label>Color *</label>
        <div class="color-picker">
          <label class="color-option">
            <input type="radio" name="sticky-color" value="#FFEB3B" ${
              note.color === "#FFEB3B" ? "checked" : ""
            } />
            <span class="color-sample" style="background: #FFEB3B;"></span>
            <span>Yellow</span>
          </label>
          <label class="color-option">
            <input type="radio" name="sticky-color" value="#2196F3" ${
              note.color === "#2196F3" ? "checked" : ""
            } />
            <span class="color-sample" style="background: #2196F3;"></span>
            <span>Blue</span>
          </label>
          <label class="color-option">
            <input type="radio" name="sticky-color" value="#FF1493" ${
              note.color === "#FF1493" ? "checked" : ""
            } />
            <span class="color-sample" style="background: #FF1493;"></span>
            <span>Pink</span>
          </label>
          <label class="color-option">
            <input type="radio" name="sticky-color" value="#FF9800" ${
              note.color === "#FF9800" ? "checked" : ""
            } />
            <span class="color-sample" style="background: #FF9800;"></span>
            <span>Orange</span>
          </label>
        </div>
      </div>

      <div class="form-group">
        <label for="sticky-tags">Tags (comma-separated)</label>
        <input type="text" id="sticky-tags" class="form-input" placeholder="e.g., important, ideas" value="${
          note.tags && note.tags.length > 0
            ? note.tags.map((tagId) => getTag(tagId)?.name || "").join(", ")
            : ""
        }" />
      </div>

      <div class="form-buttons">
        <button type="button" class="btn-cancel" onclick="closeStickyNoteModal()">Cancel</button>
        <button type="submit" class="btn-save">Save Changes</button>
      </div>
    </form>
  `;

  const modal = createModal({
    title: "Edit Note",
    content: html,
    closeOnBackground: true,
  });

  setTimeout(() => {
    const titleInput = modal.querySelector("#sticky-title");
    if (titleInput) titleInput.focus();
  }, 100);
}

/**
 * Save note (create or update)
 * @param {Event} event - Form submit event
 */
function saveStickyNote(event) {
  event.preventDefault();

  const title = document.getElementById("sticky-title").value.trim();
  const content = document.getElementById("sticky-content").value.trim();
  const color =
    document.querySelector("input[name='sticky-color']:checked")?.value ||
    "#FFEB3B";
  const tagsInput = document.getElementById("sticky-tags").value.trim();

  // Validate
  if (!validateRequired(title)) {
    showError("Please enter a note title");
    return;
  }

  if (!validateRequired(content)) {
    showError("Please enter note content");
    return;
  }

  // Parse tags
  const tagNames = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
  const tags = getTags();
  const noteTagIds = tagNames.map((tagName) => {
    let tag = tags.find((t) => t.name.toLowerCase() === tagName.toLowerCase());
    if (!tag) {
      tag = createTag(tagName);
      tags.push(tag);
    }
    return tag.id;
  });
  saveTags(tags);

  if (currentStickyNoteEditId) {
    // Update existing note
    updateNote(currentStickyNoteEditId, {
      title,
      content,
      color,
      tags: noteTagIds,
    });
    showSuccess("Note updated successfully");
  } else {
    // Create new note
    const newNote = createNote(title, content, {
      color,
      tags: noteTagIds,
    });
    addNote(newNote);
    showSuccess("Note created");
  }

  closeStickyNoteModal();
  renderStickyWall();
  updateTaskCounterBadges();
}

/**
 * Confirm deletion of note
 * @param {string} noteId - Note ID to delete
 */
function confirmDeleteStickyNote(noteId) {
  const note = getNote(noteId);
  if (!note) return;

  if (window.confirm(`Delete note "${note.title}"?`)) {
    deleteNote(noteId);
    showSuccess("Note deleted");
    renderStickyWall();
    updateTaskCounterBadges();
  }
}

/**
 * Close the note modal
 */
function closeStickyNoteModal() {
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
function handleStickySearch(query) {
  currentStickySearchQuery = query;
  renderStickyWall();
}

// ===== EVENT LISTENERS =====

/**
 * Setup event listeners for sticky wall page
 */
function setupStickyEventListeners() {
  const addBtn = document.querySelector(".add-btn");
  if (addBtn) {
    addBtn.onclick = openAddStickyNoteModal;
  }

  const searchInput = document.querySelector(".sticky-search");
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        handleStickySearch(e.target.value);
      }, 300);
    });
  }

  // Handle modal close with ESC key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeStickyNoteModal();
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
  document.addEventListener("DOMContentLoaded", setupStickyEventListeners);
} else {
  setupStickyEventListeners();
}
