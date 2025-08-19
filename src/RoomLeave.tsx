import { createSignal, onMount } from 'solid-js';
import { useNavigate, useSearchParams, A } from '@solidjs/router';
import { BACKEND_URL } from './config';

type RoomDetailsLite = {
  id: string;
  name: string;
  quote?: string | null;
  profile_picture?: string | null;
  owner_name: string;
  owner_pfp?: string | null;
};

export default function RoomLeave() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [room, setRoom] = createSignal<RoomDetailsLite | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [submitting, setSubmitting] = createSignal(false);

  const id = () => {
    const raw = (searchParams as any).id as string | string[] | undefined;
    const v = Array.isArray(raw) ? raw[0] : raw;
    return (v || '').trim();
  };

  onMount(async () => {
    const roomId = id();
    if (!roomId) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || '';
      if (!token) {
        navigate('/Login');
        return;
      }
      const res = await fetch(`${BACKEND_URL}/rooms/${encodeURIComponent(roomId)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        // pick only needed fields
        setRoom({
          id: data.id,
          name: data.name,
          quote: data.quote,
          profile_picture: data.profile_picture,
          owner_name: data.owner_name,
          owner_pfp: data.owner_pfp,
        });
      } else if (res.status === 404) {
        setError('room not found');
      } else if (res.status === 401) {
        setError('your session expired. please log in again.');
        try { localStorage.removeItem('token'); } catch {}
        navigate('/Login');
      } else {
        const text = await res.text();
        setError(text || 'failed to load room');
      }
    } catch (e) {
      setError('network error while loading room');
    } finally {
      setLoading(false);
    }
  });

  async function handleConfirm() {
    setSubmitting(true);
    try {
      const roomId = id();
      const token = localStorage.getItem('token') || '';
      if (!token) { navigate('/Login'); return; }
      const res = await fetch(`${BACKEND_URL}/rooms/${encodeURIComponent(roomId)}/leave`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) { localStorage.removeItem('token'); navigate('/Login'); return; }
      if (!res.ok) {
        const msg = await res.text();
        setError(msg || 'failed to leave room');
        return;
      }
      navigate('/Rooms');
    } catch (_) {
      setError('network error while leaving room');
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    const roomId = id();
    if (roomId) navigate(`/Room/${roomId}`);
    else navigate('/Rooms');
  }

  const roomPfpUrl = () => {
    const p = room()?.profile_picture;
    if (!p) return 'https://via.placeholder.com/150';
    return p.startsWith('http')
      ? p
      : `${BACKEND_URL}${p.startsWith('/uploads') ? '' : '/uploads/'}${p}`;
  };

  return (
    <div class="flex-1 flex flex-col bg-[#ededed] min-h-screen">
      <div class="p-8 w-full">
        <div class="w-full max-w-screen-md mx-auto">
          {/* Breadcrumb */}
          <div class="flex items-center gap-2 mb-8">
            <A href="/Rooms" class="text-2xl sm:text-3xl font-bold text-black hover:underline cursor-pointer">Rooms</A>
            <span class="text-2xl sm:text-3xl font-bold text-gray-400">/</span>
            {id() ? (
              <A href={`/Room/${id()}`} class="text-2xl sm:text-3xl font-bold text-black hover:underline cursor-pointer">Room</A>
            ) : (
              <span class="text-2xl sm:text-3xl font-bold text-gray-600">Room</span>
            )}
            <span class="text-2xl sm:text-3xl font-bold text-gray-400">/</span>
            <span class="text-2xl sm:text-3xl font-bold text-gray-600">Leave</span>
          </div>

          {/* Centered Card */}
          <div class="flex justify-center items-center min-h-[350px]">
            <div class="bg-white rounded-2xl shadow flex flex-col items-center p-8 gap-4 w-full">
              <h2 class="text-2xl font-bold mb-2 text-black text-center">Are you sure?</h2>
              <div class="flex flex-col items-center text-center bg-white rounded-xl p-4 w-full gap-3 border border-gray-200 shadow">
                {loading() ? (
                  <div class="text-sm text-gray-600">loading room details...</div>
                ) : room() ? (
                  <>
                    <img src={roomPfpUrl()} alt={room()!.name} class="w-32 h-32 rounded-full object-cover mb-2" />
                    <div class="text-xl font-semibold text-black">{room()!.name}</div>
                    <div class="text-base text-gray-600">Owner: {room()!.owner_name}</div>
                  </>
                ) : (
                  <div class="text-sm text-red-600">{error() || 'failed to load room details'}</div>
                )}
                {error() && room() && (
                  <div class="w-full text-sm text-red-600">{error()}</div>
                )}
                <button
                  class="w-full mt-2 px-6 py-2.5 rounded-lg bg-orange-500 text-white font-semibold text-base shadow hover:bg-orange-600 transition-colors disabled:opacity-60"
                  onClick={handleConfirm}
                  disabled={submitting()}
                >
                  {submitting() ? 'Leaving...' : 'Leave'}
                </button>
                <button
                  class="w-full mt-2 px-6 py-2.5 rounded-lg bg-white text-black font-semibold text-base shadow hover:bg-gray-300 transition-colors"
                  onClick={handleCancel}
                >
                  Nevermind
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
