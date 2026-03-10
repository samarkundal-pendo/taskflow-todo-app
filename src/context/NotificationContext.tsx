import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Notification as AppNotification } from '../types';
import { storage } from '../utils/storage';
import { shouldTriggerReminder, isOverdue } from '../utils/dateUtils';
import { useTasks } from './TaskContext';

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (taskId: string, taskTitle: string, message: string, type: 'reminder' | 'overdue') => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  requestPermission: () => Promise<boolean>;
  permissionStatus: NotificationPermission | 'default';
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'default'>('default');
  const { tasks, markReminderTriggered } = useTasks();

  // Load notifications from localStorage
  useEffect(() => {
    const stored = storage.getNotifications();
    setNotifications(stored);

    // Check notification permission
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    storage.setNotifications(notifications);
  }, [notifications]);

  const addNotification = useCallback((
    taskId: string,
    taskTitle: string,
    message: string,
    type: 'reminder' | 'overdue'
  ) => {
    const newNotification: AppNotification = {
      id: uuidv4(),
      taskId,
      taskTitle,
      message,
      type,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Show browser notification if permitted
    const browserNotificationShown = 'Notification' in window && Notification.permission === 'granted';
    if (browserNotificationShown) {
      new Notification(taskTitle, {
        body: message,
        icon: '/vite.svg',
        tag: taskId,
      });
    }

    // Track notification received event
    if (typeof window !== 'undefined' && (window as any).pendo) {
      (window as any).pendo.track('notification_received', {
        notification_id: newNotification.id,
        task_id: taskId,
        notification_type: type,
        task_priority: 'unknown',
        browser_notification_shown: browserNotificationShown
      });
    }
  }, []);

  const markAsRead = (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);

    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );

    // Track notification read event
    if (typeof window !== 'undefined' && (window as any).pendo && notification) {
      const timeSinceNotificationMs = new Date().getTime() - new Date(notification.createdAt).getTime();
      const timeSinceNotificationMinutes = Math.floor(timeSinceNotificationMs / (1000 * 60));

      (window as any).pendo.track('notification_read', {
        notification_id: notificationId,
        task_id: notification.taskId,
        notification_type: notification.type,
        time_since_notification_minutes: timeSinceNotificationMinutes
      });
    }
  };

  const markAllAsRead = () => {
    const unreadCount = notifications.filter(n => !n.read).length;

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    // Track all notifications read event
    if (typeof window !== 'undefined' && (window as any).pendo && unreadCount > 0) {
      (window as any).pendo.track('all_notifications_read', {
        notification_count: notifications.length,
        unread_count: unreadCount
      });
    }
  };

  const clearNotifications = () => {
    const totalNotifications = notifications.length;
    const unreadNotifications = notifications.filter(n => !n.read).length;

    setNotifications([]);

    // Track notifications cleared event
    if (typeof window !== 'undefined' && (window as any).pendo && totalNotifications > 0) {
      (window as any).pendo.track('notifications_cleared', {
        total_notifications: totalNotifications,
        unread_notifications: unreadNotifications
      });
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      // Track permission request
      if (typeof window !== 'undefined' && (window as any).pendo) {
        (window as any).pendo.track('notification_permission_requested', {
          permission_result: 'not_supported',
          browser_supports_notifications: false
        });
      }
      return false;
    }

    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);

    // Track permission request
    if (typeof window !== 'undefined' && (window as any).pendo) {
      (window as any).pendo.track('notification_permission_requested', {
        permission_result: permission,
        browser_supports_notifications: true
      });
    }

    return permission === 'granted';
  };

  // Check for reminders every minute
  useEffect(() => {
    const checkReminders = () => {
      tasks.forEach(task => {
        if (task.status === 'pending') {
          // Check for reminder
          if (shouldTriggerReminder(task.dueDate, task.dueTime, task.reminder, task.reminderTriggered)) {
            addNotification(
              task.id,
              task.title,
              `Reminder: Task "${task.title}" is due soon!`,
              'reminder'
            );
            markReminderTriggered(task.id);
          }

          // Check for overdue (only notify once per task per session)
          if (isOverdue(task.dueDate, task.dueTime, task.status) && !task.reminderTriggered) {
            const existingOverdueNotification = notifications.find(
              n => n.taskId === task.id && n.type === 'overdue'
            );
            if (!existingOverdueNotification) {
              addNotification(
                task.id,
                task.title,
                `Task "${task.title}" is overdue!`,
                'overdue'
              );
            }
          }
        }
      });
    };

    // Check immediately
    checkReminders();

    // Check every minute
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [tasks, addNotification, markReminderTriggered, notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        requestPermission,
        permissionStatus,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
