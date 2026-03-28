import { Task, Category, Notification } from '../types';
import { storage } from './storage';
import { isOverdue } from './dateUtils';

const VISITOR_ID_KEY = 'pendo_visitor_id';

function getOrCreateVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = 'visitor-' + crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

function getPreferredPriority(tasks: Task[]): string {
  if (tasks.length === 0) return 'medium';
  const counts: Record<string, number> = { high: 0, medium: 0, low: 0 };
  tasks.forEach(t => { counts[t.priority] = (counts[t.priority] || 0) + 1; });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

export function initializePendo(): void {
  const tasks: Task[] = storage.getTasks();
  const categories: Category[] = storage.getCategories();
  const notifications: Notification[] = storage.getNotifications();

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const totalTasks = tasks.length;

  const allSubtasks = tasks.flatMap(t => t.subtasks);
  const totalSubtasks = allSubtasks.length;
  const completedSubtasks = allSubtasks.filter(s => s.completed).length;

  const createdDates = tasks.map(t => t.createdAt).filter(Boolean).sort();
  const updatedDates = tasks.map(t => t.updatedAt).filter(Boolean).sort();

  pendo.initialize({
    visitor: {
      id: getOrCreateVisitorId(),
      totalTasks: totalTasks,
      completedTasks: completedTasks,
      pendingTasks: pendingTasks,
      taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 10000) / 100 : 0,
      highPriorityTaskCount: tasks.filter(t => t.priority === 'high').length,
      categoryCount: categories.length,
      customCategoryCount: categories.filter(c => !c.isDefault).length,
      usesReminders: tasks.some(t => t.reminder !== 'none'),
      usesSubtasks: tasks.some(t => t.subtasks.length > 0),
      hasOverdueTasks: tasks.some(t => t.status === 'pending' && t.dueDate !== null && isOverdue(t.dueDate, t.dueTime, t.status)),
      firstTaskCreatedAt: createdDates.length > 0 ? createdDates[0] : '',
      lastTaskUpdatedAt: updatedDates.length > 0 ? updatedDates[updatedDates.length - 1] : '',
      unreadNotificationCount: notifications.filter(n => !n.read).length,
      preferredPriority: getPreferredPriority(tasks),
      subtaskCompletionRate: totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 10000) / 100 : 0,
      storageMethod: 'localStorage',
    },
  });
}
