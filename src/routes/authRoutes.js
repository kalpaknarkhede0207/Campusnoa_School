import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { AuthService } from '../services/authService.js';
import { loginRateLimiter } from '../middlewares/rateLimiter.js';
import { authenticateToken } from '../middlewares/authenticate.js';
import { auditLogger } from '../middlewares/auditLogger.js';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 1. Login with Rate Limiting & Audit
router.post('/login', loginRateLimiter, auditLogger('USER_LOGIN', 'AUTH'), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'MISSING_FIELDS', message: 'Email and password are required.' });
    }

    const ip = req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'] || 'Unknown';

    const result = await AuthService.login(email, password, ip, userAgent);

    // Set HttpOnly Cookies
    res.cookie('campusnoa_access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.cookie('campusnoa_refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      success: true,
      user: result.user,
      accessToken: result.accessToken,
      token: result.accessToken,
      refreshToken: result.refreshToken
    });
  } catch (err) {
    next(err);
  }
});

// Google OAuth Login
router.post('/google', async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ success: false, error: 'MISSING_TOKEN', message: 'Google credential missing.' });
    }

    // Verify token
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;
    
    // Assign role based on email (as discussed)
    const isPrincipal = email === 'kalpaknarkhede0207@gmail.com';
    const roleCode = isPrincipal ? 'PRINCIPAL' : 'TEACHER';

    // Find or create user
    const { User } = await import('../models/User.js');
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        email,
        fullName: name,
        roleCode,
        status: 'ACTIVE',
        passwordHash: 'GOOGLE_OAUTH_NO_PASSWORD' 
      });
      await user.save();
    }

    // Issue standard tokens using AuthService logic
    const accessToken = AuthService.generateAccessToken(user);
    const refreshToken = AuthService.generateRefreshToken(user);

    res.cookie('campusnoa_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.cookie('campusnoa_refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    const safeUser = user.toObject();
    delete safeUser.passwordHash;

    res.json({
      success: true,
      user: safeUser,
      accessToken,
      token: accessToken,
      refreshToken
    });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(401).json({ success: false, error: 'INVALID_GOOGLE_TOKEN', message: 'Google authentication failed.' });
  }
});

// 2. Role-Guarded Sign Up
router.post('/signup', auditLogger('USER_SIGNUP', 'AUTH'), async (req, res, next) => {
  try {
    const user = await AuthService.signup(req.body);
    res.status(201).json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

// 3. Token Rotation
router.post('/refresh-token', async (req, res, next) => {
  try {
    const rawToken = req.cookies?.campusnoa_refresh_token || req.body?.refreshToken;
    const result = await AuthService.refresh(rawToken);

    res.cookie('campusnoa_access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    res.cookie('campusnoa_refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

// 4. Logout (Current Device)
router.post('/logout', async (req, res, next) => {
  try {
    const rawToken = req.cookies?.campusnoa_refresh_token || req.body?.refreshToken;
    await AuthService.logout(rawToken);

    res.clearCookie('campusnoa_access_token');
    res.clearCookie('campusnoa_refresh_token');

    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
});

// 5. Logout All Devices
router.post('/logout-all', authenticateToken, async (req, res, next) => {
  try {
    await AuthService.logoutAll(req.user.id);
    res.clearCookie('campusnoa_access_token');
    res.clearCookie('campusnoa_refresh_token');
    res.json({ success: true, message: 'All active sessions invalidated.' });
  } catch (err) {
    next(err);
  }
});

// 6. Current User Profile / Session
router.get('/session', authenticateToken, (req, res) => {
  const safeUser = req.user.toObject ? req.user.toObject() : { ...req.user };
  delete safeUser.passwordHash;

  const roleMapping = {
    'PRINCIPAL': 'principal',
    'VICE_PRINCIPAL': 'vice_principal',
    'HOD': 'hod',
    'CLASS_TEACHER': 'class_teacher',
    'TEACHER': 'faculty',
    'FACULTY': 'faculty',
    'ADMIN_OFFICER': 'admissions_officer',
    'ACCOUNTANT': 'accountant',
    'COUNSELLOR': 'counsellor',
    'PARENT': 'parent',
    'STUDENT': 'student',
    'SCHOOL_MGMT': 'school_mgmt',
    'SUPER_ADMIN': 'principal',
    'INSTITUTION_ADMIN': 'principal'
  };

  safeUser.id = safeUser._id ? safeUser._id.toString() : req.user.id;
  safeUser.name = safeUser.fullName || safeUser.name;
  safeUser.role = roleMapping[safeUser.roleCode] || (safeUser.roleCode ? safeUser.roleCode.toLowerCase() : 'principal');

  res.json({
    success: true,
    user: safeUser,
  });
});

router.get('/me', authenticateToken, (req, res) => {
  const safeUser = req.user.toObject ? req.user.toObject() : { ...req.user };
  delete safeUser.passwordHash;
  res.json({
    success: true,
    user: safeUser,
    auth0: req.auth0 || {
      sub: safeUser.auth0Sub,
      email: safeUser.email,
      role: safeUser.roleCode
    }
  });
});

// Switch role endpoint
router.post('/switch-role', authenticateToken, async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!role) {
      return res.status(400).json({ success: false, error: 'ROLE_REQUIRED' });
    }

    const inverseRoleMap = {
      'principal': 'PRINCIPAL',
      'vice_principal': 'VICE_PRINCIPAL',
      'hod': 'HOD',
      'class_teacher': 'CLASS_TEACHER',
      'faculty': 'TEACHER',
      'admissions_officer': 'ADMIN_OFFICER',
      'accountant': 'ACCOUNTANT',
      'counsellor': 'COUNSELLOR',
      'parent': 'PARENT',
      'student': 'STUDENT',
      'school_mgmt': 'SCHOOL_MGMT'
    };

    const targetRoleCode = inverseRoleMap[role.toLowerCase()] || role.toUpperCase();
    const safeUser = req.user.toObject ? req.user.toObject() : { ...req.user };
    delete safeUser.passwordHash;

    safeUser.roleCode = targetRoleCode;
    safeUser.role = role.toLowerCase();
    safeUser.name = safeUser.fullName || safeUser.name;
    safeUser.id = safeUser._id ? safeUser._id.toString() : req.user.id;

    const { mintAuth0Token } = await import('../middlewares/auth0.js');
    const token = mintAuth0Token({
      sub: safeUser.auth0Sub || `auth0|${safeUser.email.replace(/[@.]/g, '_')}`,
      email: safeUser.email,
      fullName: safeUser.fullName,
      roleCode: targetRoleCode,
      institutionId: safeUser.institutionId
    });

    res.json({
      success: true,
      user: safeUser,
      accessToken: token,
      token,
      auth0Token: token
    });
  } catch (err) {
    next(err);
  }
});

// School mode toggle
router.post('/school-mode', authenticateToken, (req, res) => {
  const { mode } = req.body;
  res.json({ success: true, mode: mode || 'k12' });
});

// 7. Auth0 Local Token Minting Gateway (for offline testing & quick persona switching)
router.post('/auth0/token', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'EMAIL_REQUIRED', message: 'Email is required to mint an Auth0 token.' });
    }

    const { User } = await import('../models/User.js');
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ success: false, error: 'USER_NOT_FOUND', message: `User with email '${email}' not found.` });
    }

    const { mintAuth0Token } = await import('../middlewares/auth0.js');
    const token = mintAuth0Token({
      sub: user.auth0Sub || `auth0|${user.email.replace(/[@.]/g, '_')}`,
      email: user.email,
      fullName: user.fullName,
      roleCode: user.roleCode,
      institutionId: user.institutionId
    });

    res.cookie('campusnoa_auth0_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000
    });

    const safeUser = user.toObject();
    delete safeUser.passwordHash;

    res.json({
      success: true,
      auth0Token: token,
      tokenType: 'Bearer',
      expiresIn: 3600,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
});

export default router;
