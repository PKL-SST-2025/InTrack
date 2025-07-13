import { createSignal } from 'solid-js';
import { useNavigate, A } from '@solidjs/router';
import {
  AiOutlineMail,
  AiFillGoogleCircle,
} from 'solid-icons/ai';
import {
  HiOutlineLockClosed,
  HiOutlineEyeSlash,
  HiOutlineEye,
  HiOutlinePhone,
} from 'solid-icons/hi';
import logo from './assets/logo.png';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = createSignal(false);
  const togglePassword = () => setShowPassword((v) => !v);

  return (
    <div class="flex flex-col md:flex-row items-center justify-center h-screen w-screen bg-white px-4">
      <div class="flex flex-1 w-full max-w-screen-xl mx-auto items-center justify-center gap-32">
        {/* Logo Section */}
        <div class="hidden md:flex md:w-5/12 items-center justify-end pr-12 md:pl-24">
          <A href="/">
            <img src={logo} alt="InTrack Logo" class="max-w-xs w-72 h-auto cursor-pointer" />
          </A>
        </div>
        {/* Form Section */}
        <div class="w-full md:w-5/12 max-w-md bg-white rounded-[2rem] shadow-[0_0_40px_rgba(0,0,0,0.1)] px-8 py-10 flex flex-col items-center">
        <h1 class="text-4xl font-bold mb-10 text-center text-black">
          Hello again!
        </h1>
        <form class="w-full flex flex-col gap-8" onSubmit={e => { e.preventDefault(); navigate('/Dashboard'); }}>
          {/* email */}
          <div class="flex flex-col gap-2">
            <label for="email" class="text-base font-medium text-black">
              Email
            </label>
            <div class="flex items-center bg-white border border-gray-300 rounded-2xl px-6 py-5 shadow-sm">
              <AiOutlineMail class="w-7 h-7 text-gray-400 mr-4" />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                class="flex-1 outline-none bg-transparent text-lg text-black"
                autocomplete="email"
              />
            </div>
          </div>

          {/* password */}
          <div class="flex flex-col gap-2">
            <label for="password" class="text-base font-medium text-black">
              Password
            </label>
            <div class="flex items-center bg-white border border-gray-300 rounded-2xl px-6 py-5 shadow-sm relative">
              <HiOutlineLockClosed class="w-7 h-7 text-gray-400 mr-4" />
              <input
                id="password"
                type={showPassword() ? 'text' : 'password'}
                placeholder="••••••••"
                class="flex-1 outline-none bg-transparent text-lg text-black"
                autocomplete="current-password"
              />
              <button
                type="button"
                class="bg-transparent border-none p-0 m-0 text-gray-400 focus:outline-none cursor-pointer ml-4"
                onClick={togglePassword}
                tabIndex={-1}
              >
                {showPassword() ? (
                  <HiOutlineEye class="w-6 h-6" />
                ) : (
                  <HiOutlineEyeSlash class="w-6 h-6" />
                )}
              </button>
            </div>
            <div class="text-right">
              <a
                href="/ResetPasswordEmail"
                class="text-sm text-yellow-500 hover:underline inline-block mt-1 glow-orange-hover"
              >
                Forgot Password?
              </a>
            </div>
          </div>

          {/* login button */}
          <button
            type="submit"
            class="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-5 rounded-2xl text-xl shadow-lg transition-all"
            onClick={() => navigate('/Dashboard')}
          >
            Login
          </button>
        </form>

        {/* register link */}
        <div class="mt-8 text-center text-base text-black">
          Don’t have an account?{' '}
          <A href="/Register" class="text-yellow-500 font-medium hover:underline glow-orange-hover">Register</A>
        </div>

        {/* divider */}
        <div class="flex items-center w-full my-8">
          <div class="flex-1 h-px bg-gray-200" />
          <span class="mx-4 text-gray-400 text-base">or</span>
          <div class="flex-1 h-px bg-gray-200" />
        </div>

        {/* social buttons */}
        <div class="flex gap-8 justify-center w-full">
          <button class="w-16 h-16 rounded-full social-btn-white glow-orange-btn-hover flex items-center justify-center">
            <HiOutlinePhone class="w-8 h-8 social-icon" />
          </button>
          <button class="w-16 h-16 rounded-full social-btn-white glow-orange-btn-hover flex items-center justify-center">
            <AiFillGoogleCircle class="w-8 h-8 social-icon" />
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Login;
