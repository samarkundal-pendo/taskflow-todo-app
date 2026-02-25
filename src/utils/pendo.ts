import { v4 as uuidv4 } from 'uuid';
import { Task, Category, Notification } from '../types';
import { isOverdue } from './dateUtils';

const VISITOR_ID_KEY = 'pendo_visitor_id';
const TASKS_KEY = 'todo_app_tasks';
const CATEGORIES_KEY = 'todo_app_categories';
const NOTIFICATIONS_KEY = 'todo_app_notifications';

function getOrCreateVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = `vis_${uuidv4()}`;
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

function getMostUsedPriority(tasks: Task[]): string {
  if (tasks.length === 0) return 'medium';
  const counts: Record<string, number> = { high: 0, medium: 0, low: 0 };
  tasks.forEach(task => {
    counts[task.priority] = (counts[task.priority] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

export function initializePendo(): void {
  const visitorId = getOrCreateVisitorId();

  const tasks: Task[] = (() => {
    try {
      const data = localStorage.getItem(TASKS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  })();

  const categories: Category[] = (() => {
    try {
      const data = localStorage.getItem(CATEGORIES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  })();

  const notifications: Notification[] = (() => {
    try {
      const data = localStorage.getItem(NOTIFICATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  })();

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const overdueTasks = pendingTasks.filter(t => isOverdue(t.dueDate, t.dueTime, t.status));
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
      usesReminders: tasks.some(t => t.reminder !== 'none'),
      usesSubtasks: tasks.some(t => t.subtasks && t.subtasks.length > 0),
      highPriorityTaskCount: highPriorityTasks.length,
      notificationPermission: 'Notification' in window ? Notification.permission : 'default',
      unreadNotificationCount: unreadNotifications.length,
      mostUsedPriority: getMostUsedPriority(tasks),
    },
  });
}
