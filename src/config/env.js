import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusnoa',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN || '',
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID || '',
  AUTH0_CLIENT_SECRET: process.env.AUTH0_CLIENT_SECRET || '',
  AUTH0_AUDIENCE: process.env.AUTH0_AUDIENCE || 'https://api.campusnoa.edu',
  AUTH0_ISSUER: process.env.AUTH0_ISSUER || '',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'campusnoa_jwt_access_super_secret_key_2026_academic_governance',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'campusnoa_jwt_refresh_super_secret_key_2026_academic_governance',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '24h',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'campusnoa_cookie_secret_key_2026_secure',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || ''
};

export default ENV;
