import assert from 'assert';
import { connectMongo } from '../src/config/mongo.js';
import {
  Institution,
  User,
  Student,
  Faculty,
  FeeTransaction,
  Attendance,
  Gfm
} from '../src/models/index.js';

export async function runMongoConnectionTests() {
  console.log('\n--- MongoDB Connection & Model Integrity Tests ---');

  await connectMongo();

  // Test 1: Verify Institutions
  const instCount = await Institution.countDocuments();
  assert(instCount >= 2, `Expected at least 2 institutions in MongoDB, found ${instCount}`);
  console.log(`✅ PASS: MongoDB connected. Found ${instCount} institutions (INST-001, INST-002).`);

  // Test 2: Verify 50 Students
  const studentCount = await Student.countDocuments({ institutionId: 'INST-001' });
  assert.strictEqual(studentCount, 50, `Expected exactly 50 students in MongoDB, found ${studentCount}`);
  console.log(`✅ PASS: Exactly ${studentCount} students verified in MongoDB.`);

  // Test 3: Verify 20 Faculty Members
  const facultyCount = await Faculty.countDocuments({ institutionId: 'INST-001' });
  assert.strictEqual(facultyCount, 20, `Expected exactly 20 faculty in MongoDB, found ${facultyCount}`);
  console.log(`✅ PASS: Exactly ${facultyCount} faculty verified in MongoDB.`);

  // Test 4: Verify Fee Transactions
  const feeCount = await FeeTransaction.countDocuments({ institutionId: 'INST-001' });
  assert.strictEqual(feeCount, 50, `Expected 50 fee transactions, found ${feeCount}`);
  console.log(`✅ PASS: Exactly ${feeCount} fee ledger transactions verified in MongoDB.`);

  // Test 5: Verify GFM Mentor Portfolio
  const gfm = await Gfm.findOne({ employeeCode: 'T-104' });
  assert(gfm, 'GFM portfolio for T-104 should exist in MongoDB');
  assert.strictEqual(gfm.menteeAdmissionNumbers.length, 10, 'Expected 10 mentees assigned to T-104');
  console.log(`✅ PASS: GFM portfolio verified with ${gfm.menteeAdmissionNumbers.length} mentees.`);
}

export default runMongoConnectionTests;
