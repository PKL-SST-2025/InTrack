import { createSignal } from 'solid-js';
import { useNavigate, A } from '@solidjs/router';
import { AiOutlineMail } from 'solid-icons/ai';

const ResetPasswordEmail = () => {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal('');

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    // Normally, send reset email here
    navigate('/ResetPasswordNew', { state: { email: email() } });
  };

  return (
    <div class="flex items-center justify-center h-screen w-screen bg-white px-4">
      <div class="w-full max-w-md bg-white rounded-[2rem] shadow-[0_0_40px_rgba(0,0,0,0.1)] px-8 py-10 flex flex-col items-center">
        <h1 class="text-4xl font-bold mb-10 text-center text-black">Reset Password</h1>
        <form class="w-full flex flex-col gap-8" onSubmit={handleSubmit}>
          <div class="flex flex-col gap-2">
            <label for="email" class="text-base font-medium text-black">Email</label>
            <div class="flex items-center bg-white border border-gray-300 rounded-2xl px-6 py-5 shadow-sm">
              <AiOutlineMail class="w-7 h-7 text-gray-400 mr-4" />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                class="flex-1 outline-none bg-transparent text-lg text-black"
                autocomplete="email"
                required
                value={email()}
                onInput={e => setEmail(e.currentTarget.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            class="w-full bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-5 rounded-2xl text-xl shadow-lg transition-all"
          >
            Submit
          </button>
        </form>
        <div class="mt-8 text-center text-base text-black">
          Remembered your password?{' '}
          <A href="/Login" class="text-yellow-500 font-medium hover:underline glow-orange-hover">Login</A>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordEmail;
