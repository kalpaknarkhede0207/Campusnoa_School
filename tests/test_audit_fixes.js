import http from 'http';
import app from '../src/app.js';
import { connectMongo } from '../src/config/mongo.js';
import { mintAuth0Token } from '../src/middlewares/auth0.js';
import mongoose from 'mongoose';

async function runFixesVerification() {
  console.log('=======================================================');
  console.log('🔍 VERIFYING REMEDIATED AUDIT FIXES');
  console.log('=======================================================');

  await connectMongo();

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(3098, resolve));
  const baseUrl = 'http://127.0.0.1:3098';

  const { User } = await import('../src/models/User.js');
  const { Student } = await import('../src/models/Student.js');

  const principalUser = await User.findOne({ roleCode: 'PRINCIPAL' });
  const teacherUser = await User.findOne({ roleCode: { $in: ['CLASS_TEACHER', 'TEACHER'] } });
  const sampleStudent = await Student.findOne();

  console.log(`Using Principal: ${principalUser?.email}, Teacher: ${teacherUser?.email}, Student: ${sampleStudent?.admissionNumber}`);

  const principalToken = mintAuth0Token({
    sub: principalUser?.auth0Sub || `auth0|${principalUser?.email}`,
    email: principalUser?.email,
    fullName: principalUser?.fullName,
    roleCode: 'PRINCIPAL',
    institutionId: principalUser?.institutionId
  });

  const teacherToken = mintAuth0Token({
    sub: teacherUser?.auth0Sub || `auth0|${teacherUser?.email}`,
    email: teacherUser?.email,
    fullName: teacherUser?.fullName,
    roleCode: teacherUser?.roleCode,
    institutionId: teacherUser?.institutionId
  });

  try {
    // 1. Verify AUD-002: POST /api/students/:id/approve
    console.log('\n--- 1. Testing AUD-002: Student Approval Route Binding ---');
    const targetAdm = sampleStudent?.admissionNumber || 'ADM-2026-001';
    const approveRes = await fetch(`${baseUrl}/api/students/${targetAdm}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${principalToken}`
      },
      body: JSON.stringify({ action: 'APPROVE' })
    });

    const approveData = await approveRes.json();
    console.log(`Status: ${approveRes.status}, Response:`, approveData.message || approveData.error);
    if (approveRes.status !== 200 || !approveData.success) {
      throw new Error(`AUD-002 Failed: Expected 200 OK, got ${approveRes.status}`);
    }
    console.log('✅ PASS: AUD-002 Student approval endpoint /api/students/:id/approve verified successfully.');

    // 2. Verify AUD-003: GET /api/gfm/notes
    console.log('\n--- 2. Testing AUD-003: GFM Notes Retrieval Route Binding ---');
    const notesRes = await fetch(`${baseUrl}/api/gfm/notes?studentId=ADM-2026-001`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${teacherToken}`
      }
    });

    const notesData = await notesRes.json();
    console.log(`Status: ${notesRes.status}, Found Notes Count:`, notesData.count);
    if (notesRes.status !== 200 || !notesData.success) {
      throw new Error(`AUD-003 Failed: Expected 200 OK, got ${notesRes.status}`);
    }
    console.log('✅ PASS: AUD-003 GFM notes retrieval endpoint /api/gfm/notes verified successfully.');

    console.log('\n=======================================================');
    console.log('🎉 ALL AUDIT REMEDIATION FIXES VERIFIED 100% WORKING!');
    console.log('=======================================================');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runFixesVerification().catch(err => {
  console.error('❌ Verification failed:', err);
  process.exit(1);
});
