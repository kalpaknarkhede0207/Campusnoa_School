import React, { useRef } from 'react';
import { X, Printer, Award, CheckCircle2, AlertTriangle, Calendar, Clock, MapPin, UserCheck } from 'lucide-react';

export default function PrintableAdmitCardModal({ isOpen, onClose, studentData, examData }) {
  const printRef = useRef(null);

  if (!isOpen) return null;

  const student = studentData || {
    name: 'Aarav Sharma',
    admissionNo: '24755',
    rollNo: '1004',
    grade: 'Grade 4-B',
    fatherName: 'Mr. Vikram Sharma',
    motherName: 'Mrs. Ananya Sharma',
    roomNo: 'ROOM-104',
    seatNo: 'Desk #18',
    medium: 'English',
    feeDueStatus: 'CLEARED'
  };

  const exam = examData || {
    title: 'HALF YEARLY EXAMINATION (2026–2027)',
    timing: '09:00 AM TO 12:00 PM',
    shift: 'Morning Shift',
    schedule: [
      { date: '15/12/2026', day: 'Monday', subject: 'English Language & Literature', shift: 'Shift 1' },
      { date: '17/12/2026', day: 'Wednesday', subject: 'Mathematics & Mental Ability', shift: 'Shift 1' },
      { date: '19/12/2026', day: 'Friday', subject: 'Environmental Studies (EVS)', shift: 'Shift 1' },
      { date: '21/12/2026', day: 'Monday', subject: 'Hindi Second Language', shift: 'Shift 1' },
      { date: '23/12/2026', day: 'Wednesday', subject: 'Computer Applications & AI', shift: 'Shift 1' },
      { date: '26/12/2026', day: 'Saturday', subject: 'General Knowledge & Reasoning', shift: 'Shift 1' },
    ]
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl my-8 flex flex-col overflow-hidden max-h-[95vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Student Examination Admit Card</h3>
              <p className="text-xs text-slate-500">Hall Ticket with Room & Seat Allocation • Roll Number Verification</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Admit Card</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Container */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-50 print:bg-white" ref={printRef}>
          <div className="max-w-3xl mx-auto bg-white border-2 border-slate-800 rounded-xl p-6 print:border-black print:p-4 shadow-sm">
            {/* Header */}
            <div className="text-center border-b-2 border-slate-800 pb-4 mb-4">
              <span className="text-xs uppercase tracking-widest font-extrabold text-indigo-900 print:text-black">
                Institutional Academic Examination Board
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                CAMPUSNOA INSTITUTIONAL ERP
              </h2>
              <div className="inline-block mt-2 px-3 py-1 bg-slate-900 text-white rounded-md text-xs font-bold tracking-wider uppercase print:bg-black print:text-white">
                ADMIT CARD / HALL TICKET • {exam.title}
              </div>
            </div>

            {/* Student Metadata Table */}
            <div className="grid grid-cols-4 sm:grid-cols-6 border border-slate-300 rounded-lg overflow-hidden text-xs mb-4 print:border-black">
              <div className="p-2 bg-slate-100 font-bold text-slate-700 border-r border-b border-slate-300">Roll No</div>
              <div className="p-2 font-mono font-bold text-indigo-700 border-r border-b border-slate-300 print:text-black">{student.rollNo}</div>
              <div className="p-2 bg-slate-100 font-bold text-slate-700 border-r border-b border-slate-300">Class</div>
              <div className="p-2 font-bold text-slate-800 border-r border-b border-slate-300">{student.grade}</div>
              <div className="p-2 bg-slate-100 font-bold text-slate-700 border-r border-b border-slate-300">Scholar No</div>
              <div className="p-2 font-mono font-semibold text-slate-800 border-b border-slate-300">{student.admissionNo}</div>

              <div className="p-2 bg-slate-100 font-bold text-slate-700 border-r border-slate-300">Room No</div>
              <div className="p-2 font-bold text-slate-800 border-r border-slate-300">{student.roomNo}</div>
              <div className="p-2 bg-slate-100 font-bold text-slate-700 border-r border-slate-300">Seat No</div>
              <div className="p-2 font-bold text-slate-800 border-r border-slate-300">{student.seatNo}</div>
              <div className="p-2 bg-slate-100 font-bold text-slate-700 border-r border-slate-300">Fee Status</div>
              <div className="p-2 font-bold text-emerald-600 print:text-black">
                {student.feeDueStatus === 'CLEARED' ? 'CLEARED (₹0)' : 'DUE (₹' + student.feeDueStatus + ')'}
              </div>
            </div>

            {/* Student Details & Photo Row */}
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4 border-b border-slate-200 pb-4 mb-4">
              <div className="space-y-1 text-xs text-slate-700 flex-1">
                <p><span className="font-bold text-slate-900">Student Name:</span> {student.name}</p>
                <p><span className="font-bold text-slate-900">Father's Name:</span> {student.fatherName}</p>
                <p><span className="font-bold text-slate-900">Mother's Name:</span> {student.motherName}</p>
                <p><span className="font-bold text-slate-900">Exam Timing:</span> {exam.timing} ({exam.shift})</p>
              </div>

              {/* Photo Box */}
              <div className="w-24 h-28 border-2 border-dashed border-slate-400 rounded-lg flex flex-col items-center justify-center bg-slate-50 text-[10px] text-slate-500 shrink-0 print:border-black">
                <UserCheck className="w-6 h-6 text-slate-400 mb-1" />
                <span>Affix Student</span>
                <span>Photo</span>
              </div>
            </div>

            {/* Subject-Wise Exam Timetable */}
            <div className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-1.5">Examination Timetable & Attendance Sheet</p>
              <table className="w-full text-xs text-left border border-slate-300 print:border-black">
                <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800 print:bg-slate-200 print:border-black">
                  <tr>
                    <th className="py-2 px-2.5 border-r border-slate-300">Date</th>
                    <th className="py-2 px-2 border-r border-slate-300">Day</th>
                    <th className="py-2 px-2.5 border-r border-slate-300">Subject</th>
                    <th className="py-2 px-2 border-r border-slate-300">Shift</th>
                    <th className="py-2 px-2 border-r border-slate-300 text-center">Candidate Sign</th>
                    <th className="py-2 px-2 text-center">Invigilator Sign</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {exam.schedule.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                      <td className="py-2 px-2.5 border-r border-slate-200 font-mono font-medium">{item.date}</td>
                      <td className="py-2 px-2 border-r border-slate-200">{item.day}</td>
                      <td className="py-2 px-2.5 border-r border-slate-200 font-semibold text-slate-900">{item.subject}</td>
                      <td className="py-2 px-2 border-r border-slate-200 text-slate-600">{item.shift}</td>
                      <td className="py-2 px-2 border-r border-slate-200 text-center text-slate-300">___________</td>
                      <td className="py-2 px-2 text-center text-slate-300">___________</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Candidate Rules & Instructions */}
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/70 text-[11px] text-slate-600 mb-5 print:bg-white print:border-slate-400">
              <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-1">Admit Card Guidelines & Regulations:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                <li>Students must carry this original Admit Card to every examination session. No entry permitted without physical card.</li>
                <li>Reach examination room at least 20 minutes before schedule. Late entry strictly prohibited after 15 minutes of commencement.</li>
                <li>Smart watches, mobile phones, programmable calculators, or study notes are strictly forbidden inside the exam hall.</li>
                <li>Wear clean school uniform and verify question paper booklet code before writing answers.</li>
              </ul>
            </div>

            {/* Official Signatures Row */}
            <div className="grid grid-cols-2 gap-8 pt-4 border-t-2 border-slate-800 text-center text-xs">
              <div>
                <div className="h-8 border-b border-dashed border-slate-400 mx-8" />
                <p className="font-bold text-slate-800 mt-1">Class Teacher Verification</p>
              </div>
              <div>
                <div className="h-8 border-b border-dashed border-slate-400 mx-8" />
                <p className="font-bold text-slate-800 mt-1">Controller of Examinations / Principal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
