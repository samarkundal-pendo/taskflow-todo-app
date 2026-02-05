import React from 'react';
import { Check, X, GripVertical } from 'lucide-react';
import { Subtask } from '../../types';

interface SubtaskItemProps {
  subtask: Subtask;
  onToggle: () => void;
  onRemove: () => void;
  disabled?: boolean;
}

export const SubtaskItem: React.FC<SubtaskItemProps> = ({
  subtask,
  onToggle,
  onRemove,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg group">
      <GripVertical className="h-4 w-4 text-gray-300" />

      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={`
          flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center
          transition-colors
          ${subtask.completed
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 hover:border-green-500'
          }
          ${disabled ? 'cursor-not-allowed opacity-50' : ''}
        `}
      >
        {subtask.completed && <Check className="h-2.5 w-2.5" />}
      </button>

      <span
        className={`flex-1 text-sm ${
          subtask.completed ? 'text-gray-400 line-through' : 'text-gray-700'
        }`}
      >
        {subtask.title}
      </span>

      <button
        type="button"
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
        title="Remove subtask"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

interface SubtaskInputProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
}

export const SubtaskInput: React.FC<SubtaskInputProps> = ({
  value,
  onChange,
  onAdd,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAdd();
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a subtask..."
        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        type="button"
        onClick={onAdd}
        disabled={!value.trim()}
        className="px-3 py-2 text-sm font-medium text-blue-500 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Add
      </button>
    </div>
  );
};
