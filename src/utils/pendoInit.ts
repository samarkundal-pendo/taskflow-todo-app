import { Task, Category } from '../types';
import { Notification as AppNotification } from '../types';
import { isOverdue } from './dateUtils';

const VISITOR_ID_KEY = 'pendo_visitor_id';

function getOrCreateVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = 'anon_visitor_' + crypto.randomUUID().replace(/-/g, '').slice(0, 12);
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

function getMostFrequent(items: string[]): string {
  if (items.length === 0) return '';
  const counts: Record<string, number> = {};
  for (const item of items) {
    counts[item] = (counts[item] || 0) + 1;
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

export function initializePendo(
  tasks: Task[],
  categories: Category[],
  notifications: AppNotification[]
): void {
  const visitorId = getOrCreateVisitorId();

  const completedTasks = tasks.filter(t => t.status === 'completed');
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const overdueTasks = tasks.filter(t => isOverdue(t.dueDate, t.dueTime, t.status));
  const highPriorityTasks = tasks.filter(t => t.priority === 'high');
  const customCategories = categories.filter(c => !c.isDefault);
  const unreadNotifications = notifications.filter(n => !n.read);

  const usesReminders = tasks.some(t => t.reminder !== 'none');
  const usesSubtasks = tasks.some(t => t.subtasks && t.subtasks.length > 0);
  const usesDueDates = tasks.some(t => t.dueDate !== null);

  const taskCompletionRate = tasks.length > 0
    ? Math.round((completedTasks.length / tasks.length) * 1000) / 10
    : 0;

  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  const taskCategoryNames = tasks
    .map(t => categoryMap.get(t.categoryId))
    .filter((name): name is string => !!name);
  const mostUsedCategory = getMostFrequent(taskCategoryNames);

  const taskPriorities = tasks.map(t => t.priority);
  const preferredPriority = getMostFrequent(taskPriorities);

  const categoriesUsed = [...new Set(taskCategoryNames)];

  const sortedByCreated = [...tasks].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const firstTaskCreatedAt = sortedByCreated.length > 0 ? sortedByCreated[0].createdAt : '';

  const sortedByUpdated = [...tasks].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
  const lastTaskUpdatedAt = sortedByUpdated.length > 0 ? sortedByUpdated[0].updatedAt : '';

  const notificationPermissionStatus = 'Notification' in window
    ? Notification.permission
    : 'default';

  pendo.initialize({
    visitor: {
      id: visitorId,
      totalTasksCreated: tasks.length,
      completedTaskCount: completedTasks.length,
      pendingTaskCount: pendingTasks.length,
      overdueTaskCount: overdueTasks.length,
      highPriorityTaskCount: highPriorityTasks.length,
      customCategoryCount: customCategories.length,
      notificationPermissionStatus: notificationPermissionStatus,
      unreadNotificationCount: unreadNotifications.length,
      usesReminders: usesReminders,
      usesSubtasks: usesSubtasks,
      usesDueDates: usesDueDates,
      taskCompletionRate: taskCompletionRate,
      mostUsedCategory: mostUsedCategory,
      preferredPriority: preferredPriority,
      categoriesUsed: categoriesUsed,
      firstTaskCreatedAt: firstTaskCreatedAt,
      lastTaskUpdatedAt: lastTaskUpdatedAt,
    },
  });
}
