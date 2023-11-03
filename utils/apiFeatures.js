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
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 100;
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

export default APIFeatures;
