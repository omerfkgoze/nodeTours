import express from 'express';
import morgan from 'morgan';

import tourRouter from './routes/tourRoutes.js';

const app = express();

// MIDDLEWARES
app.use(morgan('dev'));
app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter);

export default app;
