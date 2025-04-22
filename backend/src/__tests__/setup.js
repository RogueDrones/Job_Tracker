const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

// Connect to the database before running tests
beforeAll(async () => {
  try {
    // Set test environment variables
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.JWT_EXPIRE = '1h';
    
    // Create an in-memory MongoDB server
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    // Set the MongoDB URI for testing
    process.env.MONGO_URI = uri;

    // Connect to the in-memory database
    await mongoose.connect(uri);
  } catch (error) {
    console.error('Error setting up test database:', error);
    throw error;
  }
});

// Clear database between tests
beforeEach(async () => {
  if (!mongoose.connection.db) {
    throw new Error('Database not connected. Make sure beforeAll hook succeeded.');
  }
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
});

// Disconnect and stop MongoDB after all tests
afterAll(async () => {
  try {
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
    }
  } catch (error) {
    console.error('Error cleaning up test database:', error);
    throw error;
  }
});