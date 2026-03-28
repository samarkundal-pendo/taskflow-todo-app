import { useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { useNotifications } from '../context/NotificationContext';
import { isOverdue } from '../utils/dateUtils';

export const PendoInitializer: React.FC = () => {
  const { tasks, categories } = useTasks();
  const { unreadCount, permissionStatus } = useNotifications();

  useEffect(() => {
    if (typeof pendo === 'undefined') return;

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const overdueTasks = tasks.filter(t => isOverdue(t.dueDate, t.dueTime, t.status)).length;
    const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
    const tasksWithSubtasks = tasks.filter(t => t.subtasks.length > 0).length;
    const tasksWithReminders = tasks.filter(t => t.reminder !== 'none').length;
    const customCategoriesCount = categories.filter(c => !c.isDefault).length;
    const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    // Find the most used category
    const categoryTaskCounts: Record<string, number> = {};
    tasks.forEach(t => {
      categoryTaskCounts[t.categoryId] = (categoryTaskCounts[t.categoryId] || 0) + 1;
    });
    let mostUsedCategoryId = '';
    let maxCount = 0;
    for (const [catId, count] of Object.entries(categoryTaskCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostUsedCategoryId = catId;
      }
    }
    const mostUsedCategory = categories.find(c => c.id === mostUsedCategoryId)?.name || '';

    const categoryNames = categories.map(c => c.name);

    pendo.identify({
      visitor: {
        id: getOrCreateVisitorId(),
        totalTasks: tasks.length,
        completedTasks,
        pendingTasks,
        overdueTasks,
        totalCategories: categories.length,
        customCategoriesCount,
        highPriorityTasks,
        tasksWithSubtasks,
        tasksWithReminders,
        notificationPermission: permissionStatus,
        unreadNotifications: unreadCount,
        taskCompletionRate,
        mostUsedCategory,
        usesSubtasks: tasks.some(t => t.subtasks.length > 0),
        usesReminders: tasks.some(t => t.reminder !== 'none'),
        usesDueDates: tasks.some(t => t.dueDate !== null),
        categoryNames,
      },
    });
  }, [tasks, categories, unreadCount, permissionStatus]);

  return null;
};

const VISITOR_ID_KEY = 'pendo_visitor_id';

function getOrCreateVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = 'visitor-' + crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}
