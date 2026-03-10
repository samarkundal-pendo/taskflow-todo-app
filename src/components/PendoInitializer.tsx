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
  const { notifications, permissionStatus } = useNotifications();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const visitorId = getOrCreateVisitorId();

    const totalTaskCount = tasks.length;
    const completedTaskCount = tasks.filter(t => t.status === 'completed').length;
    const pendingTaskCount = tasks.filter(t => t.status === 'pending').length;
    const overdueTaskCount = tasks.filter(
      t => t.status === 'pending' && isOverdue(t.dueDate, t.dueTime, t.status)
    ).length;
    const categoryCount = categories.length;
    const hasCustomCategories = categories.some(c => !c.isDefault);
    const notificationPermission = permissionStatus;
    const unreadNotificationCount = notifications.filter(n => !n.read).length;
    const highPriorityTaskCount = tasks.filter(t => t.priority === 'high').length;
    const subtaskUsage = tasks.some(t => t.subtasks.length > 0);
    const reminderUsage = tasks.some(t => t.reminder !== 'none');
    const mostUsedCategory = getMostUsedCategory(tasks, categories);

    pendo.initialize({
      visitor: {
        id: visitorId,
        totalTaskCount,
        completedTaskCount,
        pendingTaskCount,
        overdueTaskCount,
        categoryCount,
        hasCustomCategories,
        notificationPermission,
        unreadNotificationCount,
        highPriorityTaskCount,
        subtaskUsage,
        reminderUsage,
        mostUsedCategory,
      },
    });
  }, [tasks, categories, notifications, permissionStatus]);

  return null;
}
