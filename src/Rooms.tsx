import { For } from 'solid-js';
import { A } from '@solidjs/router';

const memberRooms = [
  {
    name: 'Kelas Bahasa Indonesia XI6',
    owner: 'Yulita Ayu Rengganis',
    missing: 1,
    img: 'https://languagecenter.unj.ac.id/wp-content/uploads/2023/10/bahasa-indonesia-400x400.png',
    ownerUrl: undefined,
  },
  {
    name: 'Magang Smartelco',
    owner: 'Pak Alvin',
    missing: 0,
    img: 'https://media.licdn.com/dms/image/v2/C510BAQGOZpyheCmuTA/company-logo_200_200/company-logo_200_200/0/1630635394279?e=2147483647&v=beta&t=YFDNcwMDvA-_9av17_oT2c5ADNJMowY1IlbxNjrzwjY',
    ownerUrl: undefined,
  },
  {
    name: 'Mabar roblox',
    owner: 'zaffa anjay mabar',
    missing: 0,
    img: 'https://preview.redd.it/two-cursed-roblox-character-i-made-v0-gqvcffay2e0d1.jpg?width=640&crop=smart&auto=webp&s=7f537ccb7deffd01879f64a99b2895cd86692917',
    ownerUrl: undefined,
  },
];

const ownerRooms = [
  {
    name: 'MD fanart submission',
    members: 2,
    img: 'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSQNkZ5z-20nouxxzVssKbPdA26QR0ll9hFmqGyBtQ-bcgRlek2',
  },
];

export default function Rooms() {
  return (
    <div class="flex-1 flex flex-col bg-[#ededed]">
      <div class="p-8 w-full max-w-screen-2xl mx-auto">
        {/* Member Rooms Section */}
        <div class="mb-12">
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h1 class="text-3xl font-bold text-black mb-4 sm:mb-0">Rooms</h1>
            <div class="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search a room..."
                class="w-full rounded-xl border border-gray-300 pl-4 pr-10 py-2.5 bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <svg class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>
          
          <div class="bg-white rounded-2xl p-6 shadow-[0_0_16px_0_rgba(0,0,0,0.10)] w-full">
            <div class="grid gap-4 mb-6 w-full">
              <For each={memberRooms}>{room => (
                <div class="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-gray-200 w-full">
                  <img src={room.img} alt={room.name} class="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white shadow" />
                  <div class="flex-1 min-w-0 text-center sm:text-left">
                    <h3 class="text-lg font-semibold text-black truncate">{room.name}</h3>
                    <p class="text-sm text-gray-600">
                      Owner: {room.ownerUrl ? (
                        <a href={room.ownerUrl} class="text-blue-600 hover:underline" target="_blank">{room.owner}</a>
                      ) : (
                        <span>{room.owner}</span>
                      )}
                    </p>
                    <p class="text-sm text-gray-600">Missing attendance: <span class="font-medium">{room.missing}</span></p>
                  </div>
                  <div class="flex gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                    <button class="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                      Leave
                    </button>
                    <a href="/Room" class="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-orange-500 rounded-lg hover:bg-orange-600 text-center">
                      Open
                    </a>
                  </div>
                </div>
              )}</For>
            </div>
            
            <div class="text-center pt-4 border-t border-gray-200 mt-6">
              <p class="text-gray-700 mb-4">Missing a room?</p>
              <A 
                href="/RoomJoin" 
                class="inline-block px-6 py-2.5 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Join a room
              </A>
            </div>
          </div>
        </div>
        
        {/* Owner Rooms Section */}
        <div>
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 class="text-3xl font-bold text-black mb-4 sm:mb-0">Your Rooms</h2>
            <div class="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Search your room..."
                class="w-full rounded-xl border border-gray-300 pl-4 pr-10 py-2.5 bg-white text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <svg class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>
          
          <div class="bg-white rounded-2xl p-6 shadow-[0_0_16px_0_rgba(0,0,0,0.10)] w-full">
            <div class="grid gap-4 mb-6 w-full">
              <For each={ownerRooms}>{room => (
                <div class="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-gray-200 w-full">
                  <img src={room.img} alt={room.name} class="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white shadow" />
                  <div class="flex-1 min-w-0 text-center sm:text-left">
                    <h3 class="text-lg font-semibold text-black truncate">{room.name}</h3>
                    <p class="text-sm text-gray-600">Members: <span class="font-medium">{room.members}</span></p>
                  </div>
                  <div class="flex gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                    <a 
                      href="/RoomOwner" 
                      class="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-orange-500 rounded-lg hover:bg-orange-600 text-center"
                    >
                      Manage
                    </a>
                  </div>
                </div>
              )}</For>
            </div>
            
            <div class="text-center pt-4 border-t border-gray-200 mt-6">
              <p class="text-gray-700 mb-4">Have an idea in mind?</p>
              <A 
                href="/RoomCreate" 
                class="inline-block px-6 py-2.5 text-sm font-medium text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Create a room
              </A>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

