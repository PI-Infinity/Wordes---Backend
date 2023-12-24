class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // 1) create query operators
    const queryObj = { ...this.queryString };
    const excludeFields = [
      'page',
      'sort',
      'limit',
      'fields',
      'search',
      'filter',
      'country',
      'city',
      'district',
      'type',
      'check',
    ];
    excludeFields.forEach((el) => delete queryObj[el]);
    // create less, greater operators
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    // 2) sorting
    // for desc sorting using f.ex:"sort-=number"
    // for addational sorting we can use "," in query -> price, date, age etc.
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    // 3) fields
    // fields we can define only some fields using f.ex: fields=name,type
    // we also can use - for define without some fields, f.ex: fields=-name,-type
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    // 4) Pagination
    // if we have pages and want to define limit documents in each page
    // const page = req.query.page * 1 || 1;
    // const limit = req.query.limit * 1 || 100;
    // const skip = page - 1 + limit;

    // query = query.skip(skip).limit(limit);
    // this.query = this.query.limit(this.query.limit);
    // // query.sort().select().skip().limit()
    const page = this.queryString.page * 1 || 1;
    const limit = this.limit || 5;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;

    // return this;
  }
}

module.exports = APIFeatures;
