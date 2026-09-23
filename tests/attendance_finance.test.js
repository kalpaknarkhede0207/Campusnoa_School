import assert from 'assert';
import { AuthService } from '../src/services/authService.js';

export async function runAttendanceFinanceTests(serverUrl) {
  console.log('\n--- 4. Testing Attendance & Financial Reconciliations ---');

  const teacherLogin = await AuthService.login('s.roy@school.edu', 'CampusNoa@2026!', '127.0.0.1', 'TestRunner');
  const accountantLogin = await AuthService.login('bursar@school.edu', 'CampusNoa@2026!', '127.0.0.1', 'TestRunner');

  // 1. Batch Attendance Recording
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
      records: [
        { studentId: 'ADM-2026-001', status: 'PRESENT', remarks: 'On time' },
        { studentId: 'ADM-2026-002', status: 'ABSENT', remarks: 'Medical follow-up' }
      ]
    })
  });

  assert.strictEqual(attRes.status, 200, 'Batch attendance must return 200');
  const attData = await attRes.json();
  assert.strictEqual(attData.count, 2);
  console.log('✅ PASS: Batch attendance recorded and deduplicated in MongoDB.');

  // 2. Financial Ledger & Challan Reconciliation
  const ledgerRes = await fetch(`${serverUrl}/api/fees/ledger`, {
    headers: { 'Authorization': `Bearer ${accountantLogin.accessToken}` }
  });
  assert.strictEqual(ledgerRes.status, 200);
  const ledgerData = await ledgerRes.json();
  assert(ledgerData.summary.totalBilled > 0);
  assert(ledgerData.defaulters.length > 0);
  console.log(`✅ PASS: Fee ledger calculated from MongoDB: ₹${ledgerData.summary.totalBilled} billed, ${ledgerData.defaulters.length} overdue accounts.`);

  // Reconcile first defaulter
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
}
export default runAttendanceFinanceTests;
