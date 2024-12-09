function StartDatePicker(props) {
  const preferences = props.preferences;
  const setPreferences = props.setPreferences;

  const handleStartDateChange = (e) => {
    setPreferences({ ...preferences(), startDate: e.target.value });
  };

  return (
    <div>
      <h3 class="text-xl font-semibold mb-2 text-center">Start Date</h3>
      <input
        type="date"
        value={preferences().startDate}
        onInput={handleStartDateChange}
        class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-black box-border cursor-pointer"
      />
    </div>
  );
}

export default StartDatePicker;