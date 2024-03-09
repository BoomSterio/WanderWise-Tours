const multer = require('multer')
const sharp = require('sharp')

const Tour = require('../models/tour')
const AppError = require('../utils/app-error')
const catchAsync = require('../utils/catch-async')
const { deleteOne, updateOne, createOne, getOne, getAll } = require('./handlerFactory')

const multerStorage = multer.memoryStorage() // saves file to buffer memory: req.file.buffer

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
    return
  }
  cb(new AppError(400, 'Only files of type image are allowed!'), false)
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
})

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
])

exports.resizeTourImages = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next()

  // 1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`

  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`)

  // 2) Images
  req.body.images = []

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`
      await sharp(req.files.images[i].buffer)
        .resize(1000, 667)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`)

      req.body.images.push(filename)
    }),
  )

  next()
})

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
    data: { value: stats },
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
    data: { value: plan },
  })
})

// /tours-within/distance/:distance/center/:latlng/unit/:unit
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params
  const [lat, lng] = latlng.split(',')

  if (!lat || !lng) {
    next(new AppError(400, 'Please provide latitude and longitude in the format lat,lng'))
  }

  if (!['mi', 'km'].includes(unit)) {
    next(new AppError(400, 'Please provide one of the units: mi or km'))
  }

  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  })

  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { value: tours },
  })
})

// /distances/:latlng/unit/:unit
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params
  const [lat, lng] = latlng.split(',')

  if (!lat || !lng) {
    next(new AppError(400, 'Please provide latitude and longitude in the format lat,lng'))
  }

  if (!['mi', 'km'].includes(unit)) {
    next(new AppError(400, 'Please provide one of the units: mi or km'))
  }

  const multiplier = unit === 'mi' ? 0.00062137 : 0.001

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier,
      },
    },
    {
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ])

  res.status(200).json({
    status: 'success',
    data: { value: distances },
  })
})
