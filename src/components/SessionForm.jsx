import { createSignal, createEffect, Show } from 'solid-js';
import SessionFormFields from './SessionFormFields';
import { saveSession } from '../services/sessionService';

function SessionForm(props) {
  const [sessionData, setSessionData] = createSignal({
    date: props.date,
    block: '',
    subject: '',
    startTime: '',
    endTime: '',
  });
  const [originalData, setOriginalData] = createSignal(null);
  const [loading, setLoading] = createSignal(false);

  createEffect(() => {
    if (props.editSession) {
      setSessionData({ ...props.editSession, date: props.date });
      setOriginalData({ ...props.editSession });
    } else {
      setSessionData({
        date: props.date,
        block: '',
        subject: '',
        startTime: '',
        endTime: '',
      });
      setOriginalData(null);
    }
  });

  const handleInputChange = (e) => {
    setSessionData({ ...sessionData(), [e.target.name]: e.target.value });
  };

  const isFormValid = () => {
    const session = sessionData();
    return session.block && session.subject && session.startTime && session.endTime;
  };

  const handleSaveSession = async () => {
    if (!isFormValid()) return;
    setLoading(true);
    try {
      await saveSession(originalData(), sessionData(), props.date, props.onSessionSaved);
      setSessionData({
        date: props.date,
        block: '',
        subject: '',
        startTime: '',
        endTime: '',
      });
      setOriginalData(null);
    } catch (error) {
      // Error handling is already done in saveSession
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="mt-4">
      <h3 class="text-lg font-semibold mb-2 text-center">
        {originalData() ? 'Edit Revision Session' : 'Add Revision Session'}
      </h3>
      <SessionFormFields sessionData={sessionData} handleInputChange={handleInputChange} />
      <div class="flex space-x-4 mt-4">
        <button
          class={`flex-1 px-6 py-3 ${
            loading() || !isFormValid()
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 transform hover:scale-105'
          } text-white rounded-lg transition duration-300 ease-in-out cursor-pointer`}
          onClick={handleSaveSession}
          disabled={loading() || !isFormValid()}
        >
          {loading() ? 'Saving...' : originalData() ? 'Update Session' : 'Add Session'}
        </button>
        <Show when={originalData()}>
          <button
            class="flex-1 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition duration-300 ease-in-out transform hover:scale-105 cursor-pointer"
            onClick={() => {
              setSessionData({
                date: props.date,
                block: '',
                subject: '',
                startTime: '',
                endTime: '',
              });
              setOriginalData(null);
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

export default SessionForm;