import { useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useTasks } from '../context/TaskContext';
import { useNotifications } from '../context/NotificationContext';
import { isOverdue } from '../utils/dateUtils';

const VISITOR_ID_KEY = 'pendo_visitor_id';

function getOrCreateVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = 'visitor_' + uuidv4();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

export function usePendoInitialize(): void {
  const { tasks, categories } = useTasks();
  const { unreadCount, permissionStatus } = useNotifications();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (typeof pendo === 'undefined') return;

    const visitorId = getOrCreateVisitorId();

    // Compute visitor metadata from tasks
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const overdueTasks = tasks.filter(
      t => t.status === 'pending' && isOverdue(t.dueDate, t.dueTime, t.status)
    ).length;
    const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Category metadata
    const totalCategories = categories.length;
    const customCategoriesCount = categories.filter(c => !c.isDefault).length;

    // Most used category
    const categoryCountMap: Record<string, number> = {};
    tasks.forEach(t => {
      categoryCountMap[t.categoryId] = (categoryCountMap[t.categoryId] || 0) + 1;
    });
    let mostUsedCategory = '';
    let maxCount = 0;
    for (const [catId, count] of Object.entries(categoryCountMap)) {
      if (count > maxCount) {
        maxCount = count;
        const cat = categories.find(c => c.id === catId);
        mostUsedCategory = cat ? cat.name : catId;
      }
    }

    // Feature usage flags
    const usesReminders = tasks.some(t => t.reminder !== 'none');
    const usesSubtasks = tasks.some(t => t.subtasks.length > 0);

    // Timestamps
    const sortedByCreation = [...tasks].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    const firstTaskCreatedAt = sortedByCreation.length > 0 ? sortedByCreation[0].createdAt : '';
    const lastTaskCreatedAt = sortedByCreation.length > 0 ? sortedByCreation[sortedByCreation.length - 1].createdAt : '';

    const visitorData = {
      visitor: {
        id: visitorId,
        totalTasks,
        completedTasks,
        pendingTasks,
        overdueTasks,
        highPriorityTasks,
        taskCompletionRate,
        totalCategories,
        customCategoriesCount,
        mostUsedCategory,
        notificationPermission: permissionStatus,
        unreadNotifications: unreadCount,
        usesReminders,
        usesSubtasks,
        firstTaskCreatedAt,
        lastTaskCreatedAt,
      },
    };

    if (!initializedRef.current) {
      pendo.initialize(visitorData);
      initializedRef.current = true;
    } else {
      pendo.identify(visitorData);
    }
  }, [tasks, categories, unreadCount, permissionStatus]);
}
