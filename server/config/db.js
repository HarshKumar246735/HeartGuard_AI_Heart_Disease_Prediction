const mongoose = require('mongoose');

async function connectDB() {
  mongoose.set('strictQuery', true);
  const conn = await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 15000 });
  console.log(`MongoDB connected: ${conn.connection.host}`);
}

module.exports = connectDB;
