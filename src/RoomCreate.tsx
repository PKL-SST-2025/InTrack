import { createSignal, Index } from 'solid-js';
import { createStore } from 'solid-js/store';
import { A, useNavigate } from '@solidjs/router';
import { BACKEND_URL } from './config';


const RoomCreate = () => {
  // Signals for form fields
  const [roomName, setRoomName] = createSignal('');
  const [roomQuote, setRoomQuote] = createSignal('');
  const [whoCanJoin, setWhoCanJoin] = createSignal('Anyone with room link or code');
  const [joinMethod, setJoinMethod] = createSignal('Link and room code');
  // Filling settings
  const [fillingFrequency, setFillingFrequency] = createSignal('');
  const [dueDays, setDueDays] = createSignal('');
  const [submitting, setSubmitting] = createSignal(false);
  const [errorMsg, setErrorMsg] = createSignal('');
  const navigate = useNavigate();
  const [roomPfp, setRoomPfp] = createSignal<string>(''); // preview URL (object URL or remote)
  const [selectedPfpFile, setSelectedPfpFile] = createSignal<File | null>(null);
  let fileInputRef: HTMLInputElement | undefined;
  let nextFieldId = 1;
  const [fields, setFields] = createStore([{ id: nextFieldId, label: '', type: 'Text' }]);
  
  // Dynamic fields logic
  function addField() {
    nextFieldId += 1;
    setFields([...fields, { id: nextFieldId, label: '', type: 'Text' }]);
  }
  function updateField(idx: number, key: 'label' | 'type', value: string) {
    setFields(idx, key as any, value);
  }
  function removeField(idx: number) {
    const arr = fields;
    if (arr.length <= 1) return; // keep at least one
    const next = arr.filter((_, i) => i !== idx);
    setFields(next);
  }

  async function onPickRoomPfp() {
    fileInputRef?.click();
  }

  async function onFileSelected(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    // preview locally first; upload will be done after room is created
    const objUrl = URL.createObjectURL(file);
    setRoomPfp(prev => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return objUrl;
    });
    setSelectedPfpFile(file);
    if (input) input.value = '';
  }

  async function createRoom() {
    if (submitting()) return;
    setErrorMsg('');
    // basic client validation
    if (!roomName().trim()) {
      setErrorMsg('room name is required');
      return;
    }
    if (fields.some(f => !f.label.trim())) {
      setErrorMsg('all field labels are required');
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token') || '';
      const payload = {
        name: roomName(),
        quote: roomQuote() || null,
        who_can_join: whoCanJoin(),
        join_method: joinMethod(),
        filling_frequency: fillingFrequency() || null,
        due_days: dueDays() ? parseInt(dueDays(), 10) : null,
        fields: fields.map((f) => ({ label: f.label, type: f.type })),
      };
      let pfpUrl: string | null = null;
      // if a pfp was selected, upload it first
      if (selectedPfpFile()) {
        const uploadForm = new FormData();
        uploadForm.append('file', selectedPfpFile() as File);
        const upRes = await fetch(`${BACKEND_URL}/upload-profile-picture`, {
          method: 'POST',
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: uploadForm,
        });
        if (upRes.ok) {
          const upData = await upRes.json(); // { url }
          pfpUrl = `${BACKEND_URL}${upData.url}`;
        } else {
          // proceed without pfp if upload fails
          console.warn('pfp upload failed, creating room without it');
        }
      }

      const finalPayload = { ...payload, profile_picture: pfpUrl };

      const res = await fetch(`${BACKEND_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(finalPayload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'failed to create room');
      }

      // navigate to Rooms page on success
      navigate('/Rooms');
    } catch (e: any) {
      setErrorMsg(e?.message || 'failed to create room');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div class="flex-1 flex flex-col bg-[#ededed]">
      <div class="p-8 w-full max-w-screen-2xl mx-auto">
        <div class="flex items-center gap-2 mb-6">
  <A href="/Rooms" class="text-2xl font-bold text-gray-400 hover:text-gray-600 transition-colors" style={{ 'text-decoration': 'none' }}>Rooms</A>
  <span class="text-2xl font-bold text-black">/</span>
  <span class="text-2xl font-bold text-black">Create</span>
</div>
        <div class="bg-white rounded-2xl p-6 shadow-[0_0_16px_0_rgba(0,0,0,0.10)] relative">
          <div class="absolute right-6 top-6 flex flex-col gap-2 z-0 items-end">
            {errorMsg() && (
              <div class="text-sm text-red-600">{errorMsg()}</div>
            )}
            <button
              type="button"
              class="rounded-lg border px-4 py-2 font-medium bg-orange-500 text-white hover:bg-orange-600 shadow-sm disabled:opacity-60"
              disabled={submitting()}
              onClick={createRoom}
            >
              {submitting() ? 'Creating...' : 'Create'}
            </button>
          </div>
          <div class="flex flex-col sm:flex-row items-center gap-6 mt-2 mb-8">
            <div class="relative">
              <img 
                src={roomPfp() || "https://api.dicebear.com/7.x/bottts/svg?seed=Dzul Fikri"}
                alt="Profile" 
                class="rounded-full border-4 border-white shadow-[0_0_16px_0_rgba(0,0,0,0.10)] w-32 h-32 sm:w-40 sm:h-40 object-cover" 
              />
            </div>
            <div class="flex flex-col gap-4 items-center sm:items-start">
              <h2 class="text-xl font-semibold text-black">Profile Photo</h2>
              <div class="flex gap-3">
                <button type="button" onClick={onPickRoomPfp} class="rounded-lg border border-gray-300 px-4 py-2 text-sm sm:text-base font-medium bg-white text-gray-700 hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                  Change
                </button>
                <input
                  ref={el => (fileInputRef = el)}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/gif"
                  class="hidden"
                  onChange={onFileSelected}
                />
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
  </div>
  {/* Right column */}
  <div class="flex flex-col gap-6">
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
  </div>
</div>

{/* Default Filling Settings */}
<div class="mt-10">
      <h2 class="text-2xl md:text-3xl font-bold mb-6 text-black">Default Filling Settings</h2>
      <div class="flex flex-col gap-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Filling frequency</label>
            <select
              class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={fillingFrequency()}
              onInput={e => setFillingFrequency(e.currentTarget.value)}
            >
              <option value="">Select days...</option>
              <option>Daily</option>
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
        </div>
        <div>
          <h3 class="text-xl font-bold text-black mb-2 mt-4">Fields</h3>
          <div class="flex flex-col gap-4 mb-2">
            <Index each={fields}>
              {(field, i) => (
              <div class="flex flex-col gap-2" data-id={field().id}>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Label {i + 1}</label>
                    <input
                      type="text"
                      class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Title..."
                      value={field().label}
                      onInput={e => updateField(i, 'label', e.currentTarget.value)}
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Submission</label>
                    <select
                      class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={field().type}
                      onInput={e => updateField(i, 'type', e.currentTarget.value)}
                    >
                      <option>Text</option>
                      <option>Time</option>
                      <option>Photo</option>
                      <option>Checkbox</option>
                    </select>
                  </div>
                </div>
                <div class="flex justify-end">
                  <button
                    type="button"
                    class="rounded-lg border border-gray-300 px-4 py-2 text-sm sm:text-base font-medium bg-white text-gray-700 enabled:hover:bg-gray-50 shadow-sm focus:outline-none enabled:focus:ring-2 enabled:focus:ring-offset-2 enabled:focus:ring-orange-500 disabled:opacity-50"
                    onClick={() => removeField(i)}
                    disabled={fields.length <= 1}
                  >
                    Remove
                  </button>
                </div>
              </div>
              )}
            </Index>
          </div>
<button
  type="button"
  class="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm sm:text-base font-medium bg-white text-gray-700 hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 mt-2 transition"
  onClick={addField}
>
  Add another field
</button>
        </div>
      </div>
    </div>
  </div>
</div>
          
            
          </div>
  );
}

export default RoomCreate;
