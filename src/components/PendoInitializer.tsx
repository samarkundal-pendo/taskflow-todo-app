import { useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTasks } from '../context/TaskContext';
import { useNotifications } from '../context/NotificationContext';
import { isOverdue } from '../utils/dateUtils';

const VISITOR_ID_KEY = 'pendo_visitor_id';

function getOrCreateVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = uuidv4();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

export const PendoInitializer: React.FC = () => {
  const { tasks, categories } = useTasks();
  const { unreadCount, permissionStatus } = useNotifications();
  const hasInitialized = useRef(false);

  useEffect(() => {
    const visitorId = getOrCreateVisitorId();

    const totalTasksCount = tasks.length;
    const completedTasksCount = tasks.filter(t => t.status === 'completed').length;
    const pendingTasksCount = tasks.filter(t => t.status === 'pending').length;
    const overdueTasksCount = tasks.filter(
      t => t.status === 'pending' && isOverdue(t.dueDate, t.dueTime, t.status)
    ).length;
    const highPriorityTasksCount = tasks.filter(t => t.priority === 'high').length;
    const totalCategoriesCount = categories.length;
    const hasCustomCategories = categories.some(c => !c.isDefault);
    const taskCompletionRate = totalTasksCount > 0
      ? Math.round((completedTasksCount / totalTasksCount) * 100)
      : 0;

    const categoryIdsUsed = new Set(tasks.map(t => t.categoryId));
    const categoriesUsed = categories
      .filter(c => categoryIdsUsed.has(c.id))
      .map(c => c.name);

    const usesSubtasks = tasks.some(t => t.subtasks.length > 0);
    const usesReminders = tasks.some(t => t.reminder !== 'none');

    const visitorData = {
      visitor: {
        id: visitorId,
        totalTasksCount,
        completedTasksCount,
        pendingTasksCount,
        overdueTasksCount,
        highPriorityTasksCount,
        totalCategoriesCount,
        hasCustomCategories,
        notificationPermission: permissionStatus,
        unreadNotificationsCount: unreadCount,
        taskCompletionRate,
        categoriesUsed,
        usesSubtasks,
        usesReminders,
      },
    };

    if (!hasInitialized.current) {
      pendo.initialize(visitorData);
      hasInitialized.current = true;
    } else {
      pendo.updateOptions(visitorData);
    }
  }, [tasks, categories, unreadCount, permissionStatus]);

  return null;
};
