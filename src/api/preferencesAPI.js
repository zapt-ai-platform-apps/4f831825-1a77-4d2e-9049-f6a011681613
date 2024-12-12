export const getPreferences = async (session) => {
  const response = await fetch('/api/getPreferences', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });
  return response;
};

export const savePreferences = async (session, filteredPreferences) => {
  const response = await fetch('/api/savePreferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ data: filteredPreferences }),
  });
  return response;
};

export const generateTimetable = async (session) => {
  const response = await fetch('/api/generateTimetable', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });
  return response;
};