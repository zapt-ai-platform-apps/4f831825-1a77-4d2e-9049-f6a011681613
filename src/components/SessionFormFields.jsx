function SessionFormFields(props) {
  return (
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <select
        name="block"
        value={props.sessionData().block}
        onInput={props.handleInputChange}
        class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-black box-border cursor-pointer"
      >
        <option value="" disabled>Select Block</option>
        <option value="Morning">Morning</option>
        <option value="Afternoon">Afternoon</option>
        <option value="Evening">Evening</option>
      </select>
      <input
        type="text"
        name="subject"
        placeholder="Subject"
        value={props.sessionData().subject}
        onInput={props.handleInputChange}
        class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-black box-border"
      />
      <input
        type="time"
        name="startTime"
        value={props.sessionData().startTime}
        onInput={props.handleInputChange}
        class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-black box-border cursor-pointer"
      />
      <input
        type="time"
        name="endTime"
        value={props.sessionData().endTime}
        onInput={props.handleInputChange}
        class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent text-black box-border cursor-pointer"
      />
    </div>
  );
}

export default SessionFormFields;