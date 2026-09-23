import assert from 'assert';
import { AuthService } from '../src/services/authService.js';

export async function runMultiTenantTests(serverUrl) {
  console.log('\n--- 2. Testing Multi-Tenant Data Isolation ---');

  // Login as User from Institution 1 (CampusNoa)
  const inst1Login = await AuthService.login('s.roy@school.edu', 'CampusNoa@2026!', '127.0.0.1', 'TestRunner');

  // Attempt to pass explicit institutionId for Institution 2 (St. Xavier's)
  const response = await fetch(`${serverUrl}/api/students?institutionId=INST-002`, {
    headers: {
      'Authorization': `Bearer ${inst1Login.accessToken}`
    }
  });

  assert.strictEqual(response.status, 403, 'Cross-tenant query must be rejected with 403 Forbidden');
  const data = await response.json();
  assert.strictEqual(data.error, 'CROSS_TENANT_VIOLATION');
  console.log('✅ PASS: Cross-institution data query strictly rejected with 403 CROSS_TENANT_VIOLATION.');
}
export default runMultiTenantTests;
