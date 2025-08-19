import { For, Show, createSignal, onMount } from 'solid-js';
import { A } from '@solidjs/router';
import { BACKEND_URL } from './config';

interface Room {
  id: string;
  name: string;
  quote: string | null;
  profile_picture: string | null;
  owner_name: string;
  owner_pfp: string | null;
}

export default function Rooms() {
  const [ownerRooms, setOwnerRooms] = createSignal<Room[]>([]);
  const [joinedRooms, setJoinedRooms] = createSignal<Room[]>([]);
  const [loadingOwned, setLoadingOwned] = createSignal(true);
  const [loadingJoined, setLoadingJoined] = createSignal(true);
  const [errorOwned, setErrorOwned] = createSignal<string | null>(null);
  const [errorJoined, setErrorJoined] = createSignal<string | null>(null);
  const [joinedQuery, setJoinedQuery] = createSignal('');
  const [ownedQuery, setOwnedQuery] = createSignal('');

  function matches(room: Room, q: string): boolean {
    const query = (q || '').trim().toLowerCase();
    if (!query) return true;
    const name = (room.name || '').toLowerCase();
    const quote = (room.quote || '').toLowerCase();
    const owner = (room.owner_name || '').toLowerCase();
    return name.includes(query) || quote.includes(query) || owner.includes(query);
  }

  const filteredJoinedRooms = () => joinedRooms().filter(r => matches(r, joinedQuery()));
  const filteredOwnerRooms = () => ownerRooms().filter(r => matches(r, ownedQuery()));

  onMount(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoadingOwned(false);
      setLoadingJoined(false);
      setErrorOwned('not authenticated');
      setErrorJoined('not authenticated');
      return;
    }

    try {
      const [ownedRes, joinedRes] = await Promise.all([
        fetch(`${BACKEND_URL}/rooms`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BACKEND_URL}/rooms/joined`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (ownedRes.ok) {
        const data = await ownedRes.json();
        setOwnerRooms(data);
        setErrorOwned(null);
      } else {
        const errText = await ownedRes.text();
        setErrorOwned(`${ownedRes.status} ${errText}`);
        console.error('Failed to fetch owned rooms:', ownedRes.status, errText);
      }

      if (joinedRes.ok) {
        const data = await joinedRes.json();
        setJoinedRooms(data);
        setErrorJoined(null);
      } else {
        const errText = await joinedRes.text();
        setErrorJoined(`${joinedRes.status} ${errText}`);
        console.error('Failed to fetch joined rooms:', joinedRes.status, errText);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setErrorOwned('network error');
      setErrorJoined('network error');
    } finally {
      setLoadingOwned(false);
      setLoadingJoined(false);
    }
  });
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
                value={joinedQuery()}
                onInput={(e) => setJoinedQuery(e.currentTarget.value)}
              />
              <svg class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>
          
          <div class="bg-white rounded-2xl p-6 shadow-[0_0_16px_0_rgba(0,0,0,0.10)] w-full">
            <div class="grid gap-4 mb-6 w-full">
              <Show when={!loadingJoined()} fallback={<p class='text-gray-500'>loading joined rooms...</p>}>
                <Show when={!errorJoined()} fallback={<p class='text-red-600'>failed to load joined rooms: {errorJoined()}</p>}>
                  <For each={filteredJoinedRooms()} fallback={<p class='text-gray-500'>you haven't joined any rooms yet.</p>}>{(room) => (
                <div class="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-gray-200 w-full">
                  <img 
                    src={room.profile_picture
                      ? (room.profile_picture.startsWith('http')
                          ? room.profile_picture
                          : `${BACKEND_URL}${room.profile_picture.startsWith('/uploads') ? '' : '/uploads/'}${room.profile_picture}`)
                      : 'https://via.placeholder.com/150'}
                    alt={room.name}
                    class="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white shadow" 
                  />
                  <div class="flex-1 min-w-0 text-center sm:text-left">
                    <h3 class="text-lg font-semibold text-black truncate">{room.name}</h3>
                    <p class="text-sm text-gray-600">{room.quote || 'No quote provided'}</p>
                    <p class="text-xs text-gray-500">Owner: {room.owner_name}</p>
                  </div>
                  <div class="flex gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                    <a 
                      href={`/Room/${room.id}`}
                      class="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-orange-500 rounded-lg hover:bg-orange-600 text-center"
                    >
                      Open
                    </a>
                  </div>
                </div>
                  )}</For>
                </Show>
              </Show>
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
                value={ownedQuery()}
                onInput={(e) => setOwnedQuery(e.currentTarget.value)}
              />
              <svg class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>
          
          <div class="bg-white rounded-2xl p-6 shadow-[0_0_16px_0_rgba(0,0,0,0.10)] w-full">
            <div class="grid gap-4 mb-6 w-full">
              <Show when={!loadingOwned()} fallback={<p class='text-gray-500'>loading your rooms...</p>}>
                <Show when={!errorOwned()} fallback={<p class='text-red-600'>failed to load your rooms: {errorOwned()}</p>}>
                  <For each={filteredOwnerRooms()} fallback={<p class='text-gray-500'>you don't own any rooms yet.</p>}>{(room) => (
                <div class="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl border border-gray-200 w-full">
                  <img 
                    src={room.profile_picture
                      ? (room.profile_picture.startsWith('http')
                          ? room.profile_picture
                          : `${BACKEND_URL}${room.profile_picture.startsWith('/uploads') ? '' : '/uploads/'}${room.profile_picture}`)
                      : 'https://via.placeholder.com/150'}
                    alt={room.name}
                    class="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white shadow" 
                  />
                  <div class="flex-1 min-w-0 text-center sm:text-left">
                    <h3 class="text-lg font-semibold text-black truncate">{room.name}</h3>
                    <p class="text-sm text-gray-600">{room.quote || 'No quote provided'}</p>
                  </div>
                  <div class="flex gap-2 w-full sm:w-auto mt-3 sm:mt-0">
                    <a 
                      href={`/Room/${room.id}?manage=1`}
                      class="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-orange-500 rounded-lg hover:bg-orange-600 text-center"
                    >
                      Manage
                    </a>
                  </div>
                </div>
                  )}</For>
                </Show>
              </Show>
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

