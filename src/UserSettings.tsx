import { createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';

const UserSettings = () => {
  const navigate = useNavigate();
  // Example signals for form fields (replace with real state management as needed)
  const [fullName, setFullName] = createSignal('Dzul Fikri');
  const [showDeleteModal, setShowDeleteModal] = createSignal(false);

  const [email, setEmail] = createSignal('dzulbotygy@gmail.com');
  const [phone, setPhone] = createSignal('+62-858-7602-2223');
  const [birthDate, setBirthDate] = createSignal('13/12/2007');
  const [gender, setGender] = createSignal('Male');
  const [notifications, setNotifications] = createSignal('All');
  const [language, setLanguage] = createSignal('English');
  const [theme, setTheme] = createSignal('Light');

  return (
    <div class="flex-1 flex flex-col bg-[#ededed]">
      <div class="p-8 w-full max-w-screen-2xl mx-auto">
        <h1 class="text-3xl font-bold mb-6 text-black text-left">Preferences</h1>
        <div class="bg-white rounded-2xl p-6 shadow-[0_0_16px_0_rgba(0,0,0,0.10)] relative">
          <div class="absolute right-6 top-6 flex gap-4 z-0">
            <button class="rounded-lg border px-4 py-2 font-medium bg-white text-black hover:bg-gray-100 shadow-sm">Discard</button>
            <button class="rounded-lg border px-4 py-2 font-medium bg-orange-500 text-white hover:bg-orange-600 shadow-sm">Save Changes</button>
          </div>
          <div class="flex flex-col sm:flex-row items-center gap-6 mt-2 mb-8">
            <div class="relative">
              <img 
                src="https://api.dicebear.com/7.x/bottts/svg?seed=Dzul Fikri" 
                alt="Profile" 
                class="rounded-full border-4 border-white shadow-[0_0_16px_0_rgba(0,0,0,0.10)] w-32 h-32 sm:w-40 sm:h-40 object-cover" 
              />
            </div>
            <div class="flex flex-col gap-4 items-center sm:items-start">
              <h2 class="text-xl font-semibold text-black">Profile Photo</h2>
              <div class="flex gap-3">
                <button class="rounded-lg border border-gray-300 px-4 py-2 text-sm sm:text-base font-medium bg-white text-gray-700 hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                  Change
                </button>
              </div>
              <p class="text-xs text-gray-500 text-center sm:text-left">JPG, GIF or PNG. Max size of 2MB</p>
            </div>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                  value={fullName()} 
                  onInput={e => setFullName(e.currentTarget.value)} 
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div class="flex rounded-xl shadow-sm">
                  <input 
                    type="email" 
                    class="flex-1 min-w-0 block w-full px-4 py-2.5 rounded-l-xl border border-r-0 border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                    value={email()} 
                    onInput={e => setEmail(e.currentTarget.value)} 
                  />
                  <button class="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-xl bg-gray-50 text-sm font-medium text-orange-600 hover:bg-gray-100 focus:z-10 focus:outline-none focus:ring-1 focus:ring-orange-500">
                    Verify
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <div class="flex rounded-xl shadow-sm">
                  <input 
                    type="tel" 
                    class="flex-1 min-w-0 block w-full px-4 py-2.5 rounded-l-xl border border-r-0 border-gray-300 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                    value={phone()} 
                    onInput={e => setPhone(e.currentTarget.value)} 
                  />
                  <button class="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-xl bg-gray-50 text-sm font-medium text-orange-600 hover:bg-gray-100 focus:z-10 focus:outline-none focus:ring-1 focus:ring-orange-500">
                    Verify
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Birth Date</label>
                <div class="relative rounded-xl shadow-sm">
                  <input 
                    type="text" 
                    class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500" 
                    value={birthDate()} 
                    onInput={e => setBirthDate(e.currentTarget.value)} 
                  />
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select 
                  class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={gender()} 
                  onInput={e => setGender(e.currentTarget.value)}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Notifications</label>
                <select 
                  class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={notifications()} 
                  onInput={e => setNotifications(e.currentTarget.value)}
                >
                  <option>All</option>
                  <option>Important Only</option>
                  <option>None</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Language</label>
                <select 
                  class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={language()} 
                  onInput={e => setLanguage(e.currentTarget.value)}
                >
                  <option>English</option>
                  <option>Indonesian</option>
                  <option>Other</option>
                </select>
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Web Theme</label>
                <select 
                  class="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-gray-900 bg-white shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  value={theme()} 
                  onInput={e => setTheme(e.currentTarget.value)}
                >
                  <option>Light</option>
                  <option>Dark</option>
                </select>
              </div>
            </div>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-4 mt-8">
            <button 
              class="px-4 py-2.5 text-sm font-medium text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              onClick={() => navigate('/ResetPasswordNew')}
            >
              Reset Password
            </button>
            <button 
              class="px-4 py-2.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              onClick={() => navigate('/Login')}
            >
              Log out
            </button>
            <button 
              class="px-4 py-2.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete account
            </button>

            {/* Delete Account Modal */}
            {showDeleteModal() && (
              <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div class="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm flex flex-col items-center">
                  <div class="text-xl font-bold mb-4 text-black text-center">Are you sure you want to delete your account?</div>
                  <div class="flex gap-4 mt-6">
                    <button
                      class="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition"
                      onClick={() => navigate('/Login')}
                    >
                      Yes
                    </button>
                    <button
                      class="px-6 py-2 rounded-lg bg-gray-200 text-black font-semibold shadow hover:bg-gray-300 transition"
                      onClick={() => setShowDeleteModal(false)}
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
    </div>
  );
};

export default UserSettings;
