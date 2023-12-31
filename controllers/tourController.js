import Tour from '../models/tourModel.js';
import APIFeatures from '../utils/apiFeatures.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

// GET ALL TOURS
const getAllTours = catchAsync(async (req, res, next) => {
  // EXECUTE QUERY
  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
});

// GET A TOUR
const getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { tours: tour },
  });
});

// CREATE A TOUR
const createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { tour: newTour },
  });
});

// UPDATE A TOUR
const updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});

// DELETE A TOUR
const deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' }, // group by difficulty
        numTours: { $sum: 1 }, // return the number of tours
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $avg: '$price' },
        maxPrice: { $avg: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 }, // ascending
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: { stats },
  });
});

const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = +req.params.year;

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: {
          $month: '$startDates', // startDates property'sinin ayina gore gruplar
        },
        numTourStarts: {
          $sum: 1, // tur baslangic sayisini donderir
        },
        tours: {
          $push: '$name', // name property'sini tours array'ine ekler
        },
      },
    },
    {
      $addFields: {
        month: '$_id', // _id property'sini month property'sine ekler
      },
    },
    {
      $project: {
        _id: 0, // _id property'sini gizler       },
      },
    },
    {
      $sort: {
        numTourStarts: -1, // descending
      },
    },
    {
      $limit: 12, // ilk 12 ayi donderir (query limit ile ayni)
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan,
    },
  });
});

export {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
};
