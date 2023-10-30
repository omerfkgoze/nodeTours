import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';

dotenv.config({ path: './config.env' });

// console.log(process.env);

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

// connect to DB
mongoose.connect(DB).then(() => console.log('DB connection successful!'));

// create a schema
const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name!'],
    unique: true,
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price!'],
  },
});

// create a model
const Tour = mongoose.model('Tour', tourSchema);

// create a document
const testTour = new Tour({
  name: 'Hello DB',
  price: 997,
});

// save the document to the database
testTour
  .save()
  .then(doc => console.log(doc))
  .catch(err => console.log('ERROR:', err));

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
