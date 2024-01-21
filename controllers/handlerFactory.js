const APIFeatures = require('../utils/api-features')
const AppError = require('../utils/app-error')
const catchAsync = require('../utils/catch-async')

exports.getAll = (Model) =>
  catchAsync(async (req, res) => {
    // To allow nested GET requests on reviews (hack)
    let filter = {}
    if (req.params.tourId) filter = { tour: req.params.tourId }

    const { query } = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate()
    const doc = await query

    res.status(200).json({
      status: 'success',
      requestedAt: req.requestTime,
      results: doc.length,
      data: {
        value: doc,
      },
    })
  })

exports.getOne = (Model, options) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id)

    if (options?.populate) query = query.populate(options?.populate)

    const doc = await query

    if (!doc) {
      return next(
        new AppError(404, `${query.mongooseCollection.modelName || 'Document'} with id ${req.params.id} not found`),
      )
    }

    res.status(200).json({
      status: 'success',
      data: {
        value: doc,
      },
    })
  })

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body)

    res.status(201).json({
      status: 'success',
      data: { value: doc },
    })
  })

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      context: 'query',
    })

    if (!doc) {
      return next(
        new AppError(404, `${query.mongooseCollection.modelName || 'Document'} with id ${req.params.id} not found`),
      )
    }

    res.status(201).json({
      status: 'success',
      data: { value: doc },
    })
  })

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)

    if (!doc) {
      return next(
        new AppError(404, `${query.mongooseCollection.modelName || 'Document'} with id ${req.params.id} not found`),
      )
    }

    res.status(204).json({
      status: 'success',
      data: null,
    })
  })
