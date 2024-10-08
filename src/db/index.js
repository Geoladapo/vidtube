import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import logger from "../utils/logger.js";

export const connectDb = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`);
    logger.info(`Mongodb conncected`);
  } catch (error) {
    console.log(`mongoDB connection error: ${error}`);
    process.exit(1);
  }
};
