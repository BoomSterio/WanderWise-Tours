const express = require('express')

const { getAllUsers, createUser, getUser, updateUser, deleteUser, updateMe, deleteMe } = require('../controllers/user')
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

router.patch('/update-my-password', protect, updatePassword)

router.patch('/update-me', protect, updateMe)
router.delete('/delete-me', protect, deleteMe)

router.route('/').get(getAllUsers).post(createUser)
router
  .route('/:id')
  .get(protect, restrictTo(USER_ROLES.ADMIN, USER_ROLES.TECHNICIAN), getUser)
  .patch(protect, restrictTo(USER_ROLES.ADMIN), updateUser)
  .delete(protect, restrictTo(USER_ROLES.ADMIN), deleteUser)

module.exports = router
