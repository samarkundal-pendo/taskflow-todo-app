import { v4 as uuidv4 } from 'uuid';
import { Task, Category } from '../types';
import type { Notification as AppNotification } from '../types';
import { storage } from './storage';

const VISITOR_ID_KEY = 'pendo_visitor_id';

export const getOrCreateVisitorId = (): string => {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = `visitor_${uuidv4()}`;
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
};

const getMostUsedCategory = (tasks: Task[], categories: Category[]): string => {
  if (tasks.length === 0) return '';
  const counts: Record<string, number> = {};
  tasks.forEach(task => {
    counts[task.categoryId] = (counts[task.categoryId] || 0) + 1;
  });
  const topCategoryId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const category = categories.find(c => c.id === topCategoryId);
  return category?.name || '';
};

const getPreferredReminderSetting = (tasks: Task[]): string => {
  if (tasks.length === 0) return 'none';
  const counts: Record<string, number> = {};
  tasks.forEach(task => {
    counts[task.reminder] = (counts[task.reminder] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';
};

const getCategoriesUsed = (tasks: Task[], categories: Category[]): string[] => {
  const usedCategoryIds = new Set(tasks.map(t => t.categoryId));
  return categories
    .filter(c => usedCategoryIds.has(c.id))
    .map(c => c.name);
};

export const getPendoVisitorMetadata = () => {
  const tasks: Task[] = storage.getTasks();
  const categories: Category[] = storage.getCategories();
  const notifications: AppNotification[] = storage.getNotifications();

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const totalTasks = tasks.length;

  const now = new Date();
  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate || t.status === 'completed') return false;
    const due = new Date(t.dueDate);
    if (t.dueTime) {
      const [hours, minutes] = t.dueTime.split(':');
      due.setHours(parseInt(hours), parseInt(minutes));
    } else {
      due.setHours(23, 59, 59);
    }
    return now > due;
  }).length;

  const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
  const usesReminders = tasks.some(t => t.reminder !== 'none');
  const usesSubtasks = tasks.some(t => t.subtasks.length > 0);
  const customCategoriesCount = categories.filter(c => !c.isDefault).length;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  const sortedByCreated = [...tasks].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const firstTaskCreatedAt = sortedByCreated[0]?.createdAt || '';
  const lastTaskCreatedAt = sortedByCreated[sortedByCreated.length - 1]?.createdAt || '';

  const taskCompletionRate = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 1000) / 10
    : 0;

  const notificationPermission = ('Notification' in window)
    ? Notification.permission
    : 'default';

  return {
    id: getOrCreateVisitorId(),
    totalTasks,
    completedTasks,
    pendingTasks,
    totalCategories: categories.length,
    customCategoriesCount,
    notificationPermission,
    unreadNotifications,
    highPriorityTasks,
    usesReminders,
    usesSubtasks,
    mostUsedCategory: getMostUsedCategory(tasks, categories),
    overdueTasks,
    preferredReminderSetting: getPreferredReminderSetting(tasks),
    firstTaskCreatedAt: firstTaskCreatedAt || undefined,
    lastTaskCreatedAt: lastTaskCreatedAt || undefined,
    taskCompletionRate,
    categoriesUsed: getCategoriesUsed(tasks, categories),
  };
};

export const initializePendo = () => {
  const visitorData = getPendoVisitorMetadata();

  pendo.initialize({
    visitor: visitorData,
  });
};
