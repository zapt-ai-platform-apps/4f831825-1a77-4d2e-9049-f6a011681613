import React, { useState, useEffect } from 'react';
import * as Sentry from '@sentry/react';
import { supabase } from '../supabaseClient';
import ExamFormFields from './ExamFormFields';
import { saveExamData, resetExamDataValues } from '../services/examService';

function ExamForm({ onExamSaved, editExam, onCancelEdit }) {
  const [examData, setExamData] = useState({
    id: null,
    subject: '',
    examDate: '',
    timeOfDay: 'Morning',
    board: '',
    teacher: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editExam) {
      setExamData({ ...editExam });
    } else {
      setExamData(resetExamDataValues());
    }
  }, [editExam]);

  const isFormValid = () => {
    const exam = examData;
    return exam.subject && exam.examDate && exam.board && exam.teacher;
  };

  const handleInputChange = (e) => {
    setExamData({ ...examData, [e.target.name]: e.target.value });
  };

  const handleSaveExam = async () => {
    if (!isFormValid()) return;
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      await saveExamData(examData, session.access_token);
      setExamData(resetExamDataValues());
      onExamSaved();
    } catch (error) {
      console.error('Error saving exam:', error);
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-2 text-center">
        {examData.id ? 'Edit Exam' : 'Add New Exam'}
      </h3>
      <ExamFormFields examData={examData} handleInputChange={handleInputChange} />
      <div className="flex space-x-4 mt-4">
        <button
          className={`flex-1 px-6 py-3 ${
            loading || !isFormValid()
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 transform hover:scale-105'
          } text-white rounded-lg transition duration-300 ease-in-out cursor-pointer`}
          onClick={handleSaveExam}
          disabled={loading || !isFormValid()}
        >
          {loading ? 'Saving...' : examData.id ? 'Update Exam' : 'Add Exam'}
        </button>
        {examData.id && (
          <button
            className="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
            onClick={() => {
              setExamData(resetExamDataValues());
              onCancelEdit();
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default ExamForm;