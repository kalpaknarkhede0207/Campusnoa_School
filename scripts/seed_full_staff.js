import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectMongo } from '../src/config/mongo.js';
import { User } from '../src/models/User.js';
import { Faculty } from '../src/models/Faculty.js';

async function seedFullStaff() {
  console.log('🌱 Starting Full Faculty & 14 Non-Teaching Staff Seeding...');
  await connectMongo();

  const defaultPassword = 'CampusNoa@2026!';
  const passwordHash = await bcrypt.hash(defaultPassword, 12);
  const institutionId = 'INST-001';

  // 14 Standard Institutional Non-Teaching Staff
  const nonTeachingStaffList = [
    {
      code: 'S-201',
      name: 'Mr. Suresh Prabhu',
      dept: 'Treasury & Accounts',
      role: 'Senior Bursar',
      email: 'accountant@campusnoa.edu',
      phone: '+91 98221 00007',
      roleCode: 'ACCOUNTANT',
      qualification: 'B.Com, Chartered Accountant (Inter)',
      responsibilities: 'Fee collection, bank challans, accounts ledger & statutory audits'
    },
    {
      code: 'S-202',
      name: 'Mr. Rajesh Sharma',
      dept: 'Admissions & Records',
      role: 'Admissions Head',
      email: 'admissions@campusnoa.edu',
      phone: '+91 98221 00005',
      roleCode: 'ADMIN_OFFICER',
      qualification: 'MBA, PG Diploma in Educational Administration',
      responsibilities: 'Student admissions, enrollment verification & regulatory registers'
    },
    {
      code: 'S-203',
      name: 'Dr. Anandibai Joshi',
      dept: 'Student Pastoral Care',
      role: 'Lead Student Counsellor',
      email: 'counsellor@campusnoa.edu',
      phone: '+91 98221 00008',
      roleCode: 'COUNSELLOR',
      qualification: 'Ph.D Clinical Psychology',
      responsibilities: 'Confidential psycho-social guidance & student wellness'
    },
    {
      code: 'S-204',
      name: 'Mr. Nitin Kamble',
      dept: 'Campus Logistics & Transport',
      role: 'Transport Manager',
      email: 'transport@campusnoa.edu',
      phone: '+91 98221 00010',
      roleCode: 'STAFF',
      qualification: 'B.A, Fleet Safety & Logistics Certification',
      responsibilities: 'Bus fleet telemetry, driver schedules, GPS tracking & route safety'
    },
    {
      code: 'S-205',
      name: 'Mrs. Geeta Salvi',
      dept: 'Campus Infirmary',
      role: 'Senior Nursing Officer',
      email: 'infirmary@campusnoa.edu',
      phone: '+91 98221 00011',
      roleCode: 'STAFF',
      qualification: 'B.Sc Nursing, Critical Care Certified',
      responsibilities: 'Student medical triage, first-aid, health records & vaccinations'
    },
    {
      code: 'S-206',
      name: 'Mr. Anand Shinde',
      dept: 'Library & Learning Commons',
      role: 'Senior Librarian',
      email: 'library@campusnoa.edu',
      phone: '+91 98221 00012',
      roleCode: 'STAFF',
      qualification: 'M.Lib.I.Sc, UGC-NET',
      responsibilities: 'Library catalogue, digital learning repositories & research databases'
    },
    {
      code: 'S-207',
      name: 'Mr. Ramesh Pawar',
      dept: 'Science Laboratories',
      role: 'Chief Laboratory Assistant',
      email: 'lab.science@campusnoa.edu',
      phone: '+91 98221 00013',
      roleCode: 'STAFF',
      qualification: 'B.Sc Chemistry, Lab Safety Management',
      responsibilities: 'Physics, Chemistry & Biology lab consumables and equipment calibration'
    },
    {
      code: 'S-208',
      name: 'Mrs. Sunanda Kulkarni',
      dept: 'Administration & Front Desk',
      role: 'Executive Front Desk Officer',
      email: 'reception@campusnoa.edu',
      phone: '+91 98221 00014',
      roleCode: 'STAFF',
      qualification: 'B.A Mass Communication',
      responsibilities: 'Parent inquiries, visitor management, telephone registry & communications'
    },
    {
      code: 'S-209',
      name: 'Mr. Vikram Patil',
      dept: 'Estate & Campus Infrastructure',
      role: 'Estate & Facilities Manager',
      email: 'estate@campusnoa.edu',
      phone: '+91 98221 00015',
      roleCode: 'STAFF',
      qualification: 'Diploma in Civil Engineering',
      responsibilities: 'Building maintenance, sanitation, water safety, HVAC & campus upkeep'
    },
    {
      code: 'S-210',
      name: 'Mr. Manoj Gaikwad',
      dept: 'IT Infrastructure & Systems',
      role: 'Network & Systems Administrator',
      email: 'itadmin@campusnoa.edu',
      phone: '+91 98221 00016',
      roleCode: 'STAFF',
      qualification: 'B.Tech IT, CCNA, Cloud Administration',
      responsibilities: 'Campus Wi-Fi, smart classroom AV systems, server maintenance & cybersecurity'
    },
    {
      code: 'S-211',
      name: 'Mr. Santosh Jadhav',
      dept: 'Security & Surveillance',
      role: 'Campus Security In-Charge',
      email: 'security@campusnoa.edu',
      phone: '+91 98221 00017',
      roleCode: 'STAFF',
      qualification: 'Ex-Serviceman (Indian Army), CCTV Security Certified',
      responsibilities: 'Campus perimeter security, CCTV surveillance, gate passes & student safety'
    },
    {
      code: 'S-212',
      name: 'Mrs. Aruna Deshmukh',
      dept: 'Human Resources',
      role: 'HR & Staff Welfare Officer',
      email: 'hr@campusnoa.edu',
      phone: '+91 98221 00018',
      roleCode: 'STAFF',
      qualification: 'MBA in Human Resource Management',
      responsibilities: 'Staff recruitment, attendance regularization, payroll inputs & compliance'
    },
    {
      code: 'S-213',
      name: 'Mr. Sandeep More',
      dept: 'Store & Procurement',
      role: 'Store & Inventory Manager',
      email: 'stores@campusnoa.edu',
      phone: '+91 98221 00019',
      roleCode: 'STAFF',
      qualification: 'B.Com, Diploma in Materials Management',
      responsibilities: 'Uniforms, stationery distribution, textbook supply & textbook store'
    },
    {
      code: 'S-214',
      name: 'Mrs. Vandana Bhosle',
      dept: 'Examination Cell',
      role: 'Examination Coordinator',
      email: 'examcell@campusnoa.edu',
      phone: '+91 98221 00020',
      roleCode: 'STAFF',
      qualification: 'M.Sc, B.Ed, Assessment Certification',
      responsibilities: 'Term assessments, board exam seating plans, report card generation & archiving'
    }
  ];

  // 15 Teaching Faculty Members across departments
  const teachingFacultyList = [
    {
      code: 'T-101',
      name: 'Mrs. Sunita Roy',
      email: 'teacher@campusnoa.edu',
      phone: '+91 98901 23456',
      tier: 'TGT',
      dept: 'Mathematics',
      degree: 'M.Sc Mathematics, B.Ed',
      exp: 8,
      homeroom: 'Grade 9-A',
      subject: 'Mathematics'
    },
    {
      code: 'T-102',
      name: 'Dr. Vivek Sharma',
      email: 'v.sharma@campusnoa.edu',
      phone: '+91 98220 00101',
      tier: 'PGT',
      dept: 'Science',
      degree: 'Ph.D Physics, B.Ed',
      exp: 12,
      homeroom: 'Grade 10-A',
      subject: 'Physics'
    },
    {
      code: 'T-103',
      name: 'Mrs. Ananya Sen',
      email: 'a.sen@campusnoa.edu',
      phone: '+91 98220 00102',
      tier: 'PGT',
      dept: 'Science',
      degree: 'M.Sc Chemistry, B.Ed',
      exp: 9,
      homeroom: 'Grade 10-B',
      subject: 'Chemistry'
    },
    {
      code: 'T-104',
      name: 'Mr. Rajesh Kulkarni',
      email: 'r.kulkarni@campusnoa.edu',
      phone: '+91 98220 00103',
      tier: 'TGT',
      dept: 'Mathematics',
      degree: 'M.Sc Mathematics, B.Ed',
      exp: 8,
      homeroom: 'Grade 9-B',
      subject: 'Mathematics'
    },
    {
      code: 'T-105',
      name: 'Dr. Radhika Nair',
      email: 'r.nair@campusnoa.edu',
      phone: '+91 98220 00104',
      tier: 'TGT',
      dept: 'Science',
      degree: 'Ph.D Biology, B.Ed',
      exp: 6,
      homeroom: 'Grade 8-A',
      subject: 'Biology'
    },
    {
      code: 'T-106',
      name: 'Mr. Amitav Ghosh',
      email: 'a.ghosh@campusnoa.edu',
      phone: '+91 98220 00105',
      tier: 'PGT',
      dept: 'English',
      degree: 'M.A English Lit, B.Ed',
      exp: 11,
      homeroom: 'Grade 10-C',
      subject: 'English'
    },
    {
      code: 'T-107',
      name: 'Mrs. Kavita Iyer',
      email: 'k.iyer@campusnoa.edu',
      phone: '+91 98220 00106',
      tier: 'TGT',
      dept: 'Social Studies',
      degree: 'M.A History, B.Ed',
      exp: 8,
      homeroom: 'Grade 8-B',
      subject: 'History'
    },
    {
      code: 'T-108',
      name: 'Mr. Sanjay Verma',
      email: 's.verma@campusnoa.edu',
      phone: '+91 98220 00107',
      tier: 'PRT',
      dept: 'Primary',
      degree: 'B.Sc, D.El.Ed',
      exp: 4,
      homeroom: 'Grade 6-A',
      subject: 'General Science'
    },
    {
      code: 'T-109',
      name: 'Mrs. Meenakshi Rao',
      email: 'm.rao@campusnoa.edu',
      phone: '+91 98220 00108',
      tier: 'PRT',
      dept: 'Primary',
      degree: 'B.A, B.Ed',
      exp: 5,
      homeroom: 'Grade 6-B',
      subject: 'Social Science'
    },
    {
      code: 'T-110',
      name: 'Mr. Deepak Deshmukh',
      email: 'd.deshmukh@campusnoa.edu',
      phone: '+91 98220 00109',
      tier: 'TGT',
      dept: 'Computer Science',
      degree: 'MCA, B.Ed',
      exp: 7,
      homeroom: 'Grade 7-A',
      subject: 'Computer Science'
    },
    {
      code: 'T-111',
      name: 'Mrs. Rohini Patil',
      email: 'r.patil@campusnoa.edu',
      phone: '+91 98220 00110',
      tier: 'TGT',
      dept: 'Hindi',
      degree: 'M.A Hindi, B.Ed',
      exp: 10,
      homeroom: 'Grade 7-B',
      subject: 'Hindi'
    },
    {
      code: 'T-112',
      name: 'Mr. Anand Joshi',
      email: 'a.joshi@campusnoa.edu',
      phone: '+91 98220 00111',
      tier: 'PGT',
      dept: 'Science',
      degree: 'Ph.D Physics, B.Ed',
      exp: 10,
      homeroom: 'Grade 9-C',
      subject: 'Physics'
    },
    {
      code: 'T-113',
      name: 'Mrs. Pooja Bhat',
      email: 'p.bhat@campusnoa.edu',
      phone: '+91 98220 00112',
      tier: 'PRT',
      dept: 'Primary',
      degree: 'B.Sc, B.Ed',
      exp: 6,
      homeroom: 'Grade 6-C',
      subject: 'Mathematics'
    },
    {
      code: 'T-114',
      name: 'Mr. Shailesh Reddy',
      email: 's.reddy@campusnoa.edu',
      phone: '+91 98220 00113',
      tier: 'TGT',
      dept: 'Physical Education',
      degree: 'M.P.Ed, NIS',
      exp: 9,
      homeroom: 'None',
      subject: 'Physical Education'
    },
    {
      code: 'T-115',
      name: 'Mrs. Shalini Mehta',
      email: 's.mehta@campusnoa.edu',
      phone: '+91 98220 00114',
      tier: 'TGT',
      dept: 'Fine Arts',
      degree: 'M.F.A',
      exp: 8,
      homeroom: 'None',
      subject: 'Visual Arts'
    }
  ];

  // Seed 14 Non-Teaching Staff
  console.log(`Seeding ${nonTeachingStaffList.length} Non-Teaching Staff members...`);
  for (const s of nonTeachingStaffList) {
    let u = await User.findOne({ email: s.email });
    if (!u) {
      u = await User.create({
        institutionId,
        email: s.email,
        passwordHash,
        fullName: s.name,
        phone: s.phone,
        roleCode: s.roleCode,
        status: 'ACTIVE',
        auth0Sub: `auth0|${s.email.replace(/[@.]/g, '_')}`
      });
    }

    let fac = await Faculty.findOne({ employeeCode: s.code });
    if (!fac) {
      fac = await Faculty.create({
        institutionId,
        userId: u._id,
        employeeCode: s.code,
        designationTier: 'ADMIN_STAFF',
        department: s.dept,
        qualification: s.qualification,
        experienceYears: 10,
        presenceStatus: 'PRESENT'
      });
      console.log(`✅ Created Non-Teaching Faculty: ${s.name} (${s.code}) - ${s.role}`);
    } else {
      fac.designationTier = 'ADMIN_STAFF';
      fac.department = s.dept;
      fac.qualification = s.qualification;
      await fac.save();
      console.log(`ℹ️ Updated Non-Teaching Faculty: ${s.name} (${s.code})`);
    }
  }

  // Seed 15 Teaching Faculty
  console.log(`Seeding ${teachingFacultyList.length} Teaching Faculty members...`);
  for (const t of teachingFacultyList) {
    let u = await User.findOne({ email: t.email });
    if (!u) {
      u = await User.create({
        institutionId,
        email: t.email,
        passwordHash,
        fullName: t.name,
        phone: t.phone,
        roleCode: t.homeroom !== 'None' ? 'CLASS_TEACHER' : 'TEACHER',
        status: 'ACTIVE',
        auth0Sub: `auth0|${t.email.replace(/[@.]/g, '_')}`
      });
    }

    let fac = await Faculty.findOne({ employeeCode: t.code });
    if (!fac) {
      const grade = t.homeroom !== 'None' ? t.homeroom.split('-')[0] : 'Grade 9';
      const section = t.homeroom !== 'None' ? t.homeroom.split('-')[1] : 'A';
      fac = await Faculty.create({
        institutionId,
        userId: u._id,
        employeeCode: t.code,
        designationTier: t.tier,
        department: t.dept,
        qualification: t.degree,
        experienceYears: t.exp,
        homeroomDivision: t.homeroom,
        presenceStatus: 'PRESENT',
        assignedClasses: [
          { grade, section, role: t.homeroom !== 'None' ? 'Class Teacher' : 'Subject Teacher', subject: t.subject }
        ]
      });
      console.log(`✅ Created Teaching Faculty: ${t.name} (${t.code})`);
    } else {
      console.log(`ℹ️ Teaching Faculty exists: ${t.name} (${t.code})`);
    }
  }

  const finalNonTeaching = await Faculty.countDocuments({ institutionId, designationTier: 'ADMIN_STAFF' });
  const finalTeaching = await Faculty.countDocuments({ institutionId, designationTier: { $ne: 'ADMIN_STAFF' } });
  console.log(`\n🎉 Verification:`);
  console.log(`Total Teaching Faculty in MongoDB: ${finalTeaching}`);
  console.log(`Total Non-Teaching Staff in MongoDB: ${finalNonTeaching}`);

  await mongoose.disconnect();
}

seedFullStaff().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
