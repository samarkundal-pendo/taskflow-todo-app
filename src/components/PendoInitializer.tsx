import { useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { useNotifications } from '../context/NotificationContext';
import { isOverdue } from '../utils/dateUtils';

const VISITOR_ID_KEY = 'pendo_visitor_id';

function getOrCreateVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = `visitor-${crypto.randomUUID()}`;
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

export const PendoInitializer: React.FC = () => {
  const { tasks, categories } = useTasks();
  const { notifications, permissionStatus } = useNotifications();

  useEffect(() => {
    const visitorId = getOrCreateVisitorId();

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const overdueTasks = tasks.filter(t => isOverdue(t.dueDate, t.dueTime, t.status)).length;
    const totalTasks = tasks.length;
    const totalCategories = categories.length;
    const customCategoriesCount = categories.filter(c => !c.isDefault).length;
    const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
    const tasksWithSubtasks = tasks.filter(t => t.subtasks.length > 0).length;
    const tasksWithReminders = tasks.filter(t => t.reminder !== 'none').length;
    const unreadNotifications = notifications.filter(n => !n.read).length;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Compute most used category
    let mostUsedCategory = '';
    if (tasks.length > 0) {
      const categoryCounts: Record<string, number> = {};
      tasks.forEach(t => {
        categoryCounts[t.categoryId] = (categoryCounts[t.categoryId] || 0) + 1;
      });
      const topCategoryId = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
      const topCategory = categories.find(c => c.id === topCategoryId);
      mostUsedCategory = topCategory?.name ?? '';
    }

    const usesSubtasks = tasks.some(t => t.subtasks.length > 0);
    const usesReminders = tasks.some(t => t.reminder !== 'none');
    const usesDueDates = tasks.some(t => t.dueDate !== null);
    const categoryNames = categories.map(c => c.name);

    pendo.initialize({
      visitor: {
        id: visitorId,
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        totalCategories,
        customCategoriesCount,
        highPriorityTasks,
        tasksWithSubtasks,
        tasksWithReminders,
        notificationPermission: permissionStatus,
        unreadNotifications,
        taskCompletionRate,
        mostUsedCategory,
        usesSubtasks,
        usesReminders,
        usesDueDates,
        categoryNames,
      },
    });
  }, []); // Initialize once on mount

  // Update visitor metadata whenever tasks, categories, or notifications change
  useEffect(() => {
    if (typeof pendo === 'undefined' || typeof pendo.updateOptions !== 'function') {
      return;
    }

    const visitorId = getOrCreateVisitorId();

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const overdueTasks = tasks.filter(t => isOverdue(t.dueDate, t.dueTime, t.status)).length;
    const totalTasks = tasks.length;
    const totalCategories = categories.length;
    const customCategoriesCount = categories.filter(c => !c.isDefault).length;
    const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
    const tasksWithSubtasks = tasks.filter(t => t.subtasks.length > 0).length;
    const tasksWithReminders = tasks.filter(t => t.reminder !== 'none').length;
    const unreadNotifications = notifications.filter(n => !n.read).length;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    let mostUsedCategory = '';
    if (tasks.length > 0) {
      const categoryCounts: Record<string, number> = {};
      tasks.forEach(t => {
        categoryCounts[t.categoryId] = (categoryCounts[t.categoryId] || 0) + 1;
      });
      const topCategoryId = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
      const topCategory = categories.find(c => c.id === topCategoryId);
      mostUsedCategory = topCategory?.name ?? '';
    }

    const usesSubtasks = tasks.some(t => t.subtasks.length > 0);
    const usesReminders = tasks.some(t => t.reminder !== 'none');
    const usesDueDates = tasks.some(t => t.dueDate !== null);
    const categoryNames = categories.map(c => c.name);

    pendo.updateOptions({
      visitor: {
        id: visitorId,
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        totalCategories,
        customCategoriesCount,
        highPriorityTasks,
        tasksWithSubtasks,
        tasksWithReminders,
        notificationPermission: permissionStatus,
        unreadNotifications,
        taskCompletionRate,
        mostUsedCategory,
        usesSubtasks,
        usesReminders,
        usesDueDates,
        categoryNames,
      },
    });
  }, [tasks, categories, notifications, permissionStatus]);

  return null;
};
