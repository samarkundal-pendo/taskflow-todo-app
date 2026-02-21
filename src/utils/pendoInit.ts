import { Task, Category } from '../types';
import { isOverdue } from './dateUtils';

const VISITOR_ID_KEY = 'pendo_visitor_id';

function getOrCreateVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = 'visitor_' + crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

function getMostFrequent(items: string[]): string {
  if (items.length === 0) return '';
  const counts: Record<string, number> = {};
  for (const item of items) {
    counts[item] = (counts[item] || 0) + 1;
  }
  let maxCount = 0;
  let maxItem = '';
  for (const [item, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      maxItem = item;
    }
  }
  return maxItem;
}

export function initializePendo(tasks: Task[], categories: Category[], unreadNotificationCount: number, notificationPermission: string): void {
  const visitorId = getOrCreateVisitorId();

  const completedTasks = tasks.filter(t => t.status === 'completed');
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const overdueTasks = tasks.filter(t => isOverdue(t.dueDate, t.dueTime, t.status));
  const highPriorityTasks = tasks.filter(t => t.priority === 'high');

  const usesSubtasks = tasks.some(t => t.subtasks.length > 0);
  const usesReminders = tasks.some(t => t.reminder !== 'none');

  const priorities = tasks.map(t => t.priority);
  const preferredPriority = getMostFrequent(priorities);

  const taskCategoryIds = tasks.map(t => t.categoryId);
  const mostUsedCategoryId = getMostFrequent(taskCategoryIds);
  const mostUsedCategory = categories.find(c => c.id === mostUsedCategoryId);

  const categoriesUsed = [...new Set(taskCategoryIds)].map(id => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : id;
  });

  const sortedByCreation = [...tasks].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const firstTaskCreatedAt = sortedByCreation.length > 0 ? sortedByCreation[0].createdAt : '';
  const lastTaskCreatedAt = sortedByCreation.length > 0 ? sortedByCreation[sortedByCreation.length - 1].createdAt : '';

  const taskCompletionRate = tasks.length > 0
    ? Math.round((completedTasks.length / tasks.length) * 100 * 100) / 100
    : 0;

  // Check if current tasks match seed data by checking if seed data was loaded
  const seedTaskTitles = [
    'Complete quarterly report', 'Team meeting preparation', 'Review pull requests',
    'Update project documentation', 'Client presentation', 'Plan weekend trip',
    'Call mom', 'Renew passport', 'Fix leaky faucet', 'Organize garage',
  ];
  const currentTitles = tasks.map(t => t.title);
  const matchCount = seedTaskTitles.filter(t => currentTitles.includes(t)).length;
  const hasSeedData = matchCount >= 5;

  pendo.initialize({
    visitor: {
      id: visitorId,
      totalTasksCreated: tasks.length,
      completedTaskCount: completedTasks.length,
      pendingTaskCount: pendingTasks.length,
      overdueTaskCount: overdueTasks.length,
      categoryCount: categories.length,
      notificationPermission: notificationPermission,
      unreadNotificationCount: unreadNotificationCount,
      usesSubtasks: usesSubtasks,
      usesReminders: usesReminders,
      preferredPriority: preferredPriority,
      mostUsedCategory: mostUsedCategory ? mostUsedCategory.name : '',
      firstTaskCreatedAt: firstTaskCreatedAt,
      lastTaskCreatedAt: lastTaskCreatedAt,
      taskCompletionRate: taskCompletionRate,
      highPriorityTaskCount: highPriorityTasks.length,
      categoriesUsed: categoriesUsed,
      hasSeedData: hasSeedData,
    },
  });
}
