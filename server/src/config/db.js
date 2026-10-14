import mongoose from 'mongoose';

let mongoMemoryServer = null;

export const connectDB = async () => {
  // If already connected, return existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;

  try {
    if (uri && uri !== 'memory') {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000
      });
      console.log(`[MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    }
  } catch (error) {
    console.warn(`[MongoDB] Primary connection failed: ${error.message}. Checking development fallback...`);
  }

  // Development/Test fallback: spin up embedded mongodb-memory-server
  try {
    console.log('[MongoDB] Starting embedded MongoDB memory server for development/testing...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryServer = await MongoMemoryServer.create();
    const memUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(memUri);
    console.log(`[MongoDB] Connected to in-memory database: ${memUri}`);
    return conn;
  } catch (memError) {
    console.error(`[MongoDB] Fatal error initializing database connection: ${memError.message}`);
    throw memError;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
      mongoMemoryServer = null;
    }
    console.log('[MongoDB] Database disconnected successfully.');
  } catch (error) {
    console.error('[MongoDB] Error disconnecting database:', error);
  }
};
