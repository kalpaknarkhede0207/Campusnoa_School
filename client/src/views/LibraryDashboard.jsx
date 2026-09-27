import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Search, Plus, CheckCircle, AlertCircle, Bookmark, 
  RefreshCw, UserCheck, Clock, ArrowLeftRight, Trash2, Send, Check, X, ShieldCheck, Users
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useInstitutional } from '../context/InstitutionalContext';

export default function LibraryDashboard() {
  const { showToast } = useAuth();
  const { 
    bookApprovals, 
    requestBookApproval, 
    removedIssues, 
    removeReturnedIssue, 
    removedBorrowers, 
    removeBorrowerStudent 
  } = useInstitutional();

  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'issue', 'procurement', 'digital'
  const [books, setBooks] = useState([]);
  const [issues, setIssues] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Book Issue Form
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [issuing, setIssuing] = useState(false);
  const [returningId, setReturningId] = useState(null);

  // New Book Procurement Request Modal
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category: 'Science & STEM',
    targetGrade: 'Grades 1–6',
    quantity: 15,
    estimatedCost: '₹6,500'
  });

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

  // Add Book & Request Principal Approval
  const handleRequestBookApproval = (e) => {
    e.preventDefault();
    if (!bookForm.title.trim() || !bookForm.author.trim()) {
      showToast('Please fill in title and author name', 'error');
      return;
    }

    requestBookApproval({
      title: bookForm.title,
      author: bookForm.author,
      isbn: bookForm.isbn,
      category: bookForm.category,
      targetGrade: bookForm.targetGrade,
      quantity: bookForm.quantity,
      estimatedCost: bookForm.estimatedCost
    });

    showToast(`Procurement request for "${bookForm.title}" submitted to Principal for approval!`, 'success');
    setShowAddBookModal(false);
    setBookForm({
      title: '',
      author: '',
      isbn: '',
      category: 'Science & STEM',
      targetGrade: 'Grades 1–6',
      quantity: 15,
      estimatedCost: '₹6,500'
    });
    setActiveTab('procurement');
  };

  // Filtered lists taking into account removed returned issues & removed borrowers
  const visibleIssues = issues.filter(i => !removedIssues.includes(i.id || i._id));
  const activeStudents = students.filter(s => !removedBorrowers.includes(s.id || s._id));

  const safeBooks = Array.isArray(books) ? books : [];
  // Merge approved procurement books into catalog
  const approvedBooks = bookApprovals
    .filter(b => b.status === 'APPROVED')
    .map(b => ({
      id: b.id,
      title: b.title,
      author: b.author,
      isbn: b.isbn,
      category: b.category,
      grade: b.targetGrade,
      status: 'Available'
    }));

  const allDisplayBooks = [...safeBooks, ...approvedBooks];
  const filteredBooks = allDisplayBooks.filter(b => 
    b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.isbn?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeIssuesCount = visibleIssues.filter(i => i.status === 'ISSUED' || i.status === 'OVERDUE').length;
  const pendingProcurementCount = bookApprovals.filter(b => b.status === 'PENDING').length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-teal-500/20 border border-teal-400/30 rounded-xl">
              <BookOpen className="w-7 h-7 text-teal-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Library &amp; Learning Resources Portal</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-teal-500/30 text-teal-200 border border-teal-400/30">
                  Resource Governance
                </span>
              </div>
              <p className="text-sm text-teal-200/80 mt-0.5">
                Physical catalog, procurement approvals from Principal, circulation ledger &amp; borrower lifecycle
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddBookModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold rounded-xl text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4" /> Add Book &amp; Request Approval
          </button>
          <button 
            onClick={fetchData}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
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
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Catalog Volume</span>
            <div className="p-2 bg-teal-100 text-teal-700 rounded-lg">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{allDisplayBooks.length || 350} Titles</div>
          <p className="text-xs text-teal-600 mt-1 font-medium">Click to view full catalog</p>
        </button>

        <button 
          onClick={() => setActiveTab('issue')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTab === 'issue' ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Circulation</span>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">
            {activeIssuesCount} Loans
          </div>
          <p className="text-xs text-emerald-600 mt-1 font-medium">Click to view circulation desk</p>
        </button>

        <button 
          onClick={() => setActiveTab('procurement')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTab === 'procurement' ? 'border-amber-500 bg-amber-50/50 shadow-md ring-2 ring-amber-500/20' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Principal Approvals</span>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-700 mt-2">
            {pendingProcurementCount} Pending
          </div>
          <p className="text-xs text-amber-600 mt-1 font-medium">Click to view procurement queue</p>
        </button>

        <button 
          onClick={() => setActiveTab('digital')}
          className={`p-5 rounded-2xl border text-left transition-all ${
            activeTab === 'digital' ? 'border-indigo-500 bg-indigo-50/50 shadow-md ring-2 ring-indigo-500/20' : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Digital E-Library</span>
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">128 PDFs</div>
          <p className="text-xs text-indigo-600 mt-1 font-medium">Click to open digital e-books</p>
        </button>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'catalog' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Book Catalog ({allDisplayBooks.length})
        </button>
        <button
          onClick={() => setActiveTab('issue')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'issue' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Issue &amp; Return Circulation Desk ({visibleIssues.length})
        </button>
        <button
          onClick={() => setActiveTab('procurement')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
            activeTab === 'procurement' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Principal Procurement Approvals
          {pendingProcurementCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white font-extrabold">
              {pendingProcurementCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('digital')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
            activeTab === 'digital' ? 'bg-teal-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Digital E-Library
        </button>
      </div>

      {/* TAB 1: CATALOG */}
      {activeTab === 'catalog' && (
        <div className="card-clean p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              onClick={() => setShowAddBookModal(true)}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" /> Add Book &amp; Request Approval
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 border-collapse whitespace-nowrap">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Book Title</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Grade</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Circulation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBooks.map((book, idx) => (
                  <tr key={book.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-teal-600" />
                      {book.title}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{book.author}</td>
                    <td className="px-4 py-3.5 font-medium">{book.category || book.subject || 'General'}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {book.grade || 'Grade 1–6'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                        className="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-lg text-xs font-bold transition-colors"
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

      {/* TAB 2: ISSUE / RETURN DESK */}
      {activeTab === 'issue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Issue Book Form */}
            <div className="card-clean p-6 space-y-4 lg:col-span-1">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-teal-600" /> New Book Issue
                </h2>
                <p className="text-xs text-slate-500">Checkout book copy to homeroom student</p>
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
                    {allDisplayBooks.map((b, idx) => (
                      <option key={b.id || idx} value={b.id}>
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
                    {activeStudents.map(s => (
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
            <div className="card-clean p-6 lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <ArrowLeftRight className="w-5 h-5 text-indigo-600" /> Active Circulation &amp; Book Issue Ledger
                  </h2>
                  <p className="text-xs text-slate-500">Track borrower identity, class teacher, due date &amp; clear returned records</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                  {visibleIssues.length} Records
                </span>
              </div>

              {visibleIssues.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl">
                  <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700">No Active Circulation Records</p>
                  <p className="text-[11px] text-slate-500">Issued books will appear here with full borrower details.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700 border-collapse whitespace-nowrap">
                    <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Issued Book</th>
                        <th className="py-2.5 px-3">Borrowed By (Student)</th>
                        <th className="py-2.5 px-3">Class &amp; Teacher</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Circulation &amp; Cleanup Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {visibleIssues.map((i) => {
                        const isReturning = returningId === (i.id || i._id);
                        const issueId = i.id || i._id;
                        return (
                          <tr key={issueId} className="hover:bg-slate-50/80 transition-colors">
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
                                  onClick={() => handleReturnBook(issueId)}
                                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200 transition disabled:opacity-50"
                                >
                                  {isReturning ? 'Returning...' : 'Mark Returned'}
                                </button>
                              ) : (
                                <div className="flex items-center justify-end gap-1.5">
                                  <span className="text-[11px] text-slate-400 italic">Checked In</span>
                                  {/* User Request: Remove option to remove when the status is returned */}
                                  <button
                                    onClick={() => {
                                      removeReturnedIssue(issueId);
                                      showToast(`Returned circulation record for "${i.bookTitle}" removed!`, 'success');
                                    }}
                                    className="p-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition"
                                    title="Remove Returned Record from Ledger"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
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

          {/* ACTIVE BORROWERS & STUDENT REGISTER */}
          <div className="card-clean p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-teal-600" /> Active Student Borrowers Register
                </h3>
                <p className="text-xs text-slate-500">
                  Manage registered student borrower privileges. Remove students from active loan eligibility when required.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                {activeStudents.length} Eligible Borrowers
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeStudents.map(st => {
                const sId = st.id || st._id;
                return (
                  <div key={sId} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3 hover:bg-slate-50 transition">
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{st.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">Roll #{st.rollNo || st.roll_no || '—'} • {st.grade || 'Grade 5-B'}</p>
                    </div>
                    {/* User Request: Give remove option to student list also */}
                    <button
                      onClick={() => {
                        if (window.confirm(`Remove ${st.name} from active library borrowers list?`)) {
                          removeBorrowerStudent(sId);
                          showToast(`${st.name} removed from active borrowers list`, 'success');
                        }
                      }}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition shrink-0"
                      title="Remove from Borrowers List"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PRINCIPAL PROCUREMENT APPROVALS */}
      {activeTab === 'procurement' && (
        <div className="space-y-6">
          <div className="card-clean p-6 bg-gradient-to-r from-amber-50/70 via-white to-teal-50/70 border-l-4 border-l-amber-500 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" /> Book Procurement Requests &amp; Principal Sanction Desk
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl">
                When new books are requested for the school library, they enter this sanction ledger and trigger real-time notifications to the Principal. Once approved by the Principal, books are automatically enrolled into the active catalog.
              </p>
            </div>
            <button
              onClick={() => setShowAddBookModal(true)}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 transition flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Add Book &amp; Request Approval
            </button>
          </div>

          <div className="card-clean overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" /> Pending &amp; Processed Procurement Requests
                </h4>
                <p className="text-xs text-slate-500">Track Principal decision status and budget clearances</p>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                {bookApprovals.length} Procurement Entries
              </span>
            </div>

            {bookApprovals.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-xs">No book procurement requests logged yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500">
                      <th className="py-3 px-4">Book Title &amp; Author</th>
                      <th className="py-3 px-4">Category &amp; Target Grade</th>
                      <th className="py-3 px-4">Requested Copies</th>
                      <th className="py-3 px-4">Estimated Budget</th>
                      <th className="py-3 px-4">Principal Status</th>
                      <th className="py-3 px-4 text-right">Sanction Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookApprovals.map((bk) => (
                      <tr key={bk.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{bk.title}</p>
                          <p className="text-[11px] text-slate-500">{bk.author} (ISBN: {bk.isbn})</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-semibold text-[10px]">
                            {bk.category}
                          </span>
                          <span className="text-[11px] text-slate-500 block mt-0.5">{bk.targetGrade}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {bk.quantity} Copies
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                          {bk.estimatedCost}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            bk.status === 'APPROVED' 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : bk.status === 'REJECTED' 
                              ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                          }`}>
                            {bk.status === 'APPROVED' ? 'Approved & Cataloged ✓' : bk.status === 'REJECTED' ? 'Declined ✕' : 'Pending Principal Review ⏳'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-500">
                          {bk.decidedAt ? new Date(bk.decidedAt).toLocaleDateString() : new Date(bk.requestedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: DIGITAL E-LIBRARY */}
      {activeTab === 'digital' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-indigo-100 shadow-sm space-y-3">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">Mathematics</span>
            <h3 className="font-bold text-slate-900 text-base">Grade 1–6 Mathematics Practice Workbook</h3>
            <p className="text-xs text-slate-500">Complete curriculum exercises, interactive problem sets &amp; answers.</p>
            <button className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700">Read Online PDF</button>
          </div>
          <div className="p-6 bg-gradient-to-br from-teal-50 to-white rounded-2xl border border-teal-100 shadow-sm space-y-3">
            <span className="px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-full">Science &amp; STEM</span>
            <h3 className="font-bold text-slate-900 text-base">Illustrated Science Encyclopedia for Young Minds</h3>
            <p className="text-xs text-slate-500">Visual guides on biology, physical sciences, environment &amp; space.</p>
            <button className="w-full py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700">Read Online PDF</button>
          </div>
          <div className="p-6 bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-amber-100 shadow-sm space-y-3">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">Literature</span>
            <h3 className="font-bold text-slate-900 text-base">Classics Storybook Collection (Grade 1–6)</h3>
            <p className="text-xs text-slate-500">Moral stories, folk tales &amp; English language proficiency readers.</p>
            <button className="w-full py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700">Read Online PDF</button>
          </div>
        </div>
      )}

      {/* ADD BOOK & REQUEST PRINCIPAL APPROVAL MODAL */}
      {showAddBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add Book &amp; Request Principal Approval</h3>
                  <p className="text-xs text-slate-500">Submit procurement requisition to Principal desk</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddBookModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestBookApproval} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oxford Illustrated Science Encyclopedia"
                  value={bookForm.title}
                  onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 outline-none font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Author Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Carl Sagan"
                    value={bookForm.author}
                    onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ISBN Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 978-0199587445"
                    value={bookForm.isbn}
                    onChange={(e) => setBookForm({ ...bookForm, isbn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category / Discipline</label>
                  <select
                    value={bookForm.category}
                    onChange={(e) => setBookForm({ ...bookForm, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 outline-none font-medium"
                  >
                    <option value="Science & STEM">Science &amp; STEM</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Literature & Fiction">Literature &amp; Fiction</option>
                    <option value="History & Civics">History &amp; Civics</option>
                    <option value="Computer Science">Computer Science &amp; AI</option>
                    <option value="General Reference">General Reference &amp; Atlas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Grade</label>
                  <select
                    value={bookForm.targetGrade}
                    onChange={(e) => setBookForm({ ...bookForm, targetGrade: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 outline-none font-medium"
                  >
                    <option value="Grades 1–6">Grades 1–6 (All Primary)</option>
                    <option value="Grades 1–3">Grades 1–3 (Early Readers)</option>
                    <option value="Grades 4–6">Grades 4–6 (Middle Primary)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Requisition Copies</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={bookForm.quantity}
                    onChange={(e) => setBookForm({ ...bookForm, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Budget</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹6,500"
                    value={bookForm.estimatedCost}
                    onChange={(e) => setBookForm({ ...bookForm, estimatedCost: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500 outline-none font-medium"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-[11px] text-teal-900 leading-relaxed">
                <strong>Workflow Note:</strong> Upon submission, this request enters the Principal's Approvals Desk. Once sanctioned by Dr. Neha Bhatnagar, the book is automatically added to the active library catalog.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBookModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md shadow-teal-600/20 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Submit to Principal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
