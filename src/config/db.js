const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();


 async function  connectDB(){

 try {
  await mongoose.connect(process.env.MONGO_URI)
 console.log('Connected to MongoDB...')
 } catch (err) {
    console.error('could not connect to mongo db ',err)
 }



}

module.exports = connectDB;