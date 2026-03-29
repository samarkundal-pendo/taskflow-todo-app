import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { TaskProvider } from './context/TaskContext';
import { NotificationProvider } from './context/NotificationContext';
import { ToastProvider } from './components/common/Toast';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { TasksPage } from './pages/TasksPage';
import { TaskDetailPage } from './pages/TaskDetailPage';
import { TaskFormPage } from './pages/TaskFormPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { storage } from './utils/storage';
import { isOverdue } from './utils/dateUtils';
import { Task, Category } from './types';

const VISITOR_ID_KEY = 'pendo_visitor_id';

function getOrCreateVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = `visitor_${uuidv4()}`;
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

function getPendoVisitorMetadata() {
  const tasks: Task[] = storage.getTasks();
  const categories: Category[] = storage.getCategories();
  const notifications = storage.getNotifications();

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const overdueTasks = tasks.filter(t => isOverdue(t.dueDate, t.dueTime, t.status)).length;
  const highPriorityTasks = tasks.filter(t => t.priority === 'high').length;
  const totalTasks = tasks.length;
  const totalCategories = categories.length;
  const customCategoriesCount = categories.filter(c => !c.isDefault).length;
  const unreadNotifications = notifications.filter(n => !n.read).length;
  const usesReminders = tasks.some(t => t.reminder !== 'none');
  const usesSubtasks = tasks.some(t => t.subtasks && t.subtasks.length > 0);
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 1000) / 10 : 0;

  // Find the most used category
  const categoryCounts: Record<string, number> = {};
  tasks.forEach(t => {
    categoryCounts[t.categoryId] = (categoryCounts[t.categoryId] || 0) + 1;
  });
  let mostUsedCategoryId = '';
  let maxCount = 0;
  for (const [catId, count] of Object.entries(categoryCounts)) {
    if (count > maxCount) {
      maxCount = count;
      mostUsedCategoryId = catId;
    }
  }
  const mostUsedCategory = categories.find(c => c.id === mostUsedCategoryId)?.name || '';

  // Get first and last task creation timestamps
  const sortedByCreation = [...tasks].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const firstTaskCreatedAt = sortedByCreation.length > 0 ? sortedByCreation[0].createdAt : '';
  const lastTaskCreatedAt = sortedByCreation.length > 0 ? sortedByCreation[sortedByCreation.length - 1].createdAt : '';

  // Notification permission
  const notificationPermission = 'Notification' in window ? Notification.permission : 'default';

  return {
    id: getOrCreateVisitorId(),
    totalTasks,
    completedTasks,
    pendingTasks,
    overdueTasks,
    totalCategories,
    customCategoriesCount,
    notificationPermission,
    unreadNotifications,
    highPriorityTasks,
    usesReminders,
    usesSubtasks,
    taskCompletionRate,
    mostUsedCategory,
    firstTaskCreatedAt,
    lastTaskCreatedAt,
  };
}

function App() {
  useEffect(() => {
    const visitorData = getPendoVisitorMetadata();
    pendo.initialize({
      visitor: visitorData,
    });
  }, []);

  return (
    <BrowserRouter>
      <TaskProvider>
        <NotificationProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="tasks/new" element={<TaskFormPage />} />
                <Route path="tasks/:id" element={<TaskDetailPage />} />
                <Route path="tasks/:id/edit" element={<TaskFormPage />} />
                <Route path="categories" element={<CategoriesPage />} />
              </Route>
            </Routes>
          </ToastProvider>
        </NotificationProvider>
      </TaskProvider>
    </BrowserRouter>
  );
}

export default App;
