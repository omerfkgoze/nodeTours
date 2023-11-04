import express from 'express';
import {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
} from '../controllers/tourController.js';

const tourRouter = express.Router();

tourRouter.route('/tour-stats').get(getTourStats);

tourRouter.route('/top-5-cheap').get(aliasTopTours, getAllTours);

tourRouter.route('/').get(getAllTours).post(createTour);

tourRouter.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

export default tourRouter;
