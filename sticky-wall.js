// ===== STICKY WALL FUNCTIONALITY =====
// Allows creating, viewing, editing, and deleting sticky notes

const noteColors = [
  { value: "#FFEB3B", label: "Yellow" },
  { value: "#2196F3", label: "Blue" },
  { value: "#FF1493", label: "Pink" },
  { value: "#FF9800", label: "Orange" },
  { value: "#4CAF50", label: "Green" },
];

// ===== INITIALIZATION =====
document.addEventListener("DOMContentLoaded", () => {
  renderStickyWall();
  setupStickyWallEvents();
  handlePendingNoteOpen();
});

// Re-render when notes change elsewhere
window.addEventListener("dataUpdated", (e) => {
  if (e.detail.key === "notes") {
    renderStickyWall();
  }
});

// ===== RENDER FUNCTIONS =====
/**
 * Render notes on the sticky wall
 */
function renderStickyWall() {
  const wall = document.querySelector(".sticky-wall");
  if (!wall) return;

  let notes = getNotes();

  // Sort newest first
  notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (notes.length === 0) {
    wall.innerHTML = `
      <div class="empty-state" style="grid-column: 1 / -1;">
        <p>No notes yet. Add your first sticky note!</p>
      </div>
    `;
    return;
  }

  wall.innerHTML = notes
    .map(
      (note) => `
      <div class="sticky-note" style="background: ${
        note.color
      };" data-note-id="${note.id}">
        <button class="icon-btn delete-btn" title="Delete note" onclick="event.stopPropagation(); handleDeleteNote('${
          note.id
        }', event);">🗑️</button>
        <div class="note-content-wrapper" onclick="openEditNote('${note.id}')">
          <h3 class="note-title">${note.title || "Untitled note"}</h3>
          <p class="note-content">${
            note.content ? note.content : "No content yet."
          }</p>
          <div class="note-meta" style="font-size: 12px; color: #444; margin-top: 12px;">
            <span class="note-time">${getRelativeTime(note.createdAt)}</span>
          </div>
        </div>
      </div>
    `
    )
    .join("");
}

// ===== MODAL HANDLERS =====
/**
 * Open modal to add or edit a note
 * @param {Object|null} note - Note to edit, or null to add
 */
function openNoteModal(note = null) {
  const isEdit = Boolean(note);

  const modal = createModal({
    title: isEdit ? "Edit Note" : "Add Note",
    closeOnBackground: true,
    content: `
      <form id="note-form" class="form-content">
        <div class="form-group">
          <label for="note-title">Title *</label>
          <input
            type="text"
            id="note-title"
            class="form-input"
            placeholder="Enter note title"
            required
          />
        </div>

        <div class="form-group">
          <label for="note-content">Content</label>
          <textarea
            id="note-content"
            class="form-input"
            rows="4"
            placeholder="Write your note..."
          ></textarea>
        </div>

        <div class="form-group">
          <label for="note-color">Color</label>
          <select id="note-color" class="form-input">
            ${noteColors
              .map(
                (color) =>
                  `<option value="${color.value}">${color.label}</option>`
              )
              .join("")}
          </select>
        </div>

        <div class="form-buttons">
          <button type="button" class="btn-cancel" onclick="closeModal(document.querySelector('.modal.active'));">Cancel</button>
          <button type="submit" class="btn-save">${
            isEdit ? "Save Changes" : "Add Note"
          }</button>
        </div>
      </form>
    `,
  });

  // Prefill form when editing
  const titleInput = modal.querySelector("#note-title");
  const contentInput = modal.querySelector("#note-content");
  const colorSelect = modal.querySelector("#note-color");
  if (titleInput) titleInput.value = note?.title || "";
  if (contentInput) contentInput.value = note?.content || "";
  if (colorSelect) colorSelect.value = note?.color || noteColors[0].value;

  const form = modal.querySelector("#note-form");
  if (form) {
    form.addEventListener("submit", (event) =>
      saveNoteFromModal(event, note ? note.id : null)
    );
  }

  // Focus title for quicker entry
  setTimeout(() => titleInput?.focus(), 100);
}

/**
 * Save a note from the modal form
 * @param {Event} event - Form submit event
 * @param {string|null} noteId - Note ID when editing
 */
function saveNoteFromModal(event, noteId = null) {
  event.preventDefault();
  const form = event.target.closest("form");
  const modal = event.target.closest(".modal");
  if (!form) return;

  const title = form.querySelector("#note-title")?.value.trim() || "";
  const content = form.querySelector("#note-content")?.value.trim() || "";
  const color = form.querySelector("#note-color")?.value || noteColors[0].value;

  if (!validateRequired(title)) {
    showError("Please enter a note title.");
    return;
  }

  if (noteId) {
    updateNote(noteId, { title, content, color });
    showSuccess("Note updated.");
  } else {
    const newNote = createNote(title, content, { color });
    addNote(newNote);
    showSuccess("Note added.");
  }

  closeModal(modal);
  renderStickyWall();
}

// ===== NOTE ACTIONS =====
/**
 * Open edit modal for a note
 * @param {string} noteId - Note ID to edit
 */
function openEditNote(noteId) {
  const note = getNote(noteId);
  if (!note) {
    showError("Note not found.");
    return;
  }
  openNoteModal(note);
}

/**
 * Delete a note with confirmation
 * @param {string} noteId - Note ID to delete
 * @param {Event} evt - Click event for stopping propagation
 */
function handleDeleteNote(noteId, evt) {
  evt?.stopPropagation();
  const note = getNote(noteId);
  if (!note) return;

  if (window.confirm("Delete this note?")) {
    deleteNote(noteId);
    showSuccess("Note deleted.");
    renderStickyWall();
  }
}

/**
 * If coming from dashboard with a specific note to open, show it
 */
function handlePendingNoteOpen() {
  const pendingId = sessionStorage.getItem("editNoteId");
  if (pendingId) {
    const note = getNote(pendingId);
    if (note) {
      openNoteModal(note);
    }
    sessionStorage.removeItem("editNoteId");
  }
}

// ===== EVENT SETUP =====
/**
 * Wire up page-level events
 */
function setupStickyWallEvents() {
  const addBtn = document.querySelector(".add-btn");
  if (addBtn) {
    addBtn.onclick = () => openNoteModal();
  }
}

// Expose functions used in inline handlers
window.openEditNote = openEditNote;
window.handleDeleteNote = handleDeleteNote;
