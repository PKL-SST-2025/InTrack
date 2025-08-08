import { createSignal, onMount } from 'solid-js';
import { useNavigate } from '@solidjs/router';

const UserSettings = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = createSignal('');
  const [showDeleteModal, setShowDeleteModal] = createSignal(false);
  const [email, setEmail] = createSignal('');
  const [phone, setPhone] = createSignal('');
  const [birthDate, setBirthDate] = createSignal('');
  const [gender, setGender] = createSignal('');
  const [notifications, setNotifications] = createSignal('');
  const [language, setLanguage] = createSignal('');
  const [theme, setTheme] = createSignal('');
  const [logoutLoading, setLogoutLoading] = createSignal(false);
  const [logoutError, setLogoutError] = createSignal('');
  const [saveLoading, setSaveLoading] = createSignal(false);
  const [saveError, setSaveError] = createSignal('');
  const [saveSuccess, setSaveSuccess] = createSignal('');

  // profile picture state
  const [profilePicture, setProfilePicture] = createSignal('');
  const [selectedPicFile, setSelectedPicFile] = createSignal<File | null>(null);
  const [previewPic, setPreviewPic] = createSignal('');
  let fileInputRef: HTMLInputElement | undefined;

  // ref for date input to open native picker
  let birthDateInputRef: HTMLInputElement | undefined;

  // snapshot of initial values to support Discard
  type ProfileSnapshot = {
    full_name: string;
    email: string;
    phone: string;
    birth_date: string; // YYYY-MM-DD for the input
    gender: string;
    notifications: string;
    language: string;
    web_theme: string;
    profile_picture: string; // may be absolute or relative
  };
  const [initialProfile, setInitialProfile] = createSignal<ProfileSnapshot>({
    full_name: '',
    email: '',
    phone: '',
    birth_date: '',
    gender: '',
    notifications: '',
    language: '',
    web_theme: '',
    profile_picture: '',
  });

  const restoreInitial = () => {
    const init = initialProfile();
    setFullName(init.full_name);
    setEmail(init.email);
    setPhone(init.phone);
    setBirthDate(init.birth_date);
    setGender(init.gender);
    setNotifications(init.notifications);
    setLanguage(init.language);
    setTheme(init.web_theme);
    setProfilePicture(init.profile_picture);
    if (previewPic()) {
      try { URL.revokeObjectURL(previewPic()); } catch {}
    }
    setPreviewPic('');
    setSelectedPicFile(null);
    setSaveError('');
    setSaveSuccess('');
  };

  // date helpers: backend uses DD/MM/YYYY, input[type=date] uses YYYY-MM-DD
  const fromBackendDate = (s: string): string => {
    if (!s) return '';
    const [dd, mm, yyyy] = s.split('/');
    if (!dd || !mm || !yyyy) return '';
    const d = dd.padStart(2, '0');
    const m = mm.padStart(2, '0');
    return `${yyyy}-${m}-${d}`;
  };
  const toBackendDate = (s: string): string => {
    if (!s) return '';
    const [yyyy, mm, dd] = s.split('-');
    if (!yyyy || !mm || !dd) return '';
    const d = dd.padStart(2, '0');
    const m = mm.padStart(2, '0');
    return `${d}/${m}/${yyyy}`;
  };

  onMount(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8080/profile', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setFullName(data.full_name || '');
      setEmail(data.email || '');
      setPhone(data.phone || '');
      setBirthDate(data.birth_date ? fromBackendDate(data.birth_date) : '');
      setGender(data.gender || '');
      setNotifications(data.notifications || '');
      setLanguage(data.language || '');
      setTheme(data.web_theme || '');
      setProfilePicture(data.profile_picture || '');
      // store snapshot in input-compatible formats
      setInitialProfile({
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        birth_date: data.birth_date ? fromBackendDate(data.birth_date) : '',
        gender: data.gender || '',
        notifications: data.notifications || '',
        language: data.language || '',
        web_theme: data.web_theme || '',
        profile_picture: data.profile_picture || '',
      });
    } catch (e) {
      // fail silently for now
    }
  });

  async function handleLogout() {
    setLogoutLoading(true);
    setLogoutError('');
    try {
      await fetch('http://localhost:8080/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      localStorage.removeItem('token');
      navigate('/Login');
    } catch (err) {
      setLogoutError('failed to log out');
    } finally {
      setLogoutLoading(false);
    }
  }

  return (
    <div class="flex-1 flex flex-col bg-[#ededed]">
      <div class="p-8 w-full max-w-screen-2xl mx-auto">
        <h1 class="text-3xl font-bold mb-6 text-black text-left">Preferences</h1>
        {saveError() && <div class="text-red-500 mb-2">{saveError()}</div>}
        {saveSuccess() && <div class="text-green-600 mb-2">{saveSuccess()}</div>}
        <div class="bg-white rounded-2xl p-6 shadow-[0_0_16px_0_rgba(0,0,0,0.10)] relative">
          <div class="absolute right-6 top-6 flex gap-4 z-0">
            <button
              class="rounded-lg border px-4 py-2 font-medium bg-white text-black hover:bg-gray-100 shadow-sm"
              onClick={(e) => { e.preventDefault(); restoreInitial(); }}
            >
              Discard
            </button>
            <button
              class="rounded-lg border px-4 py-2 font-medium bg-orange-500 text-white hover:bg-orange-600 shadow-sm"
              onClick={async (e) => {
                e.preventDefault();
                setSaveLoading(true);
                setSaveError("");
                setSaveSuccess("");
                try {
                  const token = localStorage.getItem('token');
                  // if a new picture is selected, upload it first
                  let profilePicUrl = profilePicture();
                  if (selectedPicFile()) {
                    const form = new FormData();
                    form.append('file', selectedPicFile() as File);
                    const up = await fetch('http://localhost:8080/upload-profile-picture', {
                      method: 'POST',
                      headers: { 'Authorization': `Bearer ${token}` },
                      body: form,
                    });
                    if (!up.ok) {
                      const t = await up.text();
                      throw new Error(t || 'failed to upload image');
                    }
                    const j = await up.json();
                    profilePicUrl = j.url || '';
                    if (profilePicUrl && profilePicUrl.startsWith('/')) {
                      profilePicUrl = `http://localhost:8080${profilePicUrl}`;
                    }
                  }
                  const res = await fetch('http://localhost:8080/update-profile', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                      full_name: fullName() || null,
                      email: email() || null,
                      phone: phone() || null,
                      birth_date: (birthDate() ? toBackendDate(birthDate()) : null),
                      gender: gender() || null,
                      notifications: notifications() || null,
                      language: language() || null,
                      web_theme: theme() || null,
                      profile_picture: profilePicUrl || null,
                    })
                  });
                  if (res.ok) {
                    setSaveSuccess('preferences updated!');
                    if (selectedPicFile()) {
                      setProfilePicture(profilePicUrl);
                      setSelectedPicFile(null);
                    }
                    // update snapshot to the saved values
                    setInitialProfile({
                      full_name: fullName() || '',
                      email: email() || '',
                      phone: phone() || '',
                      birth_date: birthDate() || '', // already in YYYY-MM-DD
                      gender: gender() || '',
                      notifications: notifications() || '',
                      language: language() || '',
                      web_theme: theme() || '',
                      profile_picture: profilePicture() || '',
                    });
                  } else {
                    const err = await res.text();
                    setSaveError(err || 'failed to update preferences');
                  }
                } catch (err) {
                  setSaveError('failed to update preferences');
                } finally {
                  setSaveLoading(false);
                }
              }}
              disabled={saveLoading()}
            >
              {saveLoading() ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
          <div class="flex flex-col sm:flex-row items-center gap-6 mt-2 mb-8">
            <div class="relative">
              <img 
                src={
                  previewPic() ||
                  (profilePicture()
                    ? (profilePicture().startsWith('/')
                        ? `http://localhost:8080${profilePicture()}`
                        : profilePicture())
                    : "https://api.dicebear.com/7.x/bottts/svg?seed=Dzul Fikri")
                }
                alt="Profile" 
                class="rounded-full border-4 border-white shadow-[0_0_16px_0_rgba(0,0,0,0.10)] w-32 h-32 sm:w-40 sm:h-40 object-cover" 
              />
            </div>
            <div class="flex flex-col gap-4 items-center sm:items-start">
              <h2 class="text-xl font-semibold text-black">Profile Photo</h2>
              <div class="flex gap-3">
                <input
                  ref={el => (fileInputRef = el as HTMLInputElement)}
                  type="file"
                  accept="image/*"
                  class="hidden"
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0] || null;
                    setSelectedPicFile(file || null);
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setPreviewPic(url);
                    } else {
                      setPreviewPic('');
                    }
                  }}
                />
                <button
                  class="rounded-lg border border-gray-300 px-4 py-2 text-sm sm:text-base font-medium bg-white text-gray-700 hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  onClick={(e) => { e.preventDefault(); fileInputRef?.click(); }}
                >
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
                    type="date" 
                    class="w-full rounded-xl border border-gray-300 border-r-0 rounded-r-none px-4 py-2.5 text-gray-900 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 pr-10 [color-scheme:light] appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:pointer-events-none" 
                    value={birthDate()} 
                    onInput={e => setBirthDate(e.currentTarget.value)} 
                    ref={(el) => { birthDateInputRef = el as HTMLInputElement; }}
                  />
                  <button
                    type="button"
                    class="absolute inset-y-0 right-0 flex items-center px-3 bg-white border border-gray-300 rounded-r-xl text-gray-500 hover:text-black active:text-black focus:text-black focus:ring-2 focus:ring-orange-500"
                    onClick={(e) => {
                      e.preventDefault();
                      const el = birthDateInputRef;
                      if (!el) return;
                      // @ts-ignore showPicker not in all TS lib targets
                      if (typeof (el as any).showPicker === 'function') { (el as any).showPicker(); }
                      else { el.focus(); el.click(); }
                    }}
                    aria-label="Open calendar"
                    title="Open calendar"
                  >
                    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
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
            {logoutError() && (
              <div class="text-red-500 text-center mb-2">{logoutError()}</div>
            )}
            <button
              class="px-4 py-2.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              disabled={logoutLoading()}
              onClick={async (e) => {
                e.preventDefault();
                await handleLogout();
              }}
            >
              {logoutLoading() ? 'Logging out...' : 'Log out'}
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
