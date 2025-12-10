// ===== TASK COUNTER - REAL-TIME NAVIGATION BADGES =====
// Updates nav-count badges dynamically based on localStorage data
// Polls every 2 seconds to keep counts in sync across all pages

/**
 * Update task counter badges from API (via shared-utils getTasks)
 */
function updateTaskCounts() {
  try {
    const tasks = getTasks() || [];

    // Get today's date in consistent format
    const today = new Date().toISOString().split("T")[0];

    // Count uncompleted today's tasks
    const todayTasks = tasks.filter((t) => {
      if (!t.date) return false; // Skip tasks without dates
      try {
        const taskDate = new Date(t.date).toISOString().split("T")[0];
        return taskDate === today && !t.completed;
      } catch (e) {
        return false;
      }
    });

    // Count uncompleted future tasks (upcoming)
    const upcomingTasks = tasks.filter((t) => {
      if (!t.date) return false; // Skip tasks without dates
      try {
        const taskDate = new Date(t.date).toISOString().split("T")[0];
        return taskDate > today && !t.completed;
      } catch (e) {
        return false;
      }
    });

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
  } catch (error) {
    console.error("Error updating task counts:", error);
  }
}

// Update counts when page loads
document.addEventListener("DOMContentLoaded", updateTaskCounts);

// Temporarily disable polling to prevent errors
// setInterval(updateTaskCounts, 2000);

// Also update when dataUpdated events fire (from other pages)
window.addEventListener("dataUpdated", (e) => {
  if (e.detail?.key === "tasks") {
    updateTaskCounts();
  }
});
