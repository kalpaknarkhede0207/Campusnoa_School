import assert from 'assert';
import { AuthService } from '../src/services/authService.js';
import { User } from '../src/models/User.js';

export async function runAuthTests() {
  console.log('\n--- 1. Testing Authentication & Session Security ---');

  // Test 1: Valid Login
  const loginRes = await AuthService.login('principal@campusnoa.edu', 'CampusNoa@2026!', '127.0.0.1', 'TestRunner');
  assert(loginRes.accessToken, 'Access token should be returned on valid login');
  assert(loginRes.refreshToken, 'Refresh token should be returned on valid login');
  assert.strictEqual(loginRes.user.email, 'principal@campusnoa.edu');
  assert.strictEqual(loginRes.user.passwordHash, undefined, 'Password hash must never leak in response');
  console.log('✅ PASS: Valid login issues Auth0 JWT access token and refresh token.');

  // Test 1b: Token Refresh
  const refreshRes = await AuthService.refresh(loginRes.refreshToken);
  assert(refreshRes.accessToken, 'Access token should be issued on refresh');
  assert(refreshRes.refreshToken, 'New refresh token should be issued on refresh');
  assert.strictEqual(refreshRes.user.email, 'principal@campusnoa.edu');
  console.log('✅ PASS: Refresh token successfully verified and refreshed new session tokens.');

  // Test 2: Invalid Password
  try {
    await AuthService.login('principal@campusnoa.edu', 'WrongPassword123!', '127.0.0.1', 'TestRunner');
    assert.fail('Should have failed on wrong password');
  } catch (err) {
    assert.strictEqual(err.code, 'INVALID_CREDENTIALS');
    console.log('✅ PASS: Invalid password rejected with standard credentials error.');
  }

  // Test 3: Account Lockout after 5 failed attempts
  await User.deleteOne({ email: 'lockout.test@school.edu' });
  const testUser = await User.create({
    institutionId: 'INST-001',
    email: 'lockout.test@school.edu',
    passwordHash: await AuthService.hashPassword('Secret123!'),
    fullName: 'Lockout Test User',
    roleCode: 'STUDENT',
    auth0Sub: 'auth0|lockout_test_user'
  });

  for (let i = 0; i < 5; i++) {
    try {
      await AuthService.login('lockout.test@school.edu', 'BadPass', '127.0.0.1', 'TestRunner');
    } catch (e) { /* expected */ }
  }

  try {
    await AuthService.login('lockout.test@school.edu', 'Secret123!', '127.0.0.1', 'TestRunner');
    assert.fail('Should be locked out');
  } catch (err) {
    assert.strictEqual(err.code, 'ACCOUNT_LOCKED');
    console.log('✅ PASS: Account lockout triggered after 5 consecutive failed attempts.');
  }

  // Test 4: Block privileged self-signup
  try {
    await AuthService.signup({
      email: 'fake.admin@school.edu',
      password: 'Pass',
      fullName: 'Hacker',
      roleCode: 'SUPER_ADMIN',
      institutionId: 'INST-001'
    });
    assert.fail('Should block privileged self-registration');
  } catch (err) {
    assert.strictEqual(err.code, 'PRIVILEGED_ROLE_RESTRICTED');
    console.log('✅ PASS: Self-registration as SUPER_ADMIN strictly blocked.');
  }

  // Cleanup test user
  await User.deleteOne({ _id: testUser._id });
}
export default runAuthTests;
