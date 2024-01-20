const User = require('../models/user')
const catchAsync = require('../utils/catch-async')
const AppError = require('../utils/app-error')
const { deleteOne, updateOne, getOne, getAll } = require('./handlerFactory')

exports.updateMe = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm, ...data } = req.body
  // 1) Create error if user posts password data
  if (password || passwordConfirm) {
    return next(
      new AppError(
        400,
        'This resource is not for editing sensitive data. Please use /update-my-password to change passwords.',
      ),
    )
  }

  // 2) Get user from the collection
  const user = await User.findById(req.user.id)

  // 3) Filter out the unwanted fields from the body and update the user object
  const allowed = ['name', 'email', 'photo']
  Object.keys(data).forEach((key) => {
    if (allowed.includes(key)) user[key] = data[key]
  })

  // 4) Save the user
  await user.save({ validateModifiedOnly: true })

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  })
})

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false })

  res.status(204).json({
    status: 'success',
    data: null,
  })
})

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This request is not implemented. Please use /signup instead.',
  })
}

exports.getAllUsers = getAll(User)

exports.getUser = getOne(User)

// DO NOT update passwords with this!
exports.updateUser = updateOne(User)

exports.deleteUser = deleteOne(User)
