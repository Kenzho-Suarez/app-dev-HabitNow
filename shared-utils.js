// ===== SHARED UTILITIES FOR ALL PAGES =====
// Common functions for data management, formatting, and modal handling

// ===== LOCALSTORAGE MANAGEMENT =====

/**
 * Retrieve data from localStorage with error handling
 * @param {string} key - The localStorage key
 * @param {*} defaultValue - Default value if key doesn't exist
 * @returns {*} Parsed data or default value
 */
function getData(key, defaultValue = []) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

/**
 * Save data to localStorage with error handling
 * @param {string} key - The localStorage key
 * @param {*} data - Data to save (will be stringified)
 * @returns {boolean} True if successful, false otherwise
 */
function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    // Dispatch custom event to notify other pages of changes
    window.dispatchEvent(new CustomEvent("dataUpdated", { detail: { key } }));
    return true;
  } catch (error) {
    console.error(`Error saving localStorage key "${key}":`, error);
    showError("Failed to save data. Please try again.");
    return false;
  }
}

// ===== DATA MANAGEMENT FUNCTIONS =====

/**
 * Get all tasks from localStorage
 * @returns {Array} Array of task objects
 */
function getTasks() {
  return getData("tasks", []);
}

/**
 * Save all tasks to localStorage
 * @param {Array} tasks - Array of task objects
 * @returns {boolean} True if successful
 */
function saveTasks(tasks) {
  return saveData("tasks", tasks);
}

/**
 * Get all notes from localStorage
 * @returns {Array} Array of note objects
 */
function getNotes() {
  return getData("notes", []);
}

/**
 * Save all notes to localStorage
 * @param {Array} notes - Array of note objects
 * @returns {boolean} True if successful
 */
function saveNotes(notes) {
  return saveData("notes", notes);
}

/**
 * Get all lists from localStorage
 * @returns {Array} Array of list objects
 */
function getLists() {
  return getData("lists", []);
}

/**
 * Save all lists to localStorage
 * @param {Array} lists - Array of list objects
 * @returns {boolean} True if successful
 */
function saveLists(lists) {
  return saveData("lists", lists);
}

/**
 * Get all tags from localStorage
 * @returns {Array} Array of tag objects
 */
function getTags() {
  return getData("tags", []);
}

/**
 * Save all tags to localStorage
 * @param {Array} tags - Array of tag objects
 * @returns {boolean} True if successful
 */
function saveTags(tags) {
  return saveData("tags", tags);
}

// ===== TASK MANAGEMENT FUNCTIONS =====

/**
 * Create a new task object
 * @param {string} title - Task title
 * @param {string} date - Task date (YYYY-MM-DD format)
 * @param {Object} options - Additional task properties
 * @returns {Object} New task object
 */
function createTask(title, date, options = {}) {
  return {
    id: "task_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
    title,
    description: options.description || "",
    date,
    time: options.time || "",
    type: options.type || "personal",
    completed: options.completed || false,
    createdAt: options.createdAt || new Date().toISOString(),
    tags: options.tags || [],
    listId: options.listId || null,
  };
}

/**
 * Add a new task
 * @param {Object} task - Task object to add
 * @returns {boolean} True if successful
 */
function addTask(task) {
  const tasks = getTasks();
  tasks.push(task);
  return saveTasks(tasks);
}

/**
 * Update an existing task
 * @param {string} taskId - Task ID to update
 * @param {Object} updates - Object with properties to update
 * @returns {boolean} True if successful
 */
function updateTask(taskId, updates) {
  const tasks = getTasks();
  const taskIndex = tasks.findIndex((t) => t.id === taskId);
  if (taskIndex === -1) {
    showError("Task not found");
    return false;
  }
  tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
  return saveTasks(tasks);
}

/**
 * Delete a task
 * @param {string} taskId - Task ID to delete
 * @returns {boolean} True if successful
 */
function deleteTask(taskId) {
  const tasks = getTasks();
  const filtered = tasks.filter((t) => t.id !== taskId);
  return saveTasks(filtered);
}

/**
 * Get a single task by ID
 * @param {string} taskId - Task ID to retrieve
 * @returns {Object|null} Task object or null if not found
 */
function getTask(taskId) {
  const tasks = getTasks();
  return tasks.find((t) => t.id === taskId) || null;
}

// ===== NOTE MANAGEMENT FUNCTIONS =====

/**
 * Create a new note object
 * @param {string} title - Note title
 * @param {string} content - Note content
 * @param {Object} options - Additional note properties
 * @returns {Object} New note object
 */
function createNote(title, content, options = {}) {
  return {
    id: "note_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
    title,
    content,
    color: options.color || "#FFEB3B",
    createdAt: options.createdAt || new Date().toISOString(),
    tags: options.tags || [],
  };
}

/**
 * Add a new note
 * @param {Object} note - Note object to add
 * @returns {boolean} True if successful
 */
function addNote(note) {
  const notes = getNotes();
  notes.push(note);
  return saveNotes(notes);
}

/**
 * Update an existing note
 * @param {string} noteId - Note ID to update
 * @param {Object} updates - Object with properties to update
 * @returns {boolean} True if successful
 */
function updateNote(noteId, updates) {
  const notes = getNotes();
  const noteIndex = notes.findIndex((n) => n.id === noteId);
  if (noteIndex === -1) {
    showError("Note not found");
    return false;
  }
  notes[noteIndex] = { ...notes[noteIndex], ...updates };
  return saveNotes(notes);
}

/**
 * Delete a note
 * @param {string} noteId - Note ID to delete
 * @returns {boolean} True if successful
 */
function deleteNote(noteId) {
  const notes = getNotes();
  const filtered = notes.filter((n) => n.id !== noteId);
  return saveNotes(filtered);
}

/**
 * Get a single note by ID
 * @param {string} noteId - Note ID to retrieve
 * @returns {Object|null} Note object or null if not found
 */
function getNote(noteId) {
  const notes = getNotes();
  return notes.find((n) => n.id === noteId) || null;
}

// ===== LIST MANAGEMENT FUNCTIONS =====

/**
 * Create a new list object
 * @param {string} name - List name
 * @param {Object} options - Additional list properties
 * @returns {Object} New list object
 */
function createList(name, options = {}) {
  return {
    id: "list_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
    name,
    color: options.color || "#4CAF50",
    createdAt: options.createdAt || new Date().toISOString(),
    taskIds: options.taskIds || [],
  };
}

/**
 * Add a new list
 * @param {Object} list - List object to add
 * @returns {boolean} True if successful
 */
function addList(list) {
  const lists = getLists();
  lists.push(list);
  return saveLists(lists);
}

/**
 * Update an existing list
 * @param {string} listId - List ID to update
 * @param {Object} updates - Object with properties to update
 * @returns {boolean} True if successful
 */
function updateList(listId, updates) {
  const lists = getLists();
  const listIndex = lists.findIndex((l) => l.id === listId);
  if (listIndex === -1) {
    showError("List not found");
    return false;
  }
  lists[listIndex] = { ...lists[listIndex], ...updates };
  return saveLists(lists);
}

/**
 * Delete a list
 * @param {string} listId - List ID to delete
 * @returns {boolean} True if successful
 */
function deleteList(listId) {
  const lists = getLists();
  const filtered = lists.filter((l) => l.id !== listId);
  return saveLists(filtered);
}

/**
 * Get a single list by ID
 * @param {string} listId - List ID to retrieve
 * @returns {Object|null} List object or null if not found
 */
function getList(listId) {
  const lists = getLists();
  return lists.find((l) => l.id === listId) || null;
}

/**
 * Get tasks in a specific list
 * @param {string} listId - List ID
 * @returns {Array} Array of task objects in the list
 */
function getTasksInList(listId) {
  const tasks = getTasks();
  const list = getList(listId);
  if (!list) return [];
  return tasks.filter((t) => list.taskIds.includes(t.id));
}

// ===== TAG MANAGEMENT FUNCTIONS =====

/**
 * Create a new tag object
 * @param {string} name - Tag name
 * @param {Object} options - Additional tag properties
 * @returns {Object} New tag object
 */
function createTag(name, options = {}) {
  return {
    id: "tag_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
    name,
    createdAt: options.createdAt || new Date().toISOString(),
  };
}

/**
 * Add a new tag
 * @param {Object} tag - Tag object to add
 * @returns {boolean} True if successful
 */
function addTag(tag) {
  const tags = getTags();
  tags.push(tag);
  return saveTags(tags);
}

/**
 * Delete a tag
 * @param {string} tagId - Tag ID to delete
 * @returns {boolean} True if successful
 */
function deleteTag(tagId) {
  const tags = getTags();
  const filtered = tags.filter((t) => t.id !== tagId);
  return saveTags(filtered);
}

/**
 * Get a single tag by ID
 * @param {string} tagId - Tag ID to retrieve
 * @returns {Object|null} Tag object or null if not found
 */
function getTag(tagId) {
  const tags = getTags();
  return tags.find((t) => t.id === tagId) || null;
}

/**
 * Get all items with a specific tag
 * @param {string} tagId - Tag ID
 * @returns {Object} Object with tasks and notes arrays that have the tag
 */
function getItemsWithTag(tagId) {
  const tasks = getTasks();
  const notes = getNotes();

  return {
    tasks: tasks.filter((t) => t.tags && t.tags.includes(tagId)),
    notes: notes.filter((n) => n.tags && n.tags.includes(tagId)),
  };
}

/**
 * Count items with a specific tag
 * @param {string} tagId - Tag ID
 * @returns {number} Total count of items with the tag
 */
function countItemsWithTag(tagId) {
  const items = getItemsWithTag(tagId);
  return items.tasks.length + items.notes.length;
}

// ===== DATE AND TIME UTILITIES =====

/**
 * Format date to readable string
 * @param {Date|string} date - Date object or ISO string
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
function formatDate(date, options = {}) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const defaultOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  };
  return dateObj.toLocaleDateString("en-US", defaultOptions);
}

/**
 * Format date to short format (MMM DD, YYYY)
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Formatted date string
 */
function formatDateShort(date) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {Date|string} date - Date object or ISO string
 * @returns {string} Relative time string
 */
function getRelativeTime(date) {
  const now = new Date();
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const diffMs = now - dateObj;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "Just now";
  if (diffMinutes < 60)
    return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDateShort(date);
}

/**
 * Get today's date as YYYY-MM-DD string
 * @returns {string} Today's date
 */
function getTodayDate() {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

/**
 * Check if a date is today
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {boolean} True if date is today
 */
function isToday(dateStr) {
  return dateStr === getTodayDate();
}

/**
 * Check if a date is in the future
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {boolean} True if date is in the future
 */
function isFuture(dateStr) {
  return dateStr > getTodayDate();
}

/**
 * Check if a date is in the past
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {boolean} True if date is in the past
 */
function isPast(dateStr) {
  return dateStr < getTodayDate();
}

/**
 * Parse time string (HH:MM) to hours and minutes
 * @param {string} timeStr - Time string in HH:MM format
 * @returns {Object} Object with hours and minutes properties
 */
function parseTime(timeStr) {
  if (!timeStr) return { hours: 0, minutes: 0 };
  const [hours, minutes] = timeStr.split(":").map(Number);
  return { hours, minutes };
}

// ===== VALIDATION FUNCTIONS =====

/**
 * Validate task date (must not be in the past unless editing)
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @param {boolean} allowToday - Allow today's date
 * @returns {boolean} True if date is valid
 */
function validateTaskDate(dateStr, allowToday = true) {
  const today = getTodayDate();
  if (allowToday) {
    return dateStr >= today;
  } else {
    return dateStr > today;
  }
}

/**
 * Validate required field
 * @param {string|any} value - Value to validate
 * @returns {boolean} True if value is not empty
 */
function validateRequired(value) {
  return value && String(value).trim().length > 0;
}

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// ===== MODAL UTILITIES =====

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
  // Create and show error notification
  const notification = document.createElement("div");
  notification.className = "notification error";
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #f44336;
    color: white;
    padding: 15px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

/**
 * Show success message
 * @param {string} message - Success message to display
 */
function showSuccess(message) {
  const notification = document.createElement("div");
  notification.className = "notification success";
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 15px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease-out";
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Create and show a generic modal
 * @param {Object} options - Modal options
 * @returns {HTMLElement} Modal element
 */
function createModal(options = {}) {
  const {
    title = "Modal",
    content = "",
    onClose = () => {},
    closeOnBackground = true,
  } = options;

  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>${title}</h2>
        <button class="close-btn">&times;</button>
      </div>
      <div class="modal-body">
        ${content}
      </div>
    </div>
  `;

  const closeBtn = modal.querySelector(".close-btn");
  closeBtn.onclick = () => closeModal(modal, onClose);

  if (closeOnBackground) {
    modal.onclick = (e) => {
      if (e.target === modal) {
        closeModal(modal, onClose);
      }
    };
  }

  // ESC key to close
  const handleEsc = (e) => {
    if (e.key === "Escape") {
      closeModal(modal, onClose);
      document.removeEventListener("keydown", handleEsc);
    }
  };
  document.addEventListener("keydown", handleEsc);

  document.body.appendChild(modal);
  modal.classList.add("active");

  return modal;
}

/**
 * Close a modal
 * @param {HTMLElement} modal - Modal element to close
 * @param {Function} onClose - Callback function
 */
function closeModal(modal, onClose = () => {}) {
  if (modal) {
    modal.classList.remove("active");
    setTimeout(() => modal.remove(), 300);
  }
  onClose();
}

/**
 * Confirm action with user
 * @param {string} message - Confirmation message
 * @returns {Promise<boolean>} True if user confirms
 */
function confirm(message) {
  return Promise.resolve(window.confirm(message));
}

// ===== SEARCH AND FILTER UTILITIES =====

/**
 * Search in array of objects
 * @param {Array} items - Array to search
 * @param {string} query - Search query
 * @param {Array} fields - Fields to search in
 * @returns {Array} Filtered results
 */
function searchItems(items, query, fields) {
  if (!query) return items;

  const lowerQuery = query.toLowerCase();
  return items.filter((item) =>
    fields.some((field) => {
      const value = item[field];
      if (!value) return false;
      return String(value).toLowerCase().includes(lowerQuery);
    })
  );
}

/**
 * Filter tasks by type
 * @param {Array} tasks - Array of tasks
 * @param {string} type - Type filter (work/personal/all)
 * @returns {Array} Filtered tasks
 */
function filterTasksByType(tasks, type) {
  if (type === "all") return tasks;
  return tasks.filter((t) => t.type === type);
}

/**
 * Sort tasks by date and time
 * @param {Array} tasks - Array of tasks
 * @param {boolean} ascending - Sort ascending (default: true)
 * @returns {Array} Sorted tasks
 */
function sortTasksByDate(tasks, ascending = true) {
  return tasks.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return ascending ? dateCompare : -dateCompare;

    if (a.time && b.time) {
      return ascending
        ? a.time.localeCompare(b.time)
        : b.time.localeCompare(a.time);
    }
    return 0;
  });
}

/**
 * Group tasks by date
 * @param {Array} tasks - Array of tasks
 * @returns {Object} Tasks grouped by date
 */
function groupTasksByDate(tasks) {
  const grouped = {};
  tasks.forEach((task) => {
    if (!grouped[task.date]) {
      grouped[task.date] = [];
    }
    grouped[task.date].push(task);
  });
  return grouped;
}

// ===== THEME AND UI UTILITIES =====

/**
 * Get color for task type badge
 * @param {string} type - Task type (work/personal)
 * @returns {string} Color code
 */
function getTypeColor(type) {
  const colors = {
    work: "#2196F3",
    personal: "#FF9800",
  };
  return colors[type] || "#666";
}

/**
 * Get emoji for task type
 * @param {string} type - Task type (work/personal)
 * @returns {string} Emoji
 */
function getTypeEmoji(type) {
  const emojis = {
    work: "⚙️",
    personal: "😊",
  };
  return emojis[type] || "📌";
}

/**
 * Get color display name
 * @param {string} colorCode - Color code
 * @returns {string} Human-readable color name
 */
function getColorName(colorCode) {
  const colors = {
    "#FFEB3B": "Yellow",
    "#2196F3": "Blue",
    "#FF1493": "Pink",
    "#FF9800": "Orange",
    "#4CAF50": "Green",
    "#9C27B0": "Purple",
    "#FF5252": "Red",
  };
  return colors[colorCode] || "Custom";
}

// ===== ANIMATION STYLES =====
// Add animation styles to document if not already present
function initializeAnimationStyles() {
  if (document.getElementById("animation-styles")) return;

  const style = document.createElement("style");
  style.id = "animation-styles";
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes fadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }

    .notification {
      animation: slideIn 0.3s ease-out;
    }
  `;
  document.head.appendChild(style);
}

// Initialize animations on script load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeAnimationStyles);
} else {
  initializeAnimationStyles();
}
