import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
// import Tour from '../../models/tourModel.js';

dotenv.config({
  path: '../../.config.env',
});

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

// connect to DB
mongoose.connect(DB).then(() => console.log('DB connection successful!'));

// READ JSON FILE
const tours = JSON.parse(fs.readFileSync('./tours-simple.json', 'utf-8'));
