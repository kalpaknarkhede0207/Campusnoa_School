import http from 'http';
import app from '../src/app.js';
import { connectMongo } from '../src/config/mongo.js';
import { runMongoConnectionTests } from './mongo_connection.test.js';
import { runAuth0Tests } from './auth0_verification.test.js';
import { runAuthTests } from './auth.test.js';
import { runMultiTenantTests } from './multi_tenant.test.js';
import { runRbacAbacTests } from './rbac_abac.test.js';
import { runAttendanceFinanceTests } from './attendance_finance.test.js';
import mongoose from 'mongoose';

async function runAll() {
  console.log('=======================================================');
  console.log('🧪 RUNNING CAMPUSNOA MONGODB & AUTH0 TEST SUITE');
  console.log('=======================================================');

  // Connect to MongoDB
  await connectMongo();

  // Start test server on ephemeral port 3099
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(3099, resolve));
  const serverUrl = 'http://127.0.0.1:3099';

  try {
    // 1. MongoDB Models & Collections
    await runMongoConnectionTests();

    // 2. Auth0 Token Minting, Claims & JWKS Verification
    await runAuth0Tests(serverUrl);

    // 3. User Login, Rate Limiting & Account Lockout
    await runAuthTests();

    // 4. Multi-Tenant Isolation (INST-001 vs INST-002)
    await runMultiTenantTests(serverUrl);

    // 5. RBAC & ABAC Ownership Guards
    await runRbacAbacTests(serverUrl);

    // 6. Attendance & Fee Ledger Reconciliation
    await runAttendanceFinanceTests(serverUrl);

    console.log('\n=======================================================');
    console.log('🎉 ALL MONGODB & AUTH0 TESTS PASSED WITH 100% SUCCESS!');
    console.log('=======================================================');
  } catch (err) {
    console.error('\n❌ TEST SUITE FAILED:', err);
    process.exit(1);
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
}

runAll();
