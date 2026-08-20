import mongoose from 'mongoose';

/**
 * Establish connection to MongoDB.
 */
export async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('MONGODB_URI environment variable is not configured.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      autoIndex: true, // Auto-create indexes (useful in development)
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
}
