import { createSignal } from 'solid-js';
import { useNavigate, useLocation, A } from '@solidjs/router';
import { HiOutlineLockClosed, HiOutlineEyeSlash, HiOutlineEye } from 'solid-icons/hi';
import logo from './assets/logo.png';

const ResetPasswordNew = () => {
  const [password, setPassword] = createSignal('');
  const [confirmPassword, setConfirmPassword] = createSignal('');
  const [showPassword, setShowPassword] = createSignal(false);
  const [showConfirm, setShowConfirm] = createSignal(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as any)?.email || 'your current account.';

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (password() !== confirmPassword()) {
      alert('Passwords do not match');
      return;
    }
    // Normally, reset password here
    navigate('/Login');
  };

  return (
    <div class="flex h-screen w-screen bg-white overflow-hidden">
      {/* Logo on the left */}
      <div class="hidden md:flex items-center justify-center w-1/3 px-12">
        <A href="/" class="block">
          <img 
            src={logo}
            alt="InTrack Logo" 
            class="max-w-full h-auto max-h-24"
          />
        </A>
      </div>
      {/* Form container centered in remaining space */}
      <div class="flex-1 flex items-center justify-center p-4">
        <div class="w-full max-w-md bg-white rounded-[2rem] shadow-[0_0_40px_rgba(0,0,0,0.1)] p-8 flex flex-col items-center">
        <h1 class="text-4xl font-bold mb-10 text-center text-black">Reset Password</h1>
        <form class="w-full flex flex-col gap-8" onSubmit={handleSubmit}>
          <div class="flex flex-col gap-2">
            <label for="password" class="text-base font-medium text-black">Password</label>
            <div class="flex items-center bg-white border border-gray-300 rounded-2xl px-6 py-5 shadow-sm relative">
              <HiOutlineLockClosed class="w-7 h-7 text-gray-400 mr-4" />
              <input
                id="password"
                type={showPassword() ? 'text' : 'password'}
                placeholder="••••••••"
                class="flex-1 outline-none bg-transparent text-lg text-black"
                autocomplete="new-password"
                required
                value={password()}
                onInput={e => setPassword(e.currentTarget.value)}
              />
              <button
                type="button"
                class="bg-transparent border-none p-0 m-0 text-gray-400 focus:outline-none cursor-pointer ml-4"
                onClick={() => setShowPassword(v => !v)}
                tabIndex={-1}
              >
                {showPassword() ? (
                  <HiOutlineEye class="w-6 h-6" />
                ) : (
                  <HiOutlineEyeSlash class="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <label for="confirm-password" class="text-base font-medium text-black">Confirm password</label>
            <div class="flex items-center bg-white border border-gray-300 rounded-2xl px-6 py-5 shadow-sm relative">
              <HiOutlineLockClosed class="w-7 h-7 text-gray-400 mr-4" />
              <input
                id="confirm-password"
                type={showConfirm() ? 'text' : 'password'}
                placeholder="••••••••"
                class="flex-1 outline-none bg-transparent text-lg text-black"
                autocomplete="new-password"
                required
                value={confirmPassword()}
                onInput={e => setConfirmPassword(e.currentTarget.value)}
              />
              <button
                type="button"
                class="bg-transparent border-none p-0 m-0 text-gray-400 focus:outline-none cursor-pointer ml-4"
                onClick={() => setShowConfirm(v => !v)}
                tabIndex={-1}
              >
                {showConfirm() ? (
                  <HiOutlineEye class="w-6 h-6" />
                ) : (
                  <HiOutlineEyeSlash class="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            class="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-5 rounded-2xl text-xl shadow-lg transition-all"
          >
            Reset
          </button>
        </form>
        <div class="mt-8 text-center text-base text-black">
          For {email}{' '}
          <A href="/ResetPasswordEmail" class="text-yellow-500 font-medium hover:underline glow-orange-hover">Not you?</A>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordNew;
