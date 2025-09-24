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
  const [allowMissed, setAllowMissed] = createSignal('No');
  const [submitting, setSubmitting] = createSignal(false);
  const [errorMsg, setErrorMsg] = createSignal('');
  const navigate = useNavigate();
  const [roomPfp, setRoomPfp] = createSignal<string>(''); // preview URL (object URL or remote)
  const [selectedPfpFile, setSelectedPfpFile] = createSignal<File | null>(null);
  let fileInputRef: HTMLInputElement | undefined;
  let nextFieldId = 1;
  const [fields, setFields] = createStore([
    { id: nextFieldId, label: '', label2: '', placeholder: '', placeholder_from: '', placeholder_to: '', type: 'Text', condition: 'None', condition_field_id: null as number | null }
  ]);
  
  // Dynamic fields logic
  function addField() {
    nextFieldId += 1;
    setFields([
      ...fields,
      { id: nextFieldId, label: '', label2: '', placeholder: '', placeholder_from: '', placeholder_to: '', type: 'Text', condition: 'None', condition_field_id: null }
    ]);
  }
  function updateField(idx: number, key: any, value: any) {
    setFields(idx, key as any, value as any);
  }
  function removeField(idx: number) {
    const arr = fields;
    if (arr.length <= 1) return; // keep at least one
    const next = arr.filter((_, i) => i !== idx);
    setFields(next);
  }

  function moveFieldUp(idx: number) {
    const i = idx as number;
    if (i <= 0) return;
    const arr = [...fields];
    const tmp = arr[i - 1];
    arr[i - 1] = arr[i];
    arr[i] = tmp;
    setFields(arr);
  }

  function moveFieldDown(idx: number) {
    const i = idx as number;
    if (i >= fields.length - 1) return;
    const arr = [...fields];
    const tmp = arr[i + 1];
    arr[i + 1] = arr[i];
    arr[i] = tmp;
    setFields(arr);
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
        allow_missed: allowMissed() === 'Yes',
        fields: fields.map((f) => ({
          label: f.label,
          label2: f.label2 || null,
          placeholder: f.placeholder || null,
          placeholder_from: f.placeholder_from || null,
          placeholder_to: f.placeholder_to || null,
          type: f.type,
          condition: f.condition || 'None',
          condition_field_id: f.condition_field_id ?? null,
        })),
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
  <A href="/Rooms" class="text-3xl font-bold text-black hover:text-orange-600 transition-colors" style={{ 'text-decoration': 'none' }}>Rooms</A>
  <span class="text-3xl font-bold text-black">/</span>
  <span class="text-3xl font-bold text-gray-600">Create</span>
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
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Allow missed date filling</label>
            <select
              class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              value={allowMissed()}
              onInput={e => setAllowMissed(e.currentTarget.value)}
            >
              <option>No</option>
              <option>Yes</option>
            </select>
          </div>
        </div>
        <div>
          <h3 class="text-xl font-bold text-black mb-2 mt-4">Fields</h3>
          <div class="flex flex-col gap-4 mb-2">
            <Index each={fields}>
              {(field, i) => (
              <div class="flex flex-col gap-2" data-id={field().id}>
                <div class="flex gap-4 items-stretch">
                  <div class="flex-1 flex flex-col gap-3">
                {(() => {
                  const t = field().type;
                  if (t === 'Text') {
                    return (
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Label</label>
                          <input
                            type="text"
                            class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Title..."
                            value={field().label}
                            onInput={e => updateField(i, 'label', e.currentTarget.value)}
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
                          <input
                            type="text"
                            class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Enter placeholder..."
                            value={field().placeholder}
                            onInput={e => updateField(i, 'placeholder', e.currentTarget.value)}
                          />
                        </div>
                      </div>
                    );
                  }
                  if (t === 'Time') {
                    return (
                      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Label</label>
                          <input
                            type="text"
                            class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Title..."
                            value={field().label}
                            onInput={e => updateField(i, 'label', e.currentTarget.value)}
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Placeholder From</label>
                          <input
                            type="text"
                            class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="From..."
                            value={field().placeholder_from}
                            onInput={e => updateField(i, 'placeholder_from', e.currentTarget.value)}
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Placeholder To</label>
                          <input
                            type="text"
                            class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="To..."
                            value={field().placeholder_to}
                            onInput={e => updateField(i, 'placeholder_to', e.currentTarget.value)}
                          />
                        </div>
                      </div>
                    );
                  }
                  if (t === 'Photo') {
                    return (
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Label</label>
                          <input
                            type="text"
                            class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="Title..."
                            value={field().label}
                            onInput={e => updateField(i, 'label', e.currentTarget.value)}
                          />
                        </div>
                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-1">Placeholder</label>
                          <input
                            type="text"
                            class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="No image chosen"
                            value={field().placeholder}
                            onInput={e => updateField(i, 'placeholder', e.currentTarget.value)}
                          />
                        </div>
                      </div>
                    );
                  }
                  // Checkbox
                  return (
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Label 1</label>
                        <input
                          type="text"
                          class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="First label..."
                          value={field().label}
                          onInput={e => updateField(i, 'label', e.currentTarget.value)}
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Label 2</label>
                        <input
                          type="text"
                          class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          placeholder="Second label..."
                          value={field().label2}
                          onInput={e => updateField(i, 'label2', e.currentTarget.value)}
                        />
                      </div>
                    </div>
                  );
                })()}
                <div class={`grid grid-cols-1 ${field().condition !== 'None' ? 'md:grid-cols-2' : ''} gap-4`}>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                    <select
                      class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      value={field().condition}
                      onInput={e => updateField(i, 'condition', e.currentTarget.value)}
                    >
                      <option>None</option>
                      <option>Enable if another field is filled/true</option>
                      <option>Disable if another field is filled/true</option>
                    </select>
                  </div>
                  {field().condition !== 'None' && (
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">What field?</label>
                      <select
                        class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        value={String(field().condition_field_id ?? '')}
                        onInput={e => updateField(i, 'condition_field_id', e.currentTarget.value ? parseInt(e.currentTarget.value) : null)}
                      >
                        <option value="">Select field...</option>
                        {fields.map((f, j) => {
                          if (j === (i as unknown as number)) return null;
                          return (
                            <option value={String(f.id)}>{f.label || `Field ${j + 1}`}</option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                </div>
                  </div>
                  <div class="shrink-0 h-full flex items-center">
                    <div class="grid grid-cols-2 grid-rows-2 gap-2 items-center">
                      <button
                        type="button"
                        aria-label="Move field up"
                        class="rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 px-3 py-2 text-base"
                        onClick={() => moveFieldUp(i as unknown as number)}
                        disabled={(i as unknown as number) === 0}
                        title="Move up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        aria-label="Move field down"
                        class="rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 px-3 py-2 text-base"
                        onClick={() => moveFieldDown(i as unknown as number)}
                        disabled={(i as unknown as number) >= fields.length - 1}
                        title="Move down"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        aria-label="Remove field"
                        class="col-span-2 inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 px-4 py-2.5 text-base"
                        onClick={() => removeField(i)}
                        disabled={fields.length <= 1}
                        title="Remove"
                      >
                        <span class="hidden md:inline">✕</span>
                        <span class="md:hidden">Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
                {(i as unknown as number) < fields.length - 1 && (
                  <div class="h-px bg-gray-200 my-2"></div>
                )}
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
