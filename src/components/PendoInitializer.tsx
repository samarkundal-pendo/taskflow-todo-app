import { useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTasks } from '../context/TaskContext';
import { useNotifications } from '../context/NotificationContext';
import { isOverdue } from '../utils/dateUtils';

const VISITOR_ID_KEY = 'pendo_visitor_id';

function getOrCreateVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = `anon_${uuidv4()}`;
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

function getVisitorMetadata(
  tasks: ReturnType<typeof useTasks>['tasks'],
  categories: ReturnType<typeof useTasks>['categories'],
  unreadCount: number,
  permissionStatus: string
) {
  const totalTaskCount = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTaskCount = completedTasks.length;
  const pendingTaskCount = pendingTasks.length;
  const overdueTaskCount = pendingTasks.filter(t =>
    isOverdue(t.dueDate, t.dueTime, t.status)
  ).length;
  const categoryCount = categories.length;
  const customCategoryCount = categories.filter(c => !c.isDefault).length;
  const highPriorityTaskCount = pendingTasks.filter(t => t.priority === 'high').length;
  const hasUsedSubtasks = tasks.some(t => t.subtasks.length > 0);
  const hasUsedReminders = tasks.some(t => t.reminder !== 'none');
  const taskCompletionRate = totalTaskCount > 0
    ? Math.round((completedTaskCount / totalTaskCount) * 100)
    : 0;

  // Compute most used category
  let mostUsedCategory = '';
  if (tasks.length > 0) {
    const categoryCounts: Record<string, number> = {};
    tasks.forEach(t => {
      categoryCounts[t.categoryId] = (categoryCounts[t.categoryId] || 0) + 1;
    });
    const topCategoryId = Object.entries(categoryCounts).sort(
      (a, b) => b[1] - a[1]
    )[0]?.[0];
    if (topCategoryId) {
      const category = categories.find(c => c.id === topCategoryId);
      mostUsedCategory = category?.name || topCategoryId;
    }
  }

  return {
    totalTaskCount,
    completedTaskCount,
    pendingTaskCount,
    overdueTaskCount,
    categoryCount,
    customCategoryCount,
    notificationPermission: permissionStatus,
    unreadNotificationCount: unreadCount,
    highPriorityTaskCount,
    hasUsedSubtasks,
    hasUsedReminders,
    mostUsedCategory,
    taskCompletionRate,
  };
}

export function PendoInitializer() {
  const { tasks, categories } = useTasks();
  const { unreadCount, permissionStatus } = useNotifications();
  const initialized = useRef(false);

  // Initialize Pendo on first render
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const visitorId = getOrCreateVisitorId();
    const metadata = getVisitorMetadata(tasks, categories, unreadCount, permissionStatus);

    pendo.initialize({
      visitor: {
        id: visitorId,
        ...metadata,
      },
    });
  }, []);

  // Update Pendo visitor metadata when data changes
  useEffect(() => {
    if (!initialized.current) return;

    const visitorId = getOrCreateVisitorId();
    const metadata = getVisitorMetadata(tasks, categories, unreadCount, permissionStatus);

    pendo.identify({
      visitor: {
        id: visitorId,
        ...metadata,
      },
    });
  }, [tasks, categories, unreadCount, permissionStatus]);

  return null;
}
