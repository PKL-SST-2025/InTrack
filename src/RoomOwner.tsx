import { createSignal, onMount } from 'solid-js';
import flatpickr from 'flatpickr';
import './flatpickr.css';
import { useNavigate } from '@solidjs/router';

export default function RoomOwner() {
  const navigate = useNavigate();
  const [date, setDate] = createSignal('');
  let inputRef: HTMLInputElement | undefined;

  onMount(() => {
    if (inputRef) {
      flatpickr(inputRef, {
        dateFormat: 'Y-m-d',
        defaultDate: date() || undefined,
        onChange: (_: any, dateStr: string) => setDate(dateStr),
        allowInput: false,
      });
    }
  });

  // Sample data
  const [activeTab, setActiveTab] = createSignal<'members' | 'fill'>('members');
  const [members, setMembers] = createSignal([
    {
      name: 'Uzi Doorman',
      username: '@uzidoorman',
      avatar: 'https://characterai.io/i/200/static/avatars/uploaded/2024/3/13/RYBXGAMZvx-QSwKL2sp3mctuVLo-t0A4HJnFkU9hsz0.webp?webp=true&anim=0',
      stats: {
        filled: 1,
        missed: 0,
        filledWeek: 2,
        missedWeek: 0
      }
    },
    {
      name: 'Thad',
      username: '@thad',
      avatar: 'https://preview.redd.it/is-thad-a-dd-v0-5ihlmq1yn51d1.jpeg?auto=webp&s=b3e23c042a860d972b4623f7ceb08cc20cb12ed0',
      stats: {
        filled: 2,
        missed: 0,
        filledWeek: 1,
        missedWeek: 0
      }
    }
  ]);
  const [selectedMemberIdx, setSelectedMemberIdx] = createSignal(0);
  const selectedMember = () => members()[selectedMemberIdx()];
  // Kick modal state
  const [showKickModal, setShowKickModal] = createSignal(false);
  const [kickIdx, setKickIdx] = createSignal<number | null>(null);
  function handleKickMember() {
    const idx = kickIdx();
    if (idx !== null) {
      const updated = [...members()];
      updated.splice(idx, 1);
      setMembers(updated);
      setShowKickModal(false);
      // Adjust selected index if needed
      if (updated.length === 0) setSelectedMemberIdx(0);
      else if (selectedMemberIdx() >= updated.length) setSelectedMemberIdx(updated.length - 1);
    }
  }

  // Modal state for photo
  const [showPhotoModal, setShowPhotoModal] = createSignal(false);

  // Sample submissions data
  const submissions = [
    {
      at: '13th July 2025, 4:30 PM',
      from: 'Uzi Doorman',
      photo: '#', // Replace with actual photo URL if available
      yourArt: false,
      notes: 'idk i just feel like submitting this here lol'
    },
    {
      at: '13th July 2025, 12:00 PM',
      from: 'Thad',
      photo: '#',
      yourArt: true,
      notes: 'notes'
    },
    {
      at: '11th July 2025, 7:45 AM',
      from: 'Thad',
      photo: '#',
      yourArt: true,
      notes: 'yea dont ask why. i cant draw'
    }
  ];

  return (
    <div class="min-h-screen bg-[#ededed] p-8 w-full max-w-screen-2xl mx-auto">
      {/* Breadcrumb Directory */}
      <div class="flex items-center gap-2 mb-8">
        <span class="text-2xl sm:text-3xl font-bold text-gray-400">Rooms</span>
        <span class="text-2xl sm:text-3xl font-bold text-black">/</span>
        <span class="text-2xl sm:text-3xl font-bold text-black">Room</span>
      </div>
      {/* Header */}
      <div class="mb-6">
        <div class="bg-white rounded-xl shadow-[0_0_16px_0_rgba(0,0,0,0.10)] p-5 flex items-center justify-between">
          <div class="flex items-center gap-6">
            <img
              src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSQNkZ5z-20nouxxzVssKbPdA26QR0ll9hFmqGyBtQ-bcgRlek2"
              alt="Room Logo"
              class="w-24 h-24 rounded-full object-cover border"
            />
            <div class="flex flex-col">
              <span class="text-2xl md:text-3xl text-black font-semibold">MD fanart submission</span>
              <span class="text-base text-gray-500 mt-1">"absolutely no n haters here"</span>
            </div>
          </div>
          <button class="bg-orange-500 rounded-lg px-6 py-2 font-semibold text-white shadow hover:bg-orange-600 transition" onClick={() => navigate('/RoomEdit')}>Edit</button>
        </div>
      </div>
      {/* Tabs */}
      <div class="flex gap-2 mb-6">
        <button
          class={`flex-1 px-6 py-2 rounded-lg font-semibold text-black transition ${activeTab() === 'members' ? 'bg-[#ededed] shadow-[0_0_8px_0_rgba(0,0,0,0.10)]' : 'bg-white'}`}
          onClick={() => setActiveTab('members')}
        >
          Members
        </button>
        <button
          class={`flex-1 px-6 py-2 rounded-lg font-semibold text-black transition ${activeTab() === 'fill' ? 'bg-[#ededed] shadow-[0_0_8px_0_rgba(0,0,0,0.10)]' : 'bg-white'}`}
          onClick={() => setActiveTab('fill')}
        >
          Fill Submission
        </button>
      </div>
      {/* Main Content */}
      {activeTab() === 'members' && (
        <div class="bg-white rounded-2xl shadow-[0_0_16px_0_rgba(0,0,0,0.10)] p-6 flex flex-col md:flex-row gap-8">
          {/* Members List */}
          <div class="flex-1 min-w-[250px]">
            <h2 class="text-2xl text-black font-bold mb-4">Members</h2>
            <div class="flex flex-col gap-4">
              {members().map((m, idx) => (
                <div class={`flex items-center gap-4 px-4 py-3 rounded-lg ${selectedMemberIdx() === idx ? 'bg-[#f6f6f6]' : ''}`} style="transition: background 0.2s;">
                  <img src={m.avatar} alt={m.name} class="w-12 h-12 rounded-full object-cover border" />
                  <span class="flex-1 text-lg text-black font-medium">{m.name}</span>
                  <button
                    class="rounded-lg border border-gray-300 px-4 py-2 font-medium bg-white text-black hover:bg-gray-100 shadow-sm"
                    onClick={() => setSelectedMemberIdx(idx)}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
          {/* View Member */}
          <div class="flex-1 min-w-[280px]">
            <h2 class="text-2xl text-black font-bold mb-4">View Member</h2>
            <div class="bg-white rounded-xl shadow-[0_0_8px_0_rgba(0,0,0,0.10)] p-6 flex flex-col items-center">
              <img src={selectedMember().avatar} alt={selectedMember().name} class="w-20 h-20 rounded-full object-cover border mb-3" />
              <div class="text-xl font-bold text-black">{selectedMember().name}</div>
              <div class="text-base text-gray-500 mb-2">{selectedMember().username}</div>
              <div class="w-full mt-3 mb-4">
                <div class="font-semibold text-black mb-2">Member stats</div>
                <div class="text-sm text-black flex flex-col gap-1">
                  <div>Attendance filled so far: {selectedMember().stats.filled}</div>
                  <div>Attendance missed so far: {selectedMember().stats.missed}</div>
                  <div>Attendance filled this week: {selectedMember().stats.filledWeek}</div>
                  <div>Attendance missed this week: {selectedMember().stats.missedWeek}</div>
                </div>
              </div>
              <div class="flex gap-4 w-full mt-2">
                <button
                  class="flex-1 rounded-lg border border-gray-300 px-4 py-2 font-medium bg-white text-black hover:bg-gray-100 shadow-sm"
                  onClick={() => setActiveTab('fill')}
                >
                  View user submission
                </button>
                <button
                  class="flex-1 rounded-lg border px-4 py-2 font-medium bg-red-500 text-white hover:bg-red-600 shadow-sm"
                  onClick={() => { setShowKickModal(true); setKickIdx(selectedMemberIdx()); }}
                >
                  Kick
                </button>
              </div>
              {showKickModal() && (
                <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div class="bg-white rounded-xl p-8 shadow-xl flex flex-col items-center max-w-sm w-full relative">
                    <button
                      class="absolute top-2 right-2 rounded-full bg-black/70 text-white w-8 h-8 flex items-center justify-center text-xl hover:bg-black transition"
                      onClick={() => setShowKickModal(false)}
                      aria-label="Close"
                      type="button"
                    >
                      ×
                    </button>
                    <div class="text-lg font-semibold mb-4 text-black text-center">Are you sure you want to kick this member?</div>
                    <div class="flex gap-4 mt-2">
                      <button
                        class="px-6 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition"
                        onClick={handleKickMember}
                      >
                        Yes
                      </button>
                      <button
                        class="px-6 py-2 rounded-lg bg-gray-200 text-black font-medium hover:bg-gray-300 transition"
                        onClick={() => setShowKickModal(false)}
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
      )}
      {activeTab() === 'fill' && (
        <div class="bg-white rounded-2xl shadow-[0_0_16px_0_rgba(0,0,0,0.10)] p-6 mt-4">
          <h2 class="text-2xl text-black font-bold mb-6">Submissions</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full rounded-xl overflow-hidden">
              <thead>
                <tr class="bg-[#ededed] text-black">
                  <th class="px-4 py-2 font-bold text-left">No.</th>
                  <th class="px-4 py-2 font-bold text-left">At</th>
                  <th class="px-4 py-2 font-bold text-left">From</th>
                  <th class="px-4 py-2 font-bold text-left">Fanart</th>
                  <th class="px-4 py-2 font-bold text-left">Your art?</th>
                  <th class="px-4 py-2 font-bold text-left">Notes</th>
                  <th class="px-4 py-2 font-bold text-left"></th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s, i) => (
                  <tr class={i % 2 === 0 ? 'bg-white' : 'bg-[#ededed]'}>
                    <td class="px-4 py-2 font-medium text-black">{i + 1}</td>
                    <td class="px-4 py-2 text-black">{s.at}</td>
                    <td class="px-4 py-2 text-black">{s.from}</td>
                    <td class="px-4 py-2">
                      <button
                        class="rounded-lg border border-gray-300 px-3 py-2 font-medium bg-white text-black hover:bg-gray-100 shadow-sm"
                        onClick={() => setShowPhotoModal(true)}
                      >
                        View photo
                      </button>
                    </td>
                    <td class="px-4 py-2 text-black">{s.yourArt ? 'True' : 'False'}</td>
                    <td class="px-4 py-2 text-black">{s.notes}</td>
                    <td class="px-4 py-2">
                      <button
                        class="rounded-lg border border-gray-300 px-3 py-2 font-medium bg-white text-black hover:bg-gray-100 shadow-sm"
                        onClick={() => navigator.clipboard.writeText(s.notes)}
                        title="Copy notes"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24"><rect width="14" height="14" x="5" y="5" fill="#fff" stroke="#888" stroke-width="2" rx="2"/><rect width="14" height="14" x="7" y="7" fill="#fff" stroke="#888" stroke-width="2" rx="2"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
                {/* Empty rows for spacing */}
                <tr class="bg-[#ededed]"><td colSpan={7} class="h-8"></td></tr>
                <tr class="bg-[#ededed]"><td colSpan={7} class="h-8"></td></tr>
                <tr class="bg-[#ededed]"><td colSpan={7} class="h-8"></td></tr>
                {/* End row */}
                <tr class="bg-white">
                  <td colSpan={7} class="text-center text-lg font-semibold py-3">End</td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Photo Modal */}
          {showPhotoModal() && (
            <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={() => setShowPhotoModal(false)}>
              <div class="bg-white rounded-xl shadow-xl p-4 max-w-lg w-full flex flex-col items-center relative" onClick={e => e.stopPropagation()}>
                <button
                  class="absolute top-2 right-2 text-grey hover:text-white text-2xl font-bold"
                  onClick={() => setShowPhotoModal(false)}
                  aria-label="Close"
                  type="button"
                >
                  ×
                </button>
                <img src="https://www.jammable.com/cdn-cgi/image/width=640,quality=75,format=webp/https://imagecdn.voicify.ai/models/e2484fa5-75c7-4995-b0b5-6e52e359c5f6.png" alt="Fanart" class="max-w-full max-h-[60vh] rounded-lg" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
