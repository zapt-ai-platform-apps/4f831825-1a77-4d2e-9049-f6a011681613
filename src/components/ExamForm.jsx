import { createSignal, Show, For, onMount } from 'solid-js';
import { supabase } from '../supabaseClient';
import * as Sentry from '@sentry/browser';

function ExamForm(props) {
  const [examData, setExamData] = createSignal({
    id: null,
    subject: '',
    examDate: '',
    timeOfDay: 'Morning',
    board: '',
    teacher: '',
  });
  const [loading, setLoading] = createSignal(false);

  onMount(() => {
    if (props.editExam) {
      setExamData({ ...props.editExam });
    }
  });

  const isFormValid = () => {
    const exam = examData();
    return exam.subject && exam.examDate && exam.board && exam.teacher;
  };

  const handleInputChange = (e) => {
    setExamData({ ...examData(), [e.target.name]: e.target.value });
  };

  const handleSaveExam = async () => {
    if (!isFormValid()) return;
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const url = examData().id ? '/api/updateExam' : '/api/saveExams';
      const method = examData().id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: examData() }),
      });

      if (response.ok) {
        setExamData({
          id: null,
          subject: '',
          examDate: '',
          timeOfDay: 'Morning',
          board: '',
          teacher: '',
        });
        props.onExamSaved();
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Error saving exam');
      }
    } catch (error) {
      console.error('Error saving exam:', error);
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  const timeOptions = ['Morning', 'Afternoon', 'Evening'];

  return (
    <div>
      <h3 class="text-xl font-semibold mb-2 text-center">
        {examData().id ? 'Edit Exam' : 'Add New Exam'}
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={examData().subject}
          onInput={handleInputChange}
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-black box-border"
        />
        <input
          type="date"
          name="examDate"
          placeholder="Exam Date"
          value={examData().examDate}
          onInput={handleInputChange}
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-black box-border"
        />
        <select
          name="timeOfDay"
          value={examData().timeOfDay}
          onInput={handleInputChange}
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-black box-border cursor-pointer"
        >
          <For each={timeOptions}>
            {(option) => <option value={option}>{option}</option>}
          </For>
        </select>
        <input
          type="text"
          name="board"
          placeholder="Examination Board"
          value={examData().board}
          onInput={handleInputChange}
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-black box-border"
        />
        <input
          type="text"
          name="teacher"
          placeholder="Teacher's Name"
          value={examData().teacher}
          onInput={handleInputChange}
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-black box-border"
        />
      </div>
      <div class="flex space-x-4 mt-4">
        <button
          class={`flex-1 px-6 py-3 ${
            loading() || !isFormValid()
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 transform hover:scale-105'
          } text-white rounded-lg transition duration-300 ease-in-out cursor-pointer`}
          onClick={handleSaveExam}
          disabled={loading() || !isFormValid()}
        >
          {loading() ? 'Saving...' : examData().id ? 'Update Exam' : 'Add Exam'}
        </button>
        <Show when={examData().id}>
          <button
            class="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
            onClick={() => {
              setExamData({
                id: null,
                subject: '',
                examDate: '',
                timeOfDay: 'Morning',
                board: '',
                teacher: '',
              });
              props.onCancelEdit();
            }}
          >
            Cancel
          </button>
        </Show>
      </div>
    </div>
  );
}

export default ExamForm;