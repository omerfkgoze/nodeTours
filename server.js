import dotenv from 'dotenv';
import app from './app.js';

dotenv.config({ path: './config.env' });

// console.log(process.env);

const port = process.env.PORT || 8000;

app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});
