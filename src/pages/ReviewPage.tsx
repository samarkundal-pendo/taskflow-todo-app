import React from 'react';
import { useTasks } from '../context/TaskContext';
import { isOverdue } from '../utils/dateUtils';
import { CheckCircle, Clock, AlertTriangle, TrendingUp, Star, BarChart3 } from 'lucide-react';

export const ReviewPage: React.FC = () => {
  const { tasks, categories } = useTasks();

  const completedTasks = tasks.filter(t => t.status === 'completed');
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const overdueTasks = tasks.filter(
    t => t.status === 'pending' && isOverdue(t.dueDate, t.dueTime, t.status)
  );

  const completionRate = tasks.length > 0
    ? Math.round((completedTasks.length / tasks.length) * 100)
    : 0;

  const highPriority = tasks.filter(t => t.priority === 'high').length;
  const mediumPriority = tasks.filter(t => t.priority === 'medium').length;
  const lowPriority = tasks.filter(t => t.priority === 'low').length;

  const totalSubtasks = tasks.reduce((sum, t) => sum + t.subtasks.length, 0);
  const completedSubtasks = tasks.reduce(
    (sum, t) => sum + t.subtasks.filter(s => s.completed).length, 0
  );

  // Tasks completed in the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentlyCompleted = completedTasks.filter(
    t => t.completedAt && new Date(t.completedAt) >= sevenDaysAgo
  );

  // Per-category breakdown
  const categoryBreakdown = categories.map(cat => {
    const catTasks = tasks.filter(t => t.categoryId === cat.id);
    const catCompleted = catTasks.filter(t => t.status === 'completed').length;
    return {
      name: cat.name,
      color: cat.color,
      total: catTasks.length,
      completed: catCompleted,
      rate: catTasks.length > 0 ? Math.round((catCompleted / catTasks.length) * 100) : 0,
    };
  }).filter(c => c.total > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Review</h1>
        <p className="text-gray-500 mt-1">A summary of your task performance and progress.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-green-50 text-green-600">
              <CheckCircle className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-gray-500">Completed</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{completedTasks.length}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-yellow-50 text-yellow-600">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-gray-500">Pending</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{pendingTasks.length}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-red-50 text-red-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-gray-500">Overdue</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{overdueTasks.length}</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium text-gray-500">Completion Rate</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
        </div>
      </div>

      {/* Completion Progress Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h2>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-500 h-4 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-500">
          <span>{completedTasks.length} of {tasks.length} tasks completed</span>
          <span>{completionRate}%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Priority Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Priority Breakdown</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">High Priority</span>
                <span className="font-medium text-red-600">{highPriority}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: tasks.length > 0 ? `${(highPriority / tasks.length) * 100}%` : '0%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Medium Priority</span>
                <span className="font-medium text-yellow-600">{mediumPriority}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{ width: tasks.length > 0 ? `${(mediumPriority / tasks.length) * 100}%` : '0%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Low Priority</span>
                <span className="font-medium text-green-600">{lowPriority}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: tasks.length > 0 ? `${(lowPriority / tasks.length) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Subtask Progress */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Subtask Progress</h2>
          </div>
          <div className="text-center py-4">
            <p className="text-4xl font-bold text-gray-900">
              {completedSubtasks}<span className="text-lg text-gray-400">/{totalSubtasks}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">subtasks completed</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div
              className="bg-purple-500 h-2 rounded-full"
              style={{ width: totalSubtasks > 0 ? `${(completedSubtasks / totalSubtasks) * 100}%` : '0%' }}
            />
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h2>
          <div className="space-y-4">
            {categoryBreakdown.map(cat => (
              <div key={cat.name}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-gray-600">{cat.name}</span>
                  </div>
                  <span className="text-gray-500">
                    {cat.completed}/{cat.total} ({cat.rate}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${cat.rate}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recently Completed */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recently Completed <span className="text-sm font-normal text-gray-400">(last 7 days)</span>
        </h2>
        {recentlyCompleted.length > 0 ? (
          <ul className="space-y-3">
            {recentlyCompleted.map(task => (
              <li key={task.id} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                  <p className="text-xs text-gray-400">
                    Completed {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : ''}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  task.priority === 'high' ? 'bg-red-100 text-red-600' :
                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-green-100 text-green-600'
                }`}>
                  {task.priority}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">No tasks completed in the last 7 days.</p>
        )}
      </div>
    </div>
  );
};
