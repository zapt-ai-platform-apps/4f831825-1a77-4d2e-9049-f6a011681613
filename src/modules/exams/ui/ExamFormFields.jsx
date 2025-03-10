import React from 'react';

/**
 * Component for exam form fields
 * @param {Object} props - Component props
 * @param {Object} props.formData - Form data state
 * @param {Function} props.onChange - Change handler function
 * @param {Object} props.editExam - Exam being edited (if any)
 * @param {Object} props.errors - Form validation errors
 * @returns {React.ReactElement} Form fields
 */
function ExamFormFields({ formData, onChange, editExam, errors = {} }) {
  // Common color options for exams
  const colorOptions = [
    { value: '#4285F4', label: 'Blue' },
    { value: '#0F9D58', label: 'Green' },
    { value: '#F4B400', label: 'Yellow' },
    { value: '#9C27B0', label: 'Purple' },
    { value: '#00BCD4', label: 'Cyan' },
    { value: '#3F51B5', label: 'Indigo' },
    { value: '#009688', label: 'Teal' },
    { value: '#795548', label: 'Brown' },
    { value: '#607D8B', label: 'Blue Grey' },
    { value: '#673AB7', label: 'Deep Purple' },
    { value: '#2196F3', label: 'Light Blue' },
    { value: '#00796B', label: 'Dark Teal' },
    { value: '#E91E63', label: 'Pink' },
    { value: '#FFA000', label: 'Amber' },
    { value: '#4CAF50', label: 'Light Green' },
    { value: '#8BC34A', label: 'Lime' },
    { value: '#FF5722', label: 'Deep Orange' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.subject || ''}
          onChange={(e) => onChange('subject', e.target.value)}
          placeholder="e.g., Mathematics"
          className={`w-full px-3 py-2 rounded bg-white border border-gray-300 text-black box-border ${
            errors.subject ? 'border border-red-500' : ''
          }`}
          required
        />
        {errors.subject && (
          <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Exam Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={formData.examDate || ''}
          onChange={(e) => onChange('examDate', e.target.value)}
          className={`w-full px-3 py-2 rounded bg-white border border-gray-300 text-black box-border ${
            errors.examDate ? 'border border-red-500' : ''
          }`}
          required
        />
        {errors.examDate && (
          <p className="text-red-500 text-xs mt-1">{errors.examDate}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Time of Day</label>
        <select
          value={formData.timeOfDay || 'Morning'}
          onChange={(e) => onChange('timeOfDay', e.target.value)}
          className="w-full px-3 py-2 rounded bg-white border border-gray-300 text-black box-border"
        >
          <option value="Morning">Morning</option>
          <option value="Afternoon">Afternoon</option>
          <option value="Evening">Evening</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Exam Board (Optional)</label>
        <input
          type="text"
          value={formData.board || ''}
          onChange={(e) => onChange('board', e.target.value)}
          placeholder="e.g., AQA, OCR"
          className="w-full px-3 py-2 rounded bg-white border border-gray-300 text-black box-border"
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <label className="block text-sm font-medium text-gray-700">Subject Color</label>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((color) => (
            <div 
              key={color.value} 
              className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                formData.examColour === color.value ? 'border-gray-800' : 'border-transparent'
              }`}
              style={{ backgroundColor: color.value }}
              onClick={() => onChange('examColour', color.value)}
              title={color.label}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ExamFormFields;