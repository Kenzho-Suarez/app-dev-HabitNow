// Task counter - updates nav-count badges dynamically
// Only shows counts when there are actual tasks

function updateTaskCounts() {
  // Count upcoming items (from upcoming.html content)
  const upcomingList = document.querySelector(".upcoming-list");
  let upcomingCount = 0;

  if (upcomingList) {
    // Count non-empty upcoming items
    const upcomingItems = upcomingList.querySelectorAll(".upcoming-item");
    upcomingCount = upcomingItems.length;
  }

  // Count today items (from today.html content)
  const todaySections = document.querySelectorAll(".today-items");
  let todayCount = 0;

  if (todaySections.length > 0) {
    todaySections.forEach((section) => {
      const todayItems = section.querySelectorAll(".today-item");
      todayCount += todayItems.length;
    });
  }

  // Update upcoming count badge
  const upcomingCountEl = document.getElementById("upcoming-count");
  if (upcomingCountEl) {
    if (upcomingCount > 0) {
      upcomingCountEl.textContent = upcomingCount;
      upcomingCountEl.style.display = "inline-block";
    } else {
      upcomingCountEl.style.display = "none";
    }
  }

  // Update today count badge
  const todayCountEl = document.getElementById("today-count");
  if (todayCountEl) {
    if (todayCount > 0) {
      todayCountEl.textContent = todayCount;
      todayCountEl.style.display = "inline-block";
    } else {
      todayCountEl.style.display = "none";
    }
  }
}

// Update counts when page loads
document.addEventListener("DOMContentLoaded", updateTaskCounts);

// Update counts periodically (every 2 seconds) in case content changes dynamically
setInterval(updateTaskCounts, 2000);
