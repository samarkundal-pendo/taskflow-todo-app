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
  const { unreadCount } = useNotifications();
  const initialized = useRef(false);

  useEffect(() => {
    const visitorId = getOrCreateVisitorId();

    const totalTaskCount = tasks.length;
    const completedTaskCount = tasks.filter(t => t.status === 'completed').length;
    const pendingTaskCount = tasks.filter(t => t.status === 'pending').length;
    const overdueTaskCount = tasks.filter(t => isOverdue(t.dueDate, t.dueTime, t.status)).length;
    const categoryCount = categories.length;
    const customCategoryCount = categories.filter(c => !c.isDefault).length;
    const notificationPermission = 'Notification' in window ? Notification.permission : 'default';
    const highPriorityTaskCount = tasks.filter(t => t.priority === 'high').length;
    const hasSubtasks = tasks.some(t => t.subtasks.length > 0);
    const hasReminders = tasks.some(t => t.reminder !== 'none');
    const taskCompletionRate = totalTaskCount > 0
      ? Math.round((completedTaskCount / totalTaskCount) * 100 * 100) / 100
      : 0;

    // Find the most used category
    let mostUsedCategory = '';
    if (tasks.length > 0) {
      const categoryCounts: Record<string, number> = {};
      tasks.forEach(t => {
        categoryCounts[t.categoryId] = (categoryCounts[t.categoryId] || 0) + 1;
      });
      const topCategoryId = Object.entries(categoryCounts)
        .sort((a, b) => b[1] - a[1])[0]?.[0];
      const topCategory = categories.find(c => c.id === topCategoryId);
      mostUsedCategory = topCategory?.name || topCategoryId || '';
    }

    const visitorData = {
      id: visitorId,
      totalTaskCount,
      completedTaskCount,
      pendingTaskCount,
      overdueTaskCount,
      categoryCount,
      customCategoryCount,
      notificationPermission,
      unreadNotificationCount: unreadCount,
      highPriorityTaskCount,
      hasSubtasks,
      hasReminders,
      taskCompletionRate,
      mostUsedCategory,
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
  }, [tasks, categories, unreadCount]);

  return null;
};
