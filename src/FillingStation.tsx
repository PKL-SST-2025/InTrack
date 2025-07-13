import { Show, For } from 'solid-js';

// Dummy data for demonstration; replace with real data fetching later
const roomsWithMissing = [
  {
    id: 1,
    name: 'Kelas Bahasa Indonesia',
    owner: 'Yulita Ayu Rengganis',
    image: 'https://languagecenter.unj.ac.id/wp-content/uploads/2023/10/bahasa-indonesia-400x400.png',
    missing: 1,
    requirements: ['Photo', 'Time', 'Notes "Yang kamu lakukan"'],
  },
];
const roomsFilled = [
  {
    id: 2,
    name: 'Magang Smartelco',
    owner: 'Pak Alvin',
    image: 'https://media.licdn.com/dms/image/v2/C510BAQGOZpyheCmuTA/company-logo_200_200/company-logo_200_200/0/1630635394279?e=2147483647&v=beta&t=YFDNcwMDvA-_9av17_oT2c5ADNJMowY1IlbxNjrzwjY',
    missing: 0,
  },
  {
    id: 3,
    name: 'Mabar roblox',
    owner: 'zafira anjay mabar',
    image: 'https://preview.redd.it/two-cursed-roblox-character-i-made-v0-gqvcffay2e0d1.jpg?width=640&crop=smart&auto=webp&s=7f537ccb7deffd01879f64a99b2895cd86692917',
    missing: 0,
  },
];

export default function FillingStation() {
  return (
    <div class="flex-1 flex flex-col bg-[#ededed]">
      <div class="p-8 w-full max-w-screen-2xl mx-auto">
        <h1 class="text-3xl font-bold mb-8 text-black">Filling Station</h1>

      {/* Group: Rooms with missing attendance + Not yet filled */}
      <Show when={roomsWithMissing.length}>
        <div class="bg-white rounded-2xl shadow p-6 mb-8">
          {/* Room with missing attendance */}
          <For each={roomsWithMissing}>{room => (
            <div class="flex items-center gap-4 mb-4 last:mb-0">
              <img src={room.image} alt={room.name} class="w-20 h-20 rounded-full object-cover border" />
              <div class="flex-1">
                <div class="text-lg font-semibold text-black">{room.name}</div>
                <div class="text-xs text-gray-700 mb-1">Owner: {room.owner}</div>
                <div class="text-xs text-gray-500">Missing attendance: {room.missing}</div>
              </div>
              <a href="/Room" class="px-6 py-2 rounded-lg bg-orange-500 text-white font-semibold shadow hover:bg-orange-600 transition text-center">Open</a>
            </div>
          )}</For>

          {/* Not yet filled section (as card inside container) */}
          <div class="mt-8">
            <div class="text-xl font-bold text-black mb-2">Not yet filled</div>
            <For each={roomsWithMissing}>{room => (
              <div class="bg-white rounded-2xl border shadow p-4 flex items-center gap-4 mb-4 last:mb-0 max-w-xs">
                <img src={room.image} alt={room.name} class="w-12 h-12 rounded-full object-cover" />
                <div class="flex-1">
                  <div class="font-semibold text-black text-sm mb-1">{room.name}</div>
                  <div class="text-xs text-black mb-1">Required:</div>
                  <ul class="list-disc list-inside text-xs text-black mb-2">
                    <For each={room.requirements}>{req => <li>{req}</li>}</For>
                  </ul>
                  <a href="/Room" class="w-full px-4 py-1.5 rounded-lg bg-gray-100 text-black font-semibold text-sm shadow hover:bg-orange-100 hover:text-orange-600 transition text-center">Fill</a>
                </div>
              </div>
            )}</For>
          </div>
        </div>
      </Show>

      {/* Divider: That's all */}

      {/* Divider: That's all */}
      <div class="w-full my-4">
        <div class="w-full rounded-xl bg-white py-2 text-center text-xs text-gray-400 shadow">That&apos;s all.</div>
      </div>

      {/* Group: Rooms with no missing attendance */}
      <Show when={roomsFilled.length}>
        <div class="bg-white rounded-2xl shadow p-6 mb-6">
          <div class="grid gap-6">
            <For each={roomsFilled}>{room => (
              <div class="bg-white rounded-2xl shadow p-6 flex items-center gap-4">
                <img src={room.image} alt={room.name} class="w-20 h-20 rounded-full object-cover border" />
                <div class="flex-1">
                  <div class="text-lg font-semibold text-black">{room.name}</div>
                  <div class="text-xs text-gray-700 mb-1">Owner: {room.owner}</div>
                  <div class="text-xs text-gray-500">Missing attendance: {room.missing}</div>
                </div>
                <div class="flex gap-2">
                  <button class="px-5 py-2 rounded-lg bg-white border border-gray-300 text-black font-semibold shadow hover:bg-gray-50 transition">Leave</button>
                  <a href="/Room" class="px-6 py-2 rounded-lg bg-orange-500 text-white font-semibold shadow hover:bg-orange-600 transition text-center">Open</a>
                </div>
              </div>
            )}</For>
          </div>
        </div>
      </Show>
      </div>
    </div>
  );
}
