import { createSignal } from 'solid-js';
import { useNavigate, A } from '@solidjs/router';
import { BACKEND_URL } from './config';

export default function RoomJoin() {
  const [code, setCode] = createSignal('');
  const [showConfirm, setShowConfirm] = createSignal(false);
  const [submitting, setSubmitting] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [loadingDetails, setLoadingDetails] = createSignal(false);
  type RoomFieldDto = { label: string; field_type: string; ord: number };
  type RoomByCode = {
    id: string;
    name: string;
    quote?: string | null;
    profile_picture?: string | null;
    owner_name: string;
    owner_pfp?: string | null;
    frequency?: string | null;
    fields: RoomFieldDto[];
  };
  const [roomInfo, setRoomInfo] = createSignal<RoomByCode | null>(null);
  const navigate = useNavigate();

  async function handleJoin(e: Event) {
    e.preventDefault();
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('you need to be logged in to join a room');
      return;
    }
    const joinCode = code().trim();
    if (!joinCode) {
      setError('please enter a room code');
      return;
    }
    setShowConfirm(true);
    setLoadingDetails(true);
    setRoomInfo(null);
    try {
      const res = await fetch(`${BACKEND_URL}/rooms/by-code/${encodeURIComponent(joinCode)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setRoomInfo(data);
      } else if (res.status === 404) {
        const text = await res.text();
        setError(text || 'room not found');
        setShowConfirm(false);
      } else if (res.status === 401) {
        setError('your session expired. please log in again.');
        setShowConfirm(false);
      } else {
        const text = await res.text();
        setError(text || 'failed to load room');
        setShowConfirm(false);
      }
    } catch (err) {
      setError('network error while loading room');
      setShowConfirm(false);
    } finally {
      setLoadingDetails(false);
    }
  }

  async function handleConfirm() {
    setError(null);
    const token = localStorage.getItem('token');
    if (!token) {
      setError('you need to be logged in to join a room');
      return;
    }
    const joinCode = code().trim();
    if (!joinCode) {
      setError('please enter a room code');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/rooms/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ code: joinCode }),
      });
      if (res.ok) {
        // read response: { room_id, role }
        const data = await res.json();
        if (data?.role === 'owner') {
          // warn and do not navigate when trying to join own room
          setError("you can't join your own room");
        } else {
          navigate('/Rooms');
        }
      } else if (res.status === 404) {
        const text = await res.text();
        setError(text || 'room not found');
      } else if (res.status === 401) {
        setError('your session expired. please log in again.');
      } else {
        const text = await res.text();
        setError(text || 'failed to join room');
      }
    } catch (e) {
      setError('network error while joining room');
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    setShowConfirm(false);
  }

  return (
    <div class="flex-1 flex flex-col bg-[#ededed] min-h-screen">
      <div class="p-8 w-full">
        <div class="w-full max-w-screen-md mx-auto">
        {/* Breadcrumb */}
        <div class="flex items-center gap-2 mb-8">
          <A href="/Rooms" class="text-2xl sm:text-3xl font-bold text-black hover:underline cursor-pointer">Rooms</A>
          <span class="text-2xl sm:text-3xl font-bold text-gray-400">/</span>
          <span class="text-2xl sm:text-3xl font-bold text-gray-600">Join</span>
        </div>

        {/* Centered Card */}
        <div class="flex justify-center items-center min-h-[350px]">
          {!showConfirm() ? (
            <form 
              class="bg-white rounded-2xl shadow-[0_0_16px_0_rgba(0,0,0,0.10)] px-8 py-10 w-full flex flex-col items-center"
              onSubmit={handleJoin}
            >
              <h2 class="text-2xl sm:text-3xl font-bold mb-8 text-black text-center">Enter room code</h2>
              <div class="w-full mb-6">
                <label class="block text-sm font-semibold mb-2 text-black" for="room-code">Code</label>
                <input
                  id="room-code"
                  type="text"
                  value={code()}
                  onInput={e => setCode(e.currentTarget.value)}
                  class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-base text-black bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Enter code..."
                  required
                />
              </div>
              {error() && (
                <div class="w-full mb-4 text-sm text-red-600">{error()}</div>
              )}
              <button
                type="submit"
                class="w-full max-w-[160px] px-6 py-2.5 rounded-lg bg-orange-500 text-white font-semibold text-base shadow hover:bg-orange-600 transition-colors"
              >
                Join
              </button>
            </form>
          ) : (
            <div class="bg-white rounded-2xl shadow flex flex-col items-center p-8 gap-4 w-full">
              <h2 class="text-2xl font-bold mb-2 text-black text-center">Are you sure?</h2>
              <div class="flex flex-col items-center text-center bg-white rounded-xl p-4 w-full gap-3 border border-gray-200 shadow">
                {loadingDetails() ? (
                  <div class="text-sm text-gray-600">loading room details...</div>
                ) : roomInfo() ? (
                  <>
                    <img
                      src={roomInfo()!.profile_picture
                        ? (roomInfo()!.profile_picture!.startsWith('http')
                            ? roomInfo()!.profile_picture!
                            : `${BACKEND_URL}${roomInfo()!.profile_picture!.startsWith('/uploads') ? '' : '/uploads/'}${roomInfo()!.profile_picture}`)
                        : 'https://via.placeholder.com/150'}
                      alt={roomInfo()!.name}
                      class="w-32 h-32 rounded-full object-cover mb-2"
                    />
                    <div class="text-xl font-semibold text-black">{roomInfo()!.name}</div>
                    <div class="text-base text-gray-600">Owner: {roomInfo()!.owner_name}</div>
                    <div class="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 text-left">
                      <div>
                        <div class="text-base font-semibold text-black mb-1">Filling frequency</div>
                        <div class="text-base text-black">{roomInfo()!.frequency ?? 'not set'}</div>
                      </div>
                      <div>
                        <div class="text-base font-semibold text-black mb-1">Required to fill:</div>
                        <ul class="text-base text-black list-disc list-inside">
                          {roomInfo()!.fields.length > 0 ? (
                            roomInfo()!.fields.map((f) => (
                              <li>{f.label}</li>
                            ))
                          ) : (
                            <li>no fields</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </>
                ) : (
                  <div class="text-sm text-red-600">failed to load room details</div>
                )}
                {error() && (
                  <div class="w-full text-sm text-red-600">{error()}</div>
                )}
                <button
                  class="w-full mt-2 px-6 py-2.5 rounded-lg bg-orange-500 text-white font-semibold text-base shadow hover:bg-orange-600 transition-colors disabled:opacity-60"
                  onClick={handleConfirm}
                  disabled={submitting()}
                >
                  {submitting() ? 'Joining...' : 'Join'}
                </button>
                <button
                  class="w-full mt-2 px-6 py-2.5 rounded-lg bg-white text-black font-semibold text-base shadow hover:bg-gray-300 transition-colors"
                  onClick={handleCancel}
                >
                  Nevermind
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
