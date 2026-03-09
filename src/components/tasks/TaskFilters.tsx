import React, { useRef, useCallback, useEffect } from 'react';
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
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search tracking
  const trackSearch = useCallback((query: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      if (query.trim() && typeof pendo !== 'undefined') {
        pendo.track('task_search_executed', {
          searchQuery: query.trim().substring(0, 100),
          activeFilters: JSON.stringify({
            status: filter.status,
            priority: filter.priority,
            categoryId: filter.categoryId,
          }),
        });
      }
    }, 500);
  }, [filter.status, filter.priority, filter.categoryId]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, []);

  const hasActiveFilters =
    filter.status !== 'all' ||
    filter.priority !== 'all' ||
    filter.categoryId !== 'all' ||
    filter.search !== '';

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
          onChange={e => {
            onFilterChange({ ...filter, search: e.target.value });
            trackSearch(e.target.value);
          }}
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
              if (typeof pendo !== 'undefined') {
                pendo.track('task_filters_applied', {
                  statusFilter: newStatus,
                  priorityFilter: filter.priority,
                  categoryFilter: filter.categoryId,
                  sortBy: sort,
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
              if (typeof pendo !== 'undefined') {
                pendo.track('task_filters_applied', {
                  statusFilter: filter.status,
                  priorityFilter: newPriority,
                  categoryFilter: filter.categoryId,
                  sortBy: sort,
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
              if (typeof pendo !== 'undefined') {
                pendo.track('task_filters_applied', {
                  statusFilter: filter.status,
                  priorityFilter: filter.priority,
                  categoryFilter: newCategoryId,
                  sortBy: sort,
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
              if (typeof pendo !== 'undefined') {
                pendo.track('task_filters_applied', {
                  statusFilter: filter.status,
                  priorityFilter: filter.priority,
                  categoryFilter: filter.categoryId,
                  sortBy: newSort,
                });
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
