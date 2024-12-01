import { createSignal, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { supabase } from '../supabaseClient';
import * as Sentry from '@sentry/browser';
import ExamForm from './ExamForm';
import ExamList from './ExamList';

function Exams() {
  const navigate = useNavigate();
  const [exams, setExams] = createSignal([]);
  const [loading, setLoading] = createSignal(false);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/getExams', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
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

  const handleAddExam = () => {
    fetchExams();
  };

  const handleDeleteExam = () => {
    fetchExams();
  };

  const handleNext = () => {
    navigate('/timetable?regenerate=true');
  };

  return (
    <div class="min-h-screen flex flex-col text-white">
      <div class="flex-grow p-4">
        <div class="w-full max-w-full sm:max-w-4xl mx-auto">
          <h2 class="text-2xl font-bold mb-4">Manage Your Exams</h2>
          <div class="space-y-6">
            <ExamForm onExamAdded={handleAddExam} />
            <ExamList exams={exams()} onExamDeleted={handleDeleteExam} loading={loading()} />
            <button
              class="w-full px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
              onClick={handleNext}
            >
              Generate Timetable
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Exams;