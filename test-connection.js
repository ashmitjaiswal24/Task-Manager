require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Testing MongoDB Atlas connection...');
    console.log('Connection string:', process.env.MONGODB_URI.replace(/:[^:@]*@/, ':****@'));
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Atlas connected successfully!');
    
    // Test database operations
    const testCollection = mongoose.connection.db.collection('test');
    await testCollection.insertOne({ test: 'Hello Atlas!', timestamp: new Date() });
    console.log('✅ Test document inserted successfully!');
    
    const doc = await testCollection.findOne({ test: 'Hello Atlas!' });
    console.log('✅ Test document retrieved:', doc);
    
    await mongoose.connection.close();
    console.log('✅ Connection closed successfully!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();