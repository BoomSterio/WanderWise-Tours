const multer = require('multer')
const sharp = require('sharp')

const User = require('../models/user')
const catchAsync = require('../utils/catch-async')
const AppError = require('../utils/app-error')
const { deleteOne, updateOne, getOne, getAll } = require('./handlerFactory')

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users')
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1]
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//   },
// })

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

exports.uploadUserImage = upload.single('image')

exports.resizeUserImage = catchAsync(async (req, res, next) => {
  if (!req.file) return next()

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`

  await sharp(req.file.buffer)
    .resize(256, 256)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`)

  next()
})

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
  const allowed = ['name', 'email']
  Object.keys(data).forEach((key) => {
    if (allowed.includes(key)) user[key] = data[key]
  })

  // 4) Save the image file name to user doc
  if (req.file) {
    user.image = req.file.filename
  }

  // 5) Save the user
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

exports.setCurrentUserId = (req, res, next) => {
  req.params.id = req.user.id

  next()
}

exports.getAllUsers = getAll(User)

exports.getUser = getOne(User)

// DO NOT update passwords with this!
exports.updateUser = updateOne(User)

exports.deleteUser = deleteOne(User)
