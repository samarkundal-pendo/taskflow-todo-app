import { useEffect, useRef } from 'react';
import { useTasks } from '../context/TaskContext';
import { useNotifications } from '../context/NotificationContext';
import { initializePendo } from '../utils/pendoInit';

export const PendoInitializer: React.FC = () => {
  const { tasks, categories } = useTasks();
  const { notifications } = useNotifications();
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initializePendo(tasks, categories, notifications);
    }
  }, [tasks, categories, notifications]);

  return null;
};
