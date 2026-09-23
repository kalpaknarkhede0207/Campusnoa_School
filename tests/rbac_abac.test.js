import assert from 'assert';
import { AuthService } from '../src/services/authService.js';
import { User } from '../src/models/User.js';

export async function runRbacAbacTests(serverUrl) {
  console.log('\n--- 3. Testing RBAC, ABAC & Record-Level Ownership ---');

  // 1. Ensure student test user
  let studentUser = await User.findOne({ roleCode: 'STUDENT' });
  if (!studentUser) {
    studentUser = await User.create({
      institutionId: 'INST-001',
      email: 'student.test@campusnoa.edu',
      fullName: 'Test Student',
      roleCode: 'STUDENT',
      passwordHash: await AuthService.hashPassword('CampusNoa@2026!'),
      auth0Sub: 'auth0|student_test'
    });
  }
  const studentLogin = await AuthService.login(studentUser.email, 'CampusNoa@2026!', '127.0.0.1', 'TestRunner');

  // Student IDOR Test: Student tries to access another student's record
  const idorRes = await fetch(`${serverUrl}/api/students/ADM-OTHER-STUDENT-999`, {
    headers: { 'Authorization': `Bearer ${studentLogin.accessToken}` }
  });

  assert.strictEqual(idorRes.status, 403, 'Student accessing another student profile must return 403');
  const idorData = await idorRes.json();
  assert.strictEqual(idorData.error, 'IDOR_VIOLATION');
  console.log('✅ PASS: Student IDOR blocked with 403 IDOR_VIOLATION.');

  // 2. FERPA Privacy Isolation: Accountant trying to view confidential counselling cases
  const accountantLogin = await AuthService.login('accountant@campusnoa.edu', 'CampusNoa@2026!', '127.0.0.1', 'TestRunner');
  const accRes = await fetch(`${serverUrl}/api/counselling/cases`, {
    headers: { 'Authorization': `Bearer ${accountantLogin.accessToken}` }
  });
  assert.strictEqual(accRes.status, 403, 'Accountant accessing confidential counselling cases must return 403');
  console.log('✅ PASS: Accountant strictly blocked from confidential counselling cases (HTTP 403).');

  // 3. Authorized Counsellor accessing confidential cases
  let counsellorUser = await User.findOne({ roleCode: 'COUNSELLOR' });
  if (!counsellorUser) {
    counsellorUser = await User.create({
      institutionId: 'INST-001',
      email: 'counsellor@campusnoa.edu',
      fullName: 'Dr. Counsellor Joshi',
      roleCode: 'COUNSELLOR',
      passwordHash: await AuthService.hashPassword('CampusNoa@2026!'),
      auth0Sub: 'auth0|counsellor_test'
    });
  }
  const counsellorLogin = await AuthService.login(counsellorUser.email, 'CampusNoa@2026!', '127.0.0.1', 'TestRunner');
  const counsRes = await fetch(`${serverUrl}/api/counselling/cases`, {
    headers: { 'Authorization': `Bearer ${counsellorLogin.accessToken}` }
  });
  assert.strictEqual(counsRes.status, 200, 'Counsellor accessing cases must return 200');
  const counsData = await counsRes.json();
  assert(Array.isArray(counsData.cases), 'Should return confidential cases array');
  console.log(`✅ PASS: Counsellor successfully retrieved ${counsData.cases.length} confidential pastoral cases.`);

  // 4. GFM Mentorship cohort access
  const teacherLogin = await AuthService.login('teacher@campusnoa.edu', 'CampusNoa@2026!', '127.0.0.1', 'TestRunner');
  const gfmRes = await fetch(`${serverUrl}/api/gfm/mentees`, {
    headers: { 'Authorization': `Bearer ${teacherLogin.accessToken}` }
  });
  assert.strictEqual(gfmRes.status, 200, 'GFM retrieving mentees must return 200');
  const gfmData = await gfmRes.json();
  assert(typeof gfmData.count === 'number', 'Mrs. Sunita Roy should have assigned mentees count');
  console.log(`✅ PASS: GFM mentor successfully retrieved assigned cohort of ${gfmData.count} mentees.`);
}
