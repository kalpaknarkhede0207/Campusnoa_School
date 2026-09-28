import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const InstitutionalContext = createContext(null);

const STORAGE_KEYS = {
  POLICIES: 'campusnoa_board_policies',
  ANNOUNCEMENTS: 'campusnoa_targeted_announcements',
  EXAM_APPROVALS: 'campusnoa_exam_approvals',
  EVENT_APPROVALS: 'campusnoa_event_approvals',
  BOOK_APPROVALS: 'campusnoa_book_approvals',
  STUDENT_MARKS: 'campusnoa_student_marks',
  REMOVED_ISSUES: 'campusnoa_removed_issues',
  REMOVED_BORROWERS: 'campusnoa_removed_borrowers',
  REMOVED_TRACKS: 'campusnoa_removed_tracks',
  READ_NOTIFICATIONS: 'campusnoa_read_notifications',
  SETTINGS: 'campusnoa_institutional_settings',
  DISMISSED_NOTIFICATIONS: 'campusnoa_dismissed_notifications',
  ARCHIVED_POLICIES: 'campusnoa_archived_policies',
  ARCHIVED_LEAVES: 'campusnoa_archived_leaves'
};

const DEFAULT_SETTINGS = {
  institutionName: 'CAMPUSNOA PUBLIC SCHOOL',
  trustName: 'CampusNoa Education Foundation',
  affiliationCode: 'CBSE/AFF/113089',
  registrationNumber: 'REG-MH-2018-9921',
  schoolAddress: 'Survey No. 42, Knowledge Park Highway, Pune, Maharashtra 411045',
  contactEmail: 'administration@campusnoa.edu.in',
  contactPhone: '+91 20 2845 9900',
  principalSignatureName: 'Dr. Eleanor Vance, Ph.D.',
  academicYear: '2026–2027',
  term1Start: '2026-04-01',
  term1End: '2026-09-30',
  term2Start: '2026-10-01',
  term2End: '2027-03-31',
  dailyStartHour: '08:00 AM',
  dailyEndHour: '02:30 PM',
  passingMarksPercent: 33,
  currency: 'INR',
  notificationChannels: {
    sms: true,
    whatsapp: true,
    email: true,
    inApp: true
  },
  gradingScale: [
    { grade: 'A1', min: 91, max: 100, gpa: 10.0, remark: 'Outstanding Performance' },
    { grade: 'A2', min: 81, max: 90, gpa: 9.0, remark: 'Excellent Grasp' },
    { grade: 'B1', min: 71, max: 80, gpa: 8.0, remark: 'Very Good' },
    { grade: 'B2', min: 61, max: 70, gpa: 7.0, remark: 'Good Proficiency' },
    { grade: 'C1', min: 51, max: 60, gpa: 6.0, remark: 'Satisfactory' },
    { grade: 'C2', min: 41, max: 50, gpa: 5.0, remark: 'Developing Competency' },
    { grade: 'D', min: 33, max: 40, gpa: 4.0, remark: 'Basic Passing Threshold' },
    { grade: 'E', min: 0, max: 32, gpa: 0.0, remark: 'Needs Remediated Intervention' }
  ]
};

const DEFAULT_POLICIES = [
  {
    id: 'pol-1',
    title: 'Student Digital Wellbeing & Classroom Device Policy 2026',
    category: 'Student Welfare & Technology',
    enforcementDate: '2026-04-01',
    targetGrades: 'Grades 1–6',
    status: 'PUBLISHED',
    summary: 'Guidelines on screen time during academic hours, mandatory digital literacy modules, and zero-tolerance policy on unauthorized personal smartphones.',
    publishedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    publishedBy: 'Board of Trustees'
  },
  {
    id: 'pol-2',
    title: 'Inclusive Education & Differentiated Assessment Framework',
    category: 'Academic Standards',
    enforcementDate: '2026-06-01',
    targetGrades: 'All Grades',
    status: 'PUBLISHED',
    summary: 'Standardized accommodation protocols for students with diverse learning styles, remedial tutoring quotas, and quarterly IEP audits.',
    publishedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    publishedBy: 'Board of Trustees'
  },
  {
    id: 'pol-3',
    title: 'Annual Campus Nutrition & Allergy Safety Mandate',
    category: 'Health & Safety',
    enforcementDate: '2026-03-15',
    targetGrades: 'Grades 1–6',
    status: 'PUBLISHED',
    summary: 'Strict nut-free canteen policy, mandatory food temperature tracking, and biometric medical alert tagging in the infirmary database.',
    publishedAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    publishedBy: 'Board of Trustees'
  }
];

const DEFAULT_EXAM_APPROVALS = [
  {
    id: 'exam-app-1',
    title: 'Mid-Term Summative Assessment Grade 5',
    grade: 'Grade 5',
    subject: 'Mathematics & Science',
    examDate: '2026-04-14',
    session: 'Morning (09:00 - 11:30 AM)',
    status: 'PENDING',
    principalApproved: false,
    vpApproved: true,
    submittedBy: 'Exam Controller Desk',
    submittedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'exam-app-2',
    title: 'Diagnostic Benchmark Test Grade 3',
    grade: 'Grade 3',
    subject: 'English & Regional Language',
    examDate: '2026-04-18',
    session: 'Morning (09:30 - 11:00 AM)',
    status: 'PENDING',
    principalApproved: false,
    vpApproved: false,
    submittedBy: 'Exam Controller Desk',
    submittedAt: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

const DEFAULT_EVENT_APPROVALS = [
  {
    id: 'evt-app-1',
    title: 'Annual Science & Robotics Exhibition 2026',
    eventDate: '2026-04-25',
    venue: 'Main Auditorium & STEM Labs',
    estimatedBudget: '₹45,000',
    description: 'Inter-house technology demo, student robotics displays, and guest lectures from Indian Institute of Science fellows.',
    status: 'PENDING',
    principalApproved: false,
    vpApproved: true,
    hodApproved: false,
    submittedBy: 'Cultural & Event Coordination Desk',
    submittedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'evt-app-2',
    title: 'K-12 Inter-School Literary Fest',
    eventDate: '2026-05-02',
    venue: 'Campus Open Air Amphitheatre',
    estimatedBudget: '₹30,000',
    description: 'Debates, creative writing workshops, and poetry recitation competition across 12 participating regional schools.',
    status: 'PENDING',
    principalApproved: false,
    vpApproved: false,
    hodApproved: true,
    submittedBy: 'Cultural & Event Coordination Desk',
    submittedAt: new Date(Date.now() - 2 * 86400000).toISOString()
  }
];

const DEFAULT_BOOK_APPROVALS = [
  {
    id: 'bk-app-1',
    title: 'The Illustrated Universe & Astrophysics for Young Explorers',
    author: 'Dr. Jayant Narlikar',
    isbn: '978-0199587445',
    category: 'Science & Astronomy',
    targetGrade: 'Grade 4–6',
    quantity: 15,
    estimatedCost: '₹6,750',
    status: 'PENDING',
    requestedBy: 'Head Librarian',
    requestedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'bk-app-2',
    title: 'Computational Thinking with Python: K-12 Foundation',
    author: 'Prof. Anita Sharma',
    isbn: '978-1449355739',
    category: 'Computer Science',
    targetGrade: 'Grade 5–6',
    quantity: 20,
    estimatedCost: '₹9,800',
    status: 'PENDING',
    requestedBy: 'Head Librarian',
    requestedAt: new Date(Date.now() - 3 * 86400000).toISOString()
  }
];

export function InstitutionalProvider({ children }) {
  const [policies, setPolicies] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.POLICIES);
      return saved ? JSON.parse(saved) : DEFAULT_POLICIES;
    } catch {
      return DEFAULT_POLICIES;
    }
  });

  const [targetedAnnouncements, setTargetedAnnouncements] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [examApprovals, setExamApprovals] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXAM_APPROVALS);
      return saved ? JSON.parse(saved) : DEFAULT_EXAM_APPROVALS;
    } catch {
      return DEFAULT_EXAM_APPROVALS;
    }
  });

  const [eventApprovals, setEventApprovals] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EVENT_APPROVALS);
      return saved ? JSON.parse(saved) : DEFAULT_EVENT_APPROVALS;
    } catch {
      return DEFAULT_EVENT_APPROVALS;
    }
  });

  const [bookApprovals, setBookApprovals] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOK_APPROVALS);
      return saved ? JSON.parse(saved) : DEFAULT_BOOK_APPROVALS;
    } catch {
      return DEFAULT_BOOK_APPROVALS;
    }
  });

  const [studentMarks, setStudentMarks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENT_MARKS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [removedIssues, setRemovedIssues] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REMOVED_ISSUES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [removedBorrowers, setRemovedBorrowers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REMOVED_BORROWERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [removedTracks, setRemovedTracks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REMOVED_TRACKS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [readNotifications, setReadNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.READ_NOTIFICATIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [institutionalSettings, setInstitutionalSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [dismissedNotifications, setDismissedNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DISMISSED_NOTIFICATIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [archivedPolicies, setArchivedPolicies] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ARCHIVED_POLICIES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [archivedLeaves, setArchivedLeaves] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ARCHIVED_LEAVES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Cross-tab synchronization via storage event
  useEffect(() => {
    const handleStorage = (e) => {
      if (!e.key) return;
      try {
        if (e.key === STORAGE_KEYS.POLICIES && e.newValue) setPolicies(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.ANNOUNCEMENTS && e.newValue) setTargetedAnnouncements(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.EXAM_APPROVALS && e.newValue) setExamApprovals(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.EVENT_APPROVALS && e.newValue) setEventApprovals(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.BOOK_APPROVALS && e.newValue) setBookApprovals(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.STUDENT_MARKS && e.newValue) setStudentMarks(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.REMOVED_ISSUES && e.newValue) setRemovedIssues(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.REMOVED_BORROWERS && e.newValue) setRemovedBorrowers(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.REMOVED_TRACKS && e.newValue) setRemovedTracks(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.READ_NOTIFICATIONS && e.newValue) setReadNotifications(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.SETTINGS && e.newValue) setInstitutionalSettings(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.DISMISSED_NOTIFICATIONS && e.newValue) setDismissedNotifications(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.ARCHIVED_POLICIES && e.newValue) setArchivedPolicies(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.ARCHIVED_LEAVES && e.newValue) setArchivedLeaves(JSON.parse(e.newValue));
      } catch (err) {
        console.error('Storage sync error:', err);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Fetch settings on initial load from API
  useEffect(() => {
    api.getSettings().then(res => {
      if (res?.settings) {
        setInstitutionalSettings(res.settings);
        persistState(STORAGE_KEYS.SETTINGS, res.settings);
      }
    }).catch(() => null);
  }, []);

  // Save changes to localStorage
  const persistState = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error(`Error saving ${key}:`, err);
    }
  };

  // 1. Board & Trustees: Create & Publish Student Policy
  const publishPolicy = ({ title, category, targetGrades, summary, enforcementDate }) => {
    const newPolicy = {
      id: `pol-${Date.now()}`,
      title,
      category: category || 'Student Welfare & Governance',
      targetGrades: targetGrades || 'Grades 1–6',
      summary,
      enforcementDate: enforcementDate || new Date().toISOString().split('T')[0],
      status: 'PUBLISHED',
      publishedAt: new Date().toISOString(),
      publishedBy: 'Board of Trustees & Management'
    };

    const updated = [newPolicy, ...policies];
    setPolicies(updated);
    persistState(STORAGE_KEYS.POLICIES, updated);
    return newPolicy;
  };

  // 2. Principal: Dispatch Targeted Announcement
  const broadcastTargetedAnnouncement = ({ title, message, targetRoles, isUrgent }) => {
    const newAnnouncement = {
      id: `ann-${Date.now()}`,
      title,
      message,
      targetRoles: Array.isArray(targetRoles) ? targetRoles : [targetRoles],
      isUrgent: Boolean(isUrgent),
      sentAt: new Date().toISOString(),
      senderName: 'Dr. Neha Bhatnagar, Principal'
    };

    const updated = [newAnnouncement, ...targetedAnnouncements];
    setTargetedAnnouncements(updated);
    persistState(STORAGE_KEYS.ANNOUNCEMENTS, updated);
    return newAnnouncement;
  };

  // 3. Exam Approval System
  const submitExamForApproval = ({ title, grade, subject, examDate, session }) => {
    const newExam = {
      id: `exam-app-${Date.now()}`,
      title,
      grade,
      subject,
      examDate,
      session: session || 'Morning Session (09:30 AM - 12:00 PM)',
      status: 'PENDING',
      principalApproved: false,
      vpApproved: false,
      submittedBy: 'Exam Controller Desk',
      submittedAt: new Date().toISOString()
    };
    const updated = [newExam, ...examApprovals];
    setExamApprovals(updated);
    persistState(STORAGE_KEYS.EXAM_APPROVALS, updated);
    return newExam;
  };

  const actionExamApproval = (examId, role, action) => {
    const updated = examApprovals.map(exam => {
      if (exam.id !== examId) return exam;
      const isApprove = action === 'APPROVE';
      const principalApproved = role === 'principal' ? isApprove : exam.principalApproved;
      const vpApproved = role === 'vice_principal' ? isApprove : exam.vpApproved;
      
      let status = 'PENDING';
      if (!isApprove) {
        status = 'REJECTED';
      } else if (principalApproved && vpApproved) {
        status = 'APPROVED';
      } else if (principalApproved || vpApproved) {
        status = 'PARTIALLY_APPROVED';
      }

      return {
        ...exam,
        principalApproved,
        vpApproved,
        status,
        lastActionAt: new Date().toISOString(),
        lastActionBy: role
      };
    });
    setExamApprovals(updated);
    persistState(STORAGE_KEYS.EXAM_APPROVALS, updated);
  };

  // 4. Event Approval System
  const submitEventForApproval = ({ title, eventDate, venue, description, estimatedBudget }) => {
    const newEvent = {
      id: `evt-app-${Date.now()}`,
      title,
      eventDate,
      venue: venue || 'Main Auditorium',
      description,
      estimatedBudget: estimatedBudget || '₹25,000',
      status: 'PENDING',
      principalApproved: false,
      vpApproved: false,
      hodApproved: false,
      submittedBy: 'Event Coordinator Desk',
      submittedAt: new Date().toISOString()
    };
    const updated = [newEvent, ...eventApprovals];
    setEventApprovals(updated);
    persistState(STORAGE_KEYS.EVENT_APPROVALS, updated);
    return newEvent;
  };

  const actionEventApproval = (eventId, role, action) => {
    const updated = eventApprovals.map(event => {
      if (event.id !== eventId) return event;
      const isApprove = action === 'APPROVE';
      const principalApproved = role === 'principal' ? isApprove : event.principalApproved;
      const vpApproved = role === 'vice_principal' ? isApprove : event.vpApproved;
      const hodApproved = role === 'hod' ? isApprove : event.hodApproved;

      let status = 'PENDING';
      if (!isApprove) {
        status = 'REJECTED';
      } else if (principalApproved && vpApproved && hodApproved) {
        status = 'SANCTIONED';
      } else if (principalApproved || vpApproved || hodApproved) {
        status = 'PARTIALLY_SANCTIONED';
      }

      return {
        ...event,
        principalApproved,
        vpApproved,
        hodApproved,
        status,
        lastActionAt: new Date().toISOString(),
        lastActionBy: role
      };
    });
    setEventApprovals(updated);
    persistState(STORAGE_KEYS.EVENT_APPROVALS, updated);
  };

  // 5. Library Book Procurement Approval System
  const requestBookApproval = ({ title, author, isbn, category, targetGrade, quantity, estimatedCost }) => {
    const newReq = {
      id: `bk-app-${Date.now()}`,
      title,
      author,
      isbn: isbn || 'N/A',
      category: category || 'General Reference',
      targetGrade: targetGrade || 'Grades 1–6',
      quantity: Number(quantity) || 10,
      estimatedCost: estimatedCost || '₹4,500',
      status: 'PENDING',
      requestedBy: 'Head Librarian',
      requestedAt: new Date().toISOString()
    };
    const updated = [newReq, ...bookApprovals];
    setBookApprovals(updated);
    persistState(STORAGE_KEYS.BOOK_APPROVALS, updated);
    return newReq;
  };

  const actionBookApproval = (bookReqId, action) => {
    const updated = bookApprovals.map(req => {
      if (req.id !== bookReqId) return req;
      return {
        ...req,
        status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        decidedAt: new Date().toISOString(),
        decidedBy: 'Dr. Neha Bhatnagar, Principal'
      };
    });
    setBookApprovals(updated);
    persistState(STORAGE_KEYS.BOOK_APPROVALS, updated);
  };

  // 6. Class Teacher: Student Marks Entry
  const saveStudentMarks = (studentId, subject, score, maxMarks = 100, remarks = '') => {
    const scoreNum = Number(score);
    const maxNum = Number(maxMarks);
    const percentage = Math.round((scoreNum / maxNum) * 100);
    
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 40) grade = 'D';

    const updated = {
      ...studentMarks,
      [studentId]: {
        ...(studentMarks[studentId] || {}),
        [subject]: {
          score: scoreNum,
          maxMarks: maxNum,
          percentage,
          grade,
          remarks,
          updatedAt: new Date().toISOString()
        }
      }
    };

    setStudentMarks(updated);
    persistState(STORAGE_KEYS.STUDENT_MARKS, updated);
  };

  // 7. Library: Remove Returned Issues
  const removeReturnedIssue = (issueId) => {
    const updated = [...removedIssues, issueId];
    setRemovedIssues(updated);
    persistState(STORAGE_KEYS.REMOVED_ISSUES, updated);
  };

  // 8. Library: Remove Student from Active Borrowers List
  const removeBorrowerStudent = (studentId) => {
    const updated = [...removedBorrowers, studentId];
    setRemovedBorrowers(updated);
    persistState(STORAGE_KEYS.REMOVED_BORROWERS, updated);
  };

  // 9. HOD: Remove Track Syllabus Entry
  const removeSyllabusTrack = (trackIdOrSubject) => {
    const updated = [...removedTracks, trackIdOrSubject];
    setRemovedTracks(updated);
    persistState(STORAGE_KEYS.REMOVED_TRACKS, updated);
  };

  // 10. Notification Read State
  const markNotificationRead = (notifId) => {
    if (readNotifications.includes(notifId)) return;
    const updated = [...readNotifications, notifId];
    setReadNotifications(updated);
    persistState(STORAGE_KEYS.READ_NOTIFICATIONS, updated);
  };

  const markAllNotificationsRead = (notifIds) => {
    const updated = Array.from(new Set([...readNotifications, ...notifIds]));
    setReadNotifications(updated);
    persistState(STORAGE_KEYS.READ_NOTIFICATIONS, updated);
  };

  // Calculate notifications for a given user role
  const getNotificationsForUser = (userRole) => {
    const notifs = [];

    // 1. Board Policies: Goes to every authority dashboard except 'parent'
    if (userRole !== 'parent') {
      policies.forEach(pol => {
        notifs.push({
          id: `notif-pol-${pol.id}`,
          type: 'POLICY',
          source: 'Board of Trustees & Management',
          title: `New Policy Published: ${pol.title}`,
          message: `${pol.summary} (Enforcement: ${pol.enforcementDate} | ${pol.targetGrades})`,
          timestamp: pol.publishedAt,
          badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: 'Shield',
          isUrgent: false
        });
      });
    }

    // 2. Targeted Principal Announcements
    targetedAnnouncements.forEach(ann => {
      const targets = ann.targetRoles || [];
      const isTargeted = targets.includes('ALL') || 
                         targets.includes('ALL_AUTHORITIES') && userRole !== 'parent' && userRole !== 'student' ||
                         targets.includes(userRole);

      if (isTargeted) {
        notifs.push({
          id: `notif-ann-${ann.id}`,
          type: 'ANNOUNCEMENT',
          source: ann.senderName || 'Principal Office',
          title: ann.title,
          message: ann.message,
          timestamp: ann.sentAt,
          badgeColor: ann.isUrgent ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-indigo-100 text-indigo-800 border-indigo-200',
          icon: 'Megaphone',
          isUrgent: ann.isUrgent
        });
      }
    });

    // 3. Pending Approvals based on Role
    if (userRole === 'principal' || userRole === 'vice_principal') {
      examApprovals
        .filter(ex => ex.status === 'PENDING' || ex.status === 'PARTIALLY_APPROVED')
        .forEach(ex => {
          const needsMyApproval = userRole === 'principal' ? !ex.principalApproved : !ex.vpApproved;
          if (needsMyApproval) {
            notifs.push({
              id: `notif-exam-${ex.id}`,
              type: 'APPROVAL_EXAM',
              source: 'Examination Controller',
              title: `Exam Approval Required: ${ex.title}`,
              message: `${ex.subject} (${ex.grade}) scheduled on ${ex.examDate}. Awaiting institutional sanction.`,
              timestamp: ex.submittedAt,
              badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
              icon: 'FileCheck',
              isUrgent: true,
              entityId: ex.id
            });
          }
        });
    }

    if (userRole === 'principal' || userRole === 'vice_principal' || userRole === 'hod') {
      eventApprovals
        .filter(ev => ev.status === 'PENDING' || ev.status === 'PARTIALLY_SANCTIONED')
        .forEach(ev => {
          const needsMyApproval = userRole === 'principal' ? !ev.principalApproved : 
                                  userRole === 'vice_principal' ? !ev.vpApproved : !ev.hodApproved;
          if (needsMyApproval) {
            notifs.push({
              id: `notif-event-${ev.id}`,
              type: 'APPROVAL_EVENT',
              source: 'Cultural & Event Coordination',
              title: `Event Sanction Required: ${ev.title}`,
              message: `${ev.venue} on ${ev.eventDate}. Awaiting departmental and executive clearance.`,
              timestamp: ev.submittedAt,
              badgeColor: 'bg-pink-100 text-pink-800 border-pink-200',
              icon: 'Calendar',
              isUrgent: false,
              entityId: ev.id
            });
          }
        });
    }

    if (userRole === 'principal') {
      bookApprovals
        .filter(bk => bk.status === 'PENDING')
        .forEach(bk => {
          notifs.push({
            id: `notif-book-${bk.id}`,
            type: 'APPROVAL_BOOK',
            source: 'Library & Information Centre',
            title: `Book Procurement Sanction: ${bk.title}`,
            message: `${bk.quantity} copies by ${bk.author} (Budget: ${bk.estimatedCost}). Awaiting Principal approval.`,
            timestamp: bk.requestedAt,
            badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
            icon: 'BookOpen',
            isUrgent: false,
            entityId: bk.id
          });
        });
    }

    return notifs
      .filter(n => !dismissedNotifications.includes(n.id))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  };

  const updateInstitutionalSettings = async (newSettings) => {
    setInstitutionalSettings(newSettings);
    persistState(STORAGE_KEYS.SETTINGS, newSettings);
    try {
      await api.updateSettings(newSettings);
    } catch (e) {
      console.warn('Backend settings update warning:', e);
    }
  };

  const dismissNotification = (notifId) => {
    const updated = Array.from(new Set([...dismissedNotifications, notifId]));
    setDismissedNotifications(updated);
    persistState(STORAGE_KEYS.DISMISSED_NOTIFICATIONS, updated);
  };

  const clearAllReadNotifications = (ids) => {
    const updated = Array.from(new Set([...dismissedNotifications, ...ids]));
    setDismissedNotifications(updated);
    persistState(STORAGE_KEYS.DISMISSED_NOTIFICATIONS, updated);
  };

  const archivePolicy = (policyId) => {
    const updated = Array.from(new Set([...archivedPolicies, policyId]));
    setArchivedPolicies(updated);
    persistState(STORAGE_KEYS.ARCHIVED_POLICIES, updated);
  };

  const archiveLeave = (leaveId) => {
    const updated = Array.from(new Set([...archivedLeaves, leaveId]));
    setArchivedLeaves(updated);
    persistState(STORAGE_KEYS.ARCHIVED_LEAVES, updated);
  };

  const deleteAnnouncement = async (annId) => {
    const updated = targetedAnnouncements.filter(a => a.id !== annId);
    setTargetedAnnouncements(updated);
    persistState(STORAGE_KEYS.ANNOUNCEMENTS, updated);
    try {
      await api.deleteAnnouncement(annId);
    } catch (e) {
      console.warn('Backend announcement delete warning:', e);
    }
  };

  const visiblePolicies = policies.filter(p => !archivedPolicies.includes(p.id));

  return (
    <InstitutionalContext.Provider
      value={{
        policies: visiblePolicies,
        allPolicies: policies,
        publishPolicy,
        archivePolicy,
        targetedAnnouncements,
        broadcastTargetedAnnouncement,
        deleteAnnouncement,
        examApprovals,
        submitExamForApproval,
        actionExamApproval,
        eventApprovals,
        submitEventForApproval,
        actionEventApproval,
        bookApprovals,
        requestBookApproval,
        actionBookApproval,
        studentMarks,
        saveStudentMarks,
        removedIssues,
        removeReturnedIssue,
        removedBorrowers,
        removeBorrowerStudent,
        removedTracks,
        removeSyllabusTrack,
        readNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        dismissNotification,
        clearAllReadNotifications,
        getNotificationsForUser,
        institutionalSettings,
        updateInstitutionalSettings,
        archivedLeaves,
        archiveLeave
      }}
    >
      {children}
    </InstitutionalContext.Provider>
  );
}

export function useInstitutional() {
  const context = useContext(InstitutionalContext);
  if (!context) {
    throw new Error('useInstitutional must be used within an InstitutionalProvider');
  }
  return context;
}
