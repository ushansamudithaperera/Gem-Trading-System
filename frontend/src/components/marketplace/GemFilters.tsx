import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { SlidersHorizontal, X } from 'lucide-react';

export interface FilterState {
  type: string;
  minPrice: number | '';
  maxPrice: number | '';
  minWeight: number | '';
  maxWeight: number | '';
  location: string;
}

interface GemFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export const GemFilters: React.FC<GemFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  isMobile = false,
  onClose,
}) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const handleChange = (key: keyof FilterState, value: string | number) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    if (isMobile && onClose) onClose();
  };

  const filterContent = (
    <div className="space-y-4">
      {/* Gem Type */}
      <div>
        <label className="block text-sm font-medium text-slate-900 mb-1">Gem Type</label>
        <select
          value={localFilters.type}
          onChange={(e) => handleChange('type', e.target.value)}
          className="w-full rounded-md border border-emerald-200 p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-slate-900"
        >
          <option value="">All Types</option>
          <option value="ROUGH">Rough</option>
          <option value="POLISHED">Polished</option>
        </select>
      </div>

      {/* Price Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Price Range ($)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={localFilters.minPrice === '' ? '' : localFilters.minPrice}
            onChange={(e) => handleChange('minPrice', e.target.value === '' ? '' : Number(e.target.value))}
            className="w-1/2 rounded-md border border-gray-300 p-2 text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={localFilters.maxPrice === '' ? '' : localFilters.maxPrice}
            onChange={(e) => handleChange('maxPrice', e.target.value === '' ? '' : Number(e.target.value))}
            className="w-1/2 rounded-md border border-gray-300 p-2 text-sm"
          />
        </div>
      </div>

      {/* Weight Range (Carats) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Weight (Carats)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={localFilters.minWeight === '' ? '' : localFilters.minWeight}
            onChange={(e) => handleChange('minWeight', e.target.value === '' ? '' : Number(e.target.value))}
            className="w-1/2 rounded-md border border-gray-300 p-2 text-sm"
          />
          <input
            type="number"
            placeholder="Max"
            value={localFilters.maxWeight === '' ? '' : localFilters.maxWeight}
            onChange={(e) => handleChange('maxWeight', e.target.value === '' ? '' : Number(e.target.value))}
            className="w-1/2 rounded-md border border-gray-300 p-2 text-sm"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <input
          type="text"
          placeholder="e.g., Ratnapura, Colombo"
          value={localFilters.location}
          onChange={(e) => handleChange('location', e.target.value)}
          className="w-full rounded-md border border-gray-300 p-2 text-sm"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-2 pt-2">
        <Button variant="outline" onClick={onReset} className="flex-1">
          Reset
        </Button>
        <Button onClick={handleApply} className="flex-1">
          Apply Filters
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 bg-white p-4 overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Filters</h2>
          <button onClick={onClose} className="p-2">
            <X className="h-5 w-5" />
          </button>
        </div>
        {filterContent}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="h-4 w-4" />
        <h3 className="font-semibold">Filters</h3>
      </div>
      {filterContent}
    </div>
  );
};