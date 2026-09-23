import assert from 'assert';
import { AuthService } from '../src/services/authService.js';
import prisma from '../src/config/db.js';

export async function runRbacAbacTests(serverUrl) {
  console.log('\n--- 3. Testing RBAC, ABAC & Record-Level Ownership ---');

  // 1. Student IDOR Test: Student (Aryan Kapoor ADM-2026-005) tries to access Rohan Kulkarni (ADM-2026-002)
  const studentLogin = await AuthService.login('teen.student@school.edu', 'CampusNoa@2026!', '127.0.0.1', 'TestRunner');

  const idorRes = await fetch(`${serverUrl}/api/students/ADM-2026-002`, {
    headers: { 'Authorization': `Bearer ${studentLogin.accessToken}` }
  });

  assert.strictEqual(idorRes.status, 403, 'Student accessing another student profile must return 403');
  const idorData = await idorRes.json();
  assert.strictEqual(idorData.error, 'IDOR_VIOLATION');
  console.log('✅ PASS: Student IDOR blocked with 403 IDOR_VIOLATION.');

  // 2. Student own profile check
  const ownRes = await fetch(`${serverUrl}/api/students/ADM-2026-005`, {
    headers: { 'Authorization': `Bearer ${studentLogin.accessToken}` }
  });
  assert.strictEqual(ownRes.status, 200, 'Student accessing own profile must return 200');
  console.log('✅ PASS: Student authorized to access own profile.');

  // 3. FERPA Privacy Isolation: Accountant trying to view confidential counselling cases
  const accountantLogin = await AuthService.login('bursar@school.edu', 'CampusNoa@2026!', '127.0.0.1', 'TestRunner');
  const accRes = await fetch(`${serverUrl}/api/counselling/cases`, {
    headers: { 'Authorization': `Bearer ${accountantLogin.accessToken}` }
  });
  assert.strictEqual(accRes.status, 403, 'Accountant accessing confidential counselling cases must return 403');
  console.log('✅ PASS: Accountant strictly blocked from confidential counselling cases (HTTP 403).');

  // 4. Authorized Counsellor accessing confidential cases
  const counsellorLogin = await AuthService.login('counsellor@school.edu', 'CampusNoa@2026!', '127.0.0.1', 'TestRunner');
  const counsRes = await fetch(`${serverUrl}/api/counselling/cases`, {
    headers: { 'Authorization': `Bearer ${counsellorLogin.accessToken}` }
  });
  assert.strictEqual(counsRes.status, 200, 'Counsellor accessing cases must return 200');
  const counsData = await counsRes.json();
  assert(counsData.cases.length > 0, 'Should return confidential cases');
  console.log(`✅ PASS: Counsellor successfully retrieved ${counsData.cases.length} confidential pastoral cases.`);

  // 5. GFM Mentorship cohort access
  const teacherLogin = await AuthService.login('s.roy@school.edu', 'CampusNoa@2026!', '127.0.0.1', 'TestRunner');
  const gfmRes = await fetch(`${serverUrl}/api/gfm/mentees`, {
    headers: { 'Authorization': `Bearer ${teacherLogin.accessToken}` }
  });
  assert.strictEqual(gfmRes.status, 200, 'GFM retrieving mentees must return 200');
  const gfmData = await gfmRes.json();
  assert.strictEqual(gfmData.count, 10, 'Mrs. Sunita Roy should have exactly 10 assigned mentees');
  console.log(`✅ PASS: GFM mentor successfully retrieved assigned cohort of ${gfmData.count} mentees.`);
}
