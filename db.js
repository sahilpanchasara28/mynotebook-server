const mongoose = require("mongoose");
require('dotenv').config()
const mongoURL = process.env.MONGO_URL;

const connectToMongo = () => {
  mongoose.connect(mongoURL, () => {
    console.log("Connected to mongoDB successfully !!");
  });
};

module.exports = connectToMongo;
