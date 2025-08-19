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
  member_joined_date?: string | null;
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

 

function isPastOrToday(dateStr: string) {
  if (!dateStr) return false;
  const selected = new Date(dateStr);
  if (isNaN(selected.getTime())) return false;
  const now = new Date(CURRENT_TIME);
  now.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);
  return selected.getTime() <= now.getTime();
}

function isFuture(dateStr: string) {
  if (!dateStr) return false;
  const selected = new Date(dateStr);
  if (isNaN(selected.getTime())) return false;
  const now = new Date(CURRENT_TIME);
  now.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);
  return selected.getTime() > now.getTime();
}

// whether the date is a cycle anchor according to frequency and on/after join
function isCycleAnchorDate(ds: string, freq?: string | null, joinStr?: string | null): boolean {
  if (!ds) return false;
  if (!isOnOrAfterJoin(ds, joinStr)) return false;
  if (!freq || freq.toLowerCase() === 'daily') return true;
  const weekdays = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const idx = weekdays.indexOf(freq.toLowerCase());
  if (idx === -1) return true; // fallback to daily
  const d = new Date(ds);
  d.setHours(0,0,0,0);
  return d.getDay() === idx;
}

function isWithinDueWindow(anchorISO: string, dueDays?: number | null): boolean {
  if (!anchorISO) return false;
  const nowD = new Date(CURRENT_TIME);
  nowD.setHours(0,0,0,0);
  const anchor = new Date(anchorISO);
  if (isNaN(anchor.getTime())) return false;
  anchor.setHours(0,0,0,0);
  const dueISO = addDaysToISO(anchorISO, dueDays ?? 0);
  const due = new Date(dueISO);
  if (isNaN(due.getTime())) return false;
  due.setHours(0,0,0,0);
  return nowD.getTime() >= anchor.getTime() && nowD.getTime() <= due.getTime();
}

function isOnOrAfterJoin(dateStr: string, joinStr?: string | null) {
  if (!dateStr) return false;
  if (!joinStr) return true; // if unknown, don't block
  const d = new Date(dateStr);
  const j = new Date(joinStr);
  if (isNaN(d.getTime()) || isNaN(j.getTime())) return true;
  d.setHours(0,0,0,0);
  j.setHours(0,0,0,0);
  return d.getTime() >= j.getTime();
}

function todayISO(): string {
  const now = new Date(CURRENT_TIME);
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// compute the current cycle anchor date (the single date considered required for this period)
// - Daily: today
// - Weekday (e.g., Monday): the most recent occurrence of that weekday on/before today, but not before join date
function getCurrentCycleDate(freq?: string | null, joinStr?: string | null): string | null {
  const tISO = todayISO();
  const t = new Date(tISO);
  t.setHours(0,0,0,0);
  if (!freq || freq.toLowerCase() === 'daily') {
    // respect join date; if joined after today, no cycle yet
    if (!isOnOrAfterJoin(tISO, joinStr)) return null;
    return tISO;
  }
  const weekdays = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  const idx = weekdays.indexOf(freq.toLowerCase());
  if (idx === -1) {
    // unknown freq -> treat as daily fallback
    if (!isOnOrAfterJoin(tISO, joinStr)) return null;
    return tISO;
  }
  // only count if today is the target weekday
  if (t.getDay() !== idx) return null;
  if (!isOnOrAfterJoin(tISO, joinStr)) return null;
  return tISO;
}

function isCurrentCycleDate(ds?: string, freq?: string | null, joinStr?: string | null): boolean {
  if (!ds) return false;
  const cycle = getCurrentCycleDate(freq, joinStr);
  if (!cycle) return false;
  return ds === cycle;
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

// whether the due date (selected date + due_days, by 23:59) has already passed now
function isPastDue(baseDateStr: string, dueDays?: number | null): boolean {
  if (!baseDateStr) return false;
  const add = dueDays ?? 0;
  const dueISO = addDaysToISO(baseDateStr, add);
  const dueEnd = new Date(dueISO);
  if (isNaN(dueEnd.getTime())) return false;
  dueEnd.setHours(23, 59, 59, 999);
  const now = new Date(CURRENT_TIME);
  return now.getTime() > dueEnd.getTime();
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
          // after room loads, refresh calendar day decorations
          try {
            if (fp && (fp as any).redraw) (fp as any).redraw();
            else if (fp) fp.jumpToDate(fp.selectedDates[0] || new Date(CURRENT_TIME));
          } catch {}
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
        onDayCreate: (_dObj, _dStr, _instance, dayElem) => {
          // remove previous tags
          dayElem.classList.remove('it-day-open','it-day-missed','it-day-future','it-day-not-required','it-day-today');
          const d: any = (dayElem as any).dateObj as Date;
          if (!d) return;
          // yyyy-mm-dd
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate() + 0).padStart(2, '0');
          const ds = `${yyyy}-${mm}-${dd}`;
          const freq = room()?.filling_frequency;
          const joinStr = room()?.member_joined_date;
          // before member joined: not required (never fillable)
          if (!isOnOrAfterJoin(ds, joinStr)) {
            dayElem.classList.add('it-day-not-required');
            return;
          }
          // non-cycle anchors are never required
          if (!isCycleAnchorDate(ds, freq, joinStr)) {
            dayElem.classList.add('it-day-not-required');
            return;
          }
          // future anchor -> not now (grey)
          if (isFuture(ds)) {
            dayElem.classList.add('it-day-future');
            return;
          }
          // past/present anchor -> open within due, else missed
          if (isWithinDueWindow(ds, room()?.due_days ?? 0)) {
            dayElem.classList.add('it-day-open');
          } else if (isPastDue(ds, room()?.due_days ?? 0)) {
            dayElem.classList.add('it-day-missed');
          } else {
            // before anchor can't happen due to future check above
            dayElem.classList.add('it-day-not-required');
          }
          // mark today with black outline regardless of status
          if (ds === todayISO()) {
            dayElem.classList.add('it-day-today');
          }
        },
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
      <style>
        {`
        .flatpickr-day.it-day-open { outline: 2px solid #f59e0b; border-radius: 9999px; }
        .flatpickr-day.it-day-missed { background-color: #fee2e2; color: #b91c1c; border-radius: 9999px; }
        /* not now but fillable later: full grey with black label */
        .flatpickr-day.it-day-future { background-color: #e5e7eb; color: #000000; border-radius: 9999px; }
        .flatpickr-day.it-day-not-required { color: #9ca3af; }
        /* today: black outline regardless of status */
        .flatpickr-day.it-day-today { outline: 2px solid #111827; border-radius: 9999px; }
        `}
      </style>
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
                  ref={el => (inputRef = el)}
                  type="text"
                  placeholder="YYYY-MM-DD"
                  class="w-full bg-transparent outline-none text-black text-lg"
                  value={date()}
                  readOnly
                />
                <button
                  class="absolute right-2 bg-white border border-gray-300 rounded-lg p-1 hover:bg-gray-100 transition-colors flex items-center justify-center"
                  onClick={() => fp && fp.open()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-7 h-7 text-black">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3.75 7.5h16.5M4.5 7.5v10.125A2.625 2.625 0 007.125 20.25h9.75a2.625 2.625 0 002.625-2.625V7.5m-15 0V6.375A2.625 2.625 0 017.125 3.75h9.75a2.625 2.625 0 012.625 2.625V7.5m-15 0h16.5" />
                  </svg>
                </button>
              </div>
            </div>
            <div class="mt-2 text-base text-black">
              <span class="font-semibold">Frequency:</span> {(() => {
                const f = room()?.filling_frequency;
                if (!f) return 'Daily';
                return f.charAt(0).toUpperCase() + f.slice(1);
              })()}
            </div>
            <div class="text-base text-black">
              <span class="font-semibold">Due:</span> {(() => {
                const d = room()?.due_days ?? 0;
                const s = d === 1 ? '' : 's';
                return `${d} day${s} after`;
              })()}
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
              {/* Date Info Card or Filling Form, using cycle + due-window rules */}
              {date() ? (() => {
                const ds = date();
                const freq = room()?.filling_frequency;
                const joinStr = room()?.member_joined_date;
                const due = room()?.due_days ?? 0;
                const afterJoin = isOnOrAfterJoin(ds, joinStr);
                const anchor = isCycleAnchorDate(ds, freq, joinStr);
                const future = isFuture(ds);
                const withinDue = isWithinDueWindow(ds, due);
                const pastDue = isPastDue(ds, due);

                // Not required: before join or not a cycle anchor -> show status only
                if (!afterJoin || !anchor) {
                  return (
                    <div class="bg-white rounded-xl shadow-[0_0_16px_0_rgba(0,0,0,0.10)] p-4 w-full flex flex-col gap-2">
                      <div class="flex justify-between items-center text-base">
                        <span class="text-black">Status</span>
                        <span class="text-gray-700 font-semibold">Not required</span>
                      </div>
                    </div>
                  );
                }

                // Future anchor: not now but is fillable later -> disabled fill
                if (future) {
                  return (
                    <div class="bg-white rounded-xl shadow-[0_0_16px_0_rgba(0,0,0,0.10)] p-4 w-full flex flex-col gap-2">
                      <div class="flex justify-between items-center text-base">
                        <span class="text-black">Status</span>
                        <span class="text-gray-700 font-semibold">Not now</span>
                      </div>
                      <div class="flex justify-between items-center text-base">
                        <span class="text-black">Due</span>
                        <span class="text-black">{formatDateWithOrdinal(addDaysToISO(ds, due))}</span>
                      </div>
                      <button
                        class="w-full mt-3 bg-gray-300 text-gray-600 rounded-xl px-4 py-3 text-base font-semibold cursor-not-allowed"
                        disabled
                        type="button"
                      >
                        Fill
                      </button>
                    </div>
                  );
                }

                // Past due: missed -> disabled button with message
                if (!withinDue && pastDue) {
                  return (
                    <div class="bg-white rounded-xl shadow-[0_0_16px_0_rgba(0,0,0,0.10)] p-4 w-full flex flex-col gap-2">
                      <div class="flex justify-between items-center text-base">
                        <span class="text-black">Status</span>
                        <span class="text-red-600 font-semibold">Missed</span>
                      </div>
                      <div class="flex justify-between items-center text-base">
                        <span class="text-black">Due</span>
                        <span class="text-black">{formatDateWithOrdinal(addDaysToISO(ds, due))}</span>
                      </div>
                      <button
                        class="w-full mt-3 bg-gray-300 text-gray-600 rounded-xl px-4 py-3 text-base font-semibold cursor-not-allowed"
                        disabled
                        type="button"
                      >
                        You missed this
                      </button>
                    </div>
                  );
                }

                // Within due window (today between anchor and due): not filled yet -> enable filling
                if (withinDue) {
                  if (showFillingForm()) {
                    return (
                      <FillingForm
                        dateLabel={formatDateWithOrdinal(ds)}
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
                    );
                  }
                  return (
                    <div class="bg-white rounded-xl shadow-[0_0_16px_0_rgba(0,0,0,0.10)] p-4 w-full flex flex-col gap-2">
                      <div class="flex justify-between items-center text-base">
                        <span class="text-black">Status</span>
                        <span class="text-orange-500 font-semibold">Not filled</span>
                      </div>
                      <div class="flex justify-between items-center text-base">
                        <span class="text-black">Due</span>
                        <span class="text-black">{formatDateWithOrdinal(addDaysToISO(ds, due))}</span>
                      </div>
                      <button
                        class="w-full mt-3 bg-orange-500 text-white rounded-xl px-4 py-3 text-base font-semibold shadow hover:bg-orange-600 transition"
                        onClick={() => setShowFillingForm(true)}
                      >
                        Fill
                      </button>
                    </div>
                  );
                }

                // Fallback (shouldn't reach): show not required
                return (
                  <div class="bg-white rounded-xl shadow-[0_0_16px_0_rgba(0,0,0,0.10)] p-4 w-full flex flex-col gap-2">
                    <div class="flex justify-between items-center text-base">
                      <span class="text-black">Status</span>
                      <span class="text-gray-700 font-semibold">Not required</span>
                    </div>
                  </div>
                );
              })() : (
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
