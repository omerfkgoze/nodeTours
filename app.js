import express from 'express';
import tourRouter from './routes/tourRouter.js';

const app = express();

// MIDDLEWARES
app.use(express.json());

// ROUTES
app.use('/api/v1/tours', tourRouter);

export default app;
