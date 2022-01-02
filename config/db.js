const mongoose = require('mongoose');
require('dotenv').config({path: 'variables.env'});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('DB CONNECTED');
  } catch (error) {
    console.log("HUBO UN ERROR", error);
    process.exit(1);
  }
}


module.exports = connectDB;