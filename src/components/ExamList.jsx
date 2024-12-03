import { For } from 'solid-js';
import { supabase } from '../supabaseClient';
import * as Sentry from '@sentry/browser';

function ExamList(props) {
  const handleDeleteExam = async (examId) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch('/api/deleteExam', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: examId }),
      });

      if (response.ok) {
        props.onExamDeleted();
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Error deleting exam');
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
      Sentry.captureException(error);
    }
  };

  const handleEditExam = (exam) => {
    props.onEditExam(exam);
  };

  return (
    <div>
      <h3 class="text-xl font-semibold mb-2 text-center">Upcoming Exams</h3>
      <For each={props.exams}>
        {(exam) => (
          <div class="bg-gray-200 p-4 rounded-lg flex justify-between items-center mb-2">
            <div>
              <p class="font-semibold text-lg text-black">{exam.subject}</p>
              <p class="text-black">Exam Date: {exam.examDate}</p>
              <p class="text-black">
                Time of Day: {exam.timeOfDay || 'Morning'}
              </p>
              <p class="text-black">Board: {exam.board}</p>
              <p class="text-black">Teacher: {exam.teacher}</p>
            </div>
            <div class="flex space-x-2">
              <button
                class="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                onClick={() => handleEditExam(exam)}
              >
                Edit
              </button>
              <button
                class="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                onClick={() => handleDeleteExam(exam.id)}
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </For>
    </div>
  );
}

export default ExamList;