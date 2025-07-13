import { AiOutlineMenu, AiOutlineUser } from 'solid-icons/ai';
import { BiRegularHomeAlt2, BiRegularDoorOpen } from 'solid-icons/bi'
import { HiOutlineChartBar } from 'solid-icons/hi';
import { BsBell } from 'solid-icons/bs';
import { createSignal, onCleanup, Show } from 'solid-js';

function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour12: false });
}

function getCurrentDate() {
  const now = new Date();
  return now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

type NavbarProps = { children?: any };
const Navbar = (props: NavbarProps) => {
  const [time, setTime] = createSignal(getCurrentTime());
  const [sidebarOpen, setSidebarOpen] = createSignal(false);
  const [notifOpen, setNotifOpen] = createSignal(false);
  onCleanup(() => clearInterval(interval));
  const interval = setInterval(() => setTime(getCurrentTime()), 1000);

  return (
    <div class="flex h-screen w-screen bg-[#e5e7eb] overflow-hidden relative">
      {/* Sidebar */}
      <div class={`fixed z-30 top-0 left-0 h-screen bg-white shadow-lg transition-all duration-300 flex flex-col ${sidebarOpen() ? 'w-64 min-w-[256px]' : 'w-16 min-w-[64px]'} overflow-x-hidden`}>
        <div class="flex flex-col h-full">
          {/* Top: Hamburger and Menu label */}
          <div class={`flex items-center gap-2 px-4 py-4 ${sidebarOpen() ? '' : 'justify-center'}`}>
            <button class="nav-btn" aria-label="Toggle menu" onClick={() => setSidebarOpen(!sidebarOpen())}>
              <AiOutlineMenu size={24} />
            </button>
            {sidebarOpen() && <span class="ml-2 text-lg font-semibold text-black">Menu</span>}
          </div>

          {/* Nav links - always centered vertically */}
          <nav class="flex-1 flex flex-col gap-2 items-center justify-center">
            <a href="/Dashboard" class={`flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition nav-btn ${sidebarOpen() ? 'justify-start w-full' : 'justify-center'}`}> 
              <BiRegularHomeAlt2 size={24} />
              {sidebarOpen() && <span class="text-base text-black">Dashboard</span>}
            </a>
            <a href="/FillingStation" class={`flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition nav-btn ${sidebarOpen() ? 'justify-start w-full' : 'justify-center'}`}>
              <HiOutlineChartBar size={24} />
              {sidebarOpen() && <span class="text-base text-black">Filling Station</span>}
            </a>
            <a href="/Rooms" class={`flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition nav-btn ${sidebarOpen() ? 'justify-start w-full' : 'justify-center'}`}>
              <BiRegularDoorOpen size={24} />
              {sidebarOpen() && <span class="text-base text-black">Rooms</span>}
            </a>
          </nav>

          {/* Bottom: Preferences */}
          <div class={`mb-4 px-4 ${sidebarOpen() ? '' : 'flex justify-center'}`}>
            <a href="/UserSettings" class={`flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition nav-btn ${sidebarOpen() ? 'justify-start w-full' : 'justify-center'}`}>
              <AiOutlineUser size={24} />
              {sidebarOpen() && <span class="text-base text-black">Preferences</span>}
            </a>
          </div>
        </div>
      </div>
      {/* Overlay removed as requested */}

      {/* Main content area with scrollable content */}
      <div class={`flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300 ${sidebarOpen() ? 'ml-64' : 'ml-16'}`}>
        {/* Top Bar - Sticky */}
        <div class="sticky top-0 z-10 flex items-center justify-between bg-white px-4 py-3 shadow w-full">
          <a href="/Dashboard" class="font-bold text-lg text-black hover:underline focus:underline outline-none">InTrack</a>
          <div class="flex items-center gap-6">
            <div class="text-center">
              <div class="text-base font-mono text-black">{time()}</div>
              <div class="text-xs text-black">{getCurrentDate()}</div>
            </div>
            <button class="nav-btn ml-2 relative" onClick={() => setNotifOpen(!notifOpen())} aria-label="Notifications">
              <BsBell size={20} />
            </button>
            <Show when={notifOpen()}>
              {/* Notification Bar Overlay */}
              <div class="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div class={`fixed top-[64px] right-0 z-50 h-[calc(100vh-64px)] w-80 max-w-full bg-white shadow-2xl border-l border-gray-200 flex flex-col transition-transform duration-300 ${notifOpen() ? 'translate-x-0' : 'translate-x-full'} mt-0`}
                   onClick={e => e.stopPropagation()}>
                <div class="flex flex-col h-full justify-between">
                  <div class="flex-1 flex flex-col gap-4 p-6 overflow-y-auto">
                    <div class="text-center text-lg font-bold mb-2 text-black">Notifications</div>
                    {/* Today Section */}
                    <div>
                      <div class="text-base font-semibold text-black mb-2">Today</div>
                      <div class="bg-white rounded-xl border shadow p-4 flex flex-col gap-2 mb-4">
                        <div class="font-semibold text-black">Unfilled attendance</div>
                        <div class="text-xs text-gray-500 mb-2">You haven't filled some of your attendance yet.</div>
                        <div class="flex justify-end">
                          <a href="/FillingStation" class="px-5 py-1.5 rounded-lg bg-white text-black font-semibold text-sm shadow hover:bg-orange-100 hover:text-orange-600 transition">Fill</a>
                        </div>
                      </div>
                    </div>
                    {/* Yesterday Section */}
                    <div>
                      <div class="text-base font-semibold text-black mb-2">Yesterday</div>
                      <div class="bg-white rounded-xl border shadow p-4 flex flex-col gap-2">
                        <div class="font-semibold text-black">Kicked from a room</div>
                        <div class="text-xs text-gray-500">You were kicked out of the room \"N haters\".</div>
                        <div class="text-xs text-gray-400">Reason: you like N <span class="text-orange-500">🧡</span></div>
                        <div class="flex gap-2 mt-2 justify-end">
                          <button class="px-5 py-1.5 rounded-lg bg-white text-black font-semibold text-sm shadow hover:bg-orange-100 hover:text-orange-600 transition">Close</button>
                          <button class="px-5 py-1.5 rounded-lg bg-white text-black font-semibold text-sm shadow hover:bg-orange-100 hover:text-orange-600 transition">IDGAF</button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="p-4 border-t bg-white">
                    <button class="w-full px-5 py-2 rounded-lg border border-gray-300 bg-white text-black font-semibold shadow hover:bg-orange-100 hover:text-orange-600 transition">Close all</button>
                  </div>
                </div>
              </div>
            </Show>
          </div>
        </div>
        {/* Scrollable content area */}
        <div class="flex-1 overflow-y-auto bg-[#e5e7eb]">
          <div class="w-full bg-[#ededed] min-h-full">
            {props.children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
