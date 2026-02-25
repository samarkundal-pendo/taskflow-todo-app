import { useEffect, useRef } from 'react';
import { useTasks } from '../context/TaskContext';
import { useNotifications } from '../context/NotificationContext';
import { isOverdue } from '../utils/dateUtils';

const VISITOR_ID_KEY = 'pendo_visitor_id';

function getOrCreateVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = 'visitor-' + crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

export function PendoInitializer() {
  const { tasks, categories } = useTasks();
  const { unreadCount, permissionStatus } = useNotifications();
  const initialized = useRef(false);

  useEffect(() => {
    const visitorId = getOrCreateVisitorId();

    const totalTaskCount = tasks.length;
    const completedTaskCount = tasks.filter(t => t.status === 'completed').length;
    const pendingTaskCount = tasks.filter(t => t.status === 'pending').length;
    const overdueTaskCount = tasks.filter(t =>
      t.status === 'pending' && isOverdue(t.dueDate, t.dueTime, t.status)
    ).length;
    const highPriorityTaskCount = tasks.filter(t => t.priority === 'high').length;
    const categoryCount = categories.length;
    const hasCustomCategories = categories.some(c => !c.isDefault);
    const taskCompletionRate = totalTaskCount > 0
      ? Math.round((completedTaskCount / totalTaskCount) * 100)
      : 0;
    const usesSubtasks = tasks.some(t => t.subtasks.length > 0);
    const usesReminders = tasks.some(t => t.reminder !== 'none');
    const usesDueDates = tasks.some(t => t.dueDate !== null);

    // Compute most used category
    let mostUsedCategory = '';
    if (tasks.length > 0) {
      const categoryCounts: Record<string, number> = {};
      tasks.forEach(t => {
        categoryCounts[t.categoryId] = (categoryCounts[t.categoryId] || 0) + 1;
      });
      const topCategoryId = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0];
      const topCategory = categories.find(c => c.id === topCategoryId);
      mostUsedCategory = topCategory?.name ?? '';
    }

    const visitorData = {
      visitor: {
        id: visitorId,
        totalTaskCount,
        completedTaskCount,
        pendingTaskCount,
        overdueTaskCount,
        highPriorityTaskCount,
        categoryCount,
        hasCustomCategories,
        notificationPermission: permissionStatus,
        unreadNotificationCount: unreadCount,
        taskCompletionRate,
        usesSubtasks,
        usesReminders,
        usesDueDates,
        mostUsedCategory,
      },
    };

    if (!initialized.current) {
      pendo.initialize(visitorData);
      initialized.current = true;
    } else {
      pendo.identify(visitorData);
    }
  }, [tasks, categories, unreadCount, permissionStatus]);

  return null;
}
