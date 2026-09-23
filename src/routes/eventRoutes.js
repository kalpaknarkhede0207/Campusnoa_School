import express from 'express';
import { NotificationService } from '../services/notificationService.js';
import { authenticateToken } from '../middlewares/authenticate.js';

const router = express.Router();

router.get('/stream', authenticateToken, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // Send initial handshake
  res.write(`data: ${JSON.stringify({ type: 'HANDSHAKE', message: 'Connected to CampusNoa Real-Time Event Gateway', timestamp: new Date() })}\n\n`);

  NotificationService.addSseClient(req.user._id || req.user.id, res);

  // Keep-alive heartbeat every 25 seconds
  const interval = setInterval(() => {
    try {
      res.write(': heartbeat\n\n');
    } catch (e) {
      clearInterval(interval);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(interval);
  });
});

export default router;
