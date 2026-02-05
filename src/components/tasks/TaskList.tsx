import React from 'react';
import { Task } from '../../types';
import { TaskCard } from './TaskCard';
import { useTasks } from '../../context/TaskContext';
import { ClipboardList } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  onToggleStatus: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  emptyMessage?: string;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onToggleStatus,
  onDelete,
  emptyMessage = 'No tasks found',
}) => {
  const { getCategoryById } = useTasks();

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <ClipboardList className="h-12 w-12 mb-4" />
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <TaskCard
          key={task.id}
          task={task}
          category={getCategoryById(task.categoryId)}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
