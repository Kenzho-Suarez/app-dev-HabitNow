// ===== CALENDAR FUNCTIONALITY =====
// Manages calendar view with event creation, editing, viewing, and deletion

let currentDate = new Date();
let currentEventId = null;
let selectedDate = null;
let currentEventTags = [];

// ===== INITIALIZATION =====

document.addEventListener("DOMContentLoaded", () => {
  renderCalendar();
  setupCalendarEventListeners();
  updateTaskCounterBadges();
});

// Listen for updates from other pages
window.addEventListener("dataUpdated", (e) => {
  if (e.detail.key === "tasks") {
    renderCalendar();
    updateTaskCounterBadges();
  }
});

// ===== RENDER CALENDAR =====

/**
 * Render the calendar view
 */
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Update month display
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthEl = document.getElementById("current-month");
  if (monthEl) {
    monthEl.textContent = `${monthNames[month]} ${year}`;
  }

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const tasks = getTasks();
  const today = new Date();

  let html = "";
  let day = 1;

  // Create calendar rows
  for (let i = 0; i < 6; i++) {
    html += "<tr>";

    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDay) {
        html += "<td></td>";
      } else if (day > daysInMonth) {
        html += "<td></td>";
      } else {
        const currentDay = day;
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
          currentDay
        ).padStart(2, "0")}`;
        const dayTasks = tasks.filter((t) => t.date === dateStr);

        const isToday =
          today.getDate() === currentDay &&
          today.getMonth() === month &&
          today.getFullYear() === year;

        const classes = [];
        if (isToday) classes.push("today");
        if (dayTasks.length > 0) classes.push("has-events");

        html += `<td class="${classes.join(
          " "
        )}" onclick="openAddModalForDate('${dateStr}')">`;
        html += `<div class="day-number">${currentDay}</div>`;

        if (dayTasks.length > 0) {
          html += '<div class="calendar-events">';
          dayTasks.slice(0, 2).forEach((task) => {
            // FIXED: Only apply completed styles when task is actually completed
            const completedStyle = task.completed
              ? "text-decoration: line-through; opacity: 0.6;"
              : "";
            html += `<div class="calendar-event ${task.type}" onclick="event.stopPropagation(); viewEvent('${task.id}')" title="${task.title}" style="${completedStyle}">${task.title}</div>`;
          });
          if (dayTasks.length > 2) {
            html += `<div class="more-events" onclick="event.stopPropagation(); showAllEvents('${dateStr}')">+${
              dayTasks.length - 2
            } more</div>`;
          }
          html += "</div>";
        }

        html += "</td>";
        day++;
      }
    }

    html += "</tr>";
    if (day > daysInMonth) break;
  }

  const calendarBody = document.getElementById("calendar-body");
  if (calendarBody) {
    calendarBody.innerHTML = html;
  }
}

/**
 * Change month view
 * @param {number} delta - Number of months to move (-1 for previous, 1 for next)
 */
function changeMonth(delta) {
  currentDate.setMonth(currentDate.getMonth() + delta);
  renderCalendar();
}

// ===== EVENT ACTIONS =====

/**
 * Open add modal for new event (generic date)
 */
function openAddModal() {
  currentEventId = null;
  currentEventTags = [];
  const modalTitle = document.getElementById("modal-title");
  if (modalTitle) modalTitle.textContent = "Add Event";

  const eventForm = document.getElementById("event-form");
  if (eventForm) eventForm.reset();

  const eventDate = document.getElementById("event-date");
  if (eventDate) {
    eventDate.value = getTodayDate();
  }

  renderEventTags();
  populateTagSelect();

  const deleteBtn = document.getElementById("delete-btn");
  if (deleteBtn) deleteBtn.style.display = "none";

  const eventModal = document.getElementById("event-modal");
  if (eventModal) eventModal.classList.add("active");
}

/**
 * Open add modal for specific date
 * @param {string} dateStr - Date in YYYY-MM-DD format
 */
function openAddModalForDate(dateStr) {
  selectedDate = dateStr;
  currentEventId = null;
  currentEventTags = [];
  const modalTitle = document.getElementById("modal-title");
  if (modalTitle) modalTitle.textContent = "Add Event";

  const eventForm = document.getElementById("event-form");
  if (eventForm) eventForm.reset();

  const eventDate = document.getElementById("event-date");
  if (eventDate) eventDate.value = dateStr;

  renderEventTags();
  populateTagSelect();

  const deleteBtn = document.getElementById("delete-btn");
  if (deleteBtn) deleteBtn.style.display = "none";

  const eventModal = document.getElementById("event-modal");
  if (eventModal) eventModal.classList.add("active");
}

/**
 * View event details
 * @param {string} id - Task ID to view
 */
function viewEvent(id) {
  const task = getTask(id);
  if (!task) return;

  currentEventId = id;
  const html = `
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
      <input type="checkbox" ${
        task.completed ? "checked" : ""
      } onchange="toggleCalendarTaskCompletion('${id}')" style="width: 20px; height: 20px; cursor: pointer;" title="Mark as done" />
      <label style="cursor: pointer; user-select: none; font-weight: 600; font-size: 16px; text-decoration: ${
        task.completed ? "line-through" : "none"
      }; opacity: ${task.completed ? "0.6" : "1"};">
        ${task.completed ? "✓ Completed" : "Mark as Done"}
      </label>
    </div>
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
            .map((tagId) => `#${getTag(tagId)?.name || "unknown"}`)
            .join(", ")}</p>`
        : ""
    }
  `;
  const eventDetails = document.getElementById("event-details");
  if (eventDetails) eventDetails.innerHTML = html;

  // Show the bottom action buttons when viewing a single event
  const viewModal = document.getElementById("view-modal");
  if (viewModal) {
    viewModal.classList.add("active");
    // Show the form-buttons div
    const formButtons = viewModal.querySelector(".form-buttons");
    if (formButtons) {
      formButtons.style.display = "";  // Reset to default CSS (flex)
    }
  }
}

/**
 * Edit event from view modal
 */
function editEventFromView() {
  console.log('editEventFromView called', currentEventId);
  
  // Save the event ID BEFORE closing the modal (which clears currentEventId)
  const eventIdToEdit = currentEventId;
  
  const task = getTask(eventIdToEdit);
  if (!task) {
    console.log('Task not found for id:', eventIdToEdit);
    return;
  }
  
  console.log('Closing view modal and opening edit modal');
  closeViewModal();
  
  // Restore the event ID after closing
  currentEventId = eventIdToEdit;

  const modalTitle = document.getElementById("modal-title");
  if (modalTitle) modalTitle.textContent = "Edit Event";

  const eventTitle = document.getElementById("event-title");
  if (eventTitle) eventTitle.value = task.title;

  const eventDescription = document.getElementById("event-description");
  if (eventDescription) eventDescription.value = task.description || "";

  const eventDate = document.getElementById("event-date");
  if (eventDate) eventDate.value = task.date;

  const eventTime = document.getElementById("event-time");
  if (eventTime) eventTime.value = task.time || "";

  const eventType = document.getElementById("event-type");
  if (eventType) eventType.value = task.type;

  // Load tags
  currentEventTags = task.tags || [];
  renderEventTags();
  populateTagSelect();

  const deleteBtn = document.getElementById("delete-btn");
  if (deleteBtn) deleteBtn.style.display = "block";

  const eventModal = document.getElementById("event-modal");
  if (eventModal) {
    console.log('Opening edit modal');
    eventModal.classList.add("active");
  } else {
    console.log('Edit modal element not found!');
  }
}

/**
 * Save event (create or update)
 * @param {Event} e - Form submit event
 */
function saveEvent(e) {
  e.preventDefault();

  const title = document.getElementById("event-title").value.trim();
  const description = document.getElementById("event-description").value.trim();
  const date = document.getElementById("event-date").value;
  const time = document.getElementById("event-time").value;
  const type = document.getElementById("event-type").value;

  // Validate
  if (!validateRequired(title)) {
    showError("Please enter an event title");
    return;
  }

  if (!date) {
    showError("Please select a date");
    return;
  }

  if (currentEventId) {
    // Update existing event
    updateTask(currentEventId, {
      title,
      description,
      date,
      time,
      type,
      tags: currentEventTags,
    });
    showSuccess("Event updated successfully");
  } else {
    // Create new event
    const newTask = createTask(title, date, {
      description,
      time,
      type,
      tags: currentEventTags,
    });
    addTask(newTask);
    showSuccess("Event created");
  }

  closeModal();
  renderCalendar();
  updateTaskCounterBadges();
}

/**
 * Toggle calendar task completion
 * @param {string} taskId - Task ID to toggle
 */
function toggleCalendarTaskCompletion(taskId) {
  const task = getTask(taskId);
  if (!task) return;

  updateTask(taskId, { completed: !task.completed });
  showSuccess(task.completed ? "Task marked incomplete" : "Task completed!");
  renderCalendar();
  updateTaskCounterBadges();
}

/**
 * Delete event
 */
function deleteEvent() {
  if (!currentEventId) return;

  // Delete without confirmation to avoid browser cache issues
  deleteTask(currentEventId);
  showSuccess("Event deleted");
  closeModal();
  renderCalendar();
  updateTaskCounterBadges();
}

/**
 * Delete event from view modal
 */
function deleteEventFromView() {
  console.log('deleteEventFromView called', currentEventId);
  if (!currentEventId) {
    console.log('No currentEventId');
    return;
  }

  // Delete without confirmation to avoid browser cache issues
  console.log('About to delete task:', currentEventId);
  deleteTask(currentEventId);
  showSuccess("Event deleted");
  closeViewModal();
  renderCalendar();
  updateTaskCounterBadges();
}

/**
 * Close add/edit modal
 */
function closeModal() {
  const eventModal = document.getElementById("event-modal");
  if (eventModal) eventModal.classList.remove("active");
  currentEventId = null;
}

/**
 * Close view modal
 */
function closeViewModal() {
  const viewModal = document.getElementById("view-modal");
  if (viewModal) viewModal.classList.remove("active");
  currentEventId = null;
}

/**
 * Show all events for a day
 * @param {string} dateStr - Date in YYYY-MM-DD format
 */
function showAllEvents(dateStr) {
  const tasks = getTasks();
  const dayTasks = tasks.filter((t) => t.date === dateStr);

  if (dayTasks.length === 0) return;

  const html = dayTasks
    .map(
      (task) => `
    <div style="margin: 12px 0; padding: 12px; background: #f8f9fa; border-radius: 6px; display: flex; align-items: center; gap: 10px; border-left: 4px solid ${getTypeColor(
      task.type
    )};">
      <input type="checkbox" class="calendar-checkbox" ${
        task.completed ? "checked" : ""
      } onchange="event.stopPropagation(); toggleCalendarTaskCompletion('${
        task.id
      }')" style="cursor: pointer; width: 18px; height: 18px;" title="Mark as done" />
      <p style="margin: 0; cursor: pointer; flex: 1; text-decoration: ${
        task.completed ? "line-through" : "none"
      }; opacity: ${task.completed ? "0.6" : "1"};" onclick="viewEvent('${
        task.id
      }')">
        <strong>${task.title}</strong><br>
        <small>${task.time || "All day"} - <span style="color: ${getTypeColor(
        task.type
      )};">${task.type}</span></small>
      </p>
      <button onclick="event.stopPropagation(); deleteCalendarEventFromList('${
        task.id
      }')" style="background: #ff6b6b; color: white; border: none; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-size: 13px; font-weight: 500; transition: background 0.2s;" onmouseover="this.style.background='#ff5252'" onmouseout="this.style.background='#ff6b6b'" title="Delete task">Delete</button>
    </div>
  `
    )
    .join("");

  const eventDetails = document.getElementById("event-details");
  if (eventDetails) eventDetails.innerHTML = html;

  // Hide the bottom action buttons when showing multiple events
  const viewModal = document.getElementById("view-modal");
  if (viewModal) {
    viewModal.classList.add("active");
    // Hide the form-buttons div
    const formButtons = viewModal.querySelector(".form-buttons");
    if (formButtons) formButtons.style.display = "none";
  }
}

/**
 * Delete event from all-events list
 * @param {string} taskId - Task ID to delete
 */
function deleteCalendarEventFromList(taskId) {
  const task = getTask(taskId);
  if (!task) return;

  if (window.confirm(`Delete task "${task.title}"?`)) {
    deleteTask(taskId);
    showSuccess("Task deleted");
    renderCalendar();
    updateTaskCounterBadges();
    // Refresh the all-events modal
    const dateStr = task.date;
    showAllEvents(dateStr);
  }
}

// ===== EVENT LISTENERS =====

/**
 * Populate tag select dropdown with available tags
 */
function populateTagSelect() {
  const tagSelect = document.getElementById("event-tag-select");
  if (!tagSelect) return;

  const allTags = getTags();
  let options = '<option value="">+ Add a tag</option>';
  allTags.forEach((tag) => {
    options += `<option value="${tag.id}">${tag.name}</option>`;
  });
  tagSelect.innerHTML = options;

  // Add change listener
  tagSelect.onchange = (e) => {
    const tagId = e.target.value;
    if (tagId && !currentEventTags.includes(tagId)) {
      currentEventTags.push(tagId);
      renderEventTags();
      populateTagSelect();
    }
  };
}

/**
 * Render selected tags in the form
 */
function renderEventTags() {
  const tagsList = document.getElementById("event-tags-list");
  if (!tagsList) return;

  if (currentEventTags.length === 0) {
    tagsList.innerHTML = "";
    return;
  }

  let html = "";
  currentEventTags.forEach((tagId) => {
    const tag = getTag(tagId);
    if (tag) {
      html += `
        <span class="event-tag-pill">
          #${tag.name}
          <button type="button" onclick="removeEventTag('${tagId}')" style="background: none; border: none; color: inherit; cursor: pointer; margin-left: 5px; font-size: 12px;">×</button>
        </span>
      `;
    }
  });
  tagsList.innerHTML = html;
}

/**
 * Remove a tag from current event
 * @param {string} tagId - Tag ID to remove
 */
function removeEventTag(tagId) {
  currentEventTags = currentEventTags.filter((id) => id !== tagId);
  renderEventTags();
  populateTagSelect();
}

/**
 * Setup calendar event listeners
 */
function setupCalendarEventListeners() {
  const addBtn = document.querySelector(".add-btn");
  if (addBtn) {
    addBtn.onclick = openAddModal;
  }

  // Handle modal close with ESC key (only once)
  if (!window.calendarEscListenerAdded) {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal();
        closeViewModal();
      }
    });
    window.calendarEscListenerAdded = true;
  }

  // Close modal when clicking background (setup only once per modal)
  const eventModal = document.getElementById("event-modal");
  if (eventModal && !eventModal.dataset.listenerAdded) {
    eventModal.addEventListener("click", (e) => {
      if (e.target === eventModal) {
        closeModal();
      }
    });
    eventModal.dataset.listenerAdded = "true";
  }

  const viewModal = document.getElementById("view-modal");
  if (viewModal && !viewModal.dataset.listenerAdded) {
    viewModal.addEventListener("click", (e) => {
      if (e.target === viewModal) {
        closeViewModal();
      }
    });
    viewModal.dataset.listenerAdded = "true";
  }
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
if (!window.calendarCounterPolling) {
  setInterval(updateTaskCounterBadges, 2000);
  window.calendarCounterPolling = true;
}

// Expose functions to global scope for onclick handlers
window.changeMonth = changeMonth;
window.openAddModal = openAddModal;
window.openAddModalForDate = openAddModalForDate;
window.viewEvent = viewEvent;
window.editEventFromView = editEventFromView;
window.deleteEventFromView = deleteEventFromView;
window.saveEvent = saveEvent;
window.deleteEvent = deleteEvent;
window.closeModal = closeModal;
window.closeViewModal = closeViewModal;
window.toggleCalendarTaskCompletion = toggleCalendarTaskCompletion;
window.showAllEvents = showAllEvents;
window.removeEventTag = removeEventTag;
