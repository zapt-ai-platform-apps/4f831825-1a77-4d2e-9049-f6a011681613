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
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.subject || ''}
          onChange={(e) => onChange('subject', e.target.value)}
          placeholder="e.g., Mathematics"
          className={`w-full px-3 py-2 rounded bg-input text-black box-border ${
            errors.subject ? 'border border-red-500' : ''
          }`}
          required
        />
        {errors.subject && (
          <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Exam Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={formData.examDate || ''}
          onChange={(e) => onChange('examDate', e.target.value)}
          className={`w-full px-3 py-2 rounded bg-input text-black box-border ${
            errors.examDate ? 'border border-red-500' : ''
          }`}
          required
        />
        {errors.examDate && (
          <p className="text-red-500 text-xs mt-1">{errors.examDate}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Time of Day</label>
        <select
          value={formData.timeOfDay || 'Morning'}
          onChange={(e) => onChange('timeOfDay', e.target.value)}
          className="w-full px-3 py-2 rounded bg-input text-black box-border"
        >
          <option value="Morning">Morning</option>
          <option value="Afternoon">Afternoon</option>
          <option value="Evening">Evening</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Exam Board (Optional)</label>
        <input
          type="text"
          value={formData.board || ''}
          onChange={(e) => onChange('board', e.target.value)}
          placeholder="e.g., AQA, OCR"
          className="w-full px-3 py-2 rounded bg-input text-black box-border"
        />
      </div>
    </div>
  );
}

export default ExamFormFields;