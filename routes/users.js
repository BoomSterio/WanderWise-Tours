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
} = require('../controllers/user')
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  protect,
  updatePassword,
  restrictTo,
} = require('../controllers/auth')
const { USER_ROLES } = require('../constants/user')

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)

router.post('/forgot-password', forgotPassword)
router.patch('/reset-password/:token', resetPassword)

// ALL ROUTES AFTER THIS MIDDLEWARE ARE PROTECTED
router.use(protect)

router.patch('/update-my-password', updatePassword)

router.get('/me', setCurrentUserId, getUser)
router.patch('/update-me', updateMe)
router.delete('/delete-me', deleteMe)

router.route('/').get(restrictTo(USER_ROLES.ADMIN, USER_ROLES.TECHNICIAN), getAllUsers).post(createUser)
router
  .route('/:id')
  .get(restrictTo(USER_ROLES.ADMIN, USER_ROLES.TECHNICIAN), getUser)
  .patch(restrictTo(USER_ROLES.ADMIN), updateUser)
  .delete(restrictTo(USER_ROLES.ADMIN), deleteUser)

module.exports = router
