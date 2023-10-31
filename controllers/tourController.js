// import Tour from '../models/tourModel.js';

// GET ALL TOURS
const getAllTours = (req, res) => {
  console.log(req.requestTime);

  // res.status(200).json({
  //   status: 'success',
  //   requestedAt: req.requestTime,
  //   results: tours.length,
  //   data: { tours },
  // });
};

// GET A TOUR
const getTour = (req, res) => {
  // res.status(200).json({
  //   status: 'success',
  //   data: { tours: tour },
  // });
};

// CREATE A TOUR
const createTour = (req, res) => {
  // res.status(201).json({
  //   status: 'success',
  //   data: { tour: newTour },
  // });
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

export { getAllTours, getTour, createTour, updateTour, deleteTour };
