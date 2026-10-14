import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import app from './app.js';
import { connectDB } from './config/db.js';
import { setupSocketIO } from './sockets/chatSocket.js';
import User from './models/User.js';
import { seedDatabase } from '../scripts/seed.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

const PORT = process.env.PORT || 5000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Auto-seed in development or test environment if database is fresh/empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Database is empty. Auto-seeding initial demo community...');
      await seedDatabase(false);
    }

    const server = http.createServer(app);

    // Initialize Socket.IO with CORS
    const io = new Server(server, {
      cors: {
        origin: (origin, callback) => {
          callback(null, true);
        },
        credentials: true,
        methods: ['GET', 'POST']
      }
    });

    setupSocketIO(io);

    server.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`✨ WeDate Server & Real-Time Engine Active`);
      console.log(`📍 Port: http://localhost:${PORT}`);
      console.log(`🔒 Allowed Student Domain: @${process.env.ALLOWED_EMAIL_DOMAIN || 'campus.edu'}`);
      console.log(`🌱 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`======================================================\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
