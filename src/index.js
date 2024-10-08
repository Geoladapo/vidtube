import http from "http";
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import morgan from "morgan";
import logger from "./utils/logger.js";
import { connectDb } from "./db/index.js";

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

const morganFormat = ":method :url :status :response-time ms";

app.use(
  morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  })
);

connectDb()
  .then(() => {
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error(`Mongodb connection error ${err}`);
  });


