import { createSignal, onMount, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { supabase } from '../supabaseClient';
import * as Sentry from '@sentry/browser';
import ExamForm from './ExamForm';
import ExamList from './ExamList';

function Exams() {
  const navigate = useNavigate();
  const [exams, setExams] = createSignal([]);
  const [loading, setLoading] = createSignal(false);
  const [editExam, setEditExam] = createSignal(null);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch('/api/getExams', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const { data } = await response.json();
        setExams(data);
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Error fetching exams');
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  onMount(fetchExams);

  const handleExamSaved = () => {
    fetchExams();
    setEditExam(null);
  };

  const handleEditExam = (exam) => {
    setEditExam(exam);
  };

  const handleCancelEdit = () => {
    setEditExam(null);
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch('/api/generateTimetable', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        navigate('/timetable');
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Error generating timetable');
      }
    } catch (error) {
      console.error('Error generating timetable:', error);
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="h-full flex flex-col text-white">
      <div class="flex-grow p-4 flex items-center justify-center">
        <div class="w-full max-w-full sm:max-w-4xl bg-white/90 rounded-lg p-6 shadow-lg text-black">
          <h2 class="text-2xl font-bold mb-4 text-center">Manage Your Exams</h2>
          <div class="space-y-6">
            <ExamForm
              onExamSaved={handleExamSaved}
              editExam={editExam()}
              onCancelEdit={handleCancelEdit}
            />
            <ExamList
              exams={exams()}
              onExamDeleted={fetchExams}
              onEditExam={handleEditExam}
            />
            <button
              class={`w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${
                loading() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleNext}
              disabled={loading()}
            >
              {loading() ? 'Generating Timetable...' : 'Generate Timetable'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Exams;