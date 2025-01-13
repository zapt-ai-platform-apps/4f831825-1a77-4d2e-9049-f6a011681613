export const resetExamDataValues = () => ({
  id: null,
  subject: '',
  examDate: '',
  timeOfDay: 'Morning',
  board: '',
  teacher: '',
});

export const saveExamData = async (examData, accessToken) => {
  const url = examData.id ? '/api/updateExam' : '/api/saveExams';
  const method = examData.id ? 'PUT' : 'POST';

  const response = await fetch(url, {
    method: method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: examData }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Error saving exam');
  }
};