import React, { useState, useEffect } from 'react';
import { 
  Clock, Sun, CloudRain, Users, UserCheck, Cake, Megaphone, 
  Sparkles, Maximize2, Minimize2, ArrowLeft, Shield, Utensils,
  Award, Calendar, BellRing
} from 'lucide-react';

export default function DigitalInformationBoard({ onExit }) {
  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const formattedDate = time.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const birthdays = [
    { name: 'Kavya Choudhary', grade: 'Grade 3-A', scholarNo: '2418', avatar: 'K' },
    { name: 'Dakshraj Singh', grade: 'Grade 4-B', scholarNo: '2211', avatar: 'D' },
    { name: 'Rohan Deshmukh', grade: 'Grade 6-A', scholarNo: '1980', avatar: 'R' },
  ];

  const notices = [
    { id: 1, title: 'Admissions Open 2026–2027', category: 'Notice', time: 'Today' },
    { id: 2, title: 'Half-Yearly Examination Admit Cards Released', category: 'Exams', time: 'Urgent' },
    { id: 3, title: 'Parent-Teacher Meet (PTM) Scheduled for Saturday 10:00 AM', category: 'PTM', time: 'Upcoming' },
  ];

  const todayMenu = {
    breakfast: 'Poha with Roasted Peanuts & Fresh Milk',
    lunch: 'Steamed Rice, Yellow Dal Tadka, Phulka Roti, Seasonal Sabzi & Curd',
    snack: 'Banana & Mixed Nuts Chikki'
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-indigo-600 selection:text-white overflow-hidden">
      {/* Top Bar: Brand, Live Clock, Weather, Controls */}
      <header className="h-20 bg-slate-900/90 border-b border-slate-800 px-6 sm:px-10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-black text-xl shadow-lg">
              C
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white leading-tight">CampusNoa Live Display</h1>
              <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Campus Lobby & Reception Kiosk</p>
            </div>
          </div>
        </div>

        {/* Center: Big High-Contrast Clock */}
        <div className="text-center">
          <p className="text-3xl sm:text-4xl font-mono font-black tracking-tight text-indigo-400 drop-shadow-md">
            {formattedTime}
          </p>
          <p className="text-xs text-slate-400 font-medium">{formattedDate}</p>
        </div>

        {/* Right: Weather & Fullscreen Toggle */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3.5 py-1.5 rounded-xl text-xs">
            <Sun className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-200">28°C</span>
            <span className="text-slate-400">Pune, Maharashtra</span>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
            title="Toggle Fullscreen (F11)"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Body Dashboard Grid */}
      <div className="flex-1 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* Left Column: Real-time Attendance & Today's Nutrition */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Live Attendance Metric Cards */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-400" /> Live Student Attendance
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                94.4% Present
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-center">
                <p className="text-3xl font-mono font-black text-emerald-400">1,180</p>
                <p className="text-xs font-semibold text-slate-400 mt-1 uppercase">Students Present</p>
              </div>
              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 text-center">
                <p className="text-3xl font-mono font-black text-rose-400">70</p>
                <p className="text-xs font-semibold text-slate-400 mt-1 uppercase">Students Absent</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Faculty & Staff Attendance:</span>
              <strong className="text-slate-200">42 / 44 Present (95.5%)</strong>
            </div>
          </div>

          {/* Today's Canteen / Nutrition Menu */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-amber-400" /> Daily Healthy Food Menu
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded-md">
                Certified Hygienic
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <p className="font-bold text-amber-400 uppercase text-[10px]">Morning Breakfast</p>
                <p className="text-slate-200 font-medium mt-0.5">{todayMenu.breakfast}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <p className="font-bold text-emerald-400 uppercase text-[10px]">Nutritional Hot Lunch</p>
                <p className="text-slate-200 font-medium mt-0.5">{todayMenu.lunch}</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <p className="font-bold text-indigo-400 uppercase text-[10px]">Evening Snack</p>
                <p className="text-slate-200 font-medium mt-0.5">{todayMenu.snack}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Featured Announcement & Video/Event Highlights */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Main Visual Board Banner */}
          <div className="bg-gradient-to-br from-indigo-900/80 via-slate-900 to-indigo-950 border border-indigo-700/40 rounded-2xl p-6 shadow-2xl flex-1 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold mb-4">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Featured Institutional Update</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight leading-snug">
                Welcome to CampusNoa Academic Year 2026–2027
              </h2>
              <p className="text-xs text-indigo-200 mt-2 leading-relaxed">
                Empowering every learner with academic excellence, holistic co-scholastic activities, and state-of-the-art technological support.
              </p>
            </div>

            {/* Quote of the Day */}
            <div className="mt-6 p-4 rounded-xl bg-slate-950/60 border border-indigo-500/30">
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-1">Thought for the Day</p>
              <blockquote className="text-sm italic font-serif text-slate-100">
                "Education is the most powerful weapon which you can use to change the world."
              </blockquote>
              <p className="text-right text-[11px] text-indigo-400 font-bold mt-1">— Nelson Mandela</p>
            </div>
          </div>

          {/* Active Notices Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
              <BellRing className="w-4 h-4 text-indigo-400" /> Official Circulars & Notices
            </span>
            <div className="space-y-2">
              {notices.map((n) => (
                <div key={n.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span className="font-semibold text-slate-200">{n.title}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase px-2 py-0.5 rounded bg-slate-800">
                    {n.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Birthday Celebrations & Visitor Logs */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Today's Birthdays Celebration Card */}
          <div className="bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border border-amber-600/30 rounded-2xl p-5 shadow-xl flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Cake className="w-4 h-4 text-amber-400" /> Today's Birthday Celebrations
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                3 Students
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {birthdays.map((b, idx) => (
                <div key={idx} className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-800/60 border border-amber-500/20">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                    {b.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{b.name}</p>
                    <p className="text-xs text-amber-300/80 font-medium">{b.grade} &bull; Scholar #{b.scholarNo}</p>
                  </div>
                  <span className="text-lg">🎂</span>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-amber-900/20 border border-amber-600/30 rounded-xl text-center">
              <p className="text-xs font-bold text-amber-300">Happy Birthday from the Entire CampusNoa Family!</p>
            </div>
          </div>

          {/* Quick Security Status */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-3">
              <Shield className="w-4 h-4 text-emerald-400" /> Campus Security & Logistics
            </span>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                <p className="text-xl font-bold font-mono text-emerald-400">12 / 12</p>
                <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">Active Bus GPS</p>
              </div>
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50">
                <p className="text-xl font-bold font-mono text-indigo-400">14 Verified</p>
                <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">Gate Visitors Today</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Ticker: High-Contrast Scrolling Marquee */}
      <footer className="h-12 bg-indigo-950 border-t border-indigo-800/80 px-6 flex items-center gap-3 shrink-0">
        <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-indigo-600 text-white shrink-0">
          <Megaphone className="w-3.5 h-3.5" /> Live Ticker
        </span>
        <div className="flex-1 overflow-hidden">
          <div className="whitespace-nowrap animate-marquee text-xs font-semibold text-indigo-100 flex items-center gap-8">
            <span>&bull; Parent-Teacher Meeting (PTM) for Grades 1 to 6 scheduled this Saturday from 09:30 AM</span>
            <span>&bull; Digital Admit Cards for Half-Yearly Exams are now available for download in Parent Portal</span>
            <span>&bull; School Transport: Route #04 running 10 minutes delayed due to highway resurfacing</span>
            <span>&bull; Term-2 Fee installment due date is December 10, 2026; bank challans can be generated online</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
