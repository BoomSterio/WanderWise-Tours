class APIFeatures {
  /**
   * Features constructor
   * @param query Mongoose query object
   * @param queryStr URL query params
   */
  constructor(query, queryStr) {
    this.query = query
    this.queryStr = queryStr
  }

  /** Basic and advanced filtering of query. */
  filter() {
    // Basic filtering
    const queryObj = { ...this.queryStr }
    const excludedFields = ['limit', 'page', 'sort', 'fields']
    excludedFields.forEach((field) => delete queryObj[field])

    // Advanced filtering
    let queryStr = JSON.stringify(queryObj)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)

    this.query = this.query.find(JSON.parse(queryStr))

    return this
  }

  /** Query sorting. */
  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.replace(/,/g, ' ')
      this.query = this.query.sort(sortBy)
    } else {
      this.query = this.query.sort('-createdAt')
    }

    return this
  }

  /** Limiting query fields */
  limitFields() {
    if (this.queryStr.fields) {
      const fields = this.queryStr.fields.replace(/,/g, ' ')
      this.query = this.query.select(fields)
    } else {
      this.query = this.query.select('-__v')
    }

    return this
  }

  /** Adding query pagination */
  paginate() {
    const page = +this.queryStr.page || 1
    const limit = +this.queryStr.limit || 50
    const skip = (page - 1) * limit

    this.query = this.query.skip(skip).limit(limit)

    return this
  }
}

module.exports = APIFeatures
