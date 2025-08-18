import { createSignal, onMount, Show } from 'solid-js';
import flatpickr from 'flatpickr';
import './flatpickr.css';
import { now } from '@amcharts/amcharts5/.internal/core/util/Time';
import { useNavigate, useParams, useSearchParams } from '@solidjs/router';
import { BACKEND_URL } from './config';

interface RoomField {
  id: number;
  label: string;
  field_type: string; // e.g., "Text" | "Photo" | "Time" | "Checkbox"
  ord: number;
}

interface RoomDetails {
  id: string;
  name: string;
  quote: string | null;
  profile_picture: string | null;
  owner_id: string;
  owner_name: string;
  owner_pfp: string | null;
  is_owner: boolean;
  filling_frequency?: string | null;
  due_days?: number | null;
  fields: RoomField[];
}

function getOrdinal(n: number) {
  if (n > 3 && n < 21) return 'th';
  switch (n % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

function formatDateWithOrdinal(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const day = d.getDate();
  const ordinal = getOrdinal(day);
  const month = d.toLocaleString('en-US', { month: 'long' });
  const year = d.getFullYear();
  return `${month} ${day}${ordinal} ${year}`;
}

// Use this as the source of truth for 'now'
const CURRENT_TIME = new Date(now());

function formatDue(dateStr: string) {
  if (!dateStr) return '';
  const selected = new Date(dateStr);
  if (isNaN(selected.getTime())) return '';

  // Remove time part for comparison
  const now = new Date(CURRENT_TIME);
  now.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);

  const diffDays = Math.round((selected.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  let prefix = '';
  if (diffDays === 0) prefix = 'Today';
  else if (diffDays === 1) prefix = 'Tomorrow';
  else if (diffDays === -1) prefix = 'Yesterday';
  else {
    // e.g. Jul 10, 2025
    prefix = selected.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return `${prefix}, 11:59 PM`;
}

function isPastOrToday(dateStr: string) {
  if (!dateStr) return false;
  const selected = new Date(dateStr);
  if (isNaN(selected.getTime())) return false;
  const now = new Date(CURRENT_TIME);
  now.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);
  return selected.getTime() <= now.getTime();
}

function addDaysToISO(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  d.setDate(d.getDate() + days);
  // keep only date part yyyy-mm-dd to feed existing formatter consistently
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// frequency: "Daily" or weekday name like "Monday", "Tuesday", ...
function isAllowedByFrequency(dateStr: string, freq?: string | null): boolean {
  if (!dateStr) return false;
  if (!freq || freq.toLowerCase() === 'daily') return true;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const dayName = weekdays[d.getDay()];
  return dayName.toLowerCase() === freq.toLowerCase();
}

// FillingForm component for attendance filling UI
function FillingForm(props: { dateLabel: string, fields: RoomField[], onCancel: () => void, onSubmit: () => void }) {
  // per-field values
  const [textValues, setTextValues] = createSignal<Record<number, string>>({});
  const [timeValues, setTimeValues] = createSignal<Record<number, { from: string; to: string }>>({});
  const [checkboxValues, setCheckboxValues] = createSignal<Record<number, boolean>>({});
  const [photoPreviews, setPhotoPreviews] = createSignal<Record<number, string | null>>({});

  // local refs for photo inputs
  const photoInputRefs: Record<number, HTMLInputElement | null> = {};

  const leftTypes = new Set(["Text", "Time", "Checkbox"]);
  const fieldsLeft = () => props.fields.filter(f => leftTypes.has(f.field_type)).sort((a,b) => a.ord - b.ord);
  const fieldsRight = () => props.fields.filter(f => f.field_type === "Photo").sort((a,b) => a.ord - b.ord);

  function resetFields() {
    setTextValues({});
    setTimeValues({});
    setCheckboxValues({});
    setPhotoPreviews({});
    // also clear file inputs
    Object.values(photoInputRefs).forEach(inp => { if (inp) inp.value = ""; });
  }

  function handlePhotoChange(id: number, e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoPreviews(prev => ({ ...prev, [id]: ev.target?.result as string }));
      reader.readAsDataURL(files[0]);
    } else {
      setPhotoPreviews(prev => ({ ...prev, [id]: null }));
    }
  }

  function allFieldsFilled() {
    // assume all fields required
    for (const f of props.fields) {
      if (f.field_type === "Text") {
        if (!textValues()[f.id]) return false;
      } else if (f.field_type === "Time") {
        const v = timeValues()[f.id];
        if (!v || !v.from || !v.to) return false;
      } else if (f.field_type === "Checkbox") {
        if (!checkboxValues()[f.id]) return false;
      } else if (f.field_type === "Photo") {
        if (!photoPreviews()[f.id]) return false;
      }
    }
    return true;
  }

  function handleCancel() {
    resetFields();
    props.onCancel();
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    // here we could assemble a payload by field id/type
    resetFields();
    props.onSubmit();
  }

  return (
    <>
      <div class="w-full text-base text-gray-600 mb-2">{props.dateLabel}</div>
      <div class="bg-white rounded-xl shadow-[0_0_16px_0_rgba(0,0,0,0.10)] p-6 w-full flex flex-row gap-8">
        {/* Left (2/3): Text / Time / Checkbox in ord */}
        <div class="flex-[2] flex flex-col gap-4 min-w-[200px]">
          {fieldsLeft().map(f => (
            <div>
              <div class="text-sm font-semibold text-black mb-1">{f.label}</div>
              {f.field_type === 'Text' && (
                <textarea
                  class="border rounded-lg px-3 py-2 w-full min-h-[60px] text-base focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none bg-white text-black"
                  placeholder={f.label}
                  value={textValues()[f.id] || ''}
                  onInput={e => setTextValues(prev => ({ ...prev, [f.id]: e.currentTarget.value }))}
                />
              )}
              {f.field_type === 'Time' && (
                <div class="flex flex-row items-center gap-2">
                  <input
                    class="border rounded-lg px-3 py-2 w-24 text-base focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white text-black"
                    type="text"
                    placeholder="From"
                    value={(timeValues()[f.id]?.from) || ''}
                    onInput={e => setTimeValues(prev => ({ ...prev, [f.id]: { from: e.currentTarget.value, to: prev[f.id]?.to || '' } }))}
                  />
                  <span class="text-gray-500">-</span>
                  <input
                    class="border rounded-lg px-3 py-2 w-24 text-base focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white text-black"
                    type="text"
                    placeholder="To"
                    value={(timeValues()[f.id]?.to) || ''}
                    onInput={e => setTimeValues(prev => ({ ...prev, [f.id]: { from: prev[f.id]?.from || '', to: e.currentTarget.value } }))}
                  />
                </div>
              )}
              {f.field_type === 'Checkbox' && (
                <label class="inline-flex items-center gap-2 text-black">
                  <input
                    type="checkbox"
                    checked={!!checkboxValues()[f.id]}
                    onChange={e => setCheckboxValues(prev => ({ ...prev, [f.id]: e.currentTarget.checked }))}
                  />
                  <span>{f.label}</span>
                </label>
              )}
            </div>
          ))}
        </div>
        {/* Right (1/3): Photo(s) */}
        <div class="flex-[1] flex flex-col gap-4 min-w-[220px] max-w-[260px] w-full">
          {fieldsRight().map(f => (
            <div class="flex flex-col items-center w-full">
              <div class="text-sm font-semibold text-black mb-1 self-start">{f.label}</div>
              <label class="flex flex-col items-center justify-center border border-gray-200 bg-gray-200 rounded-xl w-full h-40 cursor-pointer overflow-hidden relative shadow-[0_0_16px_0_rgba(0,0,0,0.10)]">
                <Show when={photoPreviews()[f.id]} fallback={<span class="text-gray-500">No image chosen</span>}>
                  <img src={photoPreviews()[f.id] as string} alt="Preview" class="object-contain w-full h-full" />
                </Show>
                <input
                  ref={el => (photoInputRefs[f.id] = el)}
                  type="file"
                  accept="image/*"
                  class="hidden"
                  onChange={e => handlePhotoChange(f.id, e)}
                  tabIndex={-1}
                />
              </label>
              <button
                class="mt-2 px-4 py-2 rounded-xl bg-orange-500 text-white font-semibold shadow hover:bg-orange-600 transition"
                onClick={() => { const ref = photoInputRefs[f.id]; if (ref) ref.click(); }}
                type="button"
              >
                Change
              </button>
            </div>
          ))}
        </div>
      </div>
      <div class="flex flex-row gap-6 mt-6 w-full">
        <button
          class="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-lg text-black shadow hover:bg-gray-100 font-semibold transition"
          onClick={handleCancel}
          type="button"
        >
          Cancel
        </button>
        <button
          class="flex-1 bg-orange-500 text-white rounded-xl px-4 py-3 text-lg font-semibold shadow hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          type="submit"
          disabled={!allFieldsFilled()}
        >
          Submit
        </button>
      </div>
    </>
  );
}

export default function Room() {
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const [date, setDate] = createSignal('');
  const [showModal, setShowModal] = createSignal(false);
  const [showFilledPopup, setShowFilledPopup] = createSignal(false);
  const [showFillingForm, setShowFillingForm] = createSignal(false);
  const [room, setRoom] = createSignal<RoomDetails | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const manageRequested = () => searchParams.manage === '1';
  const isOwner = () => !!room()?.is_owner;
  const manageMode = () => isOwner() && manageRequested();
  const [activeTab, setActiveTab] = createSignal<'overview' | 'members' | 'fields' | 'settings'>('overview');
  const [settingsPfp, setSettingsPfp] = createSignal<string>('');
  const [savingSettings, setSavingSettings] = createSignal(false);
  const [settingsMsg, setSettingsMsg] = createSignal<string | null>(null);
  let inputRef: HTMLInputElement | undefined;
  let fp: flatpickr.Instance | undefined;

  // Resets for FillingForm (called on cancel/submit)
  function resetFillingForm() {
    // No-op: handled inside FillingForm via local state reset
  }

  onMount(async () => {
    // fetch room details if id present
    const id = params.id;
    if (id) {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token') || '';
      // no token, force login
      if (!token) {
        navigate('/Login');
        return;
      }
      try {
        const res = await fetch(`${BACKEND_URL}/rooms/${id}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });
        if (res.ok) {
          const data = (await res.json()) as RoomDetails;
          setRoom(data);
          setSettingsPfp(data.profile_picture || '');
        } else {
          const t = await res.text();
          console.error('failed to load room:', res.status, t);
          if (res.status === 401) {
            setError('you are not authorized. please login again.');
            // clear token and redirect to login
            try { localStorage.removeItem('token'); } catch {}
            navigate('/Login');
          }
          else if (res.status === 404) setError('room not found.');
          else setError('failed to load room.');
        }
      } catch (e) {
        console.error('error loading room:', e);
        setError('network error while loading room.');
      } finally {
        setLoading(false);
      }
    }
    if (inputRef) {
      fp = flatpickr(inputRef, {
        dateFormat: 'Y-m-d',
        defaultDate: date() || undefined,
        onChange: (_: any, dateStr: string) => {
          setDate(dateStr);
          // close any open FillingForm when date changes
          setShowFillingForm(false);
          resetFillingForm();
        },
        allowInput: false,
      });
    }
  });
  return (
    <div class="min-h-screen bg-[#ededed] p-8 w-full max-w-screen-2xl mx-auto">
      {/* loading and error states */}
      <Show when={loading()}>
        <div class="mb-4 p-3 rounded-lg bg-white border border-gray-200 text-black">loading room...</div>
      </Show>
      <Show when={error()}>
        <div class="mb-4 p-3 rounded-lg bg-red-100 border border-red-300 text-red-800">{error()}</div>
      </Show>
      {/* Breadcrumb Directory */}
      <div class="flex items-center gap-2 mb-8">
        <a href="/Rooms" class="text-2xl sm:text-3xl font-bold text-black hover:underline cursor-pointer">Rooms</a>
        <span class="text-2xl sm:text-3xl font-bold text-gray-400">/</span>
        <span class="text-2xl sm:text-3xl font-bold text-gray-600">Room</span>
      </div>
      {/* Header */}
      <div class="mb-6">
  <div class="bg-white rounded-xl shadow p-5 flex items-center justify-between">
    <div class="flex items-center gap-4">
      <img
        src={(room()?.profile_picture
          ? (room()!.profile_picture!.startsWith('http')
              ? room()!.profile_picture!
              : `${BACKEND_URL}${room()!.profile_picture!.startsWith('/uploads') ? '' : '/uploads/'}${room()!.profile_picture}`)
          : 'https://via.placeholder.com/150')}
        alt="Room Logo"
        class="w-32 h-32 rounded-full object-cover border"
      />
      <div class="flex flex-col">
        <span class="text-3xl text-black font-semibold">{room()?.name || 'room'}</span>
        <span class="text-sm text-gray-500 mt-1">{room()?.quote || ''}</span>
      </div>
    </div>
      <div class="flex items-center gap-2">
        {isOwner() && (
          <a href={`?manage=${manageMode() ? '0' : '1'}`} class="bg-white border border-gray-300 rounded-lg px-5 py-2 text-black shadow hover:bg-gray-100">
            {manageMode() ? 'view' : 'manage'}
          </a>
        )}
        <button class="bg-white border border-gray-300 rounded-lg px-5 py-2 text-black shadow hover:bg-gray-100" onClick={() => navigate('/RoomLeave')}>Leave</button>
      </div>
  </div>
</div>

      {/* owner manage tabs */}
      <Show when={manageMode()}>
        <div class="mb-6 bg-white rounded-xl shadow p-2">
          <div class="flex gap-2">
            <button class={`px-4 py-2 rounded-lg ${activeTab() === 'overview' ? 'bg-orange-500 text-white' : 'bg-white border text-black'}`} onClick={() => setActiveTab('overview')}>overview</button>
            <button class={`px-4 py-2 rounded-lg ${activeTab() === 'members' ? 'bg-orange-500 text-white' : 'bg-white border text-black'}`} onClick={() => setActiveTab('members')}>members</button>
            <button class={`px-4 py-2 rounded-lg ${activeTab() === 'fields' ? 'bg-orange-500 text-white' : 'bg-white border text-black'}`} onClick={() => setActiveTab('fields')}>fields</button>
            <button class={`px-4 py-2 rounded-lg ${activeTab() === 'settings' ? 'bg-orange-500 text-white' : 'bg-white border text-black'}`} onClick={() => setActiveTab('settings')}>settings</button>
          </div>
        </div>
      </Show>

      <div class="flex gap-8">
  {/* Owner Section */}
  <div class="flex flex-col items-center min-w-[220px] max-w-[220px] w-full">
    <div class="text-3xl font-bold text-black mb-6 w-full text-left">Owner</div>
    <div class="bg-white rounded-2xl shadow p-6 flex flex-col items-center w-full">
      <img
        src={(room()?.owner_pfp
          ? (room()!.owner_pfp!.startsWith('http')
              ? room()!.owner_pfp!
              : `${BACKEND_URL}${room()!.owner_pfp!.startsWith('/uploads') ? '' : '/uploads/'}${room()!.owner_pfp}`)
          : 'https://via.placeholder.com/150')}
        alt="Owner Avatar"
        class="w-32 h-32 rounded-full object-cover border"
      />
      <div class="flex flex-col">
        <span class="text-lg font-bold text-black text-center">{room()?.owner_name || 'owner'}</span>
      </div>
    </div>
  </div>

  {/* Right Section: content area with tabs */}
  <div class="flex-1 flex flex-col">
    <div class="text-3xl font-bold text-black mb-6">{manageMode() ? activeTab().toString() : 'Attendance'}</div>
    {/* Overview (default view content) */}
    <Show when={!manageMode() || activeTab() === 'overview'}>
      <div class="w-full">
        <div class="bg-white rounded-2xl border shadow-[0_0_16px_0_rgba(0,0,0,0.15)] p-6 flex gap-8 w-full">
          {/* Date Picker Card */}
          <div class="flex flex-col gap-4 min-w-[260px] max-w-[300px] w-full">
            <div class="font-regular text-base text-black mb-2">Select a date to fill</div>
            <div class="bg-[#fafafa] rounded-xl shadow px-4 py-3 flex items-center gap-2">
              <div class="relative flex-1 flex items-center">
                <input
                  ref={el => inputRef = el}
                  type="text"
                  class="flex-1 bg-transparent outline-none border-none text-black text-lg cursor-pointer"
                  readOnly
                  value={date()}
                  placeholder="Select date"
                  style={{'font-family': 'inherit'}}
                  onClick={() => fp && fp.open()}
                />
                <button
                  type="button"
                  class="absolute right-2 bg-white border border-gray-300 rounded-lg p-1 hover:bg-gray-100 transition-colors flex items-center justify-center"
                  onClick={() => fp && fp.open()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7 text-black">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3.75 7.5h16.5M4.5 7.5v10.125A2.625 2.625 0 007.125 20.25h9.75a2.625 2.625 0 002.625-2.625V7.5m-15 0V6.375A2.625 2.625 0 017.125 3.75h9.75a2.625 2.625 0 012.625 2.625V7.5m-15 0h16.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          {/* Attendance Details Card */}
          <div class="flex flex-col flex-1 min-w-[320px]">
            <div class="bg-white rounded-2xl shadow flex flex-col items-center p-4 gap-4 w-full">
              {/* Selected Date Text */}
              {date() && (
                <div class="w-full text-lg font-semibold text-black text-left">
                  {formatDateWithOrdinal(date())}
                </div>
              )}
              {/* Date Info Card or Filling Form */}
              {date() ? (
                isAllowedByFrequency(date(), room()?.filling_frequency) ? (
                  showFillingForm() ? (
                    <FillingForm
                      dateLabel={formatDateWithOrdinal(date())}
                      fields={room()!.fields}
                      onCancel={() => {
                        setShowFillingForm(false);
                        resetFillingForm();
                      }}
                      onSubmit={() => {
                        setShowFilledPopup(true);
                        setShowFillingForm(false);
                        resetFillingForm();
                      }}
                    />
                  ) : (
                    <>
                      <div class="bg-white rounded-xl shadow-[0_0_16px_0_rgba(0,0,0,0.10)] p-4 w-full flex flex-col gap-2">
                        <div class="flex justify-between items-center text-base">
                          <span class="text-black">Status</span>
                          <span class="text-red-500 font-semibold">Not filled</span>
                        </div>
                        <div class="flex justify-between items-center text-base">
                          <span class="text-black">Due</span>
                          <span class="text-black">{formatDue(addDaysToISO(date(), room()?.due_days ?? 0))}</span>
                        </div>
                        <div class="mt-2 mb-1 text-black">Filling requirement:</div>
                        <ul class="list-disc pl-5 text-black text-base">
                          {room()?.fields?.sort((a,b) => a.ord - b.ord).map(f => (
                            <li>{f.label} ({f.field_type})</li>
                          ))}
                        </ul>
                      </div>
                      <button
                        class="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-lg text-black shadow hover:bg-gray-100 font-semibold transition mt-2"
                        onClick={() => {
                          if (isPastOrToday(date())) {
                            setShowFillingForm(true);
                          } else {
                            setShowModal(true);
                          }
                        }}
                      >
                        Fill
                      </button>
                    </>
                  )
                ) : (
                  <>
                    <div class="bg-white rounded-xl shadow-[0_0_16px_0_rgba(0,0,0,0.10)] p-4 w-full flex flex-col gap-2">
                      <div class="flex justify-between items-center text-base">
                        <span class="text-black">Status</span>
                        <span class="text-gray-500 font-semibold">No filling required for this date</span>
                      </div>
                    </div>
                  </>
                )
              ) : (
                <span class="text-gray-400 text-base">No date chosen yet...</span>
              )}
              {/* Modal Popup for not today only */}
              {showModal() && !isPastOrToday(date()) && (
                <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div class="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative flex flex-col items-center">
                    <button
                      class="absolute top-3 right-3 bg-white border border-gray-300 rounded-full text-gray-400 hover:text-black hover:bg-gray-100 text-lg font-bold p-1 w-8 h-8 flex items-center justify-center leading-none transition"
                      onClick={() => setShowModal(false)}
                      aria-label="Close"
                    >
                      &times;
                    </button>
                    <div class="text-xl font-bold mb-4 text-black">Fill Attendance</div>
                    <div class="text-base text-red-500 mb-2 text-center">You can't fill a future date</div>
                  </div>
                </div>
              )}
              {/* Popup for filled attendance */}
              {showFilledPopup() && (
                <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div class="bg-white rounded-2xl shadow-xl p-8 max-w-xs w-full flex flex-col items-center">
                    <div class="text-xl font-bold mb-4 text-black">Attendance has been filled!</div>
                    <button
                      class="mt-2 px-6 py-2 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
                      onClick={() => setShowFilledPopup(false)}
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Show>

    {/* Members (placeholder for now) */}
    <Show when={manageMode() && activeTab() === 'members'}>
      <div class="w-full">
        <div class="bg-white rounded-2xl border shadow p-6">
          <div class="text-black mb-2 font-semibold">members</div>
          <p class="text-gray-600">members management coming soon.</p>
          <p class="text-gray-600">owner: {room()?.owner_name}</p>
        </div>
      </div>
    </Show>

    {/* Fields (read-only from loaded room details) */}
    <Show when={manageMode() && activeTab() === 'fields'}>
      <div class="w-full">
        <div class="bg-white rounded-2xl border shadow p-6">
          <div class="text-black mb-4 font-semibold">fields</div>
          <Show when={room()?.fields?.length} fallback={<p class="text-gray-600">no fields configured yet.</p>}>
            <ul class="space-y-2">
              {room()?.fields.map(f => (
                <li class="flex items-center justify-between border rounded-lg p-3">
                  <div class="text-black">
                    <div class="font-semibold">{f.label}</div>
                    <div class="text-sm text-gray-600">type: {f.field_type} • ord: {f.ord}</div>
                  </div>
                  <button class="px-3 py-1 text-sm bg-white border rounded-lg text-black opacity-50 cursor-not-allowed" disabled>edit (todo)</button>
                </li>
              ))}
            </ul>
          </Show>
        </div>
      </div>
    </Show>

    {/* Settings: update profile picture url */}
    <Show when={manageMode() && activeTab() === 'settings'}>
      <div class="w-full">
        <div class="bg-white rounded-2xl border shadow p-6 space-y-4">
          <div class="text-black font-semibold">settings</div>
          <div class="space-y-2">
            <label class="text-sm text-black">profile picture url</label>
            <input
              type="text"
              value={settingsPfp()}
              onInput={e => setSettingsPfp(e.currentTarget.value)}
              class="w-full rounded-lg border border-gray-300 px-3 py-2 text-black bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
              placeholder="/uploads/xxxx.png or full url"
            />
            <div class="text-xs text-gray-600">tip: you can upload a file on profile, then paste the resulting /uploads/... url here.</div>
            <div class="flex gap-2">
              <button
                class="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                disabled={savingSettings()}
                onClick={async () => {
                  if (!room()) return;
                  setSavingSettings(true);
                  setSettingsMsg(null);
                  const token = localStorage.getItem('token') || '';
                  try {
                    const res = await fetch(`${BACKEND_URL}/rooms/${room()!.id}/profile-picture`, {
                      method: 'PATCH',
                      headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                      },
                      body: JSON.stringify({ profile_picture: settingsPfp().trim() || null }),
                    });
                    if (res.ok) {
                      setSettingsMsg('profile picture updated');
                      setRoom({ ...room()!, profile_picture: settingsPfp().trim() || null });
                    } else {
                      const t = await res.text();
                      setSettingsMsg(`failed: ${res.status} ${t}`);
                    }
                  } catch (e) {
                    setSettingsMsg('network error');
                  } finally {
                    setSavingSettings(false);
                  }
                }}
              >save</button>
              <Show when={settingsMsg()}>
                <div class="self-center text-sm text-gray-700">{settingsMsg()}</div>
              </Show>
            </div>
          </div>
        </div>
      </div>
    </Show>
    
  </div>
      </div>
    </div>
  );
}
