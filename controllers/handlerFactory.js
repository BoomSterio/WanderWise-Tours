const AppError = require('../utils/app-error')
const catchAsync = require('../utils/catch-async')

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
      return next(new AppError(404, `Document with id ${req.params.id} not found`))
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
      return next(new AppError(404, `Document with id ${req.params.id} not found`))
    }

    res.status(204).json({
      status: 'success',
      data: null,
    })
  })
