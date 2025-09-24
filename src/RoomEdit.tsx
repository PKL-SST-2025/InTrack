import { createSignal, Index, onMount } from 'solid-js';
import { createStore } from 'solid-js/store';
import { A, useParams, useNavigate, useSearchParams } from '@solidjs/router';
import { BACKEND_URL } from './config';

const RoomEdit = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roomId = () => searchParams.id || params.id;
  
  // Signals for form fields
  const [roomName, setRoomName] = createSignal('');
  const [roomQuote, setRoomQuote] = createSignal('');
  const [whoCanJoin, setWhoCanJoin] = createSignal('Anyone with room link or code');
  const [joinMethod, setJoinMethod] = createSignal('Link and room code');
  // Join info signals
  const [joinLink, setJoinLink] = createSignal('');
  const [joinCode, setJoinCode] = createSignal('');
  // Delete modal signal
  const [showDeleteModal, setShowDeleteModal] = createSignal(false);
  // Loading and error states
  const [loading, setLoading] = createSignal(true);
  const [submitting, setSubmitting] = createSignal(false);
  const [errorMsg, setErrorMsg] = createSignal('');
  // Filling settings
  const [fillingFrequency, setFillingFrequency] = createSignal('');
  const [dueDays, setDueDays] = createSignal('');
  const [allowMissed, setAllowMissed] = createSignal('No');
  let nextFieldId = 1;
  const [fields, setFields] = createStore([
    { id: nextFieldId, label: '', label2: '', placeholder: '', placeholder_from: '', placeholder_to: '', type: 'Text', condition: 'None', condition_field_id: null as number | null, ord: 0 }
  ]);

  // Profile photo (match RoomCreate behavior)
  const [roomPfp, setRoomPfp] = createSignal<string>('');
  const [selectedPfpFile, setSelectedPfpFile] = createSignal<File | null>(null);
  let fileInputRef: HTMLInputElement | undefined;

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
    const randomLink = `localhost:5173/join/room_${Math.random().toString(36).substring(2, 8)}`;
    setJoinCode(randomCode);
    setJoinLink(randomLink);
  }

  // Load room data
  async function loadRoomData() {
    if (!roomId()) {
      // no id in route; stop loading and show an error
      setErrorMsg('missing room id in route');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${BACKEND_URL}/rooms/${roomId()}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error('Failed to load room data');
      }

      const data = await res.json();
      
      // Set form data
      setRoomName(data.name || '');
      setRoomQuote(data.quote || '');
      setWhoCanJoin(data.who_can_join || 'Anyone with room link or code');
      setJoinMethod(data.join_method || 'Link and room code');
      setFillingFrequency(data.filling_frequency || '');
      setDueDays(data.due_days ? data.due_days.toString() : '');
      setAllowMissed(data.allow_missed ? 'Yes' : 'No');
      setRoomPfp(data.profile_picture || '');
      
      // Set join info
      if (data.join_link) {
        setJoinLink(data.join_link);
      }
      if (data.code) {
        setJoinCode(data.code);
      }
      
      // Set fields
      if (data.fields && data.fields.length > 0) {
        const mappedFields = data.fields.map((f: any) => ({
          id: f.id,
          label: f.label || '',
          label2: f.label2 || '',
          placeholder: f.placeholder || '',
          placeholder_from: f.placeholder_from || '',
          placeholder_to: f.placeholder_to || '',
          type: f.field_type || 'Text',
          condition: f.condition || 'None',
          condition_field_id: f.condition_field_id ?? null, // already ord
          ord: f.ord || 0,
        }));
        setFields(mappedFields);
        
        // Update nextFieldId to avoid conflicts
        nextFieldId = Math.max(...mappedFields.map((f: any) => f.id), 0) + 1;
      }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Failed to load room data');
    } finally {
      setLoading(false);
    }
  }

  // Save room changes
  async function saveRoom() {
    if (submitting()) return;
    setErrorMsg('');
    
    // Basic client validation
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
        join_link: joinLink(),
        profile_picture: roomPfp() || null,
        fields: fields.map((f) => ({
          label: f.label,
          label2: f.label2 || null,
          placeholder: f.placeholder || null,
          placeholder_from: f.placeholder_from || null,
          placeholder_to: f.placeholder_to || null,
          type: f.type,
          condition: f.condition || 'None',
          condition_field_id: f.condition_field_id, // ord
        })),
      };

      const res = await fetch(`${BACKEND_URL}/rooms/${roomId()}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to update room');
      }

      // Navigate back to room details or rooms list
      navigate('/Rooms');
    } catch (e: any) {
      setErrorMsg(e?.message || 'Failed to update room');
    } finally {
      setSubmitting(false);
    }
  }

  // Delete room handler
  async function handleDeleteRoom() {
    setShowDeleteModal(false);
    
    try {
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${BACKEND_URL}/rooms/${roomId()}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error('Failed to delete room');
      }

      navigate('/Rooms');
    } catch (e: any) {
      setErrorMsg(e?.message || 'Failed to delete room');
    }
  }

  // Helper to get field label by ord
  function getFieldLabelByOrder(ord: number | null): string {
    if (ord === null) return '';
    const f = fields.find(f => f.ord === ord);
    return f?.label || `Field ${ord + 1}`;
  }

  // Convert database condition_field_id to field ord
  function dbIdToFieldOrd(dbId: number | null): number | null {
    if (!dbId) return null;
    const field = fields.find(f => f.id === dbId);
    return field?.ord ?? null;
  }

  // Convert field ord to database id for saving
  function fieldOrdToDbId(ord: number | null): number | null {
    if (ord === null) return null;
    const field = fields.find(f => f.ord === ord);
    return field?.id || null;
  }

  // Upload profile picture
  async function uploadProfilePicture(file: File) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const token = localStorage.getItem('token') || '';
      const res = await fetch(`${BACKEND_URL}/upload-profile-picture`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to upload profile picture');
      }

      const data = await res.json();
      return data.url; // Assuming backend returns { url: "..." }
    } catch (e: any) {
      setErrorMsg(e?.message || 'Failed to upload profile picture');
      return null;
    }
  }

  // Handle profile picture change
  async function handleProfilePictureChange(file: File | null) {
    if (!file) {
      setSelectedPfpFile(null);
      return;
    }

    setSelectedPfpFile(file);
    
    // Upload immediately and update room profile picture
    const uploadedUrl = await uploadProfilePicture(file);
    if (uploadedUrl) {
      setRoomPfp(uploadedUrl);
      
      // Also update the room in the backend
      try {
        const token = localStorage.getItem('token') || '';
        await fetch(`${BACKEND_URL}/rooms/${roomId()}/profile-picture`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ profile_picture: uploadedUrl }),
        });
      } catch (e: any) {
        setErrorMsg(e?.message || 'Failed to update room profile picture');
      }
    }
  }

  // Load data on mount
  onMount(() => {
    loadRoomData();
  });
  
  // Recompute ords after any list change
  function recomputeOrds() {
    const next = fields.map((f, i) => ({ ...f, ord: i }));
    setFields(next);
  }

  // Dynamic fields logic
  function addField() {
    nextFieldId += 1;
    setFields([
      ...fields,
      { id: nextFieldId, label: '', label2: '', placeholder: '', placeholder_from: '', placeholder_to: '', type: 'Text', condition: 'None', condition_field_id: null, ord: fields.length }
    ]);
    recomputeOrds();
  }
  function updateField(idx: number, key: any, value: any) {
    setFields(idx, key as any, value as any);
  }
  function removeField(idx: number) {
    const arr = fields;
    if (arr.length <= 1) return; // keep at least one
    const next = arr.filter((_, i) => i !== idx);
    setFields(next);
    recomputeOrds();
  }

  function moveFieldUp(idx: number) {
    const i = idx as number;
    if (i <= 0) return;
    const arr = [...fields];
    const tmp = arr[i - 1];
    arr[i - 1] = arr[i];
    arr[i] = tmp;
    setFields(arr);
    recomputeOrds();
  }

  function moveFieldDown(idx: number) {
    const i = idx as number;
    if (i >= fields.length - 1) return;
    const arr = [...fields];
    const tmp = arr[i + 1];
    arr[i + 1] = arr[i];
    arr[i] = tmp;
    setFields(arr);
    recomputeOrds();
  }

  async function onPickRoomPfp() {
    fileInputRef?.click();
  }

  async function onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      handleProfilePictureChange(file);
    }
    if (input) input.value = '';
  }

  return (
    <div class="flex-1 flex flex-col bg-[#ededed]">
      <div class="p-8 w-full max-w-screen-2xl mx-auto">
        <div class="flex items-center gap-2 mb-6">
          <A href="/Rooms" class="text-2xl font-bold text-black hover:text-orange-600 transition-colors" style={{ 'text-decoration': 'none' }}>Rooms</A>
          <span class="text-2xl font-bold text-black">/</span>
          <span class="text-2xl font-bold text-gray-600">Edit</span>
        </div>
        <div class="bg-white rounded-2xl p-6 shadow-[0_0_16px_0_rgba(0,0,0,0.10)] relative">
          {loading() && (
            <div class="flex items-center justify-center py-12">
              <div class="text-lg text-gray-600">Loading room data...</div>
            </div>
          )}
          {!loading() && (
            <>
          <div class="absolute right-6 top-6 flex flex-col gap-2 z-0 items-end">
            {errorMsg() && (
              <div class="text-sm text-red-600">{errorMsg()}</div>
            )}
            <div class="flex gap-4">
              <A href="/Rooms" class="rounded-lg border border-gray-300 px-4 py-2 font-medium bg-white text-black hover:bg-gray-100 shadow-sm">Discard</A>
              <button
                type="button"
                class="rounded-lg border px-4 py-2 font-medium bg-orange-500 text-white hover:bg-orange-600 shadow-sm disabled:opacity-60"
                disabled={submitting() || loading()}
                onClick={saveRoom}
              >
                {submitting() ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row items-center gap-6 mt-2 mb-8">
            <div class="relative">
              <img 
                src={
                  roomPfp()
                    ? (roomPfp().startsWith('/')
                        ? `${BACKEND_URL}${roomPfp()}`
                        : roomPfp())
                    : "https://api.dicebear.com/7.x/bottts/svg?seed=Room"
                }
                alt="Room Profile" 
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
                                <label class="block text-sm font-medium text-gray-700 mb-1">Placeholder (No image chosen)</label>
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
                              <option value="">{field().condition_field_id !== null ? getFieldLabelByOrder(field().condition_field_id) : 'Select field...'}</option>
                              {(() => {
                                const cur = typeof (i as any) === 'function' ? (i as any)() : (i as unknown as number);
                                return fields.map((f, j: number) => (
                                  j === cur ? null : (
                                    <option value={String(f.ord)}>{f.label || `Field ${f.ord + 1}`}</option>
                                  )
                                ));
                              })()}
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomEdit;
