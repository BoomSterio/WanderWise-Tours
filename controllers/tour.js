const Tour = require('../models/tour')
const APIFeatures = require('../utils/api-features')
const catchAsync = require('../utils/catch-async')
const AppError = require('../utils/app-error')
const { deleteOne } = require('./handlerFactory')

exports.aliasTopTours = (req, res, next) => {
  req.query = {
    limit: req.query.limit || '5',
    sort: '-ratingsAverage,price',
    fields: 'name,summary,price,ratingsAverage,difficulty',
  }
  next()
}

exports.getAllTours = catchAsync(async (req, res) => {
  const { query } = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate()
  const tours = await query

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours,
    },
  })
})

exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id).populate('reviews')

  if (!tour) {
    return next(new AppError(404, `Tour with id ${req.params.id} not found`))
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  })
})

exports.createTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.create(req.body)

  res.status(201).json({
    status: 'success',
    data: { tour },
  })
})

exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    context: 'query',
  })

  if (!tour) {
    return next(new AppError(404, `Tour with id ${req.params.id} not found`))
  }

  res.status(201).json({
    status: 'success',
    data: { tour },
  })
})

exports.deleteTour = deleteOne(Tour)

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: req.query.groupBy ? `$${req.query.groupBy}` : null,
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'easy' } },
    // },
  ])

  res.status(200).json({
    status: 'success',
    data: { stats },
  })
})

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = +req.params.year

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
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: {
          $push: {
            _id: '$_id',
            name: '$name',
          },
        },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { month: 1 },
    },
    // {
    //   $sort: { numTourStarts: -1 },
    // },
  ])

  res.status(200).json({
    status: 'success',
    results: plan.length,
    data: { plan },
  })
})
