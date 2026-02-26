import { v4 as uuidv4 } from 'uuid';
import { storage } from './storage';
import { isOverdue } from './dateUtils';

const VISITOR_ID_KEY = 'pendo_visitor_id';

function getOrCreateVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = `anon_${uuidv4()}`;
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

function getMostUsedCategory(
  tasks: { categoryId: string }[],
  categories: { id: string; name: string }[]
): string {
  if (tasks.length === 0) return 'None';

  const counts: Record<string, number> = {};
  for (const task of tasks) {
    counts[task.categoryId] = (counts[task.categoryId] || 0) + 1;
  }

  let maxId = '';
  let maxCount = 0;
  for (const [id, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      maxId = id;
    }
  }

  const category = categories.find(c => c.id === maxId);
  return category ? category.name : 'Unknown';
}

export function initializePendo(): void {
  const visitorId = getOrCreateVisitorId();
  const tasks = storage.getTasks();
  const categories = storage.getCategories();
  const notifications = storage.getNotifications();

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const overdueTasks = pendingTasks.filter(t =>
    isOverdue(t.dueDate, t.dueTime, t.status)
  );
  const highPriorityTasks = tasks.filter(t => t.priority === 'high');
  const unreadNotifications = notifications.filter(n => !n.read);

  pendo.initialize({
    visitor: {
      id: visitorId,
      totalTaskCount: tasks.length,
      completedTaskCount: completedTasks.length,
      pendingTaskCount: pendingTasks.length,
      overdueTaskCount: overdueTasks.length,
      categoryCount: categories.length,
      hasCustomCategories: categories.some(c => !c.isDefault),
      usesSubtasks: tasks.some(t => t.subtasks.length > 0),
      usesReminders: tasks.some(t => t.reminder !== 'none'),
      notificationPermission: 'Notification' in window ? Notification.permission : 'unsupported',
      unreadNotificationCount: unreadNotifications.length,
      highPriorityTaskCount: highPriorityTasks.length,
      mostUsedCategory: getMostUsedCategory(tasks, categories),
    },
  });
}
