import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { seedData } from './utils/seedData'
import { storage } from './utils/storage'
import { isOverdue } from './utils/dateUtils'
import { Task, Category } from './types'

// Expose seed function for development
declare global {
  interface Window {
    seedData: () => void;
  }
}
window.seedData = seedData;

// --- Pendo Initialization ---
const VISITOR_ID_KEY = 'pendo_visitor_id';

function getOrCreateVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = 'visitor_' + crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

function initializePendo(): void {
  const visitorId = getOrCreateVisitorId();
  const tasks: Task[] = storage.getTasks();
  const categories: Category[] = storage.getCategories();
  const notifications = storage.getNotifications();

  const completedTasks = tasks.filter(t => t.status === 'completed');
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const overdueTasks = pendingTasks.filter(t => isOverdue(t.dueDate, t.dueTime, t.status));
  const customCategories = categories.filter(c => !c.isDefault);
  const unreadNotifications = notifications.filter(n => !n.read);

  // Compute most used category
  const categoryTaskCounts: Record<string, number> = {};
  tasks.forEach(t => {
    categoryTaskCounts[t.categoryId] = (categoryTaskCounts[t.categoryId] || 0) + 1;
  });
  let mostUsedCategoryName = '';
  let maxCount = 0;
  for (const [catId, count] of Object.entries(categoryTaskCounts)) {
    if (count > maxCount) {
      maxCount = count;
      const cat = categories.find(c => c.id === catId);
      mostUsedCategoryName = cat ? cat.name : catId;
    }
  }

  // Compute active categories used
  const activeCategoryIds = new Set(tasks.map(t => t.categoryId));
  const activeCategoriesUsed = categories
    .filter(c => activeCategoryIds.has(c.id))
    .map(c => c.name);

  const totalTaskCount = tasks.length;
  const completedTaskCount = completedTasks.length;
  const taskCompletionRate = totalTaskCount > 0
    ? Math.round((completedTaskCount / totalTaskCount) * 100)
    : 0;

  const notificationPermission = 'Notification' in window
    ? Notification.permission
    : 'default';

  pendo.initialize({
    visitor: {
      id: visitorId,
      totalTaskCount: totalTaskCount,
      completedTaskCount: completedTaskCount,
      pendingTaskCount: pendingTasks.length,
      overdueTaskCount: overdueTasks.length,
      categoryCount: categories.length,
      customCategoryCount: customCategories.length,
      notificationPermission: notificationPermission,
      unreadNotificationCount: unreadNotifications.length,
      hasHighPriorityTasks: pendingTasks.some(t => t.priority === 'high'),
      mostUsedCategory: mostUsedCategoryName,
      taskCompletionRate: taskCompletionRate,
      usesSubtasks: tasks.some(t => t.subtasks.length > 0),
      usesReminders: tasks.some(t => t.reminder !== 'none'),
      activeCategoriesUsed: activeCategoriesUsed,
    },
  });
}

initializePendo();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
