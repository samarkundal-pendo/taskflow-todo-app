import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TaskProvider, useTasks } from './context/TaskContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { ToastProvider } from './components/common/Toast';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { TasksPage } from './pages/TasksPage';
import { TaskDetailPage } from './pages/TaskDetailPage';
import { TaskFormPage } from './pages/TaskFormPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { storage } from './utils/storage';
import { isOverdue } from './utils/dateUtils';

function PendoIdentifier() {
  const { tasks, categories } = useTasks();
  const { unreadCount, permissionStatus } = useNotifications();

  useEffect(() => {
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const overdueTasks = pendingTasks.filter(t => isOverdue(t.dueDate, t.dueTime, t.status));
    const totalTaskCount = tasks.length;
    const completedTaskCount = completedTasks.length;

    pendo.identify({
      visitor: {
        id: storage.getVisitorId(),
        totalTaskCount: totalTaskCount,
        completedTaskCount: completedTaskCount,
        pendingTaskCount: pendingTasks.length,
        overdueTaskCount: overdueTasks.length,
        categoryCount: categories.length,
        customCategoryCount: categories.filter(c => !c.isDefault).length,
        notificationPermission: permissionStatus,
        unreadNotificationCount: unreadCount,
        usesSubtasks: tasks.some(t => t.subtasks.length > 0),
        usesReminders: tasks.some(t => t.reminder !== 'none'),
        highPriorityTaskCount: tasks.filter(t => t.priority === 'high').length,
        taskCompletionRate: totalTaskCount > 0 ? (completedTaskCount / totalTaskCount) * 100 : 0,
        usesDueDates: tasks.some(t => t.dueDate !== null),
      },
    });
  }, [tasks, categories, unreadCount, permissionStatus]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <TaskProvider>
        <NotificationProvider>
          <ToastProvider>
            <PendoIdentifier />
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
