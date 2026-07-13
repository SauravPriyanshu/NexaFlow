const mongoose = require('mongoose');
const { logger } = require('../shared/utils/logger');

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
    logger.info(`\nMongoDB connected! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    logger.error("MongoDB connection FAILED ", error);
    process.exit(1);
  }
};

module.exports = connectDB;
