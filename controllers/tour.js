const Tour = require('../models/tour')
const catchAsync = require('../utils/catch-async')
const { deleteOne, updateOne, createOne, getOne, getAll } = require('./handlerFactory')

exports.aliasTopTours = (req, res, next) => {
  req.query = {
    limit: req.query.limit || '5',
    sort: '-ratingsAverage,price',
    fields: 'name,summary,price,ratingsAverage,difficulty',
  }
  next()
}

exports.getAllTours = getAll(Tour)

exports.getTour = getOne(Tour, { populate: { path: 'reviews' } })

exports.createTour = createOne(Tour)

exports.updateTour = updateOne(Tour)

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
