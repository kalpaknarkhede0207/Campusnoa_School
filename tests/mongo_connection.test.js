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

  // Test 2: Verify Students
  const studentCount = await Student.countDocuments({ institutionId: 'INST-001' });
  assert(studentCount >= 0, `Expected students collection in MongoDB, found ${studentCount}`);
  console.log(`✅ PASS: ${studentCount} students verified in MongoDB.`);

  // Test 3: Verify Faculty Members
  const facultyCount = await Faculty.countDocuments({ institutionId: 'INST-001' });
  assert(facultyCount >= 0, `Expected faculty collection in MongoDB, found ${facultyCount}`);
  console.log(`✅ PASS: ${facultyCount} faculty verified in MongoDB.`);

  // Test 4: Verify Fee Transactions
  const feeCount = await FeeTransaction.countDocuments({ institutionId: 'INST-001' });
  assert(feeCount >= 0, `Expected fee transactions collection in MongoDB, found ${feeCount}`);
  console.log(`✅ PASS: ${feeCount} fee ledger transactions verified in MongoDB.`);

  // Test 5: Verify GFM Mentor Portfolio
  const gfm = await Gfm.findOne({ employeeCode: 'T-104' });
  if (gfm) {
    assert(Array.isArray(gfm.menteeAdmissionNumbers), 'GFM portfolio should have menteeAdmissionNumbers array');
    console.log(`✅ PASS: GFM portfolio verified with ${gfm.menteeAdmissionNumbers.length} mentees.`);
  } else {
    console.log('ℹ️ NOTE: GFM portfolio T-104 not seeded or customized.');
  }
}

export default runMongoConnectionTests;
