import http from 'http';
import app from './src/app.js';
import { ENV } from './src/config/env.js';
import { connectMongo } from './src/config/mongo.js';

const PORT = ENV.PORT || 3000;

async function startServer() {
  try {
    await connectMongo();

    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log('=======================================================');
      console.log('🚀 CampusNoa Production-Ready Enterprise Platform Live');
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log('🍃 Database: MongoDB Community v7.0 (Mongoose)');
      console.log('🛡️  Authentication: Auth0 OIDC Bearer Tokens & Local Gateway');
      console.log('👥 Database Records: 50 Students, 20 Faculty, 750 Attendance');
      console.log('🔐 Security: Auth0 JWKS + Role Guards + ABAC Isolation');
      console.log('📡 Real-Time: Server-Sent Events (SSE) Active');
      console.log('=======================================================');
    });

    return server;
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

const serverInstance = startServer();
export default serverInstance;
