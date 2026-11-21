import React, { useState, useRef } from 'react';
import { X, Printer, Award, FileText, CheckCircle2, Shield, Calendar, Download } from 'lucide-react';

export default function PrintableCertificateModal({ isOpen, onClose, studentData, initialType = 'bonafide' }) {
  const [certType, setCertType] = useState(initialType);
  const printRef = useRef(null);

  if (!isOpen) return null;

  const student = studentData || {
    name: 'Aarav Sharma',
    admissionNo: '24755',
    rollNo: '14',
    grade: 'Grade 4-B',
    fatherName: 'Mr. Vikram Sharma',
    motherName: 'Mrs. Ananya Sharma',
    dob: '2016-08-14',
    dobWords: 'Fourteenth August Two Thousand Sixteen',
    nationality: 'Indian',
    religion: 'Hindu',
    admissionDate: '05-Apr-2020',
    leavingDate: '31-Mar-2027',
    conduct: 'Good & Moral',
    passedClass: 'Grade 4-B'
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl my-8 flex flex-col overflow-hidden max-h-[95vh]">
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Official Institutional Certificate Engine</h3>
              <p className="text-xs text-slate-500">Government Compliant School Leaving (TC) • Bonafide • Award Certificates</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Cert Type Switcher (Hidden when printing) */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 print:hidden text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCertType('bonafide')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${certType === 'bonafide' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Bonafide
              </button>
              <button
                type="button"
                onClick={() => setCertType('tc')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${certType === 'tc' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Leaving (TC)
              </button>
              <button
                type="button"
                onClick={() => setCertType('award')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${certType === 'award' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Award
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
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

        {/* Certificate Rendering Area */}
        <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100/50 print:bg-white" ref={printRef}>
          {/* 1. BONAFIDE CERTIFICATE FORMAT */}
          {certType === 'bonafide' && (
            <div className="max-w-2xl mx-auto bg-white border-4 double border-slate-800 p-8 sm:p-12 text-slate-800 shadow-sm print:border-black print:p-8">
              {/* Institution Header */}
              <div className="text-center border-b-2 border-slate-800 pb-4 mb-8">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">CampusNoa Academy</h1>
                <p className="text-xs text-slate-500 font-medium">Affiliated to Central Board of Secondary Education • Institutional Code: REG-2026-99</p>
                <p className="text-xs text-slate-500">Knowledge Park Highway, Pune, Maharashtra 411045</p>
                <div className="inline-block mt-4 px-4 py-1 border-2 border-slate-800 font-bold uppercase text-sm tracking-wider">
                  BONAFIDE CERTIFICATE
                </div>
              </div>

              {/* Certificate Metadata */}
              <div className="flex justify-between text-xs text-slate-600 mb-6">
                <p><span className="font-semibold text-slate-800">Ref No:</span> BFD-2026-0418</p>
                <p><span className="font-semibold text-slate-800">Date:</span> {new Date().toLocaleDateString('en-GB')}</p>
              </div>

              {/* Certificate Prose */}
              <div className="text-sm leading-relaxed space-y-4 text-justify mb-12">
                <p>
                  This is to certify that Master / Miss <strong className="underline underline-offset-4 font-bold text-slate-900">{student.name}</strong>, 
                  Son / Daughter of <strong className="underline underline-offset-4">{student.fatherName}</strong> and <strong className="underline underline-offset-4">{student.motherName}</strong>, 
                  is a bonafide student of this institution currently studying in <strong className="font-bold">{student.grade}</strong> under Scholar / Admission Number <strong className="font-mono">{student.admissionNo}</strong>.
                </p>

                <p>
                  As per the official school admission register, his / her recorded Date of Birth is <strong className="font-semibold">{student.dob}</strong> (in words: <em>{student.dobWords}</em>).
                </p>

                <p>
                  To the best of our institutional knowledge and records, he / she bears a <strong className="font-semibold text-slate-900">{student.conduct}</strong> moral conduct and character during his / her academic tenure in this school.
                </p>

                <p className="text-xs text-slate-500 italic mt-6">
                  This certificate is issued on parental request for official documentation and administrative records.
                </p>
              </div>

              {/* Signatures & Seal */}
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-slate-300 text-center text-xs">
                <div>
                  <div className="h-10 border-b border-dashed border-slate-400 mx-10" />
                  <p className="font-bold text-slate-800 mt-2">Verified by Administrative Registrar</p>
                </div>
                <div>
                  <div className="h-10 border-b border-dashed border-slate-400 mx-10" />
                  <p className="font-bold text-slate-800 mt-2">Head of Institution / Principal</p>
                  <p className="text-[10px] text-slate-400">(With Official Institution Stamp)</p>
                </div>
              </div>
            </div>
          )}

          {/* 2. TRANSFER / LEAVING CERTIFICATE (TC) FORMAT */}
          {certType === 'tc' && (
            <div className="max-w-2xl mx-auto bg-white border-2 border-slate-900 p-6 sm:p-10 text-slate-900 shadow-sm print:border-black print:p-6 text-xs">
              <div className="text-center border-b-2 border-slate-900 pb-3 mb-4">
                <h1 className="text-xl font-black uppercase tracking-tight">CampusNoa Academy</h1>
                <p className="text-[10px] text-slate-500">Government Recognized Higher Secondary School • Affiliation: CBSE / State</p>
                <div className="inline-block mt-2 px-3 py-0.5 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider print:bg-black print:text-white">
                  TRANSFER CERTIFICATE (SCHOOL LEAVING CERTIFICATE)
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b border-slate-300 pb-2 mb-3 text-[11px]">
                <p><span className="font-bold">TC Book No:</span> 18</p>
                <p><span className="font-bold">Sr. No:</span> 0492</p>
                <p><span className="font-bold">PEN No:</span> PEN-MH-8812</p>
              </div>

              {/* Tabular Form Lines */}
              <div className="space-y-2 border-b border-slate-300 pb-4 mb-4 text-[11px] leading-normal">
                <p>1. Name of Pupil: <strong className="font-bold">{student.name}</strong></p>
                <p>2. Father's / Guardian's Name: <strong className="font-semibold">{student.fatherName}</strong></p>
                <p>3. Mother's Name: <strong className="font-semibold">{student.motherName}</strong></p>
                <p>4. Nationality: <strong className="font-semibold">{student.nationality}</strong> &bull; Religion: <strong className="font-semibold">{student.religion}</strong></p>
                <p>5. Date of First Admission in School with Class: <strong className="font-semibold">{student.admissionDate} (Class 1)</strong></p>
                <p>6. Date of Birth according to Admission Register: <strong className="font-semibold">{student.dob}</strong></p>
                <p className="pl-4 text-[10px] italic text-slate-600">(In words: {student.dobWords})</p>
                <p>7. Class in which pupil last studied: <strong className="font-bold">{student.grade}</strong></p>
                <p>8. School / Board Annual Examination last taken with result: <strong className="font-semibold">Passed Grade 4 Examination</strong></p>
                <p>9. Whether qualified for promotion to higher class: <strong className="font-bold text-emerald-800">Yes, Promoted to Grade 5</strong></p>
                <p>10. Total No. of working days: <strong className="font-semibold">220 Days</strong> &bull; Total No. of working days present: <strong className="font-semibold">212 Days</strong></p>
                <p>11. Month up to which school dues have been paid: <strong className="font-semibold">Paid up to March 2027 (Zero Dues)</strong></p>
                <p>12. General Conduct: <strong className="font-semibold text-slate-900">{student.conduct}</strong></p>
                <p>13. Date of Application for Certificate: <strong className="font-semibold">28-Mar-2027</strong></p>
                <p>14. Reason for Leaving the School: <strong className="font-semibold">Parent Relocation / Higher Education</strong></p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 text-center text-[10px] font-bold text-slate-700">
                <div>
                  <div className="h-6 border-b border-dashed border-slate-400 mx-4" />
                  <p className="mt-1">Prepared By</p>
                </div>
                <div>
                  <div className="h-6 border-b border-dashed border-slate-400 mx-4" />
                  <p className="mt-1">Checked By</p>
                </div>
                <div>
                  <div className="h-6 border-b border-dashed border-slate-400 mx-4" />
                  <p className="mt-1">Principal Signature & Seal</p>
                </div>
              </div>
            </div>
          )}

          {/* 3. AWARD / ACHIEVEMENT CERTIFICATE FORMAT */}
          {certType === 'award' && (
            <div className="max-w-2xl mx-auto bg-amber-50/40 border-8 border-double border-amber-600 p-8 sm:p-12 text-slate-900 shadow-md relative overflow-hidden print:border-black print:bg-white print:p-8">
              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 border-2 border-amber-500 flex items-center justify-center text-amber-700 mb-2">
                  <Award className="w-6 h-6" />
                </div>
                <h1 className="text-xs uppercase tracking-widest font-extrabold text-amber-800">CampusNoa Institutional Honors</h1>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight font-serif mt-1">
                  CERTIFICATE OF ACHIEVEMENT
                </h2>
                <div className="w-24 h-0.5 bg-amber-500 mx-auto mt-2" />
              </div>

              <div className="text-center text-sm leading-relaxed space-y-3 font-serif">
                <p className="text-xs font-sans text-slate-500 uppercase tracking-wider">This Honor is Proudly Presented To</p>
                <p className="text-2xl font-black text-indigo-950 underline underline-offset-8 decoration-amber-500">{student.name}</p>
                <p className="text-xs text-slate-600">Student of <strong className="font-sans font-bold">{student.grade}</strong> (Scholar No: {student.admissionNo})</p>
                <p className="pt-2 text-slate-800">
                  In formal recognition of outstanding performance, exemplary discipline, and first-position scholastic excellence in the <strong className="text-slate-900 font-sans">Annual Academic Science & Mathematics Olympiad 2026</strong>.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8 pt-12 mt-6 border-t border-amber-300 text-center text-xs font-sans">
                <div>
                  <div className="h-8 border-b border-dashed border-slate-400 mx-12" />
                  <p className="font-bold text-slate-800 mt-1">Event Convener</p>
                </div>
                <div>
                  <div className="h-8 border-b border-dashed border-slate-400 mx-12" />
                  <p className="font-bold text-slate-800 mt-1">Principal / Head of Institution</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
