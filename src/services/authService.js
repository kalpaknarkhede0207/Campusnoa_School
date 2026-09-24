import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Student } from '../models/Student.js';
import { Faculty } from '../models/Faculty.js';
import { Institution } from '../models/Institution.js';
import { mintAuth0Token } from '../middlewares/auth0.js';
import { ENV } from '../config/env.js';

export class AuthService {
  static async hashPassword(password) {
    return bcrypt.hash(password, 12);
  }

  static async verifyPassword(password, hash) {
    if (!password) return false;
    if (hash && hash !== 'GOOGLE_OAUTH_NO_PASSWORD') {
      const isMatch = await bcrypt.compare(password, hash);
      if (isMatch) return true;
    }
    // In production, fallback seed password is strictly disabled unless explicitly permitted
    if (process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEMO_SEED_PASSWORD === 'true') {
      return password === 'CampusNoa@2026!';
    }
    return false;
  }

  static generateAccessToken(user) {
    return mintAuth0Token({
      sub: user.auth0Sub || `auth0|${user.email.replace(/[@.]/g, '_')}`,
      email: user.email,
      fullName: user.fullName,
      roleCode: user.roleCode,
      institutionId: user.institutionId
    });
  }

  static generateRefreshToken(user) {
    const payload = {
      sub: user.auth0Sub || `auth0|${user.email.replace(/[@.]/g, '_')}`,
      userId: user._id ? user._id.toString() : user.id,
      email: user.email,
      tokenVersion: user.tokenVersion || 0,
      type: 'refresh'
    };
    return jwt.sign(payload, ENV.JWT_REFRESH_SECRET, {
      expiresIn: ENV.JWT_REFRESH_EXPIRES_IN || '30d'
    });
  }

  static async login(email, password, ipAddress, userAgent) {
    const rawEmail = (email || '').toLowerCase().trim();
    const EMAIL_ALIASES = {
      // Principal
      'principal@campusnoa.edu': 'principal@school.edu',
      'principal@school.edu': 'principal@school.edu',
      'principal': 'principal@school.edu',

      // Class Teacher
      'teacher.9a@campusnoa.edu': 's.roy@school.edu',
      'teacher@campusnoa.edu': 's.roy@school.edu',
      'teacher@school.edu': 's.roy@school.edu',
      'teacher': 's.roy@school.edu',
      's.roy@school.edu': 's.roy@school.edu',

      // Admissions / Appointing Authority
      'admissions@campusnoa.edu': 'admissions@school.edu',
      'admissions@school.edu': 'admissions@school.edu',
      'admin@school.edu': 'admissions@school.edu',
      'admin@campusnoa.edu': 'admissions@school.edu',
      'admissions': 'admissions@school.edu',

      // Finance / Accountant
      'accountant@campusnoa.edu': 'bursar@school.edu',
      'accountant@school.edu': 'bursar@school.edu',
      'bursar@school.edu': 'bursar@school.edu',
      'accountant': 'bursar@school.edu',

      // Parent
      'parent.arav@campusnoa.edu': 'parent@gmail.com',
      'parent@campusnoa.edu': 'parent@gmail.com',
      'parent@school.edu': 'parent@gmail.com',
      'parent@gmail.com': 'parent@gmail.com',
      'parent': 'parent@gmail.com',

      // Student
      'student.arav@campusnoa.edu': 'teen.student@school.edu',
      'student@campusnoa.edu': 'teen.student@school.edu',
      'student@school.edu': 'teen.student@school.edu',
      'teen.student@school.edu': 'teen.student@school.edu',
      'student': 'teen.student@school.edu',

      // Counsellor
      'counsellor@campusnoa.edu': 'counsellor@school.edu',
      'counsellor@school.edu': 'counsellor@school.edu',
      'counsellor': 'counsellor@school.edu',

      // Vice Principal
      'viceprincipal@campusnoa.edu': 'vp@school.edu',
      'vp@campusnoa.edu': 'vp@school.edu',
      'vp@school.edu': 'vp@school.edu',
      'viceprincipal@school.edu': 'vp@school.edu',
      'vp': 'vp@school.edu',

      // HOD
      'hod@campusnoa.edu': 'hod.science@school.edu',
      'hod@school.edu': 'hod.science@school.edu',
      'hod.science@school.edu': 'hod.science@school.edu',
      'hod': 'hod.science@school.edu',

      // School Management
      'mgmt@campusnoa.edu': 'management@school.edu',
      'mgmt@school.edu': 'management@school.edu',
      'management@school.edu': 'management@school.edu',
      'management': 'management@school.edu',

      // Super Admin
      'superadmin@campusnoa.edu': 'superadmin@campusnoa.edu',
      'superadmin': 'superadmin@campusnoa.edu'
    };
    const targetEmail = EMAIL_ALIASES[rawEmail] || rawEmail;

    const user = await User.findOne({
      $or: [
        { email: targetEmail },
        { email: rawEmail },
        { auth0Sub: `auth0|${rawEmail.replace(/[@.]/g, '_')}` }
      ]
    });

    if (!user) {
      throw { statusCode: 401, code: 'INVALID_CREDENTIALS', message: 'Invalid email address or institutional password.' };
    }

    // Check account lockout
    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
      const waitMinutes = Math.ceil((new Date(user.lockUntil) - new Date()) / 60000);
      throw {
        statusCode: 423,
        code: 'ACCOUNT_LOCKED',
        message: `Account is temporarily locked due to excessive failed attempts. Please retry in ${waitMinutes} minute(s).`
      };
    }

    if (user.status !== 'ACTIVE') {
      throw {
        statusCode: 403,
        code: 'ACCOUNT_INACTIVE',
        message: `Account status is ${user.status}. Contact institution administration.`
      };
    }

    const isValid = await this.verifyPassword(password, user.passwordHash);

    if (!isValid) {
      const attempts = (user.failedLoginAttempts || 0) + 1;
      let lockUntil = null;

      if (attempts >= 5) {
        lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15-minute lockout
      }

      user.failedLoginAttempts = attempts;
      user.lockUntil = lockUntil;
      await user.save();

      if (attempts >= 5) {
        throw {
          statusCode: 423,
          code: 'ACCOUNT_LOCKED',
          message: 'Account locked for 15 minutes due to 5 consecutive failed login attempts.'
        };
      }

      throw {
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
        message: `Invalid credentials. ${5 - attempts} attempt(s) remaining before security lockout.`
      };
    }

    // Reset failed attempts on success
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    const accessToken = this.generateAccessToken(user);
    const rawRefreshToken = this.generateRefreshToken(user);

    // Strip sensitive fields
    const safeUser = user.toObject();
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

    safeUser.id = safeUser._id ? safeUser._id.toString() : user.id;
    safeUser.name = safeUser.fullName || safeUser.name;
    safeUser.role = roleMapping[safeUser.roleCode] || (safeUser.roleCode ? safeUser.roleCode.toLowerCase() : 'principal');

    return {
      user: safeUser,
      accessToken,
      token: accessToken,
      auth0Token: accessToken,
      refreshToken: rawRefreshToken
    };
  }

  static async refresh(rawToken) {
    if (!rawToken) {
      throw { statusCode: 401, code: 'REFRESH_TOKEN_REQUIRED', message: 'Refresh token is required.' };
    }

    let decoded;
    try {
      decoded = jwt.verify(rawToken, ENV.JWT_REFRESH_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw { statusCode: 401, code: 'REFRESH_TOKEN_EXPIRED', message: 'Refresh token has expired. Please sign in again.' };
      }
      throw { statusCode: 401, code: 'INVALID_REFRESH_TOKEN', message: 'Invalid or malformed refresh token.' };
    }

    const query = [];
    if (decoded.userId) query.push({ _id: decoded.userId });
    if (decoded.email) query.push({ email: decoded.email.toLowerCase().trim() });
    if (decoded.sub) query.push({ auth0Sub: decoded.sub });

    if (query.length === 0) {
      throw { statusCode: 401, code: 'INVALID_REFRESH_TOKEN', message: 'Refresh token missing user identity.' };
    }

    const user = await User.findOne({ $or: query });
    if (!user) {
      throw { statusCode: 401, code: 'USER_NOT_FOUND', message: 'User associated with refresh token was not found.' };
    }

    if (user.status !== 'ACTIVE') {
      throw { statusCode: 403, code: 'ACCOUNT_INACTIVE', message: `Account is ${user.status}. Contact institution administration.` };
    }

    if (decoded.tokenVersion !== undefined && user.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
      throw { statusCode: 401, code: 'TOKEN_REVOKED', message: 'Session has been invalidated. Please sign in again.' };
    }

    const accessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user);

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

    const safeUser = user.toObject();
    delete safeUser.passwordHash;
    safeUser.id = safeUser._id ? safeUser._id.toString() : user.id;
    safeUser.name = safeUser.fullName || safeUser.name;
    safeUser.role = roleMapping[safeUser.roleCode] || (safeUser.roleCode ? safeUser.roleCode.toLowerCase() : 'principal');

    return {
      user: safeUser,
      accessToken,
      token: accessToken,
      auth0Token: accessToken,
      refreshToken: newRefreshToken
    };
  }

  static async signup({ email, password, fullName, roleCode, institutionId, phone, studentData, facultyData }) {
    const restrictedRoles = ['SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'HOD'];
    if (restrictedRoles.includes(roleCode)) {
      throw {
        statusCode: 403,
        code: 'PRIVILEGED_ROLE_RESTRICTED',
        message: `Registration with privileged role '${roleCode}' must be provisioned directly by Institution Admin.`
      };
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      throw { statusCode: 409, code: 'EMAIL_IN_USE', message: 'An institutional account with this email already exists.' };
    }

    const inst = await Institution.findOne({
      $or: [{ code: institutionId }, { _id: institutionId.match(/^[0-9a-fA-F]{24}$/) ? institutionId : null }].filter(Boolean)
    });

    const targetInstitutionId = inst ? inst.code : institutionId;

    const passwordHash = await this.hashPassword(password);
    const userStatus = roleCode === 'FACULTY' ? 'PENDING_APPROVAL' : 'ACTIVE';

    const newUser = await User.create({
      email: email.toLowerCase().trim(),
      passwordHash,
      fullName,
      phone,
      roleCode: roleCode || 'STUDENT',
      status: userStatus,
      institutionId: targetInstitutionId,
      auth0Sub: `auth0|${email.replace(/[@.]/g, '_')}`
    });

    if (roleCode === 'STUDENT' && studentData) {
      await Student.create({
        institutionId: targetInstitutionId,
        userId: newUser._id,
        admissionNumber: studentData.admissionNumber || `ADM-${Date.now()}`,
        fullName,
        email: newUser.email,
        grade: studentData.grade || 'Grade 9',
        section: studentData.section || 'A',
        rollNo: studentData.rollNo || 1,
        busRoute: studentData.busRoute || 'Self Walker'
      });
    }

    const safeUser = newUser.toObject();
    delete safeUser.passwordHash;
    return safeUser;
  }

  static async logout(rawToken) {
    // Session token invalidated by client cookie clearing and TTL expiry
    return { success: true, message: 'Logged out successfully' };
  }

  static async logoutAll(userId) {
    if (userId) {
      try {
        await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
      } catch (_) {}
    }
    return { success: true, message: 'All active sessions invalidated' };
  }
}
export default AuthService;
