import React, { useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { TaskFilter, TaskSort, Category } from '../../types';
import { Select } from '../common/Input';
import { Button } from '../common/Button';

interface TaskFiltersProps {
  filter: TaskFilter;
  sort: TaskSort;
  categories: Category[];
  onFilterChange: (filter: TaskFilter) => void;
  onSortChange: (sort: TaskSort) => void;
  onClearFilters: () => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filter,
  sort,
  categories,
  onFilterChange,
  onSortChange,
  onClearFilters,
}) => {
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousSortRef = useRef<TaskSort>(sort);

  const hasActiveFilters =
    filter.status !== 'all' ||
    filter.priority !== 'all' ||
    filter.categoryId !== 'all' ||
    filter.search !== '';

  // Track search with debounce
  useEffect(() => {
    if (filter.search) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        if (typeof window !== 'undefined' && (window as any).pendo) {
          // This would need results count from parent, so we'll track without it for now
          (window as any).pendo.track('task_search_performed', {
            search_query: filter.search,
            results_count: 0,
            query_length: filter.search.length
          });
        }
      }, 1000);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [filter.search]);

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'overdue', label: 'Overdue' },
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    ...categories.map(cat => ({ value: cat.id, label: cat.name })),
  ];

  const sortOptions = [
    { value: 'dueDate', label: 'Due Date' },
    { value: 'priority', label: 'Priority' },
    { value: 'createdAt', label: 'Created Date' },
    { value: 'title', label: 'Alphabetical' },
  ];

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={filter.search}
          onChange={e => onFilterChange({ ...filter, search: e.target.value })}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[140px]">
          <Select
            options={statusOptions}
            value={filter.status}
            onChange={e => {
              const newStatus = e.target.value as TaskFilter['status'];
              onFilterChange({ ...filter, status: newStatus });

              // Track filter change
              if (typeof window !== 'undefined' && (window as any).pendo) {
                (window as any).pendo.track('task_filter_applied', {
                  filter_type: 'status',
                  filter_value: newStatus,
                  results_count: 0,
                  has_multiple_filters: filter.priority !== 'all' || filter.categoryId !== 'all' || !!filter.search
                });
              }
            }}
          />
        </div>

        <div className="flex-1 min-w-[140px]">
          <Select
            options={priorityOptions}
            value={filter.priority}
            onChange={e => {
              const newPriority = e.target.value as TaskFilter['priority'];
              onFilterChange({ ...filter, priority: newPriority });

              // Track filter change
              if (typeof window !== 'undefined' && (window as any).pendo) {
                (window as any).pendo.track('task_filter_applied', {
                  filter_type: 'priority',
                  filter_value: newPriority,
                  results_count: 0,
                  has_multiple_filters: filter.status !== 'all' || filter.categoryId !== 'all' || !!filter.search
                });
              }
            }}
          />
        </div>

        <div className="flex-1 min-w-[140px]">
          <Select
            options={categoryOptions}
            value={filter.categoryId}
            onChange={e => {
              const newCategoryId = e.target.value;
              onFilterChange({ ...filter, categoryId: newCategoryId });

              // Track filter change
              if (typeof window !== 'undefined' && (window as any).pendo) {
                (window as any).pendo.track('task_filter_applied', {
                  filter_type: 'category',
                  filter_value: newCategoryId,
                  results_count: 0,
                  has_multiple_filters: filter.status !== 'all' || filter.priority !== 'all' || !!filter.search
                });
              }
            }}
          />
        </div>

        <div className="flex-1 min-w-[140px]">
          <Select
            options={sortOptions}
            value={sort}
            onChange={e => {
              const newSort = e.target.value as TaskSort;
              onSortChange(newSort);

              // Track sort change
              if (typeof window !== 'undefined' && (window as any).pendo) {
                (window as any).pendo.track('task_sort_changed', {
                  sort_by: newSort,
                  previous_sort: previousSortRef.current,
                  task_count: 0
                });
                previousSortRef.current = newSort;
              }
            }}
          />
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};
