import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import gfmRoutes from './routes/gfmRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import financeRoutes from './routes/financeRoutes.js';
import counsellingRoutes from './routes/counsellingRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Standard Security & Body Parsing Middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Static Files - React Production Bundle
app.use(express.static(path.join(__dirname, '../dist')));
app.use(express.static(path.join(__dirname, '../public')));

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    system: 'CampusNoa Institutional Governance Platform',
    timestamp: new Date().toISOString()
  });
});

// Mount Domain API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', facultyRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/gfm', gfmRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', financeRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/counselling', counsellingRoutes);
app.use('/api/counsellor', counsellingRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/mgmt', dashboardRoutes);
app.use('/api/hod', dashboardRoutes);
app.use('/api/principal', dashboardRoutes);
app.use('/api/vp', dashboardRoutes);
app.use('/api/bus', dashboardRoutes);
app.use('/api/ai', dashboardRoutes);
app.use('/api/events', eventRoutes);

// Compatibility alias for principal student approval
app.post('/api/principal/student-approval', (req, res, next) => {
  req.url = '/principal-approval';
  studentRoutes(req, res, next);
});

// Single Page Application Fallback
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  const distIndex = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(distIndex)) {
    return res.sendFile(distIndex);
  }
  res.status(404).send('Frontend bundle not found. Please run npm run build.');
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
