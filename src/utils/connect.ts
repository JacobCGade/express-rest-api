// This file houses our DB connection
import mongoose from 'mongoose';
import config from 'config';
import logger from "./logger";

async function connect() {
  const dbUri = config.get<string>('dbUri');

  try {
    await mongoose.connect(dbUri)
    logger.info("connected to DB")
  } catch (error) {
    logger.error("DB connection error: ", error);
    process.exit(1); // i.e. exit with failure
  }
}

export default connect;