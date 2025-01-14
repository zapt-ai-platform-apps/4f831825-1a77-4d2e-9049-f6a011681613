import React, { useState, useEffect } from 'react';

function ExamForm({ onExamSaved, editExam, onCancelEdit }) {
  const [examName, setExamName] = useState('');
  const [examDate, setExamDate] = useState('');

  useEffect(() => {
    if (editExam) {
      setExamName(editExam.name);
      setExamDate(editExam.date);
    } else {
      setExamName('');
      setExamDate('');
    }
  }, [editExam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editExam) {
        const { data, error } = await supabase
          .from('exams')
          .update({ name: examName, date: examDate })
          .eq('id', editExam.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('exams')
          .insert([{ name: examName, date: examDate }]);
        if (error) throw error;
      }
      onExamSaved();
    } catch (error) {
      console.error('Error saving exam:', error);
      Sentry.captureException(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Exam Name</label>
        <input
          type="text"
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
          required
          className="mt-1 p-2 w-full border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Exam Date</label>
        <input
          type="date"
          value={examDate}
          onChange={(e) => setExamDate(e.target.value)}
          required
          className="mt-1 p-2 w-full border rounded"
        />
      </div>
      <div className="flex justify-end space-x-2">
        {editExam && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {editExam ? 'Update Exam' : 'Add Exam'}
        </button>
      </div>
    </form>
  );
}

export default ExamForm;