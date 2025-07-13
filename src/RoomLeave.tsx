import { createSignal } from 'solid-js';
import { useNavigate, A } from '@solidjs/router';

export default function RoomLeave() {
  const [showConfirm, setShowConfirm] = createSignal(true); // always show confirm for leave
  const navigate = useNavigate();

  function handleLeave() {
    // TODO: handle actual leave logic here
    navigate('/Rooms');
  }

  function handleCancel() {
    navigate('/Room');
  }

  return (
    <div class="flex-1 flex flex-col bg-[#ededed] min-h-screen">
      <div class="p-8 w-full">
        <div class="w-full max-w-screen-md mx-auto">
        {/* Breadcrumb */}
        <div class="flex items-center gap-2 mb-8">
          <A href="/Rooms" class="text-2xl sm:text-3xl font-bold text-black hover:underline cursor-pointer">Rooms</A>
          <span class="text-2xl sm:text-3xl font-bold text-gray-400">/</span>
          <A href="/Room" class="text-2xl sm:text-3xl font-bold text-black hover:underline cursor-pointer">Room</A>
          <span class="text-2xl sm:text-3xl font-bold text-gray-400">/</span>
          <span class="text-2xl sm:text-3xl font-bold text-black">Leave</span>
        </div>

        {/* Centered Card */}
        <div class="flex justify-center items-center min-h-[350px]">
          <div class="bg-white rounded-2xl shadow-[0_0_16px_0_rgba(0,0,0,0.10)] flex flex-col items-center p-8 gap-4 w-full">
            <h2 class="text-2xl font-bold mb-2 text-black text-center">Are you sure?</h2>
            <div class="flex flex-col items-center bg-white rounded-xl p-4 w-full gap-2 border border-gray-200 shadow">
              <img src="https://languagecenter.unj.ac.id/wp-content/uploads/2023/10/bahasa-indonesia-400x400.png" alt="Room" class="w-12 h-12 rounded-full object-cover mb-2" />
              <div class="text-sm font-semibold text-black">Kelas Bahasa Indonesia XI6</div>
              <div class="text-xs text-gray-600 mb-2">Owner: Yulita Ayu Rengganis</div>
              <div class="text-xs text-black mb-2">Required:</div>
              <ul class="text-xs text-black list-disc list-inside mb-2">
                <li>Photo</li>
                <li>Time</li>
                <li>Notes "Yang kamu lakukan"</li>
              </ul>
              <button
                class="w-full mt-2 px-6 py-2.5 rounded-lg bg-white text-black font-semibold text-base shadow hover:bg-gray-300 transition-colors"
                onClick={handleLeave}
              >
                Leave
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
