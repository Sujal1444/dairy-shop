const mongoose = require('mongoose');
require('dotenv').config();

const dropDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB. Dropping collections...');
    
    // We can just drop the whole database if we want, or specifically Products and Entries
    await mongoose.connection.db.dropCollection('products').catch(e => console.log('Products collection not found or already dropped'));
    await mongoose.connection.db.dropCollection('entries').catch(e => console.log('Entries collection not found or already dropped'));

    console.log('Collections dropped successfully!');
    process.exit();
  } catch (error) {
    console.error('Error dropping collections:', error);
    process.exit(1);
  }
};

dropDB();
