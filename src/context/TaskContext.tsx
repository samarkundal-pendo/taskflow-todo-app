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

    if (typeof pendo !== 'undefined') {
      pendo.track('task_created', {
        taskId: newTask.id,
        title: newTask.title,
        priority: newTask.priority,
        categoryId: newTask.categoryId,
        hasDueDate: !!newTask.dueDate,
        hasDueTime: !!newTask.dueTime,
        reminderType: newTask.reminder,
        subtaskCount: newTask.subtasks.length,
        hasDescription: !!newTask.description,
      });
    }
  };

  const updateTask = (task: Task) => {
    const updatedTask = { ...task, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_TASK', payload: updatedTask });

    if (typeof pendo !== 'undefined') {
      pendo.track('task_updated', {
        taskId: task.id,
        priority: task.priority,
        categoryId: task.categoryId,
        hasDueDate: !!task.dueDate,
        hasDueTime: !!task.dueTime,
        reminderType: task.reminder,
        subtaskCount: task.subtasks.length,
        hasDescription: !!task.description,
      });
    }
  };

  const deleteTask = (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    dispatch({ type: 'DELETE_TASK', payload: taskId });

    if (typeof pendo !== 'undefined' && task) {
      pendo.track('task_deleted', {
        taskId,
        taskStatus: task.status,
        taskPriority: task.priority,
        hadDueDate: !!task.dueDate,
        subtaskCount: task.subtasks.length,
        categoryId: task.categoryId,
      });
    }
  };

  const toggleTaskStatus = (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    dispatch({ type: 'TOGGLE_TASK_STATUS', payload: taskId });

    if (typeof pendo !== 'undefined' && task) {
      if (task.status === 'pending') {
        const completedSubtasks = task.subtasks.filter(s => s.completed).length;
        const timeSinceCreation = Math.round(
          (Date.now() - new Date(task.createdAt).getTime()) / 1000
        );
        pendo.track('task_completed', {
          taskId,
          taskPriority: task.priority,
          categoryId: task.categoryId,
          hadDueDate: !!task.dueDate,
          wasOverdue: task.dueDate
            ? new Date(task.dueDate).getTime() < Date.now()
            : false,
          subtaskCount: task.subtasks.length,
          completedSubtaskCount: completedSubtasks,
          timeSinceCreation,
        });
      } else {
        const timeSinceCompletion = task.completedAt
          ? Math.round(
              (Date.now() - new Date(task.completedAt).getTime()) / 1000
            )
          : 0;
        pendo.track('task_uncompleted', {
          taskId,
          taskPriority: task.priority,
          categoryId: task.categoryId,
          timeSinceCompletion,
        });
      }
    }
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    dispatch({ type: 'TOGGLE_SUBTASK', payload: { taskId, subtaskId } });

    if (typeof pendo !== 'undefined' && task) {
      const subtask = task.subtasks.find(s => s.id === subtaskId);
      if (subtask && !subtask.completed) {
        const completedBefore = task.subtasks.filter(s => s.completed).length;
        const completedAfter = completedBefore + 1;
        pendo.track('subtask_completed', {
          taskId,
          subtaskId,
          totalSubtasks: task.subtasks.length,
          completedSubtasks: completedAfter,
          progressPercentage: Math.round(
            (completedAfter / task.subtasks.length) * 100
          ),
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

    if (typeof pendo !== 'undefined') {
      pendo.track('category_created', {
        categoryId: newCategory.id,
        categoryName: newCategory.name,
        categoryColor: newCategory.color,
        totalCategoryCount: state.categories.length + 1,
      });
    }
  };

  const updateCategory = (category: Category) => {
    dispatch({ type: 'UPDATE_CATEGORY', payload: category });

    if (typeof pendo !== 'undefined') {
      pendo.track('category_updated', {
        categoryId: category.id,
        categoryName: category.name,
        categoryColor: category.color,
      });
    }
  };

  const deleteCategory = (categoryId: string, reassignTo: string) => {
    const category = state.categories.find(c => c.id === categoryId);
    const affectedTaskCount = state.tasks.filter(t => t.categoryId === categoryId).length;
    dispatch({ type: 'DELETE_CATEGORY', payload: { categoryId, reassignTo } });

    if (typeof pendo !== 'undefined') {
      pendo.track('category_deleted', {
        categoryId,
        categoryName: category?.name || '',
        reassignToCategoryId: reassignTo,
        affectedTaskCount,
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
