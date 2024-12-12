import { For } from 'solid-js';

function ExamSection(props) {
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <div>
      <h4 class="text-lg font-semibold mb-2">Exams</h4>
      <div class="space-y-4">
        <For each={props.exams()}>
          {(exam) => (
            <div
              class="p-4 rounded-lg text-white"
              style={{
                'background-color': '#FF0000', // Bright red color for exams
              }}
            >
              <p class="font-semibold text-2xl">
                Exam: {capitalizeFirstLetter(exam.subject)}
              </p>
              <p>Time of Day: {exam.timeOfDay || 'Morning'}</p>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}

export default ExamSection;