import mongoose from 'mongoose';
import dotenv from 'dotenv/config.js';
import app from './app.js';

dotenv.config({ path: './.env' });

// console.log(process.env);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

// connect to DB
mongoose.connect(DB).then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
