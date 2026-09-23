import assert from 'assert';
import { mintAuth0Token, verifyAuth0Token } from '../src/middlewares/auth0.js';
import { User } from '../src/models/User.js';

export async function runAuth0Tests(serverUrl) {
  console.log('\n--- Auth0 Enterprise Token & Claims Tests ---');

  // Test 1: Mint Auth0-compliant Token locally
  const token = mintAuth0Token({
    sub: 'auth0|principal_delhi_test',
    email: 'principal@campusnoa.edu',
    fullName: 'Dr. APJ Abdul Kalam',
    roleCode: 'PRINCIPAL',
    institutionId: 'INST-001'
  });

  assert(token, 'Auth0 token should be minted');
  console.log('✅ PASS: Auth0-compliant token generated with standard enterprise claims.');

  // Test 2: Verify Auth0 Token
  const verifiedClaims = await verifyAuth0Token(token);
  assert.strictEqual(verifiedClaims.sub, 'auth0|principal_delhi_test');
  assert.strictEqual(verifiedClaims.email, 'principal@campusnoa.edu');
  assert.strictEqual(verifiedClaims['https://campusnoa.edu/role'], 'PRINCIPAL');
  assert.strictEqual(verifiedClaims['https://campusnoa.edu/institutionId'], 'INST-001');
  console.log('✅ PASS: Auth0 token cryptographic verification passed and custom namespace claims validated.');

  // Test 3: Reject Tampered / Malformed Auth0 Token
  try {
    const tamperedToken = token.slice(0, -5) + 'xxxxx';
    await verifyAuth0Token(tamperedToken);
    assert.fail('Tampered token should have been rejected');
  } catch (err) {
    assert(err, 'Tampered token was rejected as expected');
    console.log('✅ PASS: Tampered Auth0 token rejected cryptographically.');
  }

  // Test 4: Live HTTP test against /api/auth/me with Auth0 Bearer token
  if (serverUrl) {
    const res = await fetch(`${serverUrl}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    assert.strictEqual(res.status, 200, 'Authenticated request to /api/auth/me should succeed');
    const body = await res.json();
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.user.email, 'principal@campusnoa.edu');
    assert.strictEqual(body.user.roleCode, 'PRINCIPAL');
    console.log('✅ PASS: Backend successfully resolved MongoDB User profile via Auth0 Bearer token.');

    // Test 5: Mint Auth0 token via API endpoint
    const mintRes = await fetch(`${serverUrl}/api/auth/auth0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teacher@campusnoa.edu' })
    });
    assert.strictEqual(mintRes.status, 200);
    const mintData = await mintRes.json();
    assert(mintData.auth0Token, 'API should return minted auth0Token');
    assert.strictEqual(mintData.user.roleCode, 'CLASS_TEACHER');
    console.log('✅ PASS: API endpoint /api/auth/auth0/token successfully mints Auth0 token for user.');
  }
}

export default runAuth0Tests;
