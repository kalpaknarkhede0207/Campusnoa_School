import http from 'http';
import app from '../src/app.js';
import { connectMongo } from '../src/config/mongo.js';
import { mintAuth0Token } from '../src/middlewares/auth0.js';
import { User } from '../src/models/User.js';
import { Student } from '../src/models/Student.js';
import { Faculty } from '../src/models/Faculty.js';
import { Attendance } from '../src/models/Attendance.js';
import { FeeTransaction } from '../src/models/FeeTransaction.js';
import { MentorshipNote } from '../src/models/MentorshipNote.js';
import { Notification } from '../src/models/Notification.js';
import mongoose from 'mongoose';

async function runFullVerification() {
  console.log('================================================================');
  console.log('🚀 CAMPUSNOA COMPLETE E2E SYSTEM AUDIT & FLOW VERIFICATION');
  console.log('================================================================');

  await connectMongo();

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(3097, resolve));
  const baseUrl = 'http://127.0.0.1:3097';

  // Retrieve actual database users
  const principalUser = await User.findOne({ roleCode: 'PRINCIPAL' });
  const vpUser = await User.findOne({ roleCode: 'VICE_PRINCIPAL' });
  const teacherUser = await User.findOne({ roleCode: { $in: ['CLASS_TEACHER', 'TEACHER'] } });
  const admissionsUser = await User.findOne({ roleCode: 'ADMIN_OFFICER' });
  const accountantUser = await User.findOne({ roleCode: 'ACCOUNTANT' });
  const counsellorUser = await User.findOne({ roleCode: 'COUNSELLOR' });
  const parentUser = await User.findOne({ roleCode: 'PARENT' });
  const studentUser = await User.findOne({ roleCode: 'STUDENT' });

  // Generate verified tokens
  const makeToken = (user, role) => mintAuth0Token({
    sub: user?.auth0Sub || `auth0|${user?.email || role.toLowerCase()}`,
    email: user?.email || `${role.toLowerCase()}@campusnoa.edu`,
    fullName: user?.fullName || role,
    roleCode: role,
    institutionId: user?.institutionId || 'INST-001'
  });

  const tokens = {
    PRINCIPAL: makeToken(principalUser, 'PRINCIPAL'),
    VICE_PRINCIPAL: makeToken(vpUser, 'VICE_PRINCIPAL'),
    CLASS_TEACHER: makeToken(teacherUser, 'CLASS_TEACHER'),
    ADMIN_OFFICER: makeToken(admissionsUser, 'ADMIN_OFFICER'),
    ACCOUNTANT: makeToken(accountantUser, 'ACCOUNTANT'),
    COUNSELLOR: makeToken(counsellorUser, 'COUNSELLOR'),
    PARENT: makeToken(parentUser, 'PARENT'),
    STUDENT: makeToken(studentUser, 'STUDENT')
  };

  const results = [];
  const recordResult = (id, name, pass, detail) => {
    results.push({ id, name, pass, detail });
    console.log(`${pass ? '✅' : '❌'} [${id}] ${name}: ${detail}`);
  };

  try {
    // 1. Health Endpoint
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    recordResult('FLOW-01', 'Health Check API', healthRes.status === 200 && healthData.status === 'HEALTHY', `HTTP ${healthRes.status} - Status: ${healthData.status}`);

    // 2. Authentication: Login
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: principalUser?.email || 'principal@campusnoa.edu', password: 'CampusNoa@2026!' })
    });
    const loginData = await loginRes.json();
    recordResult('FLOW-02', 'Login & Token Issuance', loginRes.status === 200 && !!loginData.accessToken, `HTTP ${loginRes.status} - User: ${loginData.user?.name}`);

    // 3. Session Profile Retrieval
    const sessionRes = await fetch(`${baseUrl}/api/auth/session`, {
      headers: { 'Authorization': `Bearer ${tokens.PRINCIPAL}` }
    });
    const sessionData = await sessionRes.json();
    recordResult('FLOW-03', 'Auth0 Session Hydration', sessionRes.status === 200 && sessionData.user?.role === 'principal', `HTTP ${sessionRes.status} - Role: ${sessionData.user?.role}`);

    // 4. GET Students (Database aggregation)
    const studentsRes = await fetch(`${baseUrl}/api/students`, {
      headers: { 'Authorization': `Bearer ${tokens.PRINCIPAL}` }
    });
    const studentsData = await studentsRes.json();
    recordResult('FLOW-04', 'Students Query (DB-backed)', studentsRes.status === 200 && Array.isArray(studentsData.students), `HTTP ${studentsRes.status} - Loaded ${studentsData.count} students`);

    // 5. POST Admit Student (Full DB Create & Fee Invoice creation)
    const testAdmNo = `ADM-TEST-${Date.now().toString().slice(-4)}`;
    const admitRes = await fetch(`${baseUrl}/api/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.ADMIN_OFFICER}`
      },
      body: JSON.stringify({
        fullName: 'Audit Test Student',
        email: `audit.${Date.now()}@campusnoa.edu`,
        grade: 'Grade 9',
        section: 'A',
        admissionNumber: testAdmNo,
        parentName: 'Audit Guardian',
        phone: '+91 98220 99999',
        busRoute: 'Route #04'
      })
    });
    const admitData = await admitRes.json();
    const studentInDb = await Student.findOne({ admissionNumber: testAdmNo });
    const feeInDb = await FeeTransaction.findOne({ studentAdmissionNumber: testAdmNo });
    recordResult('FLOW-05', 'Student Admission & Invoicing', admitRes.status === 201 && !!studentInDb && !!feeInDb, `Student persisted: ${!!studentInDb}, Invoice generated: ${!!feeInDb}`);

    // 6. POST Approve Student Admission (AUD-002 fix verification)
    const approveRes = await fetch(`${baseUrl}/api/students/${testAdmNo}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.PRINCIPAL}`
      },
      body: JSON.stringify({ action: 'APPROVE' })
    });
    const approveData = await approveRes.json();
    const updatedStudent = await Student.findOne({ admissionNumber: testAdmNo });
    recordResult('FLOW-06', 'Student Approval Endpoint (AUD-002)', approveRes.status === 200 && updatedStudent.admissionStatus === 'APPROVED', `Status updated: ${updatedStudent?.admissionStatus}`);

    // 7. POST Appoint Class Teacher (VP Workflow)
    const assignRes = await fetch(`${baseUrl}/api/assign-teacher`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.VICE_PRINCIPAL}`
      },
      body: JSON.stringify({
        teacherName: teacherUser?.fullName || 'Mrs. Sunita Roy',
        roleType: 'CLASS_TEACHER',
        grade: 'Grade 9',
        section: 'A',
        studentIds: [testAdmNo]
      })
    });
    const assignData = await assignRes.json();
    const assignedStudent = await Student.findOne({ admissionNumber: testAdmNo });
    recordResult('FLOW-07', 'VP Appoint Class Teacher', assignRes.status === 200 && assignedStudent.classTeacher !== 'Not Assigned', `Assigned teacher: ${assignedStudent?.classTeacher}`);

    // 8. POST Homeroom Attendance (Class Teacher Workflow)
    const attRes = await fetch(`${baseUrl}/api/attendance/mark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.CLASS_TEACHER}`
      },
      body: JSON.stringify({
        divisionName: 'Grade 9-A',
        date: new Date().toISOString().split('T')[0],
        records: [{ studentId: testAdmNo, status: 'PRESENT' }]
      })
    });
    const attData = await attRes.json();
    const attRecordInDb = await Attendance.findOne({ studentAdmissionNumber: testAdmNo });
    recordResult('FLOW-08', 'Attendance Mark & Persistence', attRes.status === 200 && !!attRecordInDb, `Attendance document persisted: ${!!attRecordInDb}`);

    // 9. POST Fee Reconciliation (Accountant Workflow)
    const reconcileRes = await fetch(`${baseUrl}/api/finance/transactions/${testAdmNo}/reconcile`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${tokens.ACCOUNTANT}` }
    });
    const reconcileData = await reconcileRes.json();
    const txInDb = await FeeTransaction.findOne({ studentAdmissionNumber: testAdmNo });
    recordResult('FLOW-09', 'Finance Fee Reconciliation', reconcileRes.status === 200 && txInDb.status === 'PAID', `Fee status: ${txInDb?.status}, Pending: ₹${txInDb?.pendingAmount}`);

    // 10. POST Counselling Case (Counsellor Workflow)
    const counselRes = await fetch(`${baseUrl}/api/counselling/cases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokens.COUNSELLOR}`
      },
      body: JSON.stringify({
        studentId: testAdmNo,
        studentName: 'Audit Test Student',
        category: 'Academic Guidance',
        confidentialNotes: 'Periodic academic orientation completed.',
        actionPlan: 'Review progress in 2 weeks.'
      })
    });
    const counselData = await counselRes.json();
    const noteInDb = await MentorshipNote.findOne({ studentAdmissionNumber: testAdmNo });
    recordResult('FLOW-10', 'Pastoral Counselling Vault', counselRes.status === 201 && !!noteInDb, `Confidential note saved: ${!!noteInDb}`);

    // 11. GET GFM Mentorship Notes (AUD-003 fix verification)
    const gfmNotesRes = await fetch(`${baseUrl}/api/gfm/notes?studentId=${testAdmNo}`, {
      headers: { 'Authorization': `Bearer ${tokens.CLASS_TEACHER}` }
    });
    const gfmNotesData = await gfmNotesRes.json();
    recordResult('FLOW-11', 'GFM Notes Retrieval (AUD-003)', gfmNotesRes.status === 200 && gfmNotesData.success, `Found ${gfmNotesData.count} mentorship notes`);

    // 12. Security Boundary: FERPA / Privacy Protection (Accountant blocked from counselling)
    const ferpaRes = await fetch(`${baseUrl}/api/counselling/cases`, {
      headers: { 'Authorization': `Bearer ${tokens.ACCOUNTANT}` }
    });
    recordResult('FLOW-12', 'FERPA Privacy Guard (Accountant Blocked)', ferpaRes.status === 403, `HTTP ${ferpaRes.status} (Access Denied as expected)`);

    // 13. Security Boundary: IDOR Protection (Student blocked from inspecting peer records)
    const idorRes = await fetch(`${baseUrl}/api/students/ADM-2026-999`, {
      headers: { 'Authorization': `Bearer ${tokens.STUDENT}` }
    });
    recordResult('FLOW-13', 'IDOR Student Record Isolation', idorRes.status === 403, `HTTP ${idorRes.status} (Blocked IDOR query as expected)`);

    // 14. Multi-Tenant Cross-Institution Violation
    const tenantRes = await fetch(`${baseUrl}/api/students?institutionId=INST-999`, {
      headers: { 'Authorization': `Bearer ${tokens.PRINCIPAL}` }
    });
    recordResult('FLOW-14', 'Multi-Tenant Cross-Tenant Block', tenantRes.status === 403, `HTTP ${tenantRes.status} (CROSS_TENANT_VIOLATION as expected)`);

    // 15. DELETE Clean-up Student Profile
    const deleteRes = await fetch(`${baseUrl}/api/students/${testAdmNo}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokens.PRINCIPAL}` }
    });
    const deletedInDb = await Student.findOne({ admissionNumber: testAdmNo });
    const feeDeleted = await FeeTransaction.findOne({ studentAdmissionNumber: testAdmNo });
    recordResult('FLOW-15', 'Cascade Student Record Deletion', deleteRes.status === 200 && !deletedInDb && !feeDeleted, `Student removed: ${!deletedInDb}, Cascade auxiliary cleaned: ${!feeDeleted}`);

    console.log('\n================================================================');
    const allPassed = results.every(r => r.pass);
    console.log(allPassed ? '🎉 ALL 15 CRITICAL PRODUCT FLOWS VERIFIED 100% WORKING!' : '⚠️ SOME CRITICAL FLOWS FAILED');
    console.log('================================================================');
    if (!allPassed) process.exit(1);

  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runFullVerification().catch(err => {
  console.error('Execution failure:', err);
  process.exit(1);
});
