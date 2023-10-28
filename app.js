import express from 'express';
import tourRouter from './routes/tourRoutes.js';

const app = express();

// MIDDLEWARES
app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter);

export default app;
