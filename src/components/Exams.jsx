```jsx
import { createSignal, onMount, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { supabase } from '../supabaseClient';
import * as Sentry from '@sentry/browser';

function Exams() {
  const navigate = useNavigate();
  const [exams, setExams] = createSignal([]);
  const [newExam, setNewExam] = createSignal({
    subject: '',
    examDate: '',
    board: '',
    teacher: '',
  });
  const [loading, setLoading] = createSignal(false);

  const isFormValid = () => {
    const exam = newExam();
    return exam.subject && exam.examDate && exam.board && exam.teacher;
  };

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

  const handleInputChange = (e) => {
    setNewExam({ ...newExam(), [e.target.name]: e.target.value });
  };

  const handleAddExam = async () => {
    if (!isFormValid()) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/saveExams', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: newExam() }),
      });

      if (response.ok) {
        setNewExam({
          subject: '',
          examDate: '',
          board: '',
          teacher: '',
        });
        fetchExams();
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Error adding exam');
      }
    } catch (error) {
      console.error('Error adding exam:', error);
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch('/api/deleteExam', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: examId }),
      });

      if (response.ok) {
        fetchExams();
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Error deleting exam');
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
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
            <div>
              <h3 class="text-xl font-semibold mb-2">Add New Exam</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="subject"
                  placeholder="Subject"
                  value={newExam().subject}
                  onInput={handleInputChange}
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-black box-border"
                />
                <input
                  type="date"
                  name="examDate"
                  placeholder="Exam Date"
                  value={newExam().examDate}
                  onInput={handleInputChange}
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-black box-border"
                />
                <input
                  type="text"
                  name="board"
                  placeholder="Examination Board"
                  value={newExam().board}
                  onInput={handleInputChange}
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-black box-border"
                />
                <input
                  type="text"
                  name="teacher"
                  placeholder="Teacher's Name"
                  value={newExam().teacher}
                  onInput={handleInputChange}
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-black box-border"
                />
              </div>
              <button
                class={`w-full mt-4 px-6 py-3 ${
                  loading() || !isFormValid() ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 transform hover:scale-105'
                } text-white rounded-lg transition duration-300 ease-in-out cursor-pointer`}
                onClick={handleAddExam}
                disabled={loading() || !isFormValid()}
              >
                <Show when={loading()} fallback="Add Exam">
                  Saving...
                </Show>
              </button>
            </div>
            <div>
              <h3 class="text-xl font-semibold mb-2">Upcoming Exams</h3>
              <Show when={!loading()} fallback={<p>Loading exams...</p>}>
                <For each={exams()}>
                  {(exam) => (
                    <div class="bg-gray-800 p-4 rounded-lg flex justify-between items-center mb-2">
                      <div>
                        <p class="font-semibold text-lg">{exam.subject}</p>
                        <p>Exam Date: {exam.examDate}</p>
                        <p>Board: {exam.board}</p>
                        <p>Teacher: {exam.teacher}</p>
                      </div>
                      <div class="flex space-x-2">
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
              </Show>
            </div>
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
```