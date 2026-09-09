import { MongoClient } from 'mongodb';

let client;
let connectionPromise;

export const getDatabase = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not configured');
  }

  if (!connectionPromise) {
    client = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 0,
      maxIdleTimeMS: 60000,
      connectTimeoutMS: 10000,
      serverSelectionTimeoutMS: 5000,
    });
    connectionPromise = client.connect();
  }

  await connectionPromise;
  return client.db(process.env.MONGODB_DB_NAME || 'mock-interviews');
};

export const closeDatabase = async () => {
  if (client) {
    await client.close();
    client = undefined;
    connectionPromise = undefined;
  }
};
