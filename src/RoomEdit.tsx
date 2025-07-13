import { createSignal } from 'solid-js';
import { A } from '@solidjs/router';

const RoomEdit = () => {
  // Signals for form fields
  const [roomName, setRoomName] = createSignal('MD fanart submission');
  const [roomQuote, setRoomQuote] = createSignal('absolutely no n haters here');
  const [whoCanJoin, setWhoCanJoin] = createSignal('Anyone with room link or code');
  const [joinMethod, setJoinMethod] = createSignal('Link and room code');
  // Join info signals
  const [joinLink, setJoinLink] = createSignal('https://intrack.com/join/abc_123');
  const [joinCode, setJoinCode] = createSignal('727420');
  // Delete modal signal
  const [showDeleteModal, setShowDeleteModal] = createSignal(false);
  // Delete handler
  function handleDeleteRoom() {
    setShowDeleteModal(false);
    window.location.href = '/Rooms';
  }
  // Filling settings
  const [fillingFrequency, setFillingFrequency] = createSignal('Daily');
  const [dueDays, setDueDays] = createSignal('');
  const [fields, setFields] = createSignal([{ label: '', type: 'Text' }]);

  // Copy handlers
  function copyJoinLink() {
    navigator.clipboard.writeText(joinLink());
  }
  function copyJoinCode() {
    navigator.clipboard.writeText(joinCode());
  }
  // Reset handler
  function resetJoinInfo() {
    // Generate random code and link for demo
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    const randomLink = `https://intrack.com/join/room_${Math.random().toString(36).substring(2, 8)}`;
    setJoinCode(randomCode);
    setJoinLink(randomLink);
  }
  
  // Dynamic fields logic
  function addField() {
    setFields([...fields(), { label: '', type: 'Text' }]);
  }
  function updateField(idx: number, key: 'label' | 'type', value: string) {
    const updated = fields().map((f, i) => i === idx ? { ...f, [key]: value } : f);
    setFields(updated);
  }

  return (
    <div class="flex-1 flex flex-col bg-[#ededed]">
      <div class="p-8 w-full max-w-screen-2xl mx-auto">
        <div class="flex items-center gap-2 mb-6">
          <A href="/Rooms" class="text-2xl font-bold text-gray-400 hover:text-gray-600 transition-colors" style={{ 'text-decoration': 'none' }}>Rooms</A>
          <span class="text-2xl font-bold text-black">/</span>
          <span class="text-2xl font-bold text-black">Edit</span>
        </div>
        <div class="bg-white rounded-2xl p-6 shadow-[0_0_16px_0_rgba(0,0,0,0.10)] relative">
          <div class="absolute right-6 top-6 flex gap-4 z-0">
            <A href="/RoomOwner" class="rounded-lg border border-gray-300 px-4 py-2 font-medium bg-white text-black hover:bg-gray-100 shadow-sm">Discard</A>
            <A href="/RoomOwner" class="rounded-lg border px-4 py-2 font-medium bg-orange-500 text-white hover:bg-orange-600 shadow-sm">Save Changes</A>
          </div>
          <div class="flex flex-col sm:flex-row items-center gap-6 mt-2 mb-8">
            <div class="relative">
              <img 
                src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSQNkZ5z-20nouxxzVssKbPdA26QR0ll9hFmqGyBtQ-bcgRlek2" 
                alt="Profile" 
                class="rounded-full border-4 border-white shadow-[0_0_16px_0_rgba(0,0,0,0.10)] w-32 h-32 sm:w-40 sm:h-40 object-cover" 
              />
            </div>
            <div class="flex flex-col gap-4 items-center sm:items-start">
              <h2 class="text-xl font-semibold text-black">Profile Photo</h2>
              <div class="flex gap-3">
                <button class="rounded-lg border border-gray-300 px-4 py-2 text-sm sm:text-base font-medium bg-white text-gray-700 hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                  Change
                </button>
              </div>
              <p class="text-xs text-gray-500 text-center sm:text-left">JPG, GIF or PNG. Max size of 2MB</p>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
            {/* Left column */}
            <div class="flex flex-col gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Room name</label>
                <input
                  type="text"
                  class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Coolest Room Name..."
                  value={roomName()}
                  onInput={e => setRoomName(e.currentTarget.value)}
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Room quote</label>
                <input
                  type="text"
                  class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Coolest Room Quote..."
                  value={roomQuote()}
                  onInput={e => setRoomQuote(e.currentTarget.value)}
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Who can join</label>
                <select
                  class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={whoCanJoin()}
                  onInput={e => setWhoCanJoin(e.currentTarget.value)}
                >
                  <option>Anyone with room link or code</option>
                  <option>No one</option>
                </select>
              </div>
            </div>
            {/* Right column */}
            <div class="flex flex-col gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Join method</label>
                <select
                  class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={joinMethod()}
                  onInput={e => setJoinMethod(e.currentTarget.value)}
                >
                  <option>Link and room code</option>
                  <option>Room code only</option>
                  <option>Link only</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Join link</label>
                <div class="flex items-center gap-2">
                  <input
                    type="text"
                    class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-500 bg-gray-100 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    value={joinLink()}
                    readOnly
                  />
                  <button type="button" class="rounded-lg border border-gray-300 px-4 py-2 font-medium bg-white text-black hover:bg-gray-100 shadow-sm" onClick={copyJoinLink}>Copy</button>
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Join code</label>
                <div class="flex items-center gap-2">
                  <input
                    type="text"
                    class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-500 bg-gray-100 shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    value={joinCode()}
                    readOnly
                  />
                  <button type="button" class="rounded-lg border border-gray-300 px-4 py-2 font-medium bg-white text-black hover:bg-gray-100 shadow-sm" onClick={copyJoinCode}>Copy</button>
                </div>
              </div>
              <button
                type="button"
                class="w-full py-2 rounded-lg bg-white text-black font-medium mt-2 shadow-[0_0_8px_0_rgba(0,0,0,0.10)] hover:bg-gray-100 transition"
                onClick={resetJoinInfo}
              >
                Reset join link & code
              </button>
            </div>
          </div>

          {/* Default Filling Settings */}
          <div class="mt-10">
            <h2 class="text-2xl md:text-3xl font-bold mb-6 text-black">Default Filling Settings</h2>
            <div class="flex flex-col gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Filling frequency</label>
                <select
                  class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={fillingFrequency()}
                  onInput={e => setFillingFrequency(e.currentTarget.value)}
                >
                    <option value="">Select days...</option>
                    <option>Daily</option>
                    <option>Every other day</option>
                    <option>Weekly</option>
                    <option>Monday</option>
                    <option>Tuesday</option>
                    <option>Wednesday</option>
                    <option>Thursday</option>
                    <option>Friday</option>
                    <option>Saturday</option>
                    <option>Sunday</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Days till due date</label>
                <input
                  type="number"
                  min="1"
                  class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="How many days..."
                  value={dueDays()}
                  onInput={e => setDueDays(e.currentTarget.value)}
                />
              </div>
              <div>
                <h3 class="text-xl font-bold text-black mb-2 mt-4">Fields</h3>
                <div class="flex flex-col gap-4 mb-2">
                  {fields().map((field, idx) => (
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Label {idx + 1}</label>
                        <input
                          type="text"
                          class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Title..."
                          value={field.label}
                          onInput={e => updateField(idx, 'label', e.currentTarget.value)}
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Submission</label>
                        <select
                          class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          value={field.type}
                          onInput={e => updateField(idx, 'type', e.currentTarget.value)}
                        >
                          <option>Text</option>
                          <option>Time</option>
                          <option>Photo</option>
                          <option>Checkbox</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  class="w-full py-2 rounded-lg bg-white text-black font-medium mt-2 shadow-[0_0_8px_0_rgba(0,0,0,0.10)] hover:bg-gray-100 transition"
                  onClick={addField}
                >
                  Add another field
                </button>
                <div class="mt-10 flex flex-col items-center">
                  <button
                    type="button"
                    class="rounded-lg border px-4 py-2 font-medium bg-red-500 text-white hover:bg-red-600 shadow-sm"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Delete room
                  </button>
                </div>
                {showDeleteModal() && (
                  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                    <div class="bg-white rounded-xl p-8 shadow-xl flex flex-col items-center max-w-sm w-full">
                      <div class="text-lg font-semibold mb-4 text-black text-center">Are you sure you want to delete this room?</div>
                      <div class="flex gap-4 mt-2">
                        <button
                          class="px-6 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition"
                          onClick={handleDeleteRoom}
                        >
                          Yes
                        </button>
                        <button
                          class="px-6 py-2 rounded-lg bg-gray-200 text-black font-medium hover:bg-gray-300 transition"
                          onClick={() => setShowDeleteModal(false)}
                        >
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomEdit;
