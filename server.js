import mongoose from 'mongoose';
import 'dotenv/config';
import app from './app.js';

//! It needs to be defined globally. As it is, it does not work in app js.
// handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.log(err.name, err.message);

  process.exit(1); // 0 success, 1 uncaught exception
});

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

// connect to DB
mongoose.connect(DB).then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);

  // giving time to finish all the requests
  server.close(() => {
    process.exit(1); // 0 success, 1 unhandled rejection
  });
});
