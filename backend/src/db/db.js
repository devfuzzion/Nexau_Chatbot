import fs from "fs";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const config = {
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync("./ca.pem").toString(),
  },
};

const client = new pg.Pool(config); // Use Pool for better connection handling


export default client;
