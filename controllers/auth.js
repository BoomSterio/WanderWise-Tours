const User = require('../models/User')
const catchAsync = require('../utils/catch-async')

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body)

  res.status(201).json({
    status: 'success',
    data: {
      user,
    },
  })
})
