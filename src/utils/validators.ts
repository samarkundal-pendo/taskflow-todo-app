export interface ValidationError {
  field: string;
  message: string;
}

export interface TaskFormData {
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  priority: string;
  categoryId: string;
  reminder: string;
}

export const validateTaskForm = (data: TaskFormData, isEdit: boolean = false): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Title validation
  if (!data.title.trim()) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (data.title.length > 100) {
    errors.push({ field: 'title', message: 'Title must be 100 characters or less' });
  }

  // Description validation
  if (data.description.length > 500) {
    errors.push({ field: 'description', message: 'Description must be 500 characters or less' });
  }

  // Due date validation (only for new tasks)
  if (!isEdit && data.dueDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(data.dueDate);
    if (dueDate < today) {
      errors.push({ field: 'dueDate', message: 'Due date cannot be in the past' });
    }
  }

  // Priority validation
  if (!['high', 'medium', 'low'].includes(data.priority)) {
    errors.push({ field: 'priority', message: 'Please select a valid priority' });
  }

  return errors;
};

export const validateCategoryName = (name: string, existingNames: string[]): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!name.trim()) {
    errors.push({ field: 'name', message: 'Category name is required' });
  } else if (name.length > 30) {
    errors.push({ field: 'name', message: 'Category name must be 30 characters or less' });
  } else if (existingNames.map(n => n.toLowerCase()).includes(name.toLowerCase().trim())) {
    errors.push({ field: 'name', message: 'A category with this name already exists' });
  }

  return errors;
};
