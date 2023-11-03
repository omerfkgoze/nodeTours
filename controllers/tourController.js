import Tour from '../models/tourModel.js';

const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';

  next();
};

// CLASS FOR API FEATURES
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  // BUILD QUERY

  // FILTERING
  filter() {
    const queryObj = { ...this.queryString };

    // excluded fields from queryObj to be used in filtering
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`); // operators integrated with mongoDB operators

    this.query = this.query.find(JSON.parse(queryStr)); // ask mongoDB to find documents with queryStr

    return this;
  }

  // SORTING
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');

      this.query = this.query.sort(sortBy);
      // this.query = this.query.sort(this.queryString.sort);

      // default sorting
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  // FIELD LIMITING
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');

      this.query = this.query.select(fields);

      // default field limiting
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  // PAGINATION
  paginate() {
    const page = +this.query.page || 1;
    const limit = +this.query.limit || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    //!BUG
    // if (this.query.page) {
    //   const numTours = await Tour.countDocuments();

    //   if (skip >= numTours) throw new Error('This page does not exist');
    // }

    return this;
  }
}

// GET ALL TOURS
const getAllTours = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

// GET A TOUR
const getTour = async (req, res) => {
  try {
    res.status(200).json({
      // status: 'success',
      // data: { tours: tour },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

// CREATE A TOUR
const createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { tour: newTour },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

// UPDATE A TOUR
const updateTour = async (req, res) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  try {
    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

// DELETE A TOUR
const deleteTour = async (req, res) => {
  await Tour.findByIdAndDelete(req.params.id);

  try {
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err,
    });
  }
};

export {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
};
