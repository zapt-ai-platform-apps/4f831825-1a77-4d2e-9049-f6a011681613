import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import * as Sentry from '@sentry/react';

function ExamForm({ onExamSaved, editExam, onCancelEdit }) {
  const [examSubject, setExamSubject] = useState('');
  const [examDate, setExamDate] = useState('');

  useEffect(() => {
    if (editExam) {
      setExamSubject(editExam.subject);
      setExamDate(editExam.examDate);
    } else {
      setExamSubject('');
      setExamDate('');
    }
  }, [editExam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editExam) {
        const { error } = await supabase
          .from('exams')
          .update({ subject: examSubject, examDate })
          .eq('id', editExam.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('exams')
          .insert([{ subject: examSubject, examDate }]);
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
        <label className="block text-sm font-medium">Subject</label>
        <input
          type="text"
          value={examSubject}
          onChange={(e) => setExamSubject(e.target.value)}
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
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded cursor-pointer"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
        >
          {editExam ? 'Update Exam' : 'Add Exam'}
        </button>
      </div>
    </form>
  );
}

export default ExamForm;