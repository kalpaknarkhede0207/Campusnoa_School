import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import { ENV } from '../config/env.js';
import { User } from '../models/User.js';

// JWKS Client for remote Auth0 verification
let jwksClient = null;
if (ENV.AUTH0_DOMAIN && !ENV.AUTH0_DOMAIN.includes('mock') && !ENV.AUTH0_DOMAIN.includes('dev-local')) {
  jwksClient = jwksRsa({
    jwksUri: `https://${ENV.AUTH0_DOMAIN}/.well-known/jwks.json`,
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 10
  });
}

const getSigningKey = (header, callback) => {
  if (!jwksClient) {
    return callback(new Error('Auth0 JWKS Client not configured'));
  }
  jwksClient.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
};

/**
 * Mint an Auth0-compliant JWT token locally.
 * Useful for local testing, offline development, and seamlessly logging into simulated personas.
 */
export const mintAuth0Token = ({ sub, email, fullName, roleCode, institutionId }) => {
  const issuer = ENV.AUTH0_DOMAIN ? `https://${ENV.AUTH0_DOMAIN}/` : 'https://campusnoa.us.auth0.com/';
  const payload = {
    sub: sub || `auth0|${email.replace(/[@.]/g, '_')}`,
    email,
    name: fullName,
    'https://campusnoa.edu/role': roleCode,
    'https://campusnoa.edu/institutionId': institutionId,
    role: roleCode,
    institutionId
  };

  return jwt.sign(payload, ENV.JWT_ACCESS_SECRET, {
    algorithm: 'HS256',
    issuer,
    audience: ENV.AUTH0_AUDIENCE,
    expiresIn: ENV.JWT_ACCESS_EXPIRES_IN || '1h'
  });
};

/**
 * Verify Auth0 Access Token (Remote RS256 with JWKS or Local HS256)
 */
export const verifyAuth0Token = (token) => {
  return new Promise((resolve, reject) => {
    const decodedUnverified = jwt.decode(token, { complete: true });
    if (!decodedUnverified) {
      return reject(new Error('Malformed JWT token'));
    }

    const isRemoteAuth0 = jwksClient && decodedUnverified.header && decodedUnverified.header.alg === 'RS256';

    if (isRemoteAuth0) {
      jwt.verify(
        token,
        getSigningKey,
        {
          algorithms: ['RS256'],
          audience: ENV.AUTH0_AUDIENCE,
          issuer: `https://${ENV.AUTH0_DOMAIN}/`
        },
        (err, decoded) => {
          if (err) return reject(err);
          resolve(decoded);
        }
      );
    } else {
      // Local fallback verification (HS256)
      jwt.verify(
        token,
        ENV.JWT_ACCESS_SECRET,
        {
          audience: ENV.AUTH0_AUDIENCE
        },
        (err, decoded) => {
          if (err) return reject(err);
          resolve(decoded);
        }
      );
    }
  });
};

/**
 * Express Middleware to enforce Auth0 Authentication
 */
export const auth0Middleware = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check Authorization Header (Bearer token)
    if (req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
        token = parts[1];
      }
    }

    // 2. Check HttpOnly cookie
    if (!token && req.cookies) {
      token = req.cookies.campusnoa_auth0_token || req.cookies.campusnoa_access_token;
    }

    // 3. Check Query parameter (for EventSource SSE streaming)
    if (!token && req.query?.token) {
      token = req.query.token;
    }

    // 4. Fallback for offline test harness (strictly enabled only in test environment)
    if (!token && req.headers['x-user-email'] && process.env.NODE_ENV === 'test') {
      const email = req.headers['x-user-email'].toLowerCase().trim();
      const user = await User.findOne({ email });
      if (user && user.status === 'ACTIVE') {
        req.user = user;
        req.institutionId = user.institutionId;
        req.auth0 = {
          sub: user.auth0Sub || `auth0|${user.email}`,
          email: user.email,
          'https://campusnoa.edu/role': user.roleCode,
          'https://campusnoa.edu/institutionId': user.institutionId
        };
        return next();
      }
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'AUTH0_TOKEN_REQUIRED',
        message: 'Auth0 bearer token required. Please authenticate via Auth0 OIDC gateway.'
      });
    }

    const decoded = await verifyAuth0Token(token);
    req.auth0 = decoded;

    const email = decoded.email || decoded['https://campusnoa.edu/email'];
    const sub = decoded.sub;

    // Find user in MongoDB
    const query = [];
    if (sub) query.push({ auth0Sub: sub });
    if (email) query.push({ email: email.toLowerCase().trim() });

    let user = await User.findOne({ $or: query });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'USER_NOT_PROVISIONED',
        message: `Account for Auth0 subject '${sub}' is not registered with this institution.`
      });
    }

    // Link auth0Sub if not yet linked
    if (!user.auth0Sub && sub) {
      user.auth0Sub = sub;
      await user.save();
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: 'ACCOUNT_INACTIVE',
        message: `Account status is ${user.status}. Contact institution administrator.`
      });
    }

    if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
      return res.status(423).json({
        success: false,
        error: 'ACCOUNT_LOCKED',
        message: 'Account temporarily locked due to repeated security triggers.'
      });
    }

    req.user = user;
    const tokenRole = decoded['https://campusnoa.edu/role'] || decoded.role;
    if (tokenRole) {
      req.user.activeRole = tokenRole;
      req.user.roleCode = tokenRole;
      req.user.role = tokenRole;
    }
    req.institutionId = decoded['https://campusnoa.edu/institutionId'] || user.institutionId;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'TOKEN_EXPIRED',
        message: 'Auth0 token has expired. Please refresh session.'
      });
    }
    return res.status(401).json({
      success: false,
      error: 'INVALID_AUTH0_TOKEN',
      message: `Auth0 token verification failed: ${err.message}`
    });
  }
};

export default auth0Middleware;
