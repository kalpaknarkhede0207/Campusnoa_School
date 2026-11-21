import React, { useState, useEffect } from 'react';
import { 
  User, BookOpen, Clock, Calendar, Award, CheckCircle2, 
  ShieldCheck, Utensils, Printer, ChevronRight, Check, Sparkles,
  FileText, Building2, BellRing, QrCode, Download, BookMarked, Smile
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import PrintableAdmitCardModal from '../components/PrintableAdmitCardModal';
import PrintableCertificateModal from '../components/PrintableCertificateModal';
import PrintableReportCardModal from '../components/PrintableReportCardModal';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DEFAULT_TIMETABLE = {
  'Monday': [
    { period: 1, time: '08:30 - 09:15', subject: 'Mathematics', teacher: 'Mrs. Anjali Desai', room: 'Room 104', type: 'Core Theory' },
    { period: 2, time: '09:15 - 10:00', subject: 'General Science', teacher: 'Mr. Rakesh Sharma', room: 'Science Lab B', type: 'Lab & Practical' },
    { period: 3, time: '10:00 - 10:45', subject: 'English Literature', teacher: 'Ms. Sunita Patil', room: 'Room 104', type: 'Core Theory' },
    { period: 4, time: '10:45 - 11:15', subject: 'Nutrition Recess', teacher: 'Cafeteria Staff', room: 'Dining Hall', type: 'Break' },
    { period: 5, time: '11:15 - 12:00', subject: 'Social Studies & EVS', teacher: 'Mrs. Preeti Verma', room: 'Room 104', type: 'Interactive' },
    { period: 6, time: '12:00 - 12:45', subject: 'Regional Language (Marathi/Hindi)', teacher: 'Mr. Ashok Shinde', room: 'Room 104', type: 'Language' },
    { period: 7, time: '12:45 - 01:30', subject: 'Computer Science & AI', teacher: 'Mr. Vikram Nair', room: 'IT Lab 1', type: 'Hands-on Coding' },
    { period: 8, time: '01:30 - 02:15', subject: 'Physical Education & Games', teacher: 'Mr. Sandeep Patil', room: 'Main Sports Ground', type: 'Activity' },
  ],
  'Tuesday': [
    { period: 1, time: '08:30 - 09:15', subject: 'General Science', teacher: 'Mr. Rakesh Sharma', room: 'Science Lab B', type: 'Experiment' },
    { period: 2, time: '09:15 - 10:00', subject: 'Mathematics', teacher: 'Mrs. Anjali Desai', room: 'Room 104', type: 'Core Theory' },
    { period: 3, time: '10:00 - 10:45', subject: 'English Grammar & Speech', teacher: 'Ms. Sunita Patil', room: 'Room 104', type: 'Communication' },
    { period: 4, time: '10:45 - 11:15', subject: 'Nutrition Recess', teacher: 'Cafeteria Staff', room: 'Dining Hall', type: 'Break' },
    { period: 5, time: '11:15 - 12:00', subject: 'Environmental Studies', teacher: 'Mrs. Preeti Verma', room: 'Room 104', type: 'Project' },
    { period: 6, time: '12:00 - 12:45', subject: 'Visual Arts & Craft', teacher: 'Mrs. Neha Kulkarni', room: 'Art Studio', type: 'Creative' },
    { period: 7, time: '12:45 - 01:30', subject: 'Regional Language', teacher: 'Mr. Ashok Shinde', room: 'Room 104', type: 'Language' },
    { period: 8, time: '01:30 - 02:15', subject: 'Library & Guided Reading', teacher: 'Mr. Rajesh Kadam', room: 'Central Library', type: 'Self Study' },
  ],
  'Wednesday': [
    { period: 1, time: '08:30 - 09:15', subject: 'Mathematics (Mental Ability)', teacher: 'Mrs. Anjali Desai', room: 'Room 104', type: 'Quiz & Drill' },
    { period: 2, time: '09:15 - 10:00', subject: 'English Comprehension', teacher: 'Ms. Sunita Patil', room: 'Room 104', type: 'Core Theory' },
    { period: 3, time: '10:00 - 10:45', subject: 'General Science', teacher: 'Mr. Rakesh Sharma', room: 'Room 104', type: 'Core Theory' },
    { period: 4, time: '10:45 - 11:15', subject: 'Nutrition Recess', teacher: 'Cafeteria Staff', room: 'Dining Hall', type: 'Break' },
    { period: 5, time: '11:15 - 12:00', subject: 'Social Studies', teacher: 'Mrs. Preeti Verma', room: 'Room 104', type: 'Core Theory' },
    { period: 6, time: '12:00 - 12:45', subject: 'Music & Performing Arts', teacher: 'Pt. Rahul Joshi', room: 'Music Hall', type: 'Cultural' },
    { period: 7, time: '12:45 - 01:30', subject: 'STEM Robotics & Tinkering', teacher: 'Mr. Vikram Nair', room: 'Robotics Lab', type: 'Practical' },
    { period: 8, time: '01:30 - 02:15', subject: 'Swimming / Yoga Session', teacher: 'Coach Pooja Rao', room: 'Indoor Complex', type: 'Physical' },
  ],
  'Thursday': [
    { period: 1, time: '08:30 - 09:15', subject: 'Social Studies & Civics', teacher: 'Mrs. Preeti Verma', room: 'Room 104', type: 'Core Theory' },
    { period: 2, time: '09:15 - 10:00', subject: 'Mathematics', teacher: 'Mrs. Anjali Desai', room: 'Room 104', type: 'Core Theory' },
    { period: 3, time: '10:00 - 10:45', subject: 'English Creative Writing', teacher: 'Ms. Sunita Patil', room: 'Room 104', type: 'Workshop' },
    { period: 4, time: '10:45 - 11:15', subject: 'Nutrition Recess', teacher: 'Cafeteria Staff', room: 'Dining Hall', type: 'Break' },
    { period: 5, time: '11:15 - 12:00', subject: 'General Science', teacher: 'Mr. Rakesh Sharma', room: 'Science Lab B', type: 'Demonstration' },
    { period: 6, time: '12:00 - 12:45', subject: 'Regional Language', teacher: 'Mr. Ashok Shinde', room: 'Room 104', type: 'Language' },
    { period: 7, time: '12:45 - 01:30', subject: 'Computer Applications', teacher: 'Mr. Vikram Nair', room: 'IT Lab 1', type: 'Coding' },
    { period: 8, time: '01:30 - 02:15', subject: 'Football / Athletics', teacher: 'Mr. Sandeep Patil', room: 'Sports Arena', type: 'Sports' },
  ],
  'Friday': [
    { period: 1, time: '08:30 - 09:15', subject: 'Mathematics Problem Solving', teacher: 'Mrs. Anjali Desai', room: 'Room 104', type: 'Core Theory' },
    { period: 2, time: '09:15 - 10:00', subject: 'English Story & Drama', teacher: 'Ms. Sunita Patil', room: 'Room 104', type: 'Theatre' },
    { period: 3, time: '10:00 - 10:45', subject: 'General Science Seminar', teacher: 'Mr. Rakesh Sharma', room: 'Room 104', type: 'Presentation' },
    { period: 4, time: '10:45 - 11:15', subject: 'Nutrition Recess', teacher: 'Cafeteria Staff', room: 'Dining Hall', type: 'Break' },
    { period: 5, time: '11:15 - 12:00', subject: 'EVS Nature Walk & Garden', teacher: 'Mrs. Preeti Verma', room: 'Botanical Court', type: 'Outdoors' },
    { period: 6, time: '12:00 - 12:45', subject: 'Regional Language Literature', teacher: 'Mr. Ashok Shinde', room: 'Room 104', type: 'Language' },
    { period: 7, time: '12:45 - 01:30', subject: 'Chess & Board Logic Games', teacher: 'Coach R. K. Nair', room: 'Activity Room 2', type: 'Strategy' },
    { period: 8, time: '01:30 - 02:15', subject: 'Weekly Homeroom Review', teacher: 'Mrs. Anjali Desai', room: 'Room 104', type: 'Mentorship' },
  ],
  'Saturday': [
    { period: 1, time: '08:30 - 09:15', subject: 'Club Activity / Eco Club', teacher: 'Club Coordinators', room: 'Campus Green', type: 'Club' },
    { period: 2, time: '09:15 - 10:00', subject: 'General Knowledge & Current Affairs', teacher: 'Ms. Sunita Patil', room: 'Room 104', type: 'Inter-house' },
    { period: 3, time: '10:00 - 10:45', subject: 'Vedic Math & Puzzles', teacher: 'Mrs. Anjali Desai', room: 'Room 104', type: 'Speed Math' },
    { period: 4, time: '10:45 - 11:15', subject: 'Nutrition Recess', teacher: 'Cafeteria Staff', room: 'Dining Hall', type: 'Break' },
    { period: 5, time: '11:15 - 12:30', subject: 'House Assembly & Cultural Practice', teacher: 'House Masters', room: 'Auditorium', type: 'Assembly' },
  ]
};

const DEFAULT_RFID_LOGS = [
  { id: 1, date: 'Today (21-Nov-2026)', time: '08:08 AM', direction: 'IN', gate: 'Campus Main Gate (Turnstile 02)', device: 'UHF RFID Reader #04', mode: 'Card Tap + Biometric Verification', status: 'VERIFIED', escort: 'School Bus #04' },
  { id: 2, date: 'Yesterday (20-Nov-2026)', time: '02:22 PM', direction: 'OUT', gate: 'Campus Main Gate (Turnstile 01)', device: 'UHF RFID Reader #01', mode: 'RFID Reader + Escort Verified', status: 'VERIFIED', escort: 'Authorized Parent' },
  { id: 3, date: 'Yesterday (20-Nov-2026)', time: '08:12 AM', direction: 'IN', gate: 'Campus Main Gate (Turnstile 02)', device: 'UHF RFID Reader #04', mode: 'Card Tap + Biometric Verification', status: 'VERIFIED', escort: 'School Bus #04' },
];

const DEFAULT_CANTEEN_MENU = {
  'Monday': {
    breakfast: 'Steamed Poha with Mustard Seeds, Curry Leaves, Roasted Peanuts & Warm Cow Milk',
    lunch: 'Steamed Jeera Rice, Yellow Moong Dal Tadka, Fresh Phulka Rotis, Aloo Gobhi Matar Sabzi & Curd',
    snack: 'Fresh Robusta Banana & Jaggery Sesame Chikki',
    nutrition: 'High Fiber, Protein 18g, Cal: 480 kcal'
  },
  'Tuesday': {
    breakfast: 'Steamed Rice Idli (3 pcs) with Sambhar, Fresh Coconut Chutney & Warm Milk',
    lunch: 'Rajma Masala, Kashmiri Steamed Rice, Butter Phulkas, Cucumber Tomato Salad & Boondi Raita',
    snack: 'Roasted Salted Makhana (Foxnuts) & Roasted Bengal Gram',
    nutrition: 'Complex Carbs, Protein 21g, Cal: 510 kcal'
  },
  'Wednesday': {
    breakfast: 'Vegetable Upma with Carrots, Beans, Ginger Tempering & Warm Milk',
    lunch: 'Choori Dal, Steamed Rice, Crisp Bhindi Fry, Whole Wheat Rotis & Mint Buttermilk',
    snack: 'Fresh Seasonal Sweet Orange & Roasted Peanuts',
    nutrition: 'Vitamin C Boost, Protein 16g, Cal: 460 kcal'
  },
  'Thursday': {
    breakfast: 'Stuffed Aloo Methi Paratha (Low Oil) with Homemade Curd & Mint Chutney',
    lunch: 'Gujarati Kadhi, Moong Dal Khichdi with Pure Ghee, Papad, Spiced Cabbage Sambharo & Curd',
    snack: 'Boiled Sweet Corn with Lemon & Chaat Masala',
    nutrition: 'Digestive & Probiotic, Protein 17g, Cal: 490 kcal'
  },
  'Friday': {
    breakfast: 'Vegetable Vermicelli (Sewai) Pulao with Green Peas, Carrots & Warm Milk',
    lunch: 'Paneer Makhani (Cottage Cheese), Steamed Jeera Rice, Soft Tawa Rotis, Green Salad & Raita',
    snack: 'Mixed Dry Fruits Chikki (Almonds, Cashews, Jaggery)',
    nutrition: 'Calcium & Healthy Fats, Protein 24g, Cal: 550 kcal'
  },
  'Saturday': {
    breakfast: 'Crispy Masala Dosa with Drumstick Sambhar, Coconut Chutney & Warm Milk',
    lunch: 'Hyderabadi Veg Dum Biryani, Mixed Veg Raita, Crispy Roasted Papad & Mini Gulab Jamun',
    snack: 'Freshly Pressed Seasonal Fruit Juice (Orange / Pomegranate)',
    nutrition: 'Wholesome Celebration Lunch, Protein 19g, Cal: 530 kcal'
  }
};

const DEFAULT_LIBRARY_BOOKS = [
  { id: 1, title: 'The Story of India’s Space Exploration', author: 'Dr. K. Radhakrishnan', callNo: 'LIB-SCI-402', issuedOn: '10-Nov-2026', dueDate: '25-Nov-2026', status: 'ACTIVE' },
  { id: 2, title: 'Malgudi Days & Other Tales', author: 'R. K. Narayan', callNo: 'LIB-LIT-118', issuedOn: '14-Nov-2026', dueDate: '28-Nov-2026', status: 'ACTIVE' },
];

export default function StudentDashboard() {
  const { user, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('overview'); // overview, timetable, diary, attendance, exams, library, canteen, certificates
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Homework state
  const [homeworkList, setHomeworkList] = useState([]);
  const [completedHomework, setCompletedHomework] = useState({});

  // Day selector
  const [selectedDay, setSelectedDay] = useState(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    return today === 'Sunday' ? 'Monday' : today;
  });

  // Modal states
  const [showAdmitCardModal, setShowAdmitCardModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [showReportCardModal, setShowReportCardModal] = useState(false);
  const [certType, setCertType] = useState('bonafide');

  const loadStudentData = async () => {
    try {
      setLoading(true);
      const [wardRes, hwRes] = await Promise.all([
        api.getStudentWard().catch(() => null),
        api.getHomework().catch(() => ({ homework: [] }))
      ]);

      const st = wardRes?.student || {
        id: '24755',
        name: user?.name || 'Aarav Sharma',
        rollNo: '14',
        grade: 'Grade 5',
        section: 'B',
        gradeDisplay: 'Grade 5-B',
        admissionNumber: '24755',
        attendanceRate: 94,
        classTeacher: 'Mrs. Anjali Desai',
        feeStatus: 'PAID'
      };

      setStudent(st);
      setHomeworkList(Array.isArray(hwRes?.homework) ? hwRes.homework : [
        { id: 'hw-1', subject: 'Mathematics', title: 'Chapter 6 Practice Numerical', description: 'Solve Q1 to Q5 from page 78 in homework notebook.', due_date: 'Tomorrow' },
        { id: 'hw-2', subject: 'General Science', title: 'Plant Reproduction Flowchart', description: 'Draw labelled diagram of flower parts in fair book.', due_date: '23-Nov-2026' },
        { id: 'hw-3', subject: 'English', title: 'Reading Comprehension', description: 'Read Chapter 4 "The Brave Voyager" and write 5 new vocabulary words.', due_date: '24-Nov-2026' },
      ]);
    } catch (err) {
      console.warn('Student data load:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, []);

  // Listen to navigation events from sidebar
  useEffect(() => {
    const handleSwitch = (e) => {
      if (e.detail?.tab) {
        setActiveTab(e.detail.tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    window.addEventListener('campusnoa:switchTab', handleSwitch);
    return () => window.removeEventListener('campusnoa:switchTab', handleSwitch);
  }, []);

  const handleToggleHomework = (hwId) => {
    setCompletedHomework(prev => {
      const next = !prev[hwId];
      if (next) {
        showToast('Great job! Homework marked as completed.', 'success');
      }
      return { ...prev, [hwId]: next };
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold">Loading Scholar Workspace...</p>
      </div>
    );
  }

  const scholarName = student?.name || user?.name || 'Aarav Sharma';
  const scholarGrade = student?.gradeDisplay || `${student?.grade || 'Grade 5'} - ${student?.section || 'B'}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in space-y-6">
      {/* Scholar Header Hero */}
      <div className="card-clean p-6 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white border-0 shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-white/20">
              {scholarName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-white">{scholarName}</h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" /> Scholar
                </span>
              </div>
              <p className="text-xs text-indigo-200 mt-1 flex items-center gap-3">
                <span>{scholarGrade}</span>
                <span>•</span>
                <span>Roll #{student?.rollNo || '14'}</span>
                <span>•</span>
                <span>Mentor: {student?.classTeacher || 'Mrs. Anjali Desai'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowAdmitCardModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
            >
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Exam Admit Card</span>
            </button>
            <button
              type="button"
              onClick={() => setShowReportCardModal(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-400 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Report Card</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 overflow-x-auto scrollbar-none max-w-full">
        {[
          { id: 'overview', label: 'Overview', icon: User },
          { id: 'timetable', label: 'Class Timetable', icon: Clock },
          { id: 'diary', label: `Homework (${homeworkList.length})`, icon: BookOpen },
          { id: 'attendance', label: 'Attendance & Gate Logs', icon: ShieldCheck },
          { id: 'exams', label: 'Examinations', icon: Award },
          { id: 'library', label: 'Library Shelf', icon: BookMarked },
          { id: 'canteen', label: 'Canteen Menu', icon: Utensils },
          { id: 'certificates', label: 'Certificates & Awards', icon: FileText },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card-clean p-5 border-l-4 border-l-emerald-500">
              <span className="text-xs font-bold uppercase text-slate-500">Term Attendance</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">94%</p>
              <span className="text-xs text-slate-400">Regular presence recorded</span>
            </div>

            <div className="card-clean p-5 border-l-4 border-l-indigo-500">
              <span className="text-xs font-bold uppercase text-slate-500">Today's Homework</span>
              <p className="text-2xl font-black text-indigo-600 mt-1">
                {Object.values(completedHomework).filter(Boolean).length} / {homeworkList.length}
              </p>
              <span className="text-xs text-slate-400">Tasks checked off</span>
            </div>

            <div className="card-clean p-5 border-l-4 border-l-amber-500">
              <span className="text-xs font-bold uppercase text-slate-500">Active Library Books</span>
              <p className="text-2xl font-black text-amber-600 mt-1">2 Books</p>
              <span className="text-xs text-slate-400">Return due 25-Nov-2026</span>
            </div>

            <div className="card-clean p-5 border-l-4 border-l-sky-500">
              <span className="text-xs font-bold uppercase text-slate-500">Upcoming Exam</span>
              <p className="text-xl font-black text-sky-600 mt-1">Half-Yearly</p>
              <span className="text-xs text-slate-400">Desk #18 • Room 104</span>
            </div>
          </div>

          {/* Quick Action Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Today's Schedule Highlight */}
            <div className="card-clean p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" /> Today's Lecture Schedule ({selectedDay})
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('timetable')}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    View All &rarr;
                  </button>
                </div>
                <div className="space-y-2">
                  {(DEFAULT_TIMETABLE[selectedDay] || DEFAULT_TIMETABLE['Monday']).slice(0, 4).map(p => (
                    <div key={p.period} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-800">Period {p.period}: {p.subject}</span>
                        <div className="text-[11px] text-slate-500">{p.teacher} • {p.room}</div>
                      </div>
                      <span className="font-mono font-bold text-indigo-600 text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                        {p.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Today's Homework Checklist */}
            <div className="card-clean p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" /> Homework &amp; Diary Checklist
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab('diary')}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-800"
                  >
                    View All &rarr;
                  </button>
                </div>
                <div className="space-y-2">
                  {homeworkList.map(hw => {
                    const isDone = Boolean(completedHomework[hw.id]);
                    return (
                      <div
                        key={hw.id}
                        onClick={() => handleToggleHomework(hw.id)}
                        className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between text-xs ${
                          isDone ? 'bg-emerald-50/60 border-emerald-200 text-slate-500' : 'bg-slate-50 border-slate-100 hover:border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                            isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <span className={`font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {hw.subject}: {hw.title}
                            </span>
                            <div className="text-[11px] text-slate-500">{hw.description}</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 shrink-0">{hw.due_date}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: TIMETABLE */}
      {activeTab === 'timetable' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="card-clean p-6 bg-gradient-to-r from-indigo-50 via-white to-sky-50 border-l-4 border-l-indigo-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" /> My Class Timetable — {scholarGrade}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Bell timings, designated teachers, and room numbers for homeroom {scholarGrade}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print My Timetable</span>
            </button>
          </div>

          {/* Weekday Selector */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {WEEKDAYS.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                  selectedDay === day
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="card-clean overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Periods for {selectedDay}
              </h4>
              <span className="text-xs text-slate-500 font-mono">08:30 AM – 02:15 PM</span>
            </div>

            <div className="divide-y divide-slate-100">
              {(DEFAULT_TIMETABLE[selectedDay] || DEFAULT_TIMETABLE['Monday']).map(period => (
                <div key={period.period} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 flex flex-col items-center justify-center shrink-0 text-indigo-900">
                      <span className="text-[10px] font-bold uppercase">P</span>
                      <span className="text-sm font-black leading-none">{period.period}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{period.subject}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-700 border-slate-200">
                          {period.type}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {period.teacher} • <span className="font-semibold text-slate-700">{period.room}</span>
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                    {period.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: HOMEWORK DIARY */}
      {activeTab === 'diary' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="card-clean p-6 bg-gradient-to-r from-emerald-50 via-white to-teal-50 border-l-4 border-l-emerald-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" /> Digital Diary &amp; Daily Homework
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Assignments posted directly by your subject teachers. Click checkbox when you finish your homework.
              </p>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-emerald-700 flex items-center gap-1.5 shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{Object.values(completedHomework).filter(Boolean).length} / {homeworkList.length} Finished</span>
            </div>
          </div>

          <div className="card-clean overflow-hidden">
            <div className="divide-y divide-slate-100">
              {homeworkList.map(hw => {
                const isDone = Boolean(completedHomework[hw.id]);
                return (
                  <div
                    key={hw.id}
                    onClick={() => handleToggleHomework(hw.id)}
                    className={`p-4 transition cursor-pointer flex items-start justify-between gap-4 ${
                      isDone ? 'bg-emerald-50/40 text-slate-500' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition shrink-0 ${
                        isDone ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                            {hw.subject}: {hw.title}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            Due: {hw.due_date}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 ${isDone ? 'text-slate-400' : 'text-slate-600'}`}>
                          {hw.description}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg shrink-0 ${
                      isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {isDone ? 'Done' : 'Mark Done'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB: ATTENDANCE & RFID */}
      {activeTab === 'attendance' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="card-clean p-6 bg-gradient-to-r from-emerald-50 via-white to-teal-50 border-l-4 border-l-emerald-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Attendance Streak &amp; RFID Gate Telemetry
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Automated turnstile check-in records and daily homeroom attendance verified by {student?.classTeacher || 'Mrs. Anjali Desai'}.
              </p>
            </div>
            <div className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl">
              Overall Presence: 94%
            </div>
          </div>

          <div className="card-clean overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Recent Campus Gate Tap Logs
              </h4>
              <span className="text-xs text-slate-500 font-mono">UHF Badge #88219</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap text-xs">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Direction</th>
                    <th className="py-3 px-4">Time</th>
                    <th className="py-3 px-4">Gate Location</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {DEFAULT_RFID_LOGS.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-medium text-slate-900">{log.date}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.direction === 'IN' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {log.direction === 'IN' ? 'Check-in' : 'Check-out'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{log.time}</td>
                      <td className="py-3 px-4 text-slate-600">{log.gate}</td>
                      <td className="py-3 px-4 text-slate-600">{log.mode}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: EXAMS & HALL TICKET */}
      {activeTab === 'exams' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="card-clean p-6 bg-gradient-to-r from-purple-50 via-white to-indigo-50 border-l-4 border-l-purple-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" /> Half-Yearly Examination 2026–2027
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Seat allocation: Desk #18 (Room 104) • Morning Shift (09:00 AM – 12:00 PM).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAdmitCardModal(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Printer className="w-4 h-4" />
              <span>Print My Official Admit Card</span>
            </button>
          </div>

          {/* Exam Timetable */}
          <div className="card-clean overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Exam Timetable Schedule</h4>
              <span className="text-xs text-slate-500 font-medium">CBSE Curriculum Scale</span>
            </div>
            <div className="divide-y divide-slate-100 text-xs">
              {[
                { date: '15/12/2026', day: 'Monday', subject: 'English Language & Literature', timing: '09:00 AM – 12:00 PM' },
                { date: '17/12/2026', day: 'Wednesday', subject: 'Mathematics & Mental Ability', timing: '09:00 AM – 12:00 PM' },
                { date: '19/12/2026', day: 'Friday', subject: 'Environmental Studies (EVS)', timing: '09:00 AM – 12:00 PM' },
                { date: '21/12/2026', day: 'Monday', subject: 'Hindi Second Language', timing: '09:00 AM – 12:00 PM' },
                { date: '23/12/2026', day: 'Wednesday', subject: 'Computer Applications & AI', timing: '09:00 AM – 12:00 PM' },
              ].map(ex => (
                <div key={ex.subject} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                  <div>
                    <span className="font-bold text-slate-900 text-sm">{ex.subject}</span>
                    <div className="text-slate-500 text-xs mt-0.5">{ex.date} ({ex.day})</div>
                  </div>
                  <span className="font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">
                    {ex.timing}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: LIBRARY SHELF */}
      {activeTab === 'library' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="card-clean p-6 bg-gradient-to-r from-teal-50 via-white to-emerald-50 border-l-4 border-l-teal-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-teal-600" /> My Library Borrowing Shelf
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Books issued from Central School Library on your scholar barcode badge.
              </p>
            </div>
            <div className="text-xs font-bold text-teal-700 bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-xl">
              2 Active Loans • No Overdue Fines
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DEFAULT_LIBRARY_BOOKS.map(b => (
              <div key={b.id} className="card-clean p-5 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-mono font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                    {b.callNo}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">{b.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Author: {b.author}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Due: <strong className="text-slate-800">{b.dueDate}</strong></span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">Issued</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: CANTEEN */}
      {activeTab === 'canteen' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="card-clean p-6 bg-gradient-to-r from-amber-50 via-white to-orange-50 border-l-4 border-l-amber-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-600" /> Cafeteria Meal Plan &amp; Menu
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Nutritious, vegetarian, pediatric meals prepared fresh daily.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl">
              FSSAI Certified Campus Kitchen
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {WEEKDAYS.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                  selectedDay === day
                    ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-300'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {(() => {
            const menu = DEFAULT_CANTEEN_MENU[selectedDay] || DEFAULT_CANTEEN_MENU['Monday'];
            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card-clean p-5 border-t-4 border-t-amber-500">
                  <span className="text-xs font-bold uppercase text-amber-700">Breakfast (08:15 AM)</span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">Morning Fuel</h4>
                  <p className="text-xs text-slate-600 mt-2">{menu.breakfast}</p>
                </div>
                <div className="card-clean p-5 border-t-4 border-t-emerald-500">
                  <span className="text-xs font-bold uppercase text-emerald-700">Lunch (10:45 AM)</span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">Wholesome Meal</h4>
                  <p className="text-xs text-slate-600 mt-2">{menu.lunch}</p>
                  <div className="mt-3 text-[11px] font-bold text-emerald-700">{menu.nutrition}</div>
                </div>
                <div className="card-clean p-5 border-t-4 border-t-orange-500">
                  <span className="text-xs font-bold uppercase text-orange-700">Snack (01:45 PM)</span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">Energy Booster</h4>
                  <p className="text-xs text-slate-600 mt-2">{menu.snack}</p>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB: CERTIFICATES & AWARDS */}
      {activeTab === 'certificates' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="card-clean p-6 bg-gradient-to-r from-purple-50 via-white to-indigo-50 border-l-4 border-l-purple-600 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" /> Certificates, Bonafide &amp; Distinctions
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Official authenticated certificates with institutional digital seals and QR verification.
              </p>
            </div>
            <span className="text-xs font-bold text-purple-700 bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-xl">
              CBSE Authorized Records
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card-clean p-5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
                  <FileText className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Bonafide Student Certificate</h4>
                <p className="text-xs text-slate-500 mt-1">Official proof of active enrollment for passports, travel concessions, and contests.</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-700">Instant Authenticated PDF</span>
                <button
                  type="button"
                  onClick={() => { setCertType('bonafide'); setShowCertModal(true); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xs transition flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>View &amp; Print</span>
                </button>
              </div>
            </div>

            <div className="card-clean p-5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">Certificate of Co-curricular Merit</h4>
                <p className="text-xs text-slate-500 mt-1">Inter-school science quiz honors and scholastic distinction award.</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-purple-700">Distinction Honors</span>
                <button
                  type="button"
                  onClick={() => { setCertType('award'); setShowCertModal(true); }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-2xs transition flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>View &amp; Print</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Print Modals */}
      <PrintableAdmitCardModal
        isOpen={showAdmitCardModal}
        onClose={() => setShowAdmitCardModal(false)}
        studentData={{
          name: scholarName,
          admissionNo: student?.admissionNumber || '24755',
          rollNo: student?.rollNo || '14',
          grade: scholarGrade,
          roomNo: 'ROOM-104',
          seatNo: 'Desk #18',
          medium: 'English',
          feeDueStatus: 'CLEARED'
        }}
      />

      <PrintableCertificateModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        initialType={certType}
        studentData={{
          name: scholarName,
          admissionNo: student?.admissionNumber || '24755',
          rollNo: student?.rollNo || '14',
          grade: scholarGrade,
          dob: '2016-08-14',
          dobWords: 'Fourteenth August Two Thousand Sixteen',
          nationality: 'Indian',
          conduct: 'Good & Moral',
          passedClass: scholarGrade
        }}
      />

      <PrintableReportCardModal
        isOpen={showReportCardModal}
        onClose={() => setShowReportCardModal(false)}
        student={student}
      />
    </div>
  );
}
