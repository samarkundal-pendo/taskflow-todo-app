import React, { createContext, useContext, useReducer, useEffect, useRef, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Task, Category } from '../types';
import { storage } from '../utils/storage';

interface TaskState {
  tasks: Task[];
  categories: Category[];
}

type TaskAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_TASK_STATUS'; payload: string }
  | { type: 'TOGGLE_SUBTASK'; payload: { taskId: string; subtaskId: string } }
  | { type: 'MARK_REMINDER_TRIGGERED'; payload: string }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: { categoryId: string; reassignTo: string } };

const taskReducer = (state: TaskState, action: TaskAction): TaskState => {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload };

    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };

    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload.id ? action.payload : task
        ),
      };

    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
      };

    case 'TOGGLE_TASK_STATUS': {
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id === action.payload) {
            const newStatus = task.status === 'pending' ? 'completed' : 'pending';
            return {
              ...task,
              status: newStatus,
              completedAt: newStatus === 'completed' ? new Date().toISOString() : null,
              updatedAt: new Date().toISOString(),
            };
          }
          return task;
        }),
      };
    }

    case 'TOGGLE_SUBTASK': {
      return {
        ...state,
        tasks: state.tasks.map(task => {
          if (task.id === action.payload.taskId) {
            return {
              ...task,
              subtasks: task.subtasks.map(subtask =>
                subtask.id === action.payload.subtaskId
                  ? { ...subtask, completed: !subtask.completed }
                  : subtask
              ),
              updatedAt: new Date().toISOString(),
            };
          }
          return task;
        }),
      };
    }

    case 'MARK_REMINDER_TRIGGERED':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task.id === action.payload
            ? { ...task, reminderTriggered: true, updatedAt: new Date().toISOString() }
            : task
        ),
      };

    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };

    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };

    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(cat =>
          cat.id === action.payload.id ? action.payload : cat
        ),
      };

    case 'DELETE_CATEGORY': {
      const { categoryId, reassignTo } = action.payload;
      return {
        ...state,
        categories: state.categories.filter(cat => cat.id !== categoryId),
        tasks: state.tasks.map(task =>
          task.categoryId === categoryId ? { ...task, categoryId: reassignTo } : task
        ),
      };
    }

    default:
      return state;
  }
};

interface TaskContextValue {
  tasks: Task[];
  categories: Category[];
  addTask: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt' | 'reminderTriggered'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskStatus: (taskId: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  markReminderTriggered: (taskId: string) => void;
  getTaskById: (taskId: string) => Task | undefined;
  addCategory: (name: string, color: string) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (categoryId: string, reassignTo: string) => void;
  getCategoryById: (categoryId: string) => Category | undefined;
}

const TaskContext = createContext<TaskContextValue | undefined>(undefined);

// Initialize state from localStorage
const getInitialState = (): TaskState => {
  return {
    tasks: storage.getTasks(),
    categories: storage.getCategories(),
  };
};

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, null, getInitialState);
  const isFirstRender = useRef(true);

  // Save tasks to localStorage whenever they change (skip first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    storage.setTasks(state.tasks);
  }, [state.tasks]);

  // Save categories to localStorage whenever they change
  useEffect(() => {
    storage.setCategories(state.categories);
  }, [state.categories]);

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completedAt' | 'reminderTriggered'>) => {
    const now = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      completedAt: null,
      reminderTriggered: false,
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });

    // Track task creation event
    if (typeof window !== 'undefined' && (window as any).pendo) {
      const category = state.categories.find(c => c.id === newTask.categoryId);
      (window as any).pendo.track('task_created', {
        task_id: newTask.id,
        priority: newTask.priority,
        category_id: newTask.categoryId,
        category_name: category?.name || 'Unknown',
        has_due_date: !!newTask.dueDate,
        has_reminder: newTask.reminder !== 'none',
        has_subtasks: newTask.subtasks.length > 0,
        subtask_count: newTask.subtasks.length,
        creation_method: 'full_form'
      });
    }
  };

  const updateTask = (task: Task) => {
    const updatedTask = { ...task, updatedAt: new Date().toISOString() };
    const originalTask = state.tasks.find(t => t.id === task.id);

    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });

    // Track task update event
    if (typeof window !== 'undefined' && (window as any).pendo && originalTask) {
      const fieldsChanged: string[] = [];
      if (originalTask.title !== task.title) fieldsChanged.push('title');
      if (originalTask.description !== task.description) fieldsChanged.push('description');
      if (originalTask.priority !== task.priority) fieldsChanged.push('priority');
      if (originalTask.categoryId !== task.categoryId) fieldsChanged.push('category');
      if (originalTask.dueDate !== task.dueDate) fieldsChanged.push('due_date');
      if (originalTask.dueTime !== task.dueTime) fieldsChanged.push('due_time');
      if (originalTask.reminder !== task.reminder) fieldsChanged.push('reminder');
      if (JSON.stringify(originalTask.subtasks) !== JSON.stringify(task.subtasks)) fieldsChanged.push('subtasks');

      (window as any).pendo.track('task_updated', {
        task_id: task.id,
        fields_changed: fieldsChanged.join(','),
        priority: task.priority,
        category_id: task.categoryId,
        due_date_added: !originalTask.dueDate && !!task.dueDate,
        due_date_removed: !!originalTask.dueDate && !task.dueDate,
        reminder_changed: originalTask.reminder !== task.reminder,
        subtasks_modified: JSON.stringify(originalTask.subtasks) !== JSON.stringify(task.subtasks)
      });
    }
  };

  const deleteTask = (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    dispatch({ type: 'DELETE_TASK', payload: taskId });

    // Track task deletion event
    if (typeof window !== 'undefined' && (window as any).pendo && task) {
      const taskAgeMs = new Date().getTime() - new Date(task.createdAt).getTime();
      const taskAgeDays = Math.floor(taskAgeMs / (1000 * 60 * 60 * 24));

      (window as any).pendo.track('task_deleted', {
        task_id: taskId,
        task_status: task.status,
        task_priority: task.priority,
        category_id: task.categoryId,
        had_subtasks: task.subtasks.length > 0,
        subtask_count: task.subtasks.length,
        task_age_days: taskAgeDays,
        deletion_location: 'task_list'
      });
    }
  };

  const toggleTaskStatus = (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    dispatch({ type: 'TOGGLE_TASK_STATUS', payload: taskId });

    // Track task completion/uncompletion event
    if (typeof window !== 'undefined' && (window as any).pendo && task) {
      if (task.status === 'pending') {
        // Task is being completed
        const isOverdue = task.dueDate && task.dueTime
          ? new Date(`${task.dueDate}T${task.dueTime}`) < new Date()
          : task.dueDate
          ? new Date(task.dueDate) < new Date()
          : false;

        const timeToCompleteMs = new Date().getTime() - new Date(task.createdAt).getTime();
        const timeToCompleteHours = Math.floor(timeToCompleteMs / (1000 * 60 * 60));

        const allSubtasksCompleted = task.subtasks.length > 0
          ? task.subtasks.every(st => st.completed)
          : true;

        (window as any).pendo.track('task_completed', {
          task_id: taskId,
          task_priority: task.priority,
          category_id: task.categoryId,
          was_overdue: isOverdue,
          time_to_complete_hours: timeToCompleteHours,
          completion_location: 'task_list',
          had_subtasks: task.subtasks.length > 0,
          all_subtasks_completed: allSubtasksCompleted
        });
      } else {
        // Task is being uncompleted
        const timeSinceCompletedMs = task.completedAt
          ? new Date().getTime() - new Date(task.completedAt).getTime()
          : 0;
        const timeSinceCompletedHours = Math.floor(timeSinceCompletedMs / (1000 * 60 * 60));

        (window as any).pendo.track('task_reopened', {
          task_id: taskId,
          priority: task.priority,
          days_since_completion: Math.floor(timeSinceCompletedHours / 24)
        });
      }
    }
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    const subtask = task?.subtasks.find(st => st.id === subtaskId);

    dispatch({ type: 'TOGGLE_SUBTASK', payload: { taskId, subtaskId } });

    // Track subtask completion/reopening event
    if (typeof window !== 'undefined' && (window as any).pendo && task && subtask) {
      const newStatus = !subtask.completed;
      const completedSubtasksCount = task.subtasks.filter(st =>
        st.id === subtaskId ? newStatus : st.completed
      ).length;
      const completionPercentage = Math.round((completedSubtasksCount / task.subtasks.length) * 100);

      if (newStatus) {
        // Subtask being completed
        (window as any).pendo.track('subtask_completed', {
          task_id: taskId,
          subtask_id: subtaskId,
          completed_subtasks: completedSubtasksCount,
          total_subtasks: task.subtasks.length,
          completion_percentage: completionPercentage,
          location: 'task_detail'
        });
      } else {
        // Subtask being reopened
        (window as any).pendo.track('subtask_reopened', {
          task_id: taskId,
          subtask_id: subtaskId,
          completed_subtasks: completedSubtasksCount,
          total_subtasks: task.subtasks.length
        });
      }
    }
  };

  const markReminderTriggered = (taskId: string) => {
    dispatch({ type: 'MARK_REMINDER_TRIGGERED', payload: taskId });
  };

  const getTaskById = (taskId: string) => {
    return state.tasks.find(task => task.id === taskId);
  };

  const addCategory = (name: string, color: string) => {
    const newCategory: Category = {
      id: uuidv4(),
      name,
      color,
      isDefault: false,
    };
    dispatch({ type: 'ADD_CATEGORY', payload: newCategory });

    // Track category creation event
    if (typeof window !== 'undefined' && (window as any).pendo) {
      (window as any).pendo.track('category_created', {
        category_id: newCategory.id,
        category_name: newCategory.name,
        category_color: newCategory.color,
        total_categories: state.categories.length + 1
      });
    }
  };

  const updateCategory = (category: Category) => {
    const originalCategory = state.categories.find(c => c.id === category.id);
    dispatch({ type: 'UPDATE_CATEGORY', payload: category });

    // Track category update event
    if (typeof window !== 'undefined' && (window as any).pendo && originalCategory) {
      const taskCount = state.tasks.filter(t => t.categoryId === category.id).length;

      (window as any).pendo.track('category_updated', {
        category_id: category.id,
        category_name_changed: originalCategory.name !== category.name,
        category_color_changed: originalCategory.color !== category.color,
        new_color: category.color,
        task_count: taskCount
      });
    }
  };

  const deleteCategory = (categoryId: string, reassignTo: string) => {
    const category = state.categories.find(c => c.id === categoryId);
    const affectedTaskCount = state.tasks.filter(t => t.categoryId === categoryId).length;

    dispatch({ type: 'DELETE_CATEGORY', payload: { categoryId, reassignTo } });

    // Track category deletion event
    if (typeof window !== 'undefined' && (window as any).pendo && category) {
      (window as any).pendo.track('category_deleted', {
        category_id: categoryId,
        category_name: category.name,
        reassign_to_category_id: reassignTo,
        affected_task_count: affectedTaskCount
      });
    }
  };

  const getCategoryById = (categoryId: string) => {
    return state.categories.find(cat => cat.id === categoryId);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks: state.tasks,
        categories: state.categories,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        toggleSubtask,
        markReminderTriggered,
        getTaskById,
        addCategory,
        updateCategory,
        deleteCategory,
        getCategoryById,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = (): TaskContextValue => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
