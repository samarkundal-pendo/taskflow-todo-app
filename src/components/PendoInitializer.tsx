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

function getMostUsedCategory(
  tasks: { categoryId: string }[],
  categories: { id: string; name: string }[]
): string {
  if (tasks.length === 0) return '';
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
  return category ? category.name : '';
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
    const overdueTaskCount = tasks.filter(
      t => t.status === 'pending' && isOverdue(t.dueDate, t.dueTime, t.status)
    ).length;
    const highPriorityTaskCount = tasks.filter(t => t.priority === 'high').length;
    const categoryCount = categories.length;
    const hasCustomCategories = categories.some(c => !c.isDefault);
    const usesSubtasks = tasks.some(t => t.subtasks && t.subtasks.length > 0);
    const usesReminders = tasks.some(t => t.reminder !== 'none');
    const notificationPermission = permissionStatus;
    const unreadNotificationCount = unreadCount;
    const taskCompletionRate =
      totalTaskCount > 0 ? Math.round((completedTaskCount / totalTaskCount) * 100) : 0;
    const mostUsedCategory = getMostUsedCategory(tasks, categories);
    const usesDueDates = tasks.some(t => t.dueDate !== null);

    const visitorData = {
      id: visitorId,
      totalTaskCount,
      completedTaskCount,
      pendingTaskCount,
      overdueTaskCount,
      highPriorityTaskCount,
      categoryCount,
      hasCustomCategories,
      usesSubtasks,
      usesReminders,
      notificationPermission,
      unreadNotificationCount,
      taskCompletionRate,
      mostUsedCategory,
      usesDueDates,
    };

    if (!initialized.current) {
      pendo.initialize({
        visitor: visitorData,
      });
      initialized.current = true;
    } else {
      pendo.updateOptions({
        visitor: visitorData,
      });
    }
  }, [tasks, categories, unreadCount, permissionStatus]);

  return null;
}
