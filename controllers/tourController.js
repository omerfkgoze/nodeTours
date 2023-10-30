import fs from 'fs';
import Tour from '../models/tourModel.js';

const tours = JSON.parse(fs.readFileSync('./dev-data/data/tours-simple.json'));

const checkID = (req, res, next, val) => {
  console.log(`Tour id is: ${val}`);

  if (+req.params.id > tours.length) {
    return res.status(404).json({
      status: 'fail',
      message: 'Invalid ID',
    });
  }
  next();
};

const checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing name or price',
    });
  }
  next();
};

// GET ALL TOURS
const getAllTours = (req, res) => {
  console.log(req.requestTime);

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: { tours },
  });
};

// GET A TOUR
const getTour = (req, res) => {
  const tour = tours.find((el) => el.id === +req.params.id);

  res.status(200).json({
    status: 'success',
    data: { tours: tour },
  });
};

// CREATE A TOUR
const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;

  const newTour = { id: newId, ...req.body };

  tours.push(newTour);

  fs.writeFile(
    './dev-data/data/tours-simple.json',
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: { tour: newTour },
      });
    },
  );
};

// UPDATE A TOUR

const updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: { tour: '<updated tour here>' },
  });
};

// DELETE A TOUR
const deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null,
  });
};

export {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  checkID,
  checkBody,
};
