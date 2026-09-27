import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Plus, CheckCircle, AlertCircle, Bookmark, RefreshCw, UserCheck, Clock, ArrowLeftRight } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function LibraryDashboard() {
  const { showToast } = useAuth();
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'issue', 'digital'
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [issuing, setIssuing] = useState(false);
  const [returningId, setReturningId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookRes, studentRes] = await Promise.all([
        api.getLibraryBooks().catch(() => ({ catalogue: [], issues: [] })),
        api.getStudents().catch(() => ({ students: [] }))
      ]);
      const loadedBooks = bookRes?.catalogue || bookRes?.books || (Array.isArray(bookRes) ? bookRes : []);
      setBooks(Array.isArray(loadedBooks) ? loadedBooks : []);
      setIssues(Array.isArray(bookRes?.issues) ? bookRes.issues : []);

      const loadedStudents = studentRes?.students || (Array.isArray(studentRes) ? studentRes : []);
      setStudents(Array.isArray(loadedStudents) ? loadedStudents : []);
    } catch (err) {
      showToast('Failed to load library data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    if (!selectedBook || !selectedStudent) {
      showToast('Please select both a book and a student', 'error');
      return;
    }
    setIssuing(true);
    try {
      const res = await api.issueLibraryBook(selectedBook, selectedStudent);
      showToast(res.message || 'Book issued successfully!', 'success');
      setSelectedBook('');
      setSelectedStudent('');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to issue book', 'error');
    } finally {
      setIssuing(false);
    }
  };

  const handleReturnBook = async (issueId) => {
    setReturningId(issueId);
    try {
      const res = await api.returnLibraryBook(issueId);
      showToast(res.message || 'Book returned and checked back into library catalog!', 'success');
      fetchData();
    } catch (err) {
      showToast(err.message || 'Failed to return book', 'error');
    } finally {
      setReturningId(null);
    }
  };

  const safeBooks = Array.isArray(books) ? books : [];
  const filteredBooks = safeBooks.filter(b => 
    b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.isbn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeIssuesCount = issues.filter(i => i.status === 'ISSUED' || i.status === 'OVERDUE').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/20 border border-teal-400/30 rounded-xl">
              <BookOpen className="w-7 h-7 text-teal-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Library & Learning Resources Portal</h1>
              <p className="text-sm text-teal-200/80">Manage physical catalog, circulation logs, class teacher tracking & return cycles</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-semibold transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Catalog
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button 
          onClick={() => setActiveTab('catalog')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTab === 'catalog' ? 'border-teal-500 bg-teal-50/50 shadow-md ring-2 ring-teal-500/20' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Books</span>
            <div className="p-2 bg-teal-100 text-teal-700 rounded-lg">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{books.length || 350}</div>
          <p className="text-xs text-teal-600 mt-1 font-medium">Click to view full catalog</p>
        </button>

        <button 
          onClick={() => setActiveTab('issue')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTab === 'issue' ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Issued Books</span>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {activeIssuesCount}
          </div>
          <p className="text-xs text-emerald-600 mt-1 font-medium">Click to view active circulation</p>
        </button>

        <button 
          onClick={() => setActiveTab('catalog')}
          className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 text-left transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Available Copies</span>
            <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
              <Bookmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {Math.max(0, (books.length || 5) - activeIssuesCount)}
          </div>
          <p className="text-xs text-sky-600 mt-1 font-medium">Ready for checkout</p>
        </button>

        <button 
          onClick={() => setActiveTab('digital')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTab === 'digital' ? 'border-indigo-500 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Digital E-Books</span>
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">128 PDFs</div>
          <p className="text-xs text-indigo-600 mt-1 font-medium">Click to view e-library</p>
        </button>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'catalog' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Book Catalog
        </button>
        <button
          onClick={() => setActiveTab('issue')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'issue' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Issue / Return Circulation Desk
        </button>
        <button
          onClick={() => setActiveTab('digital')}
          className={`px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'digital' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          Digital E-Library
        </button>
      </div>

      {/* Tab 1: Catalog */}
      {activeTab === 'catalog' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">Showing {filteredBooks.length} titles</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Book Title</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Subject / Category</th>
                  <th className="px-4 py-3">Target Grade</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-teal-600" />
                      {book.title}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{book.author}</td>
                    <td className="px-4 py-3.5 font-medium">{book.category || book.subject || 'General'}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                        {book.grade || 'Grade 1–6'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        book.status === 'Issued' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {book.status || 'Available'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button 
                        onClick={() => {
                          setSelectedBook(book.id);
                          setActiveTab('issue');
                        }}
                        className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-bold transition-colors"
                      >
                        Issue Book
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Issue / Return Desk */}
      {activeTab === 'issue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Issue Book Form */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4 lg:col-span-1">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-teal-600" /> New Book Issue
                </h2>
                <p className="text-xs text-slate-500">Checkout book copy to student</p>
              </div>

              <form onSubmit={handleIssueBook} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Select Book Title
                  </label>
                  <select
                    value={selectedBook}
                    onChange={(e) => setSelectedBook(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
                  >
                    <option value="">-- Select Book from Catalog --</option>
                    {books.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.title} ({b.author})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Select Borrowing Student
                  </label>
                  <select
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none font-medium"
                  >
                    <option value="">-- Choose Student (Grade 1–6) --</option>
                    {students.map(s => (
                      <option key={s.id || s._id} value={s.id || s._id}>
                        {s.name} ({s.rollNo || s.roll_no ? `Roll #${s.rollNo || s.roll_no}` : 'Student'}) - {s.grade || 'Grade 5-B'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={issuing}
                    className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    {issuing ? 'Logging Book Checkout...' : 'Confirm Book Issue'}
                  </button>
                </div>
              </form>
            </div>

            {/* Active Circulation & Issue Records Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ArrowLeftRight className="w-5 h-5 text-indigo-600" /> Active Circulation & Book Issue Ledger
                  </h2>
                  <p className="text-xs text-slate-500">Track borrower identity, homeroom class teacher, issue date & return deadlines</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  {issues.length} Total Records
                </span>
              </div>

              {issues.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl">
                  <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No Active Circulation Records</p>
                  <p className="text-[11px] text-slate-500">Issued books will appear here with full student & class teacher details.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700 border-collapse whitespace-nowrap">
                    <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Issued Book</th>
                        <th className="py-2.5 px-3">Borrowed By (Student)</th>
                        <th className="py-2.5 px-3">Class & Teacher</th>
                        <th className="py-2.5 px-3">Issue Date</th>
                        <th className="py-2.5 px-3">Returning / Due Date</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Circulation Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {issues.map((i) => {
                        const isReturning = returningId === (i.id || i._id);
                        return (
                          <tr key={i.id || i._id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3">
                              <span className="font-bold text-slate-900 block">{i.bookTitle}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{i.bookAuthor || 'Library Copy'}</span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-bold text-indigo-700 block">{i.studentName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{i.admissionNumber || 'ADM-2026-REG'}</span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-semibold text-slate-800 block">{i.gradeSection || i.grade}</span>
                              <span className="text-[10px] text-slate-500">Teacher: <strong className="text-slate-700">{i.classTeacher || i.classTeacherName || 'Anita Verma'}</strong></span>
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                              {i.issueDate}
                            </td>
                            <td className="py-3 px-3 font-mono text-[11px] font-bold text-slate-800">
                              {i.returningDate || i.dueDate}
                            </td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                i.status === 'RETURNED'
                                  ? 'bg-slate-100 text-slate-600 border border-slate-200'
                                  : i.status === 'OVERDUE'
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                                {i.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              {i.status !== 'RETURNED' ? (
                                <button
                                  disabled={isReturning}
                                  onClick={() => handleReturnBook(i.id || i._id)}
                                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200 transition disabled:opacity-50"
                                >
                                  {isReturning ? 'Returning...' : 'Mark Returned'}
                                </button>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic">Checked In</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Digital E-Library */}
      {activeTab === 'digital' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 shadow-sm space-y-3">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">Mathematics</span>
            <h3 className="font-bold text-slate-900 text-base">Grade 1–6 Mathematics Practice Workbook</h3>
            <p className="text-xs text-slate-500">Complete curriculum exercises, interactive problem sets & answers.</p>
            <button className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700">Read Online PDF</button>
          </div>
          <div className="p-6 bg-gradient-to-br from-teal-50 to-white rounded-2xl border border-teal-100 shadow-sm space-y-3">
            <span className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-full">Science & STEM</span>
            <h3 className="font-bold text-slate-900 text-base">Illustrated Science Encyclopedia for Young Minds</h3>
            <p className="text-xs text-slate-500">Visual guides on biology, physical sciences, environment & space.</p>
            <button className="w-full py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700">Read Online PDF</button>
          </div>
          <div className="p-6 bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-100 shadow-sm space-y-3">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">Literature</span>
            <h3 className="font-bold text-slate-900 text-base">Classics Storybook Collection (Grade 1–6)</h3>
            <p className="text-xs text-slate-500">Moral stories, folk tales & English language proficiency readers.</p>
            <button className="w-full py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700">Read Online PDF</button>
          </div>
        </div>
      )}
    </div>
  );
}
