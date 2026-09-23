import bcrypt from 'bcryptjs';
import prisma from '../src/config/db.js';

async function main() {
  console.log('🌱 Initiating CampusNoa Production Database Seeding...');

  // 1. Clean existing records
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.timetableProxy.deleteMany();
  await prisma.leaveApplication.deleteMany();
  await prisma.feeTransaction.deleteMany();
  await prisma.feeStructure.deleteMany();
  await prisma.backlog.deleteMany();
  await prisma.result.deleteMany();
  await prisma.marks.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.mentorshipNote.deleteMany();
  await prisma.mentorshipAssignment.deleteMany();
  await prisma.gFM.deleteMany();
  await prisma.studentParentLink.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.student.deleteMany();
  await prisma.facultySubjectAssignment.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.division.deleteMany();
  await prisma.class.deleteMany();
  await prisma.department.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.institution.deleteMany();

  console.log('🧹 Cleaned existing tables.');

  // 2. Seed Institutions (Multi-Tenant)
  const inst1 = await prisma.institution.create({
    data: {
      id: 'inst-campusnoa-001',
      code: 'INST-001',
      name: 'CampusNoa Model Academy',
      type: 'K12_ACADEMY',
      address: 'Survey 44, Baner-Pashan Link Road, Pune, Maharashtra 411045',
      phone: '+91 20 2588 9000',
      email: 'governance@campusnoa.edu'
    }
  });

  const inst2 = await prisma.institution.create({
    data: {
      id: 'inst-stxaviers-002',
      code: 'INST-002',
      name: "St. Xavier's International School",
      type: 'K12_ACADEMY',
      address: 'Fort Campus, Mumbai, Maharashtra 400001',
      phone: '+91 22 2262 0661',
      email: 'admin@stxaviers.edu'
    }
  });

  console.log('✅ Institutions created: INST-001 and INST-002.');

  // 3. Seed Roles
  const rolesData = [
    { code: 'SUPER_ADMIN', name: 'Super Administrator', hierarchyLevel: 100 },
    { code: 'SCHOOL_MGMT', name: 'Board of Trustees / School Management', hierarchyLevel: 95 },
    { code: 'INSTITUTION_ADMIN', name: 'Institution Administrator', hierarchyLevel: 90 },
    { code: 'PRINCIPAL', name: 'Principal / Head of School', hierarchyLevel: 90 },
    { code: 'VICE_PRINCIPAL', name: 'Vice Principal / Academic Coordinator', hierarchyLevel: 80 },
    { code: 'HOD', name: 'Head of Department', hierarchyLevel: 70 },
    { code: 'GFM_COORDINATOR', name: 'GFM Mentorship Coordinator', hierarchyLevel: 65 },
    { code: 'ACCOUNTANT', name: 'Senior Bursar / Accountant', hierarchyLevel: 60 },
    { code: 'ADMIN_OFFICER', name: 'Admissions & HR Officer', hierarchyLevel: 60 },
    { code: 'COUNSELLOR', name: 'Student Counsellor & Wellbeing Lead', hierarchyLevel: 50 },
    { code: 'CLASS_TEACHER', name: 'Class Teacher / Homeroom Mentor', hierarchyLevel: 40 },
    { code: 'GFM', name: 'Guardian Faculty Member', hierarchyLevel: 35 },
    { code: 'TEACHER', name: 'Subject Faculty', hierarchyLevel: 30 },
    { code: 'STAFF', name: 'Non-Teaching Operational Staff', hierarchyLevel: 25 },
    { code: 'PARENT', name: 'Parent / Guardian', hierarchyLevel: 10 },
    { code: 'STUDENT', name: 'Student', hierarchyLevel: 5 }
  ];

  for (const r of rolesData) {
    await prisma.role.create({ data: r });
  }

  // 4. Seed Academic Structure for INST-001
  const ay = await prisma.academicYear.create({
    data: {
      institutionId: inst1.id,
      name: '2026-2027',
      startDate: new Date('2026-06-01'),
      endDate: new Date('2027-04-30'),
      isCurrent: true
    }
  });

  const deptScience = await prisma.department.create({
    data: { institutionId: inst1.id, code: 'SCI', name: 'Department of Science' }
  });
  const deptMaths = await prisma.department.create({
    data: { institutionId: inst1.id, code: 'MATH', name: 'Department of Mathematics' }
  });
  const deptAdmin = await prisma.department.create({
    data: { institutionId: inst1.id, code: 'ADMIN', name: 'Administrative Operations' }
  });

  const gradeNames = ['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'];
  const classMap = {};
  const divisionMap = {};

  for (let g = 0; g < gradeNames.length; g++) {
    const cls = await prisma.class.create({
      data: {
        institutionId: inst1.id,
        name: gradeNames[g],
        gradeLevel: 6 + g
      }
    });
    classMap[gradeNames[g]] = cls;

    // 3 divisions per grade: A, B, C
    for (const sec of ['A', 'B', 'C']) {
      const div = await prisma.division.create({
        data: {
          classId: cls.id,
          name: sec,
          roomNumber: `Room ${100 + g * 10 + sec.charCodeAt(0) - 64}`
        }
      });
      divisionMap[`${gradeNames[g]}-${sec}`] = div;
    }
  }

  // Subjects
  const subjPhys = await prisma.subject.create({
    data: { institutionId: inst1.id, code: 'PHY-10', name: 'Physics (Grade 10)' }
  });
  const subjChem = await prisma.subject.create({
    data: { institutionId: inst1.id, code: 'CHEM-09', name: 'Chemistry (Grade 9)' }
  });
  const subjMath = await prisma.subject.create({
    data: { institutionId: inst1.id, code: 'MATH-09', name: 'Mathematics (Grade 9)' }
  });

  console.log('✅ Academic structure (Departments, Classes, Divisions, Subjects) seeded.');

  // 5. Seed Core Personas & Users (Hashed Password: CampusNoa@2026!)
  const defaultPassword = await bcrypt.hash('CampusNoa@2026!', 12);

  const personaConfigs = [
    { email: 'management@school.edu', name: 'Dr. Vikram Sarabhai', role: 'SCHOOL_MGMT', phone: '+91 98221 00001' },
    { email: 'principal@school.edu', name: 'Dr. APJ Abdul Kalam', role: 'PRINCIPAL', phone: '+91 98221 00002' },
    { email: 'vp@school.edu', name: 'Dr. K. Radhakrishnan', role: 'VICE_PRINCIPAL', phone: '+91 98221 00003' },
    { email: 'hod.science@school.edu', name: 'Prof. Yash Pal', role: 'HOD', phone: '+91 98221 00004' },
    { email: 's.roy@school.edu', name: 'Mrs. Sunita Roy', role: 'CLASS_TEACHER', phone: '+91 98901 23456' },
    { email: 'a.joshi@school.edu', name: 'Mr. Anand Joshi', role: 'TEACHER', phone: '+91 98220 99887' },
    { email: 'admissions@school.edu', name: 'Mr. Rajesh Sharma', role: 'ADMIN_OFFICER', phone: '+91 98221 00005' },
    { email: 'hr@school.edu', name: 'Mr. Rajesh Sharma', role: 'ADMIN_OFFICER', phone: '+91 98221 00006' },
    { email: 'bursar@school.edu', name: 'Mr. Suresh Prabhu', role: 'ACCOUNTANT', phone: '+91 98221 00007' },
    { email: 'counsellor@school.edu', name: 'Dr. Anandibai Joshi', role: 'COUNSELLOR', phone: '+91 98221 00008' },
    { email: 'parent@gmail.com', name: 'Mr. Rajesh Kulkarni', role: 'PARENT', phone: '+91 98220 11223' },
    { email: 'teen.student@school.edu', name: 'Aryan Kapoor', role: 'STUDENT', phone: '+91 98220 55667' },

    // Institutional Isolation Test User (Institution 2)
    { email: 'admin@stxaviers.edu', name: 'Fr. Francis DSilva', role: 'INSTITUTION_ADMIN', institutionId: inst2.id, phone: '+91 22 2262 0000' }
  ];

  const createdUsers = {};

  for (const p of personaConfigs) {
    const u = await prisma.user.create({
      data: {
        institutionId: p.institutionId || inst1.id,
        email: p.email,
        passwordHash: defaultPassword,
        fullName: p.name,
        roleCode: p.role,
        phone: p.phone
      }
    });
    createdUsers[p.email] = u;
  }

  // Create Faculty Profile for Mrs. Sunita Roy (Class Teacher 9-A & GFM Mentor)
  const facSunita = await prisma.faculty.create({
    data: {
      institutionId: inst1.id,
      userId: createdUsers['s.roy@school.edu'].id,
      departmentId: deptMaths.id,
      employeeCode: 'EMP-104',
      designationTier: 'TGT (Trained Graduate Teacher)',
      qualification: 'M.Sc (Mathematics), B.Ed',
      experienceYears: 7,
      tetCertificationId: 'CTET-PAPER-II-98214',
      homeroomDivision: 'Grade 9-A'
    }
  });

  // Create Faculty Profile for Mr. Anand Joshi (PGT Physics)
  const facAnand = await prisma.faculty.create({
    data: {
      institutionId: inst1.id,
      userId: createdUsers['a.joshi@school.edu'].id,
      departmentId: deptScience.id,
      employeeCode: 'EMP-112',
      designationTier: 'PGT (Post Graduate Teacher)',
      qualification: 'Ph.D (Physics), B.Ed',
      experienceYears: 10,
      tetCertificationId: 'CTET-PAPER-II-77120',
      homeroomDivision: 'Grade 10-A'
    }
  });

  // Setup GFM Profile for Mrs. Sunita Roy
  const gfmSunita = await prisma.gFM.create({
    data: {
      institutionId: inst1.id,
      facultyId: facSunita.id,
      academicYearId: ay.id,
      maxMentees: 20
    }
  });

  // Setup Parent Profile for Mr. Rajesh Kulkarni
  const parentRajesh = await prisma.parent.create({
    data: {
      userId: createdUsers['parent@gmail.com'].id,
      occupation: 'Senior Software Architect',
      emergencyContact: '+91 98220 11223',
      address: 'Flat 402, Residency Towers, Baner, Pune'
    }
  });

  console.log('✅ Core 11 personas and faculty/GFM profiles created.');

  // 6. Generate and Seed 50 Students
  const firstNames = [
    'Aarav', 'Ananya', 'Rohan', 'Sneha', 'Aryan', 'Zara', 'Devansh', 'Ishaan', 'Diya', 'Kabir',
    'Meera', 'Aditya', 'Pooja', 'Vihaan', 'Tanvi', 'Siddharth', 'Riya', 'Arjun', 'Avani', 'Yash',
    'Kavya', 'Reyansh', 'Saanvi', 'Shaurya', 'Anushka', 'Atharv', 'Prisha', 'Kunal', 'Aashi', 'Samar',
    'Neha', 'Varun', 'Ira', 'Manav', 'Kiara', 'Harsh', 'Myra', 'Dhruv', 'Navya', 'Ayush',
    'Tara', 'Karan', 'Siya', 'Om', 'Anvi', 'Alok', 'Rhea', 'Nikhil', 'Gauri', 'Tushar'
  ];

  const lastNames = [
    'Patil', 'Kulkarni', 'Sharma', 'Deshmukh', 'Verma', 'Kapoor', 'Shaikh', 'Joshi', 'Mehta', 'Nambiar',
    'Iyer', 'Sen', 'Gupta', 'Bose', 'Reddy', 'Nair', 'Chavan', 'Pawar', 'Bhat', 'Rao'
  ];

  const busRoutes = [
    'Route #04 (Kothrud Express)', 'Route #08 (Bavdhan)', 'Route #12 (Aundh)', 'Route #14 (Baner)',
    'Self Walker', 'Private Van'
  ];

  const studentEntities = [];

  for (let i = 0; i < 50; i++) {
    const fName = firstNames[i % firstNames.length];
    const lName = lastNames[(i * 3 + 7) % lastNames.length];
    const gradeIdx = Math.floor(i / 10);
    const grade = gradeNames[gradeIdx];
    const sec = ['A', 'B', 'C'][i % 3];
    const div = divisionMap[`${grade}-${sec}`];
    const admissionNo = `ADM-2026-${String(i + 1).padStart(3, '0')}`;
    const rollNo = (i % 18) + 1;

    // At-risk student configuration (Rohan Kulkarni #2, Aryan Kapoor #5, etc.)
    const isAtRisk = (i === 1 || i === 4 || i === 8 || i === 23);
    const riskLevel = isAtRisk ? 'HIGH' : (i % 7 === 0 ? 'MODERATE' : 'LOW');

    let studentUser = null;
    if (i === 4) {
      // Linked to teen.student@school.edu (Aryan Kapoor)
      studentUser = createdUsers['teen.student@school.edu'];
    } else {
      studentUser = await prisma.user.create({
        data: {
          institutionId: inst1.id,
          email: `${fName.toLowerCase()}.${lName.toLowerCase()}.${i}@school.edu`,
          passwordHash: defaultPassword,
          fullName: `${fName} ${lName}`,
          roleCode: 'STUDENT',
          phone: `+91 9822${String(10000 + i * 143).slice(0, 5)}`
        }
      });
    }

    const st = await prisma.student.create({
      data: {
        institutionId: inst1.id,
        userId: studentUser.id,
        divisionId: div.id,
        academicYearId: ay.id,
        admissionNumber: admissionNo,
        rollNo,
        dob: new Date(`201${Math.max(0, 5 - gradeIdx)}-05-15`),
        gender: i % 2 === 0 ? 'Male' : 'Female',
        bloodGroup: ['A+', 'B+', 'O+', 'AB+'][i % 4],
        busRoute: busRoutes[i % busRoutes.length],
        riskLevel,
        admissionStatus: 'APPROVED'
      }
    });

    studentEntities.push(st);

    // Link Rohan Kulkarni (i === 1, ADM-2026-002) to parent Rajesh Kulkarni
    if (i === 1) {
      await prisma.studentParentLink.create({
        data: {
          studentId: st.id,
          parentId: parentRajesh.id,
          relationship: 'FATHER',
          isPrimary: true
        }
      });
    }

    // Assign first 10 students to Mrs. Sunita Roy's GFM mentorship cohort
    if (i < 10) {
      await prisma.mentorshipAssignment.create({
        data: {
          gfmId: gfmSunita.id,
          studentId: st.id,
          status: 'ACTIVE'
        }
      });
    }

    // Seed Attendance (30 days)
    for (let day = 1; day <= 15; day++) {
      const dateStr = `2026-09-${String(day).padStart(2, '0')}`;
      const isAbsent = isAtRisk && (day % 3 === 0);
      await prisma.attendance.create({
        data: {
          institutionId: inst1.id,
          divisionId: div.id,
          studentId: st.id,
          recordedByFacultyId: facSunita.id,
          date: dateStr,
          periodNumber: 1,
          status: isAbsent ? 'ABSENT' : 'PRESENT',
          remarks: isAbsent ? 'Medical Leave verified' : 'Present in homeroom'
        }
      });
    }

    // Seed Fee Transactions (Annual fee: ₹45,000)
    let paidAmt = 45000;
    let feeStat = 'PAID';
    if (i % 6 === 1 || i === 2) {
      paidAmt = 25000;
      feeStat = 'PARTIAL';
    } else if (i % 8 === 3 || i === 8) {
      paidAmt = 0;
      feeStat = 'OVERDUE';
    }

    await prisma.feeTransaction.create({
      data: {
        studentId: st.id,
        invoiceNumber: `INV-2026-${String(i + 1).padStart(3, '0')}`,
        amountBilled: 45000,
        amountPaid: paidAmt,
        pendingAmount: 45000 - paidAmt,
        status: feeStat,
        paymentMethod: paidAmt > 0 ? 'BANK_TRANSFER' : 'CHEQUE',
        challanReference: paidAmt > 0 ? `CHALLAN-HDFC-992${i}` : null
      }
    });
  }

  console.log(`✅ 50 student records with attendance and fees seeded.`);

  // 7. Seed Pastoral & Counselling Notes (Confidential)
  const rohanAssignment = await prisma.mentorshipAssignment.findFirst({
    where: { student: { admissionNumber: 'ADM-2026-002' } }
  });

  if (rohanAssignment) {
    await prisma.mentorshipNote.create({
      data: {
        assignmentId: rohanAssignment.id,
        noteType: 'POST_VIRAL_FATIGUE',
        content: 'Student recovering from severe viral infection. Shows mild academic catching-up anxiety. Coping well with mentor support. Recommend extended homework windows.',
        actionPlan: 'Extended homework submission windows for 2 weeks. Weekly check-in on Friday.',
        isConfidential: true
      }
    });
  }

  // 8. Seed Timetable Proxy
  await prisma.timetableProxy.create({
    data: {
      institutionId: inst1.id,
      assignedFacultyId: facSunita.id,
      periodNumber: 4,
      timeSlot: 'Period 4 (11:15 AM)',
      divisionName: 'Grade 8-B',
      subjectName: 'Science (Biology)',
      absentTeacherName: 'Mrs. Rohini Deshmukh',
      lessonHandover: 'Conduct Ch 7 Photosynthesis lab observation worksheet.'
    }
  });

  console.log('🎉 CampusNoa Database Seeded Successfully with 100% relational integrity!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
