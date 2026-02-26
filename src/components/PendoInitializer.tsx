import { useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTasks } from '../context/TaskContext';
import { useNotifications } from '../context/NotificationContext';
import { isOverdue } from '../utils/dateUtils';

const VISITOR_ID_KEY = 'pendo_visitor_id';

const getOrCreateVisitorId = (): string => {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = uuidv4();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
};

export const PendoInitializer: React.FC = () => {
  const { tasks, categories } = useTasks();
  const { unreadCount, permissionStatus } = useNotifications();
  const initialized = useRef(false);

  useEffect(() => {
    const visitorId = getOrCreateVisitorId();

    const totalTaskCount = tasks.length;
    const completedTaskCount = tasks.filter(t => t.status === 'completed').length;
    const pendingTaskCount = tasks.filter(t => t.status === 'pending').length;
    const overdueTaskCount = tasks.filter(t => t.status === 'pending' && isOverdue(t.dueDate, t.dueTime, t.status)).length;
    const categoryCount = categories.length;
    const hasCustomCategories = categories.some(c => !c.isDefault);
    const taskCompletionRate = totalTaskCount > 0 ? Math.round((completedTaskCount / totalTaskCount) * 100) : 0;
    const usesReminders = tasks.some(t => t.reminder !== 'none');
    const usesSubtasks = tasks.some(t => t.subtasks.length > 0);
    const highPriorityTaskCount = tasks.filter(t => t.priority === 'high').length;

    // Calculate most used category
    let mostUsedCategory = '';
    if (tasks.length > 0) {
      const categoryCounts: Record<string, number> = {};
      tasks.forEach(t => {
        categoryCounts[t.categoryId] = (categoryCounts[t.categoryId] || 0) + 1;
      });
      const topCategoryId = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
      const topCategory = categories.find(c => c.id === topCategoryId);
      mostUsedCategory = topCategory?.name || '';
    }

    const visitorData = {
      id: visitorId,
      totalTaskCount,
      completedTaskCount,
      pendingTaskCount,
      overdueTaskCount,
      categoryCount,
      hasCustomCategories,
      notificationPermission: permissionStatus,
      unreadNotificationCount: unreadCount,
      taskCompletionRate,
      usesReminders,
      usesSubtasks,
      mostUsedCategory,
      highPriorityTaskCount,
    };

    if (!initialized.current) {
      pendo.initialize({
        visitor: visitorData,
      });
      initialized.current = true;
    } else {
      pendo.identify({
        visitor: visitorData,
      });
    }
  }, [tasks, categories, unreadCount, permissionStatus]);

  return null;
};
