import { createSignal, onMount, For, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { supabase } from '../supabaseClient';

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

  const fetchExams = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let { data, error } = await supabase
        .from('exams')
        .select('*')
        .eq('user_id', user.id)
        .gte('exam_date', new Date().toISOString().split('T')[0])
        .order('exam_date', { ascending: true });
      if (error) throw error;
      setExams(data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  onMount(fetchExams);

  const handleInputChange = (e) => {
    setNewExam({ ...newExam(), [e.target.name]: e.target.value });
  };

  const handleAddExam = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('exams')
        .insert({ ...newExam(), user_id: user.id });
      if (error) throw error;
      setNewExam({
        subject: '',
        examDate: '',
        board: '',
        teacher: '',
      });
      fetchExams();
    } catch (error) {
      console.error('Error adding exam:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (examId) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('exams')
        .delete()
        .eq('id', examId);
      if (error) throw error;
      fetchExams();
    } catch (error) {
      console.error('Error deleting exam:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditExam = async (exam) => {
    // Implement edit functionality if needed
  };

  const handleNext = () => {
    navigate('/timetable');
  };

  return (
    <div class="max-w-4xl mx-auto">
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
            class={`w-full mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer ${
              loading() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={handleAddExam}
            disabled={loading()}
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
                    <p>Exam Date: {exam.exam_date}</p>
                    <p>Board: {exam.board}</p>
                    <p>Teacher: {exam.teacher}</p>
                  </div>
                  <div class="flex space-x-2">
                    {/* Uncomment when edit functionality is implemented */}
                    {/* <button
                      class="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
                      onClick={() => handleEditExam(exam)}
                    >
                      Edit
                    </button> */}
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
  );
}

export default Exams;