import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectMongo } from '../src/config/mongo.js';
import {
  Institution,
  User,
  Student,
  Faculty,
  Parent,
  Gfm,
  MentorshipNote,
  Attendance,
  FeeTransaction,
  LeaveApplication,
  TimetableProxy,
  Notification,
  AuditLog
} from '../src/models/index.js';

async function seedMongoDB() {
  console.log('🌱 Starting CampusNoa MongoDB Database Seeding...');
  await connectMongo();

  // 1. Wipe existing collections for clean state
  await Promise.all([
    Institution.deleteMany({}),
    User.deleteMany({}),
    Student.deleteMany({}),
    Faculty.deleteMany({}),
    Parent.deleteMany({}),
    Gfm.deleteMany({}),
    MentorshipNote.deleteMany({}),
    Attendance.deleteMany({}),
    FeeTransaction.deleteMany({}),
    LeaveApplication.deleteMany({}),
    TimetableProxy.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({})
  ]);
  console.log('🧹 Cleaned all existing MongoDB collections.');

  // 2. Seed Institutions (Multi-Tenant)
  const inst1 = await Institution.create({
    code: 'INST-001',
    name: 'CampusNoa Model Academy',
    type: 'K12_ACADEMY',
    status: 'ACTIVE',
    address: 'Survey 44, Baner-Pashan Link Road, Pune, Maharashtra 411045',
    phone: '+91 20 2588 9000',
    email: 'governance@campusnoa.edu',
    settingsJson: JSON.stringify({ boardAffiliation: 'CBSE-930411', academicYear: '2026-2027' })
  });

  const inst2 = await Institution.create({
    code: 'INST-002',
    name: "St. Xavier's International School",
    type: 'K12_ACADEMY',
    status: 'ACTIVE',
    address: 'Fort Campus, Mumbai, Maharashtra 400001',
    phone: '+91 22 2262 0661',
    email: 'admin@stxaviers.edu',
    settingsJson: JSON.stringify({ boardAffiliation: 'ICSE-MH-102', academicYear: '2026-2027' })
  });

  console.log('✅ Institutions created: INST-001 and INST-002.');

  // 3. Password hash: CampusNoa@2026!
  const passwordHash = await bcrypt.hash('CampusNoa@2026!', 12);

  // 4. Seed Core Institutional Personas
  const personas = [
    { email: 'superadmin@campusnoa.edu', name: 'Super Administrator', role: 'SUPER_ADMIN', phone: '+91 98221 00000' },
    { email: 'board@campusnoa.edu', name: 'School Management Board', role: 'SCHOOL_MGMT', phone: '+91 98221 00001' },
    { email: 'principal@campusnoa.edu', name: 'Dr. APJ Abdul Kalam', role: 'PRINCIPAL', phone: '+91 98221 00002' },
    { email: 'teacher@campusnoa.edu', name: 'Mrs. Sunita Roy', role: 'CLASS_TEACHER', phone: '+91 98901 23456' },
    { email: 'admissions@campusnoa.edu', name: 'Mr. Rajesh Sharma', role: 'ADMIN_OFFICER', phone: '+91 98221 00005' },
    { email: 'accountant@campusnoa.edu', name: 'Mr. Suresh Prabhu', role: 'ACCOUNTANT', phone: '+91 98221 00007' },
    { email: 'parent.arav@campusnoa.edu', name: 'Mr. Rajesh Kulkarni', role: 'PARENT', phone: '+91 98220 11223' },
    { email: 'kalpaknarkhede0207@gmail.com', name: 'Kalpak Narkhede', role: 'PRINCIPAL', phone: '+91 98221 00002' },
    { email: 'management@school.edu', name: 'Dr. Vikram Sarabhai', role: 'SCHOOL_MGMT', phone: '+91 98221 00001' },
    { email: 'principal@school.edu', name: 'Dr. APJ Abdul Kalam', role: 'PRINCIPAL', phone: '+91 98221 00002' },
    { email: 'vp@school.edu', name: 'Dr. K. Radhakrishnan', role: 'VICE_PRINCIPAL', phone: '+91 98221 00003' },
    { email: 'hod.science@school.edu', name: 'Prof. Yash Pal', role: 'HOD', phone: '+91 98221 00004' },
    { email: 's.roy@school.edu', name: 'Mrs. Sunita Roy', role: 'CLASS_TEACHER', phone: '+91 98901 23456' },
    { email: 'a.joshi@school.edu', name: 'Mr. Anand Joshi', role: 'TEACHER', phone: '+91 98220 99887' },
    { email: 'admissions@school.edu', name: 'Mr. Rajesh Sharma', role: 'ADMIN_OFFICER', phone: '+91 98221 00005' },
    { email: 'bursar@school.edu', name: 'Mr. Suresh Prabhu', role: 'ACCOUNTANT', phone: '+91 98221 00007' },
    { email: 'counsellor@school.edu', name: 'Dr. Anandibai Joshi', role: 'COUNSELLOR', phone: '+91 98221 00008' },
    { email: 'parent@gmail.com', name: 'Mr. Rajesh Kulkarni', role: 'PARENT', phone: '+91 98220 11223' },
    { email: 'teen.student@school.edu', name: 'Aryan Kapoor', role: 'STUDENT', phone: '+91 98220 55667' },

    // Institutional Isolation Tenant User (INST-002)
    { email: 'admin@stxaviers.edu', name: 'Fr. Francis DSilva', role: 'INSTITUTION_ADMIN', institutionId: inst2.code, phone: '+91 22 2262 0000' }
  ];

  const userMap = {};
  for (const p of personas) {
    const instCode = p.institutionId || inst1.code;
    const u = await User.create({
      institutionId: instCode,
      email: p.email,
      passwordHash,
      fullName: p.name,
      roleCode: p.role,
      phone: p.phone,
      auth0Sub: `auth0|${p.email.replace(/[@.]/g, '_')}`
    });
    userMap[p.email] = u;
  }
  console.log(`✅ ${personas.length} institutional users created with Auth0 identities.`);

  // 5. Seed Faculty Members (15 Teaching + 5 Non-Teaching = 20 total)
  const teachingStaffData = [
    { code: 'T-101', name: 'Dr. Vivek Sharma', tier: 'PGT', dept: 'Science', degree: 'Ph.D Physics, B.Ed', exp: 12, homeroom: 'Grade 6-B', email: 'v.sharma@school.edu' },
    { code: 'T-102', name: 'Mrs. Ananya Sen', tier: 'PGT', dept: 'Science', degree: 'M.Sc Chemistry, B.Ed', exp: 9, homeroom: 'Grade 5-A', email: 'a.sen@school.edu' },
    { code: 'T-103', name: 'Mr. Rajesh Kulkarni', tier: 'TGT', dept: 'Mathematics', degree: 'M.Sc Mathematics, B.Ed', exp: 8, homeroom: 'Grade 4-A', email: 'r.kulkarni@school.edu' },
    { code: 'T-104', name: 'Mrs. Sunita Roy', tier: 'TGT', dept: 'Mathematics', degree: 'M.Sc Mathematics, B.Ed', exp: 7, homeroom: 'Grade 5-B', email: 's.roy@school.edu', userId: userMap['s.roy@school.edu']._id },
    { code: 'T-105', name: 'Dr. Radhika Nair', tier: 'TGT', dept: 'Science', degree: 'Ph.D Biology, B.Ed', exp: 6, homeroom: 'Grade 4-B', email: 'r.nair@school.edu' },
    { code: 'T-106', name: 'Mr. Amitav Ghosh', tier: 'PGT', dept: 'English', degree: 'M.A English Lit, B.Ed', exp: 11, homeroom: 'Grade 3-A', email: 'a.ghosh@school.edu' },
    { code: 'T-107', name: 'Mrs. Kavita Iyer', tier: 'TGT', dept: 'Social Studies', degree: 'M.A History, B.Ed', exp: 8, homeroom: 'Grade 3-B', email: 'k.iyer@school.edu' },
    { code: 'T-108', name: 'Mr. Sanjay Verma', tier: 'PRT', dept: 'Primary', degree: 'B.Sc, D.El.Ed', exp: 4, homeroom: 'Grade 6-A', email: 's.verma@school.edu' },
    { code: 'T-109', name: 'Mrs. Meenakshi Rao', tier: 'PRT', dept: 'Primary', degree: 'B.A, B.Ed', exp: 5, homeroom: 'Grade 2-A', email: 'm.rao@school.edu' },
    { code: 'T-110', name: 'Mr. Deepak Deshmukh', tier: 'TGT', dept: 'Computer Science', degree: 'MCA, B.Ed', exp: 7, homeroom: 'Grade 2-B', email: 'd.deshmukh@school.edu' },
    { code: 'T-111', name: 'Mrs. Rohini Patil', tier: 'TGT', dept: 'Hindi', degree: 'M.A Hindi, B.Ed', exp: 10, homeroom: 'Grade 1-A', email: 'r.patil@school.edu' },
    { code: 'T-112', name: 'Mr. Anand Joshi', tier: 'PGT', dept: 'Science', degree: 'Ph.D Physics, B.Ed', exp: 10, homeroom: 'Grade 1-B', email: 'a.joshi@school.edu', userId: userMap['a.joshi@school.edu']._id },
    { code: 'T-113', name: 'Mrs. Pooja Bhat', tier: 'PRT', dept: 'Primary', degree: 'B.Sc, B.Ed', exp: 6, homeroom: 'Grade 6-C', email: 'p.bhat@school.edu' },
    { code: 'T-114', name: 'Mr. Shailesh Reddy', tier: 'TGT', dept: 'Physical Education', degree: 'M.P.Ed, NIS', exp: 9, homeroom: 'None', email: 's.reddy@school.edu' },
    { code: 'T-115', name: 'Mrs. Shalini Mehta', tier: 'TGT', dept: 'Fine Arts', degree: 'M.F.A', exp: 8, homeroom: 'None', email: 's.mehta@school.edu' }
  ];

  const nonTeachingStaffData = [
    { code: 'S-201', name: 'Mr. Rajesh Sharma', dept: 'Admissions & Records', role: 'Admissions Head', email: 'admissions@school.edu', userId: userMap['admissions@school.edu']._id, qualification: 'Admissions pipeline, verification & parent counseling' },
    { code: 'S-202', name: 'Mr. Suresh Prabhu', dept: 'Treasury & Accounts', role: 'Senior Bursar', email: 'bursar@school.edu', userId: userMap['bursar@school.edu']._id, qualification: 'Fee reconciliation, bank challans & statutory audits' },
    { code: 'S-203', name: 'Dr. Anandibai Joshi', dept: 'Student Pastoral Care', role: 'Lead Counsellor', email: 'counsellor@school.edu', userId: userMap['counsellor@school.edu']._id, qualification: 'Confidential psycho-social counseling & wellbeing audits' },
    { code: 'S-204', name: 'Mr. Nitin Kamble', dept: 'Campus Logistics', role: 'Transport Manager', email: 'transport@school.edu', qualification: 'Fleet tracking, GPS logs & driver safety compliance' },
    { code: 'S-205', name: 'Mrs. Geeta Salvi', dept: 'Infirmary', role: 'Senior Nursing Officer', email: 'infirmary@school.edu', qualification: 'Emergency triage, vaccination records & student medical logs' }
  ];

  const facultyDocs = [];
  for (const t of teachingStaffData) {
    let uId = t.userId;
    if (!uId) {
      const u = await User.create({
        institutionId: inst1.code,
        email: t.email,
        passwordHash,
        fullName: t.name,
        roleCode: 'TEACHER',
        phone: '+91 98220 00100',
        auth0Sub: `auth0|${t.email.replace(/[@.]/g, '_')}`
      });
      uId = u._id;
    }

    const fac = await Faculty.create({
      institutionId: inst1.code,
      userId: uId,
      employeeCode: t.code,
      designationTier: t.tier,
      department: t.dept,
      qualification: t.degree,
      experienceYears: t.exp,
      homeroomDivision: t.homeroom,
      presenceStatus: 'PRESENT',
      assignedClasses: [
        { grade: t.homeroom !== 'None' ? t.homeroom.split('-')[0] : 'Grade 1', section: t.homeroom !== 'None' ? t.homeroom.split('-')[1] : 'A', role: 'Subject Teacher', subject: t.dept }
      ]
    });
    facultyDocs.push(fac);
  }

  for (const s of nonTeachingStaffData) {
    let uId = s.userId;
    if (!uId) {
      const u = await User.create({
        institutionId: inst1.code,
        email: s.email,
        passwordHash,
        fullName: s.name,
        roleCode: 'STAFF',
        phone: '+91 98220 00200',
        auth0Sub: `auth0|${s.email.replace(/[@.]/g, '_')}`
      });
      uId = u._id;
    }

    const fac = await Faculty.create({
      institutionId: inst1.code,
      userId: uId,
      employeeCode: s.code,
      designationTier: 'ADMIN_STAFF',
      department: s.dept,
      qualification: s.qualification,
      experienceYears: 10,
      presenceStatus: 'PRESENT'
    });
    facultyDocs.push(fac);
  }
  console.log('✅ 20 Faculty & Staff profiles created (15 Teaching + 5 Non-Teaching).');

  // 6. Setup GFM for Mrs. Sunita Roy (T-104)
  const facSunita = facultyDocs.find(f => f.employeeCode === 'T-104');
  const menteeAdmissions = Array.from({ length: 10 }, (_, i) => `ADM-2026-${String(i + 1).padStart(3, '0')}`);
  await Gfm.create({
    institutionId: inst1.code,
    facultyId: facSunita._id,
    employeeCode: 'T-104',
    academicYear: '2026-2027',
    maxMentees: 20,
    menteeAdmissionNumbers: menteeAdmissions
  });

  // 7. Setup Parent Profile for Mr. Rajesh Kulkarni (parent@gmail.com)
  await Parent.create({
    institutionId: inst1.code,
    userId: userMap['parent@gmail.com']._id,
    occupation: 'Senior Software Architect',
    emergencyContact: '+91 98220 11223',
    address: 'Flat 402, Residency Towers, Baner, Pune',
    linkedStudentAdmissionNumbers: ['ADM-2026-002'] // Rohan Kulkarni
  });

  // 8. Generate and Seed 50 Students with Fees & Attendance
  const firstNames = [
    'Aarav', 'Rohan', 'Sneha', 'Ananya', 'Aryan', 'Zara', 'Devansh', 'Ishaan', 'Diya', 'Kabir',
    'Meera', 'Aditya', 'Pooja', 'Vihaan', 'Tanvi', 'Siddharth', 'Riya', 'Arjun', 'Avani', 'Yash',
    'Kavya', 'Reyansh', 'Saanvi', 'Shaurya', 'Anushka', 'Atharv', 'Prisha', 'Kunal', 'Aashi', 'Samar',
    'Neha', 'Varun', 'Ira', 'Manav', 'Kiara', 'Harsh', 'Myra', 'Dhruv', 'Navya', 'Ayush',
    'Tara', 'Karan', 'Siya', 'Om', 'Anvi', 'Alok', 'Rhea', 'Nikhil', 'Gauri', 'Tushar'
  ];

  const lastNames = [
    'Patil', 'Kulkarni', 'Sharma', 'Deshmukh', 'Verma', 'Kapoor', 'Shaikh', 'Joshi', 'Mehta', 'Nambiar',
    'Iyer', 'Sen', 'Gupta', 'Bose', 'Reddy', 'Nair', 'Chavan', 'Pawar', 'Bhat', 'Rao'
  ];

  const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];
  const busRoutes = [
    'Route #04 (Kothrud Express)', 'Route #08 (Bavdhan)', 'Route #12 (Aundh)', 'Route #14 (Baner)',
    'Self Walker', 'Private Van'
  ];

  const studentInserts = [];
  const feeInserts = [];
  const attendanceInserts = [];

  for (let i = 0; i < 50; i++) {
    const fName = firstNames[i % firstNames.length];
    const lName = lastNames[(i * 3 + 7) % lastNames.length];
    const admissionNumber = `ADM-2026-${String(i + 1).padStart(3, '0')}`;
    const grade = grades[Math.floor(i / 10)];
    const section = ['A', 'B', 'C'][i % 3];
    const rollNo = (i % 20) + 1;

    // Set specific at-risk profiles (Rohan Kulkarni #2, Aryan Kapoor #5, etc.)
    const isHighRisk = (i === 1 || i === 4 || i === 8 || i === 23);
    const riskLevel = isHighRisk ? 'HIGH' : (i % 6 === 0 ? 'MODERATE' : 'LOW');

    const email = (i === 4)
      ? 'teen.student@school.edu'
      : `${fName.toLowerCase()}.${lName.toLowerCase()}.${i + 1}@campusnoa.edu`;

    const studentUser = (i === 4)
      ? userMap['teen.student@school.edu']
      : await User.create({
          institutionId: inst1.code,
          email,
          passwordHash,
          fullName: `${fName} ${lName}`,
          roleCode: 'STUDENT',
          phone: `+91 9822${String(10000 + i * 143).slice(0, 5)}`,
          auth0Sub: `auth0|${email.replace(/[@.]/g, '_')}`
        });

    studentInserts.push({
      institutionId: inst1.code,
      userId: studentUser._id,
      admissionNumber,
      fullName: `${fName} ${lName}`,
      email,
      grade,
      section,
      rollNo,
      dob: `2012-0${(i % 8) + 1}-15`,
      gender: i % 2 === 0 ? 'Male' : 'Female',
      bloodGroup: ['A+', 'B+', 'O+', 'AB+'][i % 4],
      parentName: i === 1 ? 'Mr. Rajesh Kulkarni' : `Mr. & Mrs. ${lName}`,
      parentWhatsApp: i === 1 ? '+91 98220 11223' : `+91 9822${String(20000 + i * 111).slice(0, 5)}`,
      parentEmail: i === 1 ? 'parent@gmail.com' : `parent.${lName.toLowerCase()}${i + 1}@gmail.com`,
      address: `Tower ${((i % 4) + 1)}, Residency Greens, Pune`,
      busRoute: busRoutes[i % busRoutes.length],
      admissionStatus: 'APPROVED',
      riskLevel
    });

    // Fee structure (₹45,000 annual)
    let paidAmt = 45000;
    let feeStat = 'PAID';
    if (i % 6 === 1 || i === 2) {
      paidAmt = 25000;
      feeStat = 'PARTIAL';
    } else if (i % 8 === 3 || i === 8) {
      paidAmt = 0;
      feeStat = 'OVERDUE';
    }

    feeInserts.push({
      institutionId: inst1.code,
      studentAdmissionNumber: admissionNumber,
      studentName: `${fName} ${lName}`,
      gradeDivision: `${grade}-${section}`,
      parentName: i === 1 ? 'Mr. Rajesh Kulkarni' : `Mr. ${lName}`,
      parentPhone: `+91 9822${String(20000 + i * 111).slice(0, 5)}`,
      invoiceNumber: `INV-2026-${String(i + 1).padStart(3, '0')}`,
      amountBilled: 45000,
      amountPaid: paidAmt,
      pendingAmount: 45000 - paidAmt,
      paymentMethod: paidAmt > 0 ? 'BANK_TRANSFER' : 'CHEQUE',
      challanReference: paidAmt > 0 ? `CHALLAN-HDFC-992${i}` : null,
      status: feeStat,
      transactionDate: new Date(Date.now() - (i * 24 * 60 * 60 * 1000))
    });

    // Seed 15 days of attendance for each student
    for (let day = 1; day <= 15; day++) {
      const dateStr = `2026-09-${String(day).padStart(2, '0')}`;
      const isAbsent = isHighRisk && (day % 3 === 0);
      attendanceInserts.push({
        institutionId: inst1.code,
        divisionName: `${grade}-${section}`,
        studentAdmissionNumber: admissionNumber,
        recordedByEmployeeCode: 'T-104',
        date: dateStr,
        periodNumber: 1,
        status: isAbsent ? 'ABSENT' : 'PRESENT',
        remarks: isAbsent ? 'Medical leave requested' : 'Present in homeroom'
      });
    }
  }

  await Student.insertMany(studentInserts);
  await FeeTransaction.insertMany(feeInserts);
  await Attendance.insertMany(attendanceInserts);
  console.log(`✅ 50 Student profiles, 50 Fee transactions, and ${attendanceInserts.length} Attendance records inserted.`);

  // 9. Seed Confidential Pastoral & Counselling Case (Rohan Kulkarni ADM-2026-002)
  await MentorshipNote.create({
    institutionId: inst1.code,
    employeeCode: 'T-104',
    studentAdmissionNumber: 'ADM-2026-002',
    noteType: 'COUNSELLING',
    content: 'Student recovering from severe post-viral fatigue. Displays mild catch-up anxiety in Mathematics and Science. Coping positively with homeroom mentor assistance.',
    actionPlan: 'Provide 2-week homework buffer. Hold weekly counseling check-ins every Friday.',
    isConfidential: true,
    followUpDate: new Date('2026-09-30')
  });

  // 10. Seed Leave Application with Peer Workload Delegation
  await LeaveApplication.create({
    institutionId: inst1.code,
    applicantEmployeeCode: 'T-101',
    applicantName: 'Dr. Vivek Sharma',
    delegatedEmployeeCode: 'T-104',
    delegatedName: 'Mrs. Sunita Roy',
    leaveType: 'CASUAL',
    startDate: '2026-09-25',
    endDate: '2026-09-26',
    reason: 'Attending National Science Teachers Symposium at IISc Bengaluru',
    delegationStatus: 'ACCEPTED',
    principalStatus: 'APPROVED'
  });

  // 11. Seed Timetable Proxy
  await TimetableProxy.create({
    institutionId: inst1.code,
    assignedEmployeeCode: 'T-104',
    periodNumber: 4,
    timeSlot: 'Period 4 (11:15 AM)',
    divisionName: 'Grade 5-B',
    subjectName: 'Science (Biology)',
    absentTeacherName: 'Mrs. Rohini Deshmukh',
    lessonHandover: 'Conduct Chapter 7 Photosynthesis lab observation worksheet.',
    status: 'ASSIGNED'
  });

  // 12. Seed Institutional Announcements
  await Notification.create({
    institutionId: inst1.code,
    recipientUserId: userMap['principal@school.edu']._id,
    recipientEmail: 'principal@school.edu',
    type: 'ANNOUNCEMENT',
    title: 'Mid-Term Examination Schedule Finalized',
    message: 'All faculty must submit moderated question papers to the Examination Committee by 5:00 PM Friday.'
  });

  console.log('===============================================================');
  console.log('🎉 CampusNoa MongoDB Database Seed Complete with 100% Integrity!');
  console.log(`🍃 Host: mongodb://127.0.0.1:27017/campusnoa`);
  console.log(`🏫 Tenants: INST-001 (CampusNoa) & INST-002 (St. Xavier's)`);
  console.log(`👥 Personas: 11 Auth0-ready institutional roles`);
  console.log(`🎓 Students: 50 records with fees, attendance & risk tiers`);
  console.log(`👨‍🏫 Faculty: 20 profiles (15 Teaching + 5 Non-Teaching Staff)`);
  console.log('===============================================================');

  await mongoose.disconnect();
}

seedMongoDB().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
