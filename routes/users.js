const express = require('express')

const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
  setCurrentUserId,
  uploadUserImage,
  resizeUserImage,
} = require('../controllers/user')
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
  restrictTo,
  logout,
} = require('../controllers/auth')

const { USER_ROLES } = require('../constants/user')
const getRecursiveRoles = require('../utils/get-recursive-roles')

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.get('/logout', logout)

router.post('/forgot-password', forgotPassword)
router.patch('/reset-password/:token', resetPassword)

// ALL ROUTES AFTER THIS MIDDLEWARE ARE PROTECTED
router.use(protect)

router.patch('/update-my-password', updatePassword)

router.get('/me', setCurrentUserId, getUser)
router.patch('/update-me', uploadUserImage, resizeUserImage, updateMe)
router.delete('/delete-me', deleteMe)

router
  .route('/')
  .get(restrictTo(getRecursiveRoles(USER_ROLES.TECHNICIAN)), getAllUsers)
  .post(restrictTo(getRecursiveRoles(USER_ROLES.TECHNICIAN)), createUser)
router
  .route('/:id')
  .get(restrictTo(getRecursiveRoles(USER_ROLES.TECHNICIAN)), getUser)
  .patch(restrictTo(getRecursiveRoles(USER_ROLES.TECHNICIAN)), updateUser)
  .delete(restrictTo(getRecursiveRoles(USER_ROLES.ADMIN)), deleteUser)

module.exports = router
