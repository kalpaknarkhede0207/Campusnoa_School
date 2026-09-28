import React, { useRef } from 'react';
import { Printer, X, Award, CheckCircle, ShieldCheck, Sparkles, BookOpen, GraduationCap } from 'lucide-react';

export default function PrintableReportCardModal({ isOpen, onClose, student, studentMarks }) {
  const printRef = useRef(null);

  if (!isOpen || !student) return null;

  const handlePrint = () => {
    window.print();
  };

  const stId = student._id || student.id || student.admissionNumber;
  const marks = (studentMarks && (studentMarks[stId] || studentMarks[student.admissionNumber] || studentMarks[student.id])) || {};

  const subjects = [
    { name: 'Mathematics', code: 'MATH-101', maxPT: 20, maxTerm: 80, defaultPT: 19, defaultTerm: 76 },
    { name: 'Science', code: 'SCI-102', maxPT: 20, maxTerm: 80, defaultPT: 18, defaultTerm: 74 },
    { name: 'English', code: 'ENG-103', maxPT: 20, maxTerm: 80, defaultPT: 19, defaultTerm: 75 },
    { name: 'Social Studies', code: 'SST-104', maxPT: 20, maxTerm: 80, defaultPT: 17, defaultTerm: 72 },
    { name: 'Regional Language', code: 'LANG-105', maxPT: 20, maxTerm: 80, defaultPT: 18, defaultTerm: 73 },
    { name: 'Computer Science', code: 'CS-106', maxPT: 20, maxTerm: 80, defaultPT: 20, defaultTerm: 78 },
  ];

  let totalScored = 0;
  let totalMax = 0;

  const subjectEvaluations = subjects.map(sub => {
    const rawScore = marks[sub.name];
    const customScore = (rawScore && typeof rawScore === 'object') ? rawScore.score : rawScore;
    let ptMarks = sub.defaultPT;
    let termMarks = sub.defaultTerm;

    if (customScore !== undefined && customScore !== null && !isNaN(customScore)) {
      const parsed = parseFloat(customScore);
      ptMarks = Math.min(20, Math.round(parsed * 0.2));
      termMarks = Math.min(80, Math.round(parsed * 0.8));
    }

    const total = ptMarks + termMarks;
    totalScored += total;
    totalMax += 100;

    let grade = 'A1';
    let gpa = 10.0;
    if (total >= 91) { grade = 'A1'; gpa = 10.0; }
    else if (total >= 81) { grade = 'A2'; gpa = 9.0; }
    else if (total >= 71) { grade = 'B1'; gpa = 8.0; }
    else if (total >= 61) { grade = 'B2'; gpa = 7.0; }
    else if (total >= 51) { grade = 'C1'; gpa = 6.0; }
    else { grade = 'C2'; gpa = 5.0; }

    return {
      ...sub,
      ptMarks,
      termMarks,
      total,
      grade,
      gpa,
    };
  });

  const aggregatePercent = totalMax > 0 ? ((totalScored / totalMax) * 100).toFixed(1) : 92.5;
  const cumulativeGpa = totalMax > 0 ? (subjectEvaluations.reduce((acc, s) => acc + s.gpa, 0) / subjectEvaluations.length).toFixed(2) : 9.5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      {/* Container with Print CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report-card, #printable-report-card * {
            visibility: visible;
          }
          #printable-report-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 16px;
            box-shadow: none;
            border: 2px solid #0f172a;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-200">
        {/* Top Control Bar */}
        <div className="no-print bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-sm tracking-wide">CBSE / NEP 2020 Holistic Progress Card (HPC)</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document */}
        <div id="printable-report-card" ref={printRef} className="p-8 sm:p-10 bg-white text-slate-900 font-sans">
          {/* Institutional Header */}
          <div className="text-center pb-6 border-b-2 border-slate-900">
            <div className="inline-flex items-center justify-center gap-2 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-900 text-white flex items-center justify-center font-bold text-xl shadow-md">
                CN
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-black uppercase tracking-wider text-slate-950">CampusNoa Institutional Academy</h1>
                <p className="text-xs text-slate-600 font-medium">Affiliated to CBSE, New Delhi · Affiliation No: 2130892 · School Code: 40182</p>
              </div>
            </div>
            <div className="mt-2 inline-block px-4 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-extrabold uppercase tracking-widest text-indigo-900">
              Continuous & Comprehensive Evaluation · Holistic Progress Card 2025–2026
            </div>
          </div>

          {/* Student Demographics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6 p-4 rounded-2xl bg-slate-50 border border-slate-300 text-xs">
            <div>
              <span className="text-slate-500 font-medium block">Student Full Name</span>
              <strong className="text-sm text-slate-900 font-bold">{student.fullName || student.name}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Admission Number</span>
              <strong className="text-sm font-mono text-slate-900">{student.admissionNumber || 'ADM-2026-X8Q2'}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Class & Section</span>
              <strong className="text-sm text-slate-900 font-bold">{student.grade || 'Grade 5'} - Section {student.section || 'B'}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Roll Number</span>
              <strong className="text-sm font-mono text-slate-900">{student.rollNo || '18'}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Parent / Guardian</span>
              <strong className="text-slate-800">{student.parentName || student.parent || 'Suresh Patil'}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Attendance Record</span>
              <strong className="text-emerald-700 font-bold">172 / 180 Sessions (95.5%)</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Homeroom Teacher</span>
              <strong className="text-slate-800">{student.classTeacher || 'Anita Verma'}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-medium block">Health / Blood Group</span>
              <strong className="text-slate-800 font-bold">{student.bloodGroup || 'B+ Positive'} (Fit)</strong>
            </div>
          </div>

          {/* Part 1: Scholastic Performance Table */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-700" />
                Part 1: Scholastic Academic Evaluation
              </h3>
              <span className="text-[11px] font-semibold text-slate-500">Grading Scale: A1 (91-100) to C2 (Below 50)</span>
            </div>

            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold">
                  <th className="p-2.5 border border-slate-300">Subject Name</th>
                  <th className="p-2.5 border border-slate-300 text-center">Code</th>
                  <th className="p-2.5 border border-slate-300 text-center">Periodic Test (20)</th>
                  <th className="p-2.5 border border-slate-300 text-center">Term Exam (80)</th>
                  <th className="p-2.5 border border-slate-300 text-center">Total (100)</th>
                  <th className="p-2.5 border border-slate-300 text-center">Letter Grade</th>
                  <th className="p-2.5 border border-slate-300 text-center">Grade Point</th>
                </tr>
              </thead>
              <tbody>
                {subjectEvaluations.map((sub, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="p-2.5 border border-slate-300 font-semibold text-slate-900">{sub.name}</td>
                    <td className="p-2.5 border border-slate-300 text-center font-mono text-slate-500">{sub.code}</td>
                    <td className="p-2.5 border border-slate-300 text-center font-mono">{sub.ptMarks}</td>
                    <td className="p-2.5 border border-slate-300 text-center font-mono">{sub.termMarks}</td>
                    <td className="p-2.5 border border-slate-300 text-center font-mono font-bold text-slate-900">{sub.total}</td>
                    <td className="p-2.5 border border-slate-300 text-center font-bold text-indigo-900">
                      <span className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200">{sub.grade}</span>
                    </td>
                    <td className="p-2.5 border border-slate-300 text-center font-mono font-semibold">{sub.gpa.toFixed(1)}</td>
                  </tr>
                ))}
                {/* Aggregate Row */}
                <tr className="bg-indigo-50/80 font-bold text-slate-950 border-t-2 border-slate-900">
                  <td colSpan={4} className="p-2.5 border border-slate-300 text-right uppercase tracking-wider">
                    Cumulative Grand Total & Academic Average:
                  </td>
                  <td className="p-2.5 border border-slate-300 text-center font-mono text-sm font-black text-indigo-950">
                    {totalScored} / {totalMax}
                  </td>
                  <td className="p-2.5 border border-slate-300 text-center text-sm font-black text-indigo-950">
                    {aggregatePercent}%
                  </td>
                  <td className="p-2.5 border border-slate-300 text-center font-mono text-sm font-black text-emerald-800">
                    GPA {cumulativeGpa}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Part 2: Co-Scholastic & Life Skills (NEP 2020) */}
          <div className="mb-6">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5 mb-2">
              <Award className="w-4 h-4 text-emerald-700" />
              Part 2: Co-Scholastic & Life Skills Assessment (3-Point Scale: A - Outstanding, B - Very Good, C - Fair)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Work Education & ICT</span>
                <p className="text-slate-600 text-[11px] mb-2">Computational thinking, digital safety, and practical project builds.</p>
                <div className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded inline-block border border-emerald-200">
                  Grade A (Outstanding)
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Art & Cultural Expression</span>
                <p className="text-slate-600 text-[11px] mb-2">Visual sketching, creative design participation, and theater arts.</p>
                <div className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded inline-block border border-emerald-200">
                  Grade A (Outstanding)
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">Health & Physical Education</span>
                <p className="text-slate-600 text-[11px] mb-2">Agility, team spirit, sportsmanship, and personal wellness awareness.</p>
                <div className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded inline-block border border-emerald-200">
                  Grade A (Outstanding)
                </div>
              </div>
            </div>
          </div>

          {/* Teacher Remarks & Promotion Verdict */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-300 text-xs mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
              <div className="sm:col-span-3">
                <span className="font-bold text-slate-700 block uppercase tracking-wider text-[11px] mb-1">Homeroom Educator Remarks:</span>
                <p className="text-slate-800 italic leading-relaxed">
                  "{student.name} demonstrates exceptional analytical rigor, high curiosity in scientific concepts, and constructive peer leadership during group activities. Regular in assignment completion."
                </p>
              </div>
              <div className="text-right sm:border-l border-slate-200 sm:pl-4">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Final Academic Status</span>
                <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1.5 rounded-lg mt-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  QUALIFIED & PROMOTED
                </span>
              </div>
            </div>
          </div>

          {/* Institutional Signatures & Seal Block */}
          <div className="grid grid-cols-3 gap-6 pt-6 border-t-2 border-slate-300 text-center text-xs">
            <div>
              <div className="h-12 flex items-end justify-center font-serif italic text-slate-600 border-b border-dashed border-slate-400 pb-1">
                Anita Verma
              </div>
              <span className="font-bold text-slate-800 block mt-1">Homeroom Teacher</span>
              <span className="text-[10px] text-slate-500">Date: {new Date().toLocaleDateString()}</span>
            </div>
            <div>
              <div className="h-12 flex items-end justify-center font-serif italic text-slate-600 border-b border-dashed border-slate-400 pb-1">
                Dr. Suresh Joshi
              </div>
              <span className="font-bold text-slate-800 block mt-1">Controller of Examinations</span>
              <span className="text-[10px] text-slate-500">Institutional Exam Board</span>
            </div>
            <div>
              <div className="h-12 flex items-end justify-center font-serif italic text-indigo-900 font-bold border-b border-dashed border-slate-400 pb-1">
                Dr. Neha Bhatnagar
              </div>
              <span className="font-bold text-slate-800 block mt-1">Principal & Seal</span>
              <span className="text-[10px] text-slate-500">CampusNoa Institutional Academy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
