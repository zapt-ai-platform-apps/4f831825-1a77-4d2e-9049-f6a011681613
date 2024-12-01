import { createSignal, For } from 'solid-js';
import { supabase } from '../supabaseClient';
import * as Sentry from '@sentry/browser';

function ExamForm(props) {
  const [newExam, setNewExam] = createSignal({
    subject: '',
    examDate: '',
    timeOfDay: 'Morning',
    board: '',
    teacher: '',
  });
  const [loading, setLoading] = createSignal(false);

  const isFormValid = () => {
    const exam = newExam();
    return exam.subject && exam.examDate && exam.board && exam.teacher;
  };

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
          timeOfDay: 'Morning',
          board: '',
          teacher: '',
        });
        props.onExamAdded();
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

  const timeOptions = ['Morning', 'Afternoon', 'Evening'];

  return (
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
        <select
          name="timeOfDay"
          value={newExam().timeOfDay}
          onChange={handleInputChange}
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent text-black box-border cursor-pointer"
        >
          <For each={timeOptions}>{(option) => (
            <option value={option}>{option}</option>
          )}</For>
        </select>
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
        {loading() ? 'Saving...' : 'Add Exam'}
      </button>
    </div>
  );
}

export default ExamForm;