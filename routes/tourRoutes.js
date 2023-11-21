import express from 'express';
import {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
} from '../controllers/tourController.js';
import { protect } from '../controllers/authController.js';

const tourRouter = express.Router();

tourRouter.route('/tour-stats').get(getTourStats);

tourRouter.route('/monthly-plan/:year').get(getMonthlyPlan);

tourRouter.route('/top-5-cheap').get(aliasTopTours, getAllTours);

tourRouter.route('/').get(protect, getAllTours).post(createTour);

tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

export default tourRouter;
