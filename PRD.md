# Todo App - Product Requirements Document (PRD)

## 1. Overview

A modern, full-featured todo application that helps users manage their tasks efficiently. The app provides intuitive task management with features like categorization, due dates, reminders, and progress tracking.

---

## 2. Tech Stack

| Layer        | Technology                     |
|--------------|--------------------------------|
| Frontend     | React 18 + TypeScript          |
| Styling      | Tailwind CSS                   |
| Routing      | React Router v6                |
| State        | React Context + useReducer     |
| Storage      | LocalStorage (persistent)      |
| Build Tool   | Vite                           |
| Icons        | Lucide React                   |

---

## 3. Pages / Routes

### 3.1 Dashboard (`/`)
**Purpose:** Landing page showing an overview of all tasks and quick stats.

**Features:**
- Summary cards showing:
  - Total tasks count
  - Completed tasks count
  - Pending tasks count
  - Overdue tasks count
- Quick add task input
- Recent tasks list (last 5 tasks)
- Navigation to other pages

---

### 3.2 All Tasks (`/tasks`)
**Purpose:** Complete list of all tasks with filtering and sorting capabilities.

**Features:**
- Display all tasks in a list/card view
- Filter tasks by:
  - Status (All, Pending, Completed, Overdue)
  - Priority (All, High, Medium, Low)
  - Category
- Sort tasks by:
  - Due date
  - Priority
  - Created date
  - Alphabetical
- Bulk actions (mark complete, delete)
- Pagination or infinite scroll (if tasks > 20)

---

### 3.3 Add/Edit Task (`/tasks/new` and `/tasks/:id/edit`)
**Purpose:** Form page to create a new task or edit an existing one.

**Fields:**
- Title (required, max 100 characters)
- Description (optional, max 500 characters)
- Due date (optional, date picker)
- Due time (optional, time picker)
- Priority (required: High, Medium, Low)
- Category (optional: Work, Personal, Shopping, Health, Other)
- Reminder (optional: None, 15 min before, 1 hour before, 1 day before)
- Subtasks (optional, add multiple subtasks)

**Validations:**
- Title cannot be empty
- Due date cannot be in the past (for new tasks)
- Show confirmation before discarding unsaved changes

---

### 3.4 Task Detail (`/tasks/:id`)
**Purpose:** Detailed view of a single task with all information and actions.

**Features:**
- Display all task information
- Show subtasks with individual completion status
- Edit button (navigates to edit page)
- Delete button (with confirmation modal)
- Mark complete/incomplete toggle
- Show created date and last modified date
- Navigation back to task list

---

### 3.5 Categories (`/categories`)
**Purpose:** Manage task categories and view tasks grouped by category.

**Features:**
- List all categories with task counts
- Create new custom categories
- Edit category name and color
- Delete category (with option to reassign tasks)
- Click category to filter tasks by that category
- Default categories: Work, Personal, Shopping, Health, Other

---

## 4. Core Workflows

### 4.1 Creating a Task
**Trigger:** User clicks "Add Task" button or uses quick add input.

**Flow:**
1. User navigates to `/tasks/new` or uses quick add on dashboard
2. User fills in task details (minimum: title)
3. User clicks "Save" button
4. System validates input
5. If valid: Task is created, user is redirected to task list with success message
6. If invalid: Show inline error messages

**Acceptance Criteria:**
- Task appears immediately in the task list
- Task is persisted in localStorage
- Success toast notification shown

---

### 4.2 Completing a Task
**Trigger:** User clicks checkbox or "Mark Complete" button.

**Flow:**
1. User clicks completion checkbox on any task (list view, detail view, or dashboard)
2. System updates task status to "completed"
3. Task shows visual completion indicator (strikethrough, checkmark)
4. Completion timestamp is recorded
5. Dashboard stats update immediately

**Acceptance Criteria:**
- Task can be marked complete from any view
- Completed tasks are visually distinct
- Action is reversible (can mark as incomplete)
- Stats update in real-time

---

### 4.3 Deleting a Task
**Trigger:** User clicks delete button on a task.

**Flow:**
1. User clicks delete icon/button on a task
2. Confirmation modal appears: "Are you sure you want to delete this task?"
3. User confirms deletion
4. Task is removed from storage
5. Success message shown
6. If on detail page, redirect to task list

**Acceptance Criteria:**
- Confirmation required before deletion
- Task is permanently removed
- Cannot be undone (clear warning in modal)
- Associated subtasks are also deleted

---

### 4.4 Task Reminders
**Trigger:** System checks for upcoming due dates.

**Flow:**
1. When app loads and periodically (every minute), system checks for tasks with reminders
2. If a task's reminder time matches current time (within 1-minute window):
   - Browser notification is triggered (if permission granted)
   - In-app notification banner appears
3. User can click notification to view task detail
4. User can dismiss or snooze reminder

**Acceptance Criteria:**
- Request notification permission on first app load
- Show in-app notification even if browser notifications denied
- Reminders only trigger once per task
- Overdue tasks show visual warning indicator

---

### 4.5 Filtering and Searching Tasks
**Trigger:** User interacts with filter/search controls.

**Flow:**
1. User types in search box or selects filter options
2. Task list updates in real-time (debounced for search)
3. Active filters are visually indicated
4. "Clear filters" option available
5. URL updates to reflect filters (shareable/bookmarkable)

**Acceptance Criteria:**
- Search matches title and description
- Multiple filters can be combined
- Filter state persists on page refresh
- Shows "No tasks found" when filters return empty

---

## 5. Data Model

### Task Object
```typescript
interface Task {
  id: string;                    // UUID
  title: string;                 // Required
  description: string;           // Optional
  status: 'pending' | 'completed';
  priority: 'high' | 'medium' | 'low';
  category: string;              // Category ID
  dueDate: string | null;        // ISO date string
  dueTime: string | null;        // HH:MM format
  reminder: 'none' | '15min' | '1hour' | '1day';
  subtasks: Subtask[];
  createdAt: string;             // ISO timestamp
  updatedAt: string;             // ISO timestamp
  completedAt: string | null;    // ISO timestamp
}

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

interface Category {
  id: string;
  name: string;
  color: string;                 // Hex color code
  isDefault: boolean;            // Cannot delete default categories
}
```

---

## 6. UI/UX Requirements

### Design Principles
- Clean, minimal interface with focus on usability
- Responsive design (mobile-first)
- Consistent spacing and typography
- Accessible (WCAG 2.1 AA compliance)

### Color Scheme
- Primary: Blue (#3B82F6)
- Success/Complete: Green (#10B981)
- Warning/Overdue: Red (#EF4444)
- High Priority: Red (#EF4444)
- Medium Priority: Yellow (#F59E0B)
- Low Priority: Gray (#6B7280)

### Interactive States
- Hover effects on clickable elements
- Loading states for async operations
- Disabled states for invalid actions
- Focus indicators for keyboard navigation

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## 7. Non-Functional Requirements

### Performance
- Initial page load < 2 seconds
- Task operations (add/edit/delete) < 100ms
- Smooth animations (60fps)

### Browser Support
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)

### Storage
- All data persisted in localStorage
- Maximum 5MB storage (localStorage limit)
- Graceful handling when storage is full

---

## 8. Future Enhancements (Out of Scope for v1)

- User authentication and cloud sync
- Recurring tasks
- Task sharing/collaboration
- Dark mode theme
- Export tasks to CSV/PDF
- Drag-and-drop task reordering
- Keyboard shortcuts
- Mobile app (React Native)

---

## 9. File Structure

```
/src
  /components
    /common          # Reusable UI components
      Button.tsx
      Input.tsx
      Modal.tsx
      Toast.tsx
      Card.tsx
    /tasks           # Task-specific components
      TaskCard.tsx
      TaskForm.tsx
      TaskList.tsx
      TaskFilters.tsx
      SubtaskItem.tsx
    /layout          # Layout components
      Header.tsx
      Sidebar.tsx
      Layout.tsx
  /pages
    Dashboard.tsx
    TasksPage.tsx
    TaskDetailPage.tsx
    TaskFormPage.tsx
    CategoriesPage.tsx
  /context
    TaskContext.tsx
    NotificationContext.tsx
  /hooks
    useTasks.ts
    useLocalStorage.ts
    useNotifications.ts
  /utils
    storage.ts
    dateUtils.ts
    validators.ts
  /types
    index.ts
  App.tsx
  main.tsx
  index.css
```

---

## 10. Success Metrics

- User can create, view, edit, and delete tasks
- All 5 pages are functional and navigable
- Data persists across browser sessions
- Reminders trigger at correct times
- App is responsive on all device sizes
- No console errors in production build

---

**Document Version:** 1.0
**Created:** February 2026
**Status:** Ready for Review
