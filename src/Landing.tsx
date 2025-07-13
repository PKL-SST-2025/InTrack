import { A } from '@solidjs/router';
import logo from './assets/logo.png';
import teaching from './assets/teaching.png';

export default function Landing() {
  return (
    <div class="w-screen min-h-screen flex flex-col bg-white font-poppins">
      {/* Header */}
      <header class="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-30">
        <div class="flex items-center gap-2">
          <img src={logo} alt="InTrack Logo" class="w-59 h-10" />
        </div>
        <nav class="hidden md:flex items-center gap-8 text-base font-medium">
          <A href="#" class="hover:text-orange-500 text-black transition">Home</A>
          <A href="#about" class="hover:text-orange-500 text-black transition">About</A>
          <A href="#features" class="hover:text-orange-500 text-black transition">Features</A>
        </nav>
        <A href="/login" class="hidden md:inline-block px-5 py-2 rounded-lg bg-orange-500 text-white font-semibold shadow hover:bg-orange-600 transition">Dashboard</A>
      </header>

      {/* Hero Section */}
      <section class="flex flex-col md:flex-row h-[calc(100vh-72px)] min-h-[500px] w-full overflow-hidden bg-white">
        <div class="flex-1 flex flex-col justify-center pl-28 pr-8 gap-8 h-full">
          <h1 class="text-4xl md:text-5xl font-bold text-black leading-tight">
            It's as if<br />everything is <span class="text-orange-500">under control</span>
          </h1>
          <p class="text-lg text-gray-700 max-w-lg">
            InTrack makes your activities organized efficiently by tracking, filling, and visualizing all your group situations. Life is in your hands!
          </p>
          <A href="/login" class="inline-block px-6 py-3 rounded-lg bg-orange-500 text-white font-semibold text-lg shadow hover:bg-orange-600 transition w-max">Dashboard</A>
        </div>
        <div class="flex-1 h-full">
          <img src="./src/assets/undercontrol.png" alt="Situation" class="w-full h-full object-cover" />
        </div>
      </section>

      {/* Motto & About */}
      <section id="about" class="bg-orange-500 py-16 px-4 flex flex-col items-center">
        <div class="bg-white rounded-2xl shadow p-8 max-w-2xl w-full text-center">
          <h2 class="text-2xl text-black font-bold mb-4">Our motto</h2>
          <p class="italic text-gray-500 mb-6">"It's better to take some precautions than none at all.<br />You'll never know what happens next."</p>
          <p class="text-black text-base">
            <b>inTrack</b> is a simple but flexible attendance platform designed to help you create your own scenario-based tracking, making it easy to log, track, and visualize your group activities. Whether you are a student, teacher, or team lead, InTrack helps you manage your group situation with clarity and control.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" class="relative flex flex-col items-center justify-center min-h-[80vh] py-12 px-2 overflow-hidden">
  {/* Blurred background image */}
  <img src={teaching} alt="Teaching" class="absolute inset-0 w-full h-full object-cover blur-lg pointer-events-none select-none z-0" />
  <div class="relative z-10 w-full max-w-7xl flex flex-col items-center justify-center">
    <h2 class="text-4xl md:text-5xl font-bold mb-12 text-center text-white drop-shadow-lg">See what’s useful for you</h2>
    <div class="w-full grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
      <div class="bg-white bg-opacity-90 rounded-xl shadow-xl p-8 flex flex-col items-center min-w-[220px]">
        <div class="font-semibold mb-3 text-black text-lg text-center">Real Time Tracking</div>
        <div class="text-gray-600 text-sm text-center">Track how much your members are actually engaging. Or if you’re one of their members, track how much you’ve missed. With our tools, you’re guaranteed to not miss anything important ever again.</div>
      </div>
      <div class="bg-white bg-opacity-90 rounded-xl shadow-xl p-8 flex flex-col items-center min-w-[220px]">
        <div class="font-semibold mb-3 text-black text-lg text-center">Rooms</div>
        <div class="text-gray-600 text-sm text-center">Manage on how you want your members to do their attendances in good ways, and know what you’re doing.</div>
      </div>
      <div class="bg-white bg-opacity-90 rounded-xl shadow-xl p-8 flex flex-col items-center min-w-[220px]">
        <div class="font-semibold mb-3 text-black text-lg text-center">Filling Station</div>
        <div class="text-gray-600 text-sm text-center">Wanna know how much attendances you’ve been missing for the past week? We’ve got you. In fact, it’s all there, waiting for you to realize that you’re a disappointing human being.</div>
      </div>
      <div class="bg-white bg-opacity-90 rounded-xl shadow-xl p-8 flex flex-col items-center min-w-[220px]">
        <div class="font-semibold mb-3 text-black text-lg text-center">Owner = Member</div>
        <div class="text-gray-600 text-sm text-center">You can be anything who you want to be. It’s just that there’s only 2 options. Either be an owner of a cringe room, or be the member of it. It’s your choice!</div>
      </div>
    </div>
    <div class="flex flex-col items-center">
      <h3 class="text-3xl md:text-4xl font-bold mb-6 text-white drop-shadow-lg">Ready to track?</h3>
      <A href="/Dashboard" class="inline-block px-8 py-3 rounded-lg bg-orange-500 text-white font-semibold text-lg shadow hover:bg-orange-600 transition w-max">Dashboard</A>
    </div>
  </div>
</section>

      {/* Footer */}
      <footer class="bg-white border-t border-gray-200 py-8 px-4 mt-auto">
        <div class="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div class="flex flex-col gap-2 items-start">
            <div class="flex items-center gap-2 mb-2">
              <img src={logo} alt="InTrack Logo" class="w-59 h-10" />
            </div>
            <div class="flex gap-3 text-gray-500 text-lg">
              <A href="#"><i class="i-simple-icons-x"></i></A>
              <A href="#"><i class="i-simple-icons-instagram"></i></A>
              <A href="#"><i class="i-simple-icons-github"></i></A>
              <A href="#"><i class="i-simple-icons-youtube"></i></A>
              <A href="#"><i class="i-simple-icons-linkedin"></i></A>
            </div>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-8 flex-1">
            <div>
              <div class="font-semibold mb-2">Use cases</div>
              <ul class="text-gray-600 text-sm flex flex-col gap-1">
                <li>UI design</li>
                <li>UX design</li>
                <li>Wireframing</li>
                <li>Diagramming</li>
                <li>Brainstorming</li>
                <li>Whiteboarding</li>
                <li>Team collaboration</li>
              </ul>
            </div>
            <div>
              <div class="font-semibold mb-2">Explore</div>
              <ul class="text-gray-600 text-sm flex flex-col gap-1">
                <li>Design</li>
                <li>Prototyping</li>
                <li>Development features</li>
                <li>Design systems</li>
                <li>Collaboration features</li>
                <li>Project process</li>
                <li>Figma</li>
              </ul>
            </div>
            <div>
              <div class="font-semibold mb-2">Resources</div>
              <ul class="text-gray-600 text-sm flex flex-col gap-1">
                <li>Blog</li>
                <li>Best practices</li>
                <li>Colors</li>
                <li>Color wheel</li>
                <li>Support</li>
                <li>Developer docs</li>
                <li>Resource library</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="text-center text-xs text-gray-500 mt-8">© 2025 InTrack</div>
      </footer>
    </div>
  );
}
