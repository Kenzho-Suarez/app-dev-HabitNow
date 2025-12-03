// Calendar functionality for calendar.html

let currentDate = new Date();
let currentEventId = null;
let selectedDate = null;

// Initialize data
function getTasks() {
  const data = localStorage.getItem("tasks");
  return data ? JSON.parse(data) : [];
}

function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Render calendar
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
            html += `<div class="calendar-event ${task.type}" onclick="event.stopPropagation(); viewEvent('${task.id}')">${task.title}</div>`;
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

// Change month
function changeMonth(delta) {
  currentDate.setMonth(currentDate.getMonth() + delta);
  renderCalendar();
}

// Open add modal
function openAddModal() {
  currentEventId = null;
  const modalTitle = document.getElementById("modal-title");
  if (modalTitle) modalTitle.textContent = "Add Event";

  const eventForm = document.getElementById("event-form");
  if (eventForm) eventForm.reset();

  const eventDate = document.getElementById("event-date");
  if (eventDate) {
    eventDate.value = new Date().toISOString().split("T")[0];
  }

  const deleteBtn = document.getElementById("delete-btn");
  if (deleteBtn) deleteBtn.style.display = "none";

  const eventModal = document.getElementById("event-modal");
  if (eventModal) eventModal.classList.add("active");
}

// Open add modal for specific date
function openAddModalForDate(dateStr) {
  selectedDate = dateStr;
  currentEventId = null;
  const modalTitle = document.getElementById("modal-title");
  if (modalTitle) modalTitle.textContent = "Add Event";

  const eventForm = document.getElementById("event-form");
  if (eventForm) eventForm.reset();

  const eventDate = document.getElementById("event-date");
  if (eventDate) eventDate.value = dateStr;

  const deleteBtn = document.getElementById("delete-btn");
  if (deleteBtn) deleteBtn.style.display = "none";

  const eventModal = document.getElementById("event-modal");
  if (eventModal) eventModal.classList.add("active");
}

// View event details
function viewEvent(id) {
  const tasks = getTasks();
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  currentEventId = id;
  const html = `
    <p><strong>Title:</strong> ${task.title}</p>
    <p><strong>Date:</strong> ${new Date(task.date).toLocaleDateString()}</p>
    ${task.time ? `<p><strong>Time:</strong> ${task.time}</p>` : ""}
    ${
      task.description
        ? `<p><strong>Description:</strong> ${task.description}</p>`
        : ""
    }
    <p><strong>Type:</strong> <span style="text-transform: capitalize;">${
      task.type
    }</span></p>
  `;
  const eventDetails = document.getElementById("event-details");
  if (eventDetails) eventDetails.innerHTML = html;

  const viewModal = document.getElementById("view-modal");
  if (viewModal) viewModal.classList.add("active");
}

// Edit event from view
function editEventFromView() {
  closeViewModal();
  const tasks = getTasks();
  const task = tasks.find((t) => t.id === currentEventId);
  if (!task) return;

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

  const deleteBtn = document.getElementById("delete-btn");
  if (deleteBtn) deleteBtn.style.display = "block";

  const eventModal = document.getElementById("event-modal");
  if (eventModal) eventModal.classList.add("active");
}

// Save event
function saveEvent(e) {
  e.preventDefault();

  const task = {
    id: currentEventId || "task_" + Date.now(),
    title: document.getElementById("event-title").value,
    description: document.getElementById("event-description").value,
    date: document.getElementById("event-date").value,
    time: document.getElementById("event-time").value,
    type: document.getElementById("event-type").value,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  const tasks = getTasks();

  if (currentEventId) {
    const index = tasks.findIndex((t) => t.id === currentEventId);
    if (index !== -1) {
      tasks[index] = task;
    }
  } else {
    tasks.push(task);
  }

  saveTasks(tasks);
  closeModal();
  renderCalendar();
}

// Delete event
function deleteEvent() {
  if (!confirm("Are you sure you want to delete this event?")) return;

  const tasks = getTasks();
  const filtered = tasks.filter((t) => t.id !== currentEventId);
  saveTasks(filtered);
  closeModal();
  renderCalendar();
}

// Delete event from view modal
function deleteEventFromView() {
  if (!confirm("Are you sure you want to delete this event?")) return;

  const tasks = getTasks();
  const filtered = tasks.filter((t) => t.id !== currentEventId);
  saveTasks(filtered);
  closeViewModal();
  renderCalendar();
}

// Close modals
function closeModal() {
  const eventModal = document.getElementById("event-modal");
  if (eventModal) eventModal.classList.remove("active");
  currentEventId = null;
}

function closeViewModal() {
  const viewModal = document.getElementById("view-modal");
  if (viewModal) viewModal.classList.remove("active");
  currentEventId = null;
}

// Show all events for a day
function showAllEvents(dateStr) {
  const tasks = getTasks();
  const dayTasks = tasks.filter((t) => t.date === dateStr);

  if (dayTasks.length === 0) return;

  const html = dayTasks
    .map(
      (task) => `
    <p style="margin: 8px 0; cursor: pointer; padding: 8px; background: #f8f9fa; border-radius: 4px;" 
       onclick="viewEvent('${task.id}')">
      <strong>${task.title}</strong><br>
      <small>${task.time || "All day"} - ${task.type}</small>
    </p>
  `
    )
    .join("");

  const eventDetails = document.getElementById("event-details");
  if (eventDetails) eventDetails.innerHTML = html;

  const viewModal = document.getElementById("view-modal");
  if (viewModal) viewModal.classList.add("active");
}

// Initialize
document.addEventListener("DOMContentLoaded", renderCalendar);
