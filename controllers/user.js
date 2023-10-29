const User = require('../models/user')
const catchAsync = require('../utils/catch-async')

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find()

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: users.length,
    data: {
      users,
    },
  })
})

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This request is not implemented yet',
  })
}

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This request is not implemented yet',
  })
}

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This request is not implemented yet',
  })
}

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This request is not implemented yet',
  })
}
