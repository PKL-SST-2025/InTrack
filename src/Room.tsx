import { createSignal, onMount, Show } from 'solid-js';
import flatpickr from 'flatpickr';
import './flatpickr.css';
import { now } from '@amcharts/amcharts5/.internal/core/util/Time';
import { useNavigate } from '@solidjs/router';

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

function isToday(dateStr: string) {
  if (!dateStr) return false;
  const selected = new Date(dateStr);
  if (isNaN(selected.getTime())) return false;
  const now = new Date(CURRENT_TIME);
  now.setHours(0, 0, 0, 0);
  selected.setHours(0, 0, 0, 0);
  return selected.getTime() === now.getTime();
}

// FillingForm component for attendance filling UI
function FillingForm(props: { dateLabel: string, onCancel: () => void, onSubmit: () => void }) {
  const [timeFrom, setTimeFrom] = createSignal('');
  const [timeTo, setTimeTo] = createSignal('');
  const [notes, setNotes] = createSignal('');
  const [imagePreview, setImagePreview] = createSignal<string | null>(null);

  // Reset all fields
  function resetFields() {
    setTimeFrom('');
    setTimeTo('');
    setNotes('');
    setImagePreview(null);
  }

  function handleFileChange(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(files[0]);
    } else {
      setImagePreview(null);
    }
  }

  function handleCancel() {
    resetFields();
    props.onCancel();
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    resetFields();
    props.onSubmit();
  }

  return (
    <>
      {/* Date label */}
      <div class="w-full text-base text-gray-600 mb-2">{props.dateLabel}</div>
      {/* Card UI */}
      <div class="bg-white rounded-xl shadow-[0_0_16px_0_rgba(0,0,0,0.10)] p-6 w-full flex flex-row gap-8">
        {/* Left side: Time, Notes */}
        <div class="flex-1 flex flex-col gap-4 min-w-[200px]">
          <div>
            <div class="text-sm font-semibold text-black mb-1">Time</div>
            <div class="flex flex-row items-center gap-2">
              <input
                class="border rounded-lg px-3 py-2 w-24 text-base focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white text-black"
                type="text"
                placeholder="From"
                value={timeFrom()}
                onInput={e => setTimeFrom(e.currentTarget.value)}
              />
              <span class="text-gray-500">-</span>
              <input
                class="border rounded-lg px-3 py-2 w-24 text-base focus:outline-none focus:ring-2 focus:ring-orange-300 bg-white text-black"
                type="text"
                placeholder="To"
                value={timeTo()}
                onInput={e => setTimeTo(e.currentTarget.value)}
              />
            </div>
          </div>
          <div>
            <div class="text-sm font-semibold text-black mb-1">Notes</div>
            <textarea
              class="border rounded-lg px-3 py-2 w-full min-h-[60px] text-base focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none bg-white text-black"
              placeholder="Yang kamu lakukan saat di kelas..."
              value={notes()}
              onInput={e => setNotes(e.currentTarget.value)}
            />
          </div>
        </div>
        {/* Right side: Attachment */}
        <div class="flex flex-col items-center min-w-[220px] max-w-[260px] w-full">
          <div class="text-sm font-semibold text-black mb-1 self-start">Attachment</div>
          <label class="flex flex-col items-center justify-center border border-gray-200 bg-gray-200 rounded-xl w-full h-40 cursor-pointer overflow-hidden relative shadow-[0_0_16px_0_rgba(0,0,0,0.10)]">
            <Show when={imagePreview()} fallback={<span class="text-gray-500">No image chosen</span>}>
              <img src={imagePreview()!} alt="Preview" class="object-contain w-full h-full" />
            </Show>
            <input
              ref={el => ((window as any).__imageInputRef = el)}
              type="file"
              accept="image/*"
              class="hidden"
              onChange={handleFileChange}
              tabIndex={-1}
            />
          </label>
          <button
            class="mt-2 px-4 py-2 rounded-xl bg-orange-500 text-white font-semibold shadow hover:bg-orange-600 transition"
            onClick={() => {
              if ((window as any).__imageInputRef) (window as any).__imageInputRef.click();
            }}
            type="button"
          >
            Change
          </button>
        </div>
      </div>
      {/* Action buttons */}
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
          disabled={!(timeFrom() && timeTo() && notes() && imagePreview())}
        >
          Submit
        </button>
      </div>
    </>
  );
}

export default function Room() {
  const navigate = useNavigate();
  const [date, setDate] = createSignal('');
  const [showModal, setShowModal] = createSignal(false);
  const [showFilledPopup, setShowFilledPopup] = createSignal(false);
  const [showFillingForm, setShowFillingForm] = createSignal(false);
  let inputRef: HTMLInputElement | undefined;
  let fp: flatpickr.Instance | undefined;

  // Resets for FillingForm (called on cancel/submit)
  function resetFillingForm() {
    // No-op: handled inside FillingForm via local state reset
  }

  onMount(() => {
    if (inputRef) {
      fp = flatpickr(inputRef, {
        dateFormat: 'Y-m-d',
        defaultDate: date() || undefined,
        onChange: (_: any, dateStr: string) => setDate(dateStr),
        allowInput: false,
      });
    }
  });
  return (
    <div class="min-h-screen bg-[#ededed] p-8 w-full max-w-screen-2xl mx-auto">
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
        src="https://languagecenter.unj.ac.id/wp-content/uploads/2023/10/bahasa-indonesia-400x400.png"
        alt="Room Logo"
        class="w-32 h-32 rounded-full object-cover border"
      />
      <div class="flex flex-col">
  <span class="text-3xl text-black font-semibold">Kelas Bahasa Indonesia XI6</span>
  <span class="text-sm text-gray-500 mt-1">"Pelajar giat adalah pelajar yang sukses."</span>
</div>
    </div>
    <button class="bg-white border border-gray-300 rounded-lg px-5 py-2 text-black shadow hover:bg-gray-100" onClick={() => navigate('/RoomLeave')}>Leave</button>
  </div>
</div>

      <div class="flex gap-8">
  {/* Owner Section */}
  <div class="flex flex-col items-center min-w-[220px] max-w-[220px] w-full">
    <div class="text-3xl font-bold text-black mb-6 w-full text-left">Owner</div>
    <div class="bg-white rounded-2xl shadow p-6 flex flex-col items-center w-full">
      <img
        src="https://media.licdn.com/dms/image/v2/C5103AQF2pD3z1-Lg-w/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1573455349677?e=2147483647&v=beta&t=a3vPNTYdnirYDWN936Xuoc9kS6K36m62RGP7BYnDKEU"
        alt="Owner"
        class="w-32 h-32 rounded-full object-cover border mb-4"
      />
      <div class="text-lg font-bold text-black text-center">Yulita Ayu Rengganis</div>
    </div>
  </div>

  {/* Attendance Section */}
  <div class="flex-1 flex flex-col">
    <div class="text-3xl font-bold text-black mb-6">Attendance</div>
        <div class="w-full">
          <div class="bg-white rounded-2xl border shadow-[0_0_16px_0_rgba(0,0,0,0.15)] p-6 flex gap-8 w-full">
            {/* Date Picker Card */}
            <div class="flex flex-col gap-4 min-w-[260px] max-w-[300px] w-full">
              <div class="font-regular text-base text-black mb-2">Please select a date</div>
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
                  isToday(date()) ? (
                    showFillingForm() ? (
                      <FillingForm
                        dateLabel={formatDateWithOrdinal(date())}
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
                            <span class="text-black">{formatDue(date())}</span>
                          </div>
                          <div class="mt-2 mb-1 text-black">Filling pre-requirement:</div>
                          <ul class="list-disc pl-5 text-black text-base">
                            <li>Photo</li>
                            <li>Time</li>
                            <li>Notes</li>
                          </ul>
                        </div>
                        <button
                          class="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-lg text-black shadow hover:bg-gray-100 font-semibold transition mt-2"
                          onClick={() => {
                            if (isToday(date())) {
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
                          <span class="text-red-500 font-semibold">Not filled</span>
                        </div>
                        <div class="flex justify-between items-center text-base">
                          <span class="text-black">Due</span>
                          <span class="text-black">{formatDue(date())}</span>
                        </div>
                        <div class="mt-2 mb-1 text-black">Filling pre-requirement:</div>
                        <ul class="list-disc pl-5 text-black text-base">
                          <li>Photo</li>
                          <li>Time</li>
                          <li>Notes</li>
                        </ul>
                      </div>
                      <button
                        class="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-lg text-black shadow hover:bg-gray-100 font-semibold transition mt-2"
                        onClick={() => setShowModal(true)}
                      >
                        Fill
                      </button>
                    </>
                  )
                ) : (
                  <span class="text-gray-400 text-base">No date chosen yet...</span>
                )}
                {/* Modal Popup for not today only */}
                {showModal() && !isToday(date()) && (
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
                      <div class="text-base text-red-500 mb-2 text-center">You can't fill an attendance that's not today</div>
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
      </div>
    </div>
  </div>
  );
}
