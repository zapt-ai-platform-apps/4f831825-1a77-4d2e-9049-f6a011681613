export async function saveExam(formData, editExam) {
  const url = editExam ? '/api/updateExam' : '/api/saveExams';
  const method = editExam ? 'PUT' : 'POST';
  const body = editExam
    ? { data: { id: editExam.id, ...formData } }
    : { data: { ...formData } };

  const response = await fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to save exam.');
  }
}