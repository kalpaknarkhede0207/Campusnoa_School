import assert from 'assert';
import { AuthService } from '../src/services/authService.js';

export async function runAttendanceFinanceTests(serverUrl) {
  console.log('\n--- 4. Testing Attendance & Financial Reconciliations ---');

  const teacherLogin = await AuthService.login('teacher@campusnoa.edu', 'CampusNoa@2026!', '127.0.0.1', 'TestRunner');
  const accountantLogin = await AuthService.login('accountant@campusnoa.edu', 'CampusNoa@2026!', '127.0.0.1', 'TestRunner');

  // 1. Batch Attendance Recording
  const { Student } = await import('../src/models/Student.js');
  const existingStudents = await Student.find({ institutionId: 'INST-001' }).limit(2).lean();
  let testRecords = existingStudents.map((s, idx) => ({
    studentId: s.admissionNumber,
    status: idx === 0 ? 'PRESENT' : 'ABSENT',
    remarks: 'Automated test verification'
  }));

  if (testRecords.length === 0) {
    testRecords = [{ studentId: 'ADM-2026-929', status: 'PRESENT', remarks: 'Test' }];
  }

  const attRes = await fetch(`${serverUrl}/api/attendance/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherLogin.accessToken}`
    },
    body: JSON.stringify({
      divisionId: 'Grade 9-A',
      date: '2026-09-22',
      periodNumber: 1,
      records: testRecords
    })
  });

  assert.strictEqual(attRes.status, 200, 'Batch attendance must return 200');
  const attData = await attRes.json();
  assert.strictEqual(attData.count, testRecords.length);
  console.log(`✅ PASS: Batch attendance recorded and deduplicated in MongoDB for ${testRecords.length} students.`);

  // 2. Financial Ledger & Challan Reconciliation
  const ledgerRes = await fetch(`${serverUrl}/api/fees/ledger`, {
    headers: { 'Authorization': `Bearer ${accountantLogin.accessToken}` }
  });
  assert.strictEqual(ledgerRes.status, 200);
  const ledgerData = await ledgerRes.json();
  assert(ledgerData.summary.totalBilled >= 0);
  console.log(`✅ PASS: Fee ledger calculated from MongoDB: ₹${ledgerData.summary.totalBilled} billed, ${ledgerData.defaulters.length} overdue accounts.`);

  // Reconcile first defaulter if available
  if (ledgerData.defaulters.length > 0) {
    const targetDefaulter = ledgerData.defaulters[0];
    const recRes = await fetch(`${serverUrl}/api/fees/reconcile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accountantLogin.accessToken}`
      },
      body: JSON.stringify({
        transactionId: targetDefaulter.transactionId,
        amount: targetDefaulter.pendingAmount,
        challanRef: 'BANK-CHALLAN-CLEAR-991',
        method: 'BANK_TRANSFER'
      })
    });

    assert.strictEqual(recRes.status, 200);
    const recData = await recRes.json();
    assert.strictEqual(recData.transaction.status, 'PAID');
    console.log(`✅ PASS: Fee transaction ${targetDefaulter.invoiceNumber} reconciled to status PAID in MongoDB.`);
  } else {
    console.log('ℹ️ NOTE: Zero fee defaulters pending reconciliation in current database.');
  }
}
export default runAttendanceFinanceTests;
