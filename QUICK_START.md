# HabitNow - Quick Start Guide

## Installation

No installation required! HabitNow is a pure JavaScript web application that runs entirely in your browser.

## Getting Started

### 1. Open the Application

Simply open `index.html` in your web browser to start using HabitNow.

### 2. Navigation

Use the sidebar menu to navigate between different sections:

- **🏠 Home** - Dashboard with overview stats
- **📋 Upcoming** - View future tasks
- **📅 Today** - Today's tasks and progress
- **📅 Calendar** - Monthly calendar view
- **📝 Sticky Wall** - Digital sticky notes
- **📚 Lists** - Task organization
- **🏷️ Tags** - Tag management

### 3. Creating Your First Task

1. Go to "Today" page
2. Click "Add Task" button
3. Enter task details:
   - **Title** (required) - What you need to do
   - **Description** (optional) - Additional details
   - **Time** (optional) - What time
   - **Type** - Work or Personal
   - **Tags** - Comma-separated tag names
4. Click "Save"

### 4. Creating a Note

1. Go to "Sticky Wall" page
2. Click "Add Note" button
3. Enter note details:
   - **Title** (required)
   - **Content** (required)
   - **Color** - Choose from 4 colors
   - **Tags** (optional)
4. Click "Create Note"

### 5. Creating a List

1. Go to "Lists" page
2. Click "Create List" button
3. Enter:
   - **List Name** (required)
   - **Color** - Choose from 4 colors
4. Click "Create List"

### 6. Creating a Tag

1. Go to "Tags" page
2. Click "Create Tag" button
3. Enter tag name
4. Click "Create Tag"

## Key Features

### ✅ Task Management

- **Add Tasks** - Create tasks for today or schedule for future
- **Complete Tasks** - Check off tasks as you complete them
- **Edit Tasks** - Click pencil icon to modify
- **Delete Tasks** - Click trash icon to remove
- **Progress Tracking** - See completion percentage
- **Type Organization** - Separate Work and Personal

### ✅ Note Taking

- **Sticky Notes** - Digital notes with colors
- **Search Notes** - Find notes by title or content
- **Tag Notes** - Organize with custom tags
- **Color Coding** - Yellow, Blue, Pink, Orange
- **Edit Notes** - Click note to modify
- **Delete Notes** - Click × to remove

### ✅ Task Organization

- **Lists** - Group related tasks
- **Tags** - Cross-cutting categorization
- **Filtering** - View specific types
- **Sorting** - Automatic date sorting
- **Search** - Find tasks by name

### ✅ Calendar View

- **Monthly Calendar** - See all tasks at a glance
- **Today Highlight** - Current date is highlighted
- **Event Count** - See how many tasks on each day
- **Add Events** - Click any date to add task
- **View Events** - Click event to see details

### ✅ Dashboard

- **Stats Overview** - Total tasks, completed, notes, lists
- **Today's Focus** - Preview of today's tasks
- **Week Preview** - See next 5 days
- **Recent Notes** - Latest notes created
- **Quick Actions** - Fast access to create items

### ✅ Navigation Badges

- **Today Badge** - Count of today's tasks
- **Upcoming Badge** - Count of future tasks
- **Real-time Updates** - Syncs across all pages
- **Auto-hide** - Only shows when count > 0

## Tips & Tricks

### Organizing Tasks

1. Use **Types** (Work/Personal) for primary categorization
2. Use **Tags** for secondary organization
3. Use **Lists** for project-based grouping
4. Use **Colors** (for notes/lists) for visual identification

### Maximizing Productivity

- Review "Today's Focus" on Dashboard each morning
- Check "Week Preview" to plan ahead
- Use tags consistently across tasks and notes
- Create lists for projects to group related tasks
- Use "Upcoming" to see all pending tasks

### Search Tips

- Search in Sticky Wall to find notes quickly
- Search in Lists to find your lists
- Search in Tags to find tags
- Searches work in real-time as you type

### Filtering

- Use "Upcoming" filter buttons to show specific task types
- Toggle between All, Work, and Personal views
- Combine with search for precise filtering

## Data Persistence

### How It Works

All your data is stored locally in your browser's localStorage:

- ✅ Tasks survive browser refresh
- ✅ Notes survive browser refresh
- ✅ Lists survive browser refresh
- ✅ Tags survive browser refresh
- ⚠️ Data is lost if browser cache is cleared
- ⚠️ Data is not synced between devices

### Backing Up Data

- Export your browser's localStorage regularly
- Use browser developer tools (F12 > Application > localStorage)
- Copy the JSON data and save it safely

## Keyboard Shortcuts

### Universal

- **ESC** - Close any open modal
- **Click background** - Close any open modal

### Form Submission

- **Enter** in last field - Submit form
- **Tab** - Navigate between fields

## Troubleshooting

### Tasks Not Saving?

1. Check browser allows localStorage
2. Try refreshing page
3. Check browser console for errors (F12)
4. Check available storage space

### Badges Not Updating?

1. Refresh the page
2. Wait for 2-second polling interval
3. Check if other browser tabs are open

### Search Not Working?

1. Ensure you've typed in search box
2. Wait for 300ms debounce delay
3. Check for exact spelling

### Form Won't Submit?

1. Check for red error messages
2. Ensure all required fields (\*) are filled
3. Check date is valid (today or future for tasks)
4. Try clearing browser cache

## Browser Requirements

### Supported Browsers

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Any modern browser with localStorage support

### Required Features

- localStorage API
- ES6+ JavaScript support
- CSS Grid and Flexbox
- Modern DOM APIs

## Accessibility

### Keyboard Navigation

- Tab through all interactive elements
- ESC to close modals
- Enter to submit forms
- Click to activate buttons

### Screen Readers

- Semantic HTML elements
- ARIA labels on inputs
- Descriptive button text

### Visual

- Color-coded sections
- Clear typography
- Sufficient contrast
- Responsive layout

## Advanced Usage

### Managing Tags

1. Go to Tags page
2. View item count per tag
3. Click "View All" to see tagged items
4. Delete tags (items are not deleted)
5. Auto-create tags by typing in task/note forms

### Creating Projects

1. Create a List for the project
2. Assign tasks to the project list
3. Use tags for subtopics within project
4. Track progress with completion

### Weekly Review

1. Check Dashboard for overview
2. Review completed tasks
3. Plan next week in Upcoming
4. Update task statuses
5. Clear completed tasks if desired

## Common Workflows

### Daily Routine

1. Open Dashboard
2. Check Today's Focus
3. Review Today page
4. Add any new tasks
5. Check off completed tasks
6. Review Upcoming for planning

### Weekly Planning

1. Go to Calendar
2. Review next week
3. Add planned tasks
4. Assign to Lists if project-based
5. Add tags for organization
6. Check Dashboard stats

### Note Taking

1. Go to Sticky Wall
2. Click Add Note
3. Choose color by category
4. Add tags for organization
5. Search notes when needed

### Project Management

1. Create List for project
2. Add tasks to list
3. Assign to team (via tags)
4. Track progress
5. Mark complete when done

## Best Practices

### ✅ DO

- ✅ Use consistent tag names
- ✅ Choose colors for quick identification
- ✅ Separate work and personal tasks
- ✅ Update task status regularly
- ✅ Review progress daily

### ❌ DON'T

- ❌ Use special characters in tag names
- ❌ Leave tasks without dates
- ❌ Forget to mark tasks complete
- ❌ Create duplicate tags
- ❌ Rely on memory (write it down)

## Performance Tips

### Keeping App Fast

- Keep task count reasonable (100+)
- Archive old completed tasks regularly
- Delete unused lists and tags
- Use search instead of scrolling

### Browser Optimization

- Close unused browser tabs
- Clear browser cache periodically
- Keep browser updated
- Disable unnecessary extensions

## Privacy & Security

### Your Data

- ✅ All data stored locally in browser
- ✅ No data sent to servers
- ✅ No tracking or analytics
- ✅ No ads or third-party content
- ✅ Complete privacy

### Security Considerations

- ⚠️ Anyone with access to computer can see data
- ⚠️ Data deleted if browser cache is cleared
- ⚠️ No cloud backup by default
- ⚠️ No encryption (browser storage is unencrypted)

## Getting Help

### Debugging

1. Open browser console (F12)
2. Check for error messages
3. Verify data in localStorage
4. Check browser storage space
5. Try different browser

### Common Issues

- **"No tasks yet"** - Add a task via Add button
- **"Badge not showing"** - Wait for 2-second update
- **"Can't edit"** - Click pencil icon to edit
- **"Can't find tag"** - Check exact spelling
- **"Form won't save"** - Check all required fields

## Feature Requests

Potential future enhancements:

- Cloud synchronization
- Mobile app
- Recurring tasks
- Priorities and urgency
- Time tracking
- Statistics
- Dark mode
- Collaboration
- API integration

## Support

For questions or issues:

1. Check this guide first
2. Review README.md
3. Check browser console for errors
4. Test in different browser
5. Clear cache and try again

---

**Version:** 1.0  
**Last Updated:** December 2025  
**Status:** Production Ready ✅

Enjoy using HabitNow!
